import { DOMParser } from '@xmldom/xmldom';
import { existsSync } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import * as config from './config';
import JarFileContentsProvider from './jar-file-contents';
import SelectorHandler from './selector';
import downloadLanguageServerIfRequired, {
    compareVersions,
    isSupportedVersion,
    MINIMUM_VERSION,
} from './download-language-server';
import { logger } from './logger';

let client: lsp.LanguageClient;

// The version of the running language server, if the extension downloaded it.
let serverVersion: string | undefined;

// Settles once the language server's current start or restart, if any, finishes.
let serverUpdates: Promise<unknown> = Promise.resolve();

const VERSION_POLICY_PROMPTED_KEY = 'smithy.versionPolicyPrompted';
const LATEST_RELEASE = 'latest.release';

export async function activate(context: vscode.ExtensionContext) {
    // The client doesn't dispose a channel passed in via options, so we own its lifecycle.
    context.subscriptions.push(logger);

    promptVersionPolicy(context);
    createVersionStatusBarItem(context);
    // Registered before getServer, so the status bar item still works if the server can't be set up.
    context.subscriptions.push(vscode.commands.registerCommand('smithy.toggleVersionPolicy', toggleVersionPolicy));

    // Also registered before getServer, so they work once a version change starts the server.
    const selectorHandler = new SelectorHandler(() => client);

    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('smithyjar', new JarFileContentsProvider(() => client)),
        vscode.commands.registerCommand('smithy.runSelector', selectorHandler.run, selectorHandler),
        vscode.commands.registerCommand('smithy.clearSelector', selectorHandler.clear, selectorHandler),
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('smithy.server.version')) {
                restartServer(context);
            }
        })
    );

    // Start the client. This will also launch the server. Activation completes once the server has
    // initialized, so awaiting activation means the server is ready.
    await queueServerUpdate(async () => {
        const { server, version } = await getServer(context);
        await startClient(server, version);
    });
}

// Runs `update` once the language server's current start or restart, if any, finishes.
function queueServerUpdate(update: () => Promise<void>): Promise<void> {
    const result = serverUpdates.then(update);
    serverUpdates = result.catch(() => {});
    return result;
}

// Stops the running language server, if any, and starts `server`, which runs `version`.
async function startClient(server: lsp.Executable, version: string | undefined): Promise<void> {
    if (client) {
        // dispose() throws if the client isn't running, for example because it failed to start.
        await client.dispose().catch((err) => logger.warn(`Couldn't stop smithy-language-server: ${err}`));
    }
    serverVersion = undefined;

    client = new lsp.LanguageClient('smithy', 'Smithy', server, {
        outputChannel: logger,
        // Don't switch to output window when the server returns output.
        revealOutputChannelOn: lsp.RevealOutputChannelOn.Never,
        progressOnInitialization: true,

        documentSelector: [
            { language: 'smithy' },
            { scheme: 'smithyjar' },
            { pattern: '**/{smithy-build,.smithy-project}.json' },
        ],

        initializationOptions: {
            'diagnostics.minimumSeverity': config.getServerDiagnosticsMinimumSeverity(),
            onlyReloadOnSave: config.getServerOnlyReloadOnSave(),
        },
    });

    await client.start();
    serverVersion = version;
}

// Restarts the language server if smithy.server.version resolves to a version other than the running
// one. If a start or restart is running, restarts once it finishes, with the latest setting.
function restartServer(context: vscode.ExtensionContext): void {
    queueServerUpdate(async () => {
        const version = config.getServerVersion();
        // smithy.server.executable ignores smithy.server.version.
        if (config.getServerExecutable()) {
            return;
        }
        logger.info(`smithy.server.version changed to ${version}`);

        let server: lsp.Executable;
        let resolvedVersion: string | undefined;
        try {
            // Download before stopping the running server, which keeps running if this fails.
            ({ server, version: resolvedVersion } = await getServer(context));
        } catch (err) {
            logger.error(`Couldn't restart smithy-language-server with ${version}: ${err}`);
            if (!(err instanceof ShownError)) {
                vscode.window.showErrorMessage(
                    `Couldn't switch Smithy Language Server to ${version}: ${err instanceof Error ? err.message : err}`
                );
            }
            return;
        }

        if (resolvedVersion === serverVersion && client?.isRunning()) {
            logger.info(`smithy-language-server ${resolvedVersion} is already running, not restarting it`);
            return;
        }

        logger.info(`Restarting smithy-language-server with ${resolvedVersion}`);
        // The client shows its own error if the server fails to start.
        await startClient(server, resolvedVersion).catch((err) =>
            logger.error(`smithy-language-server failed to start: ${err}`)
        );
    });
}

// An error that the extension has already shown to the user.
class ShownError extends Error {}

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

    const pinVersion = 'Pin a version';
    const choice = await vscode.window.showInformationMessage(
        'The Smithy extension can automatically use the latest Smithy Language Server, or you can pin a specific version.',
        'Use latest',
        pinVersion
    );

    await context.globalState.update(VERSION_POLICY_PROMPTED_KEY, true);

    if (choice === pinVersion) {
        await pickAndPinVersion();
    }
}

