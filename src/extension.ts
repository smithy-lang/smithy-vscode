import { existsSync } from 'fs';
import { dirname, join } from 'path';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import * as config from './config';
import JarFileContentsProvider from './jar-file-contents';
import SelectorHandler from './selector';
import downloadLanguageServerIfRequired, {
    compareVersions,
    deleteCoursier,
    isSupportedVersion,
    MINIMUM_VERSION,
} from './download-language-server';
import { logger } from './logger';

let client: lsp.LanguageClient;
let versionStatusBarItem: vscode.StatusBarItem;

const VERSION_POLICY_PROMPTED_KEY = 'smithy.versionPolicyPrompted';
const RELEASES_CACHE_KEY = 'smithy.releasesCache';
const LATEST_RELEASE = 'latest.release';

export async function activate(context: vscode.ExtensionContext) {
    // The client doesn't dispose a channel passed in via options, so we own its lifecycle.
    context.subscriptions.push(logger);

    promptVersionPolicy(context);
    createVersionStatusBarItem(context);
    // Registered before getServer, so the status bar item still works if the server can't be set up.
    context.subscriptions.push(
        vscode.commands.registerCommand('smithy.toggleVersionPolicy', () => toggleVersionPolicy(context))
    );

    const server = await getServer(context);
    const clientOptions = getClientOptions();

    // Create the language client and start the client.
    client = new lsp.LanguageClient('smithy', 'Smithy', server, clientOptions);

    const jarFileContentsProvider = new JarFileContentsProvider(client);
    const selectorHandler = new SelectorHandler(client);

    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('smithyjar', jarFileContentsProvider),
        vscode.commands.registerCommand('smithy.runSelector', selectorHandler.run, selectorHandler),
        vscode.commands.registerCommand('smithy.clearSelector', selectorHandler.clear, selectorHandler)
    );

    // Start the client. This will also launch the server. Activation completes once the server has
    // initialized, so awaiting activation means the server is ready.
    await client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

async function promptVersionPolicy(context: vscode.ExtensionContext): Promise<void> {
    if (context.globalState.get<boolean>(VERSION_POLICY_PROMPTED_KEY)) {
        return;
    }

    const useLatest = 'Use latest';
    const pinVersion = 'Pin a version';
    const choice = await vscode.window.showInformationMessage(
        'The Smithy extension can automatically use the latest Smithy Language Server, or you can pin a specific version.',
        useLatest,
        pinVersion
    );

    await context.globalState.update(VERSION_POLICY_PROMPTED_KEY, true);

    if (choice === pinVersion) {
        await pickAndPinVersion(context);
    }
}

function createVersionStatusBarItem(context: vscode.ExtensionContext): void {
    versionStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    versionStatusBarItem.command = 'smithy.toggleVersionPolicy';
    updateVersionStatusBarItem();
    versionStatusBarItem.show();
    context.subscriptions.push(versionStatusBarItem);

    // Update status bar when configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('smithy.server.version')) {
                updateVersionStatusBarItem();
            }
        })
    );
}

function updateVersionStatusBarItem(): void {
    const version = config.getServerVersion();
    if (version === LATEST_RELEASE) {
        versionStatusBarItem.text = '$(check) Smithy LS (latest)';
        versionStatusBarItem.tooltip = 'Smithy Language Server: using the latest release. Click to pin a version.';
    } else {
        versionStatusBarItem.text = '$(pin) Smithy LS v' + version;
        versionStatusBarItem.tooltip = 'Smithy Language Server: pinned to v' + version + '. Click to switch to latest.';
    }
}

interface ReleasesCache {
    versions: string[];
    etag?: string;
    rateLimitRemaining?: number;
    // UTC epoch seconds.
    rateLimitReset?: number;
}

// Unauthenticated requests are limited to 60 per hour per IP, and a 304 response counts too.
// Returns the cached versions when GitHub can't be reached or the rate limit is used up.
async function fetchAvailableVersions(context: vscode.ExtensionContext): Promise<string[]> {
    const releasesUrl = 'https://api.github.com/repos/smithy-lang/smithy-language-server/releases?per_page=100';
    const cache = context.globalState.get<ReleasesCache>(RELEASES_CACHE_KEY);
    // GitHub asks clients not to send requests until the rate limit resets.
    if (
        cache?.rateLimitRemaining === 0 &&
        cache.rateLimitReset !== undefined &&
        Date.now() < cache.rateLimitReset * 1000
    ) {
        return cache.versions;
    }
    try {
        const response = await fetch(releasesUrl, {
            headers: {
                Accept: 'application/vnd.github+json',
                ...(cache?.etag && { 'If-None-Match': cache.etag }),
            },
        });
        const newCache: ReleasesCache = {
            versions: cache?.versions ?? [],
            etag: cache?.etag,
            rateLimitRemaining: getNumberHeader(response, 'x-ratelimit-remaining'),
            rateLimitReset: getNumberHeader(response, 'x-ratelimit-reset'),
        };
        if (response.status === 200) {
            const releases = (await response.json()) as { tag_name: string }[];
            // Only versions with a release zip can be downloaded.
            newCache.versions = releases
                .map((release) => release.tag_name)
                .filter(isSupportedVersion)
                .sort(compareVersions)
                .reverse();
            newCache.etag = response.headers.get('etag') ?? undefined;
        }
        await context.globalState.update(RELEASES_CACHE_KEY, newCache);
        return newCache.versions;
    } catch {
        return cache?.versions ?? [];
    }
}