function createVersionStatusBarItem(context: vscode.ExtensionContext): void {
    const item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    item.command = 'smithy.toggleVersionPolicy';

    const update = () => {
        const version = config.getServerVersion();
        if (version === LATEST_RELEASE) {
            item.text = '$(check) Smithy LS (latest)';
            item.tooltip = 'Smithy Language Server: using the latest release. Click to pin a version.';
        } else {
            item.text = '$(pin) Smithy LS v' + version;
            item.tooltip = 'Smithy Language Server: pinned to v' + version + '. Click to switch to latest.';
        }
    };

    update();
    item.show();
    context.subscriptions.push(item);

    // Update status bar when configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('smithy.server.version')) {
                update();
            }
        })
    );
}

async function fetchAvailableVersions(): Promise<string[]> {
    // Lists the 10 most recently published releases.
    const releasesFeedUrl = 'https://github.com/smithy-lang/smithy-language-server/releases.atom';
    try {
        const response = await fetch(releasesFeedUrl);
        const responseText = await response.text();
        const releasesFeed = new DOMParser().parseFromString(responseText, 'text/xml');

        // Each entry's id ends with the release tag, e.g. tag:github.com,2008:Repository/318516123/0.10.0.
        // Only versions with a release zip can be downloaded.
        return Array.from(
            releasesFeed.getElementsByTagName('entry'),
            (entry) => entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() ?? ''
        )
            .filter(isSupportedVersion)
            .sort(compareVersions)
            .reverse();
    } catch {
        return [];
    }
}

async function pickAndPinVersion(): Promise<void> {
    const versions = await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification, title: 'Fetching available versions...' },
        () => fetchAvailableVersions()
    );

    if (versions.length === 0) {
        vscode.window.showErrorMessage('Could not fetch Smithy Language Server versions from GitHub releases.');
        return;
    }

    const picked = await vscode.window.showQuickPick(versions, {
        placeHolder: 'Select a Smithy Language Server version to pin',
    });

    if (picked) {
        await setServerVersion(picked);
    }
}

async function toggleVersionPolicy(): Promise<void> {
    if (config.getServerVersion() === LATEST_RELEASE) {
        await pickAndPinVersion();
    } else {
        await setServerVersion(undefined);
    }
}

async function setServerVersion(version: string | undefined): Promise<void> {
    await vscode.workspace
        .getConfiguration('smithy')
        .update('server.version', version, vscode.ConfigurationTarget.Global);
}

// Returns the command that runs the language server, and the version it runs if the extension
// downloaded it.
async function getServer(context: vscode.ExtensionContext): Promise<{ server: lsp.Executable; version?: string }> {
    const serverExecutable = config.getServerExecutable();
    if (serverExecutable) {
        logger.info(`Using configured language server executable: ${serverExecutable}`);
        return {
            server: {
                command: serverExecutable,
                args: ['0'],
            },
        };
    }

    const languageServerVersion = config.getServerVersion();

    if (languageServerVersion !== LATEST_RELEASE && !isSupportedVersion(languageServerVersion)) {
        promptUnsupportedVersion(languageServerVersion);
        throw new ShownError(`Unsupported smithy-language-server version: ${languageServerVersion}`);
    }

    const javaHome = config.getServerJavaHome();
    const javaExecutable = javaHome && join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    if (javaExecutable && !existsSync(javaExecutable)) {
        const message = `smithy.server.javaHome is set to ${javaHome}, but ${javaExecutable} doesn't exist.`;
        vscode.window.showErrorMessage(message);
        throw new ShownError(message);
    }

    const { version, launchScript, classpath } = await downloadLanguageServerIfRequired(
        context.globalStoragePath,
        languageServerVersion
    );
    if (javaExecutable) {
        // The launch scripts always use the bundled Java runtime, so run the server's main class directly.
        logger.info(`Using smithy-language-server ${version} with ${javaExecutable}`);
        return {
            server: { command: javaExecutable, args: ['-cp', classpath, 'software.amazon.smithy.lsp.Main', '0'] },
            version,
        };
    }
    logger.info(`Using smithy-language-server ${version} at ${launchScript}`);

    if (process.platform === 'win32') {
        // Node can only run .bat files through a shell. Quote the path, which may contain spaces.
        // Pass the argument in the command, since Node deprecates args with shell (DEP0190).
        return { server: { command: `"${launchScript}" 0`, args: [], options: { shell: true } }, version };
    }

    return { server: { command: launchScript, args: ['0'] }, version };
}

async function promptUnsupportedVersion(version: string): Promise<void> {
    const pickVersion = 'Pick a version';
    const choice = await vscode.window.showErrorMessage(
        `Smithy Language Server ${version} isn't supported. Pick version ${MINIMUM_VERSION} or later, ` +
            'or set smithy.server.executable to run your own installation. If smithyLsp.version is set, remove it.',
        pickVersion
    );
    if (choice === pickVersion) {
        await pickAndPinVersion();
    }
}