function getNumberHeader(response: Response, name: string): number | undefined {
    const value = response.headers.get(name);
    return value === null ? undefined : Number(value);
}

async function pickAndPinVersion(context: vscode.ExtensionContext): Promise<void> {
    const versions = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Fetching available versions...' },
        () => fetchAvailableVersions(context)
    );

    if (versions.length === 0) {
        vscode.window.showErrorMessage('Could not fetch Smithy Language Server versions from GitHub releases.');
        return;
    }

    const picked = await vscode.window.showQuickPick(versions, {
        placeHolder: 'Select a Smithy Language Server version to pin',
    });

    if (picked) {
        await vscode.workspace
            .getConfiguration('smithy')
            .update('server.version', picked, vscode.ConfigurationTarget.Global);
        const reload = await vscode.window.showInformationMessage(
            'Smithy Language Server pinned to v' + picked + '. Reload window to apply.',
            'Reload'
        );
        if (reload === 'Reload') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
}

async function toggleVersionPolicy(context: vscode.ExtensionContext): Promise<void> {
    const currentVersion = config.getServerVersion();
    const isLatest = currentVersion === LATEST_RELEASE;

    if (isLatest) {
        await pickAndPinVersion(context);
    } else {
        await vscode.workspace
            .getConfiguration('smithy')
            .update('server.version', undefined, vscode.ConfigurationTarget.Global);
        const reload = await vscode.window.showInformationMessage(
            'Smithy Language Server set to use latest version. Reload window to apply.',
            'Reload'
        );
        if (reload === 'Reload') {
            vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
}

function getClientOptions(): lsp.LanguageClientOptions {
    const initializationOptions = {
        'diagnostics.minimumSeverity': config.getServerDiagnosticsMinimumSeverity(),
        onlyReloadOnSave: config.getServerOnlyReloadOnSave(),
    };

    return {
        outputChannel: logger,
        // Don't switch to output window when the server returns output.
        revealOutputChannelOn: lsp.RevealOutputChannelOn.Never,
        progressOnInitialization: true,

        documentSelector: [
            { language: 'smithy' },
            { scheme: 'smithyjar' },
            { pattern: '**/{smithy-build,.smithy-project}.json' },
        ],

        initializationOptions,
    };
}

async function getServer(context: vscode.ExtensionContext): Promise<lsp.Executable> {
    const serverExecutable = config.getServerExecutable();
    if (serverExecutable) {
        logger.info(`Using configured language server executable: ${serverExecutable}`);
        return {
            command: serverExecutable,
            args: ['0'],
        };
    } else {
        const languageServerVersion = config.getServerVersion();

        if (languageServerVersion !== LATEST_RELEASE && !isSupportedVersion(languageServerVersion)) {
            promptUnsupportedVersion(context, languageServerVersion);
            throw new Error(`Unsupported smithy-language-server version: ${languageServerVersion}`);
        }

        const javaHome = config.getServerJavaHome();
        const javaExecutable = javaHome && join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
        if (javaExecutable && !existsSync(javaExecutable)) {
            const message = `smithy.server.javaHome is set to ${javaHome}, but ${javaExecutable} doesn't exist.`;
            vscode.window.showErrorMessage(message);
            throw new Error(message);
        }

        // TODO: Remove deleteCoursier once most users have run a version after 0.10.2, which deletes
        // the Coursier binary that 0.10.2 and earlier downloaded.
        await deleteCoursier(context.globalStoragePath);

        const launchScript = await downloadLanguageServerIfRequired(context.globalStoragePath, languageServerVersion);
        if (javaExecutable) {
            // The launch scripts always use the bundled Java runtime, so run the server's main class directly.
            logger.info(`Launching smithy-language-server ${languageServerVersion} with ${javaExecutable}`);
            const classpath = join(dirname(dirname(launchScript)), 'lib', '*');
            return { command: javaExecutable, args: ['-cp', classpath, 'software.amazon.smithy.lsp.Main', '0'] };
        }
        logger.info(`Launching smithy-language-server ${languageServerVersion} via ${launchScript}`);

        if (process.platform === 'win32') {
            // Node can only run .bat files through a shell. Quote the path, which may contain spaces.
            // Pass the argument in the command, since Node deprecates args with shell (DEP0190).
            return { command: `"${launchScript}" 0`, args: [], options: { shell: true } };
        }

        return { command: launchScript, args: ['0'] };
    }
}

async function promptUnsupportedVersion(context: vscode.ExtensionContext, version: string): Promise<void> {
    const pickVersion = 'Pick a version';
    const choice = await vscode.window.showErrorMessage(
        `Smithy Language Server ${version} isn't supported. Pick version ${MINIMUM_VERSION} or later, ` +
            'or set smithy.server.executable to run your own installation. If smithyLsp.version is set, remove it.',
        pickVersion
    );
    if (choice === pickVersion) {
        await pickAndPinVersion(context);
    }
}
