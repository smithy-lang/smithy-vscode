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

const VERSION_POLICY_PROMPTED_KEY = 'smithy.versionPolicyPrompted';
const LATEST_RELEASE = 'latest.release';

export async function activate(context: vscode.ExtensionContext) {
    // The client doesn't dispose a channel passed in via options, so we own its lifecycle.
    context.subscriptions.push(logger);

    promptVersionPolicy(context);
    createVersionStatusBarItem(context);
    // Registered before getServer, so the status bar item still works if the server can't be set up.
    context.subscriptions.push(vscode.commands.registerCommand('smithy.toggleVersionPolicy', toggleVersionPolicy));

    const server = await getServer(context);

    // Create the language client and start the client.
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

    const selectorHandler = new SelectorHandler(client);

    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('smithyjar', new JarFileContentsProvider(client)),
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
    const feedUrl = 'https://github.com/smithy-lang/smithy-language-server/releases.atom';
    try {
        const response = await fetch(feedUrl);
        const text = await response.text();
        // Only versions with a release zip can be downloaded.
        return [
            ...text.matchAll(
                /href="https:\/\/github\.com\/smithy-lang\/smithy-language-server\/releases\/tag\/([^"]+)"/g
            ),
        ]
            .map((m) => m[1])
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
        await setServerVersion(picked, 'Smithy Language Server pinned to v' + picked + '. Reload window to apply.');
    }
}

async function toggleVersionPolicy(): Promise<void> {
    if (config.getServerVersion() === LATEST_RELEASE) {
        await pickAndPinVersion();
    } else {
        await setServerVersion(undefined, 'Smithy Language Server set to use latest version. Reload window to apply.');
    }
}

async function setServerVersion(version: string | undefined, message: string): Promise<void> {
    await vscode.workspace
        .getConfiguration('smithy')
        .update('server.version', version, vscode.ConfigurationTarget.Global);
    const reload = await vscode.window.showInformationMessage(message, 'Reload');
    if (reload === 'Reload') {
        vscode.commands.executeCommand('workbench.action.reloadWindow');
    }
}

async function getServer(context: vscode.ExtensionContext): Promise<lsp.Executable> {
    const serverExecutable = config.getServerExecutable();
    if (serverExecutable) {
        logger.info(`Using configured language server executable: ${serverExecutable}`);
        return {
            command: serverExecutable,
            args: ['0'],
        };
    }

    const languageServerVersion = config.getServerVersion();

    if (languageServerVersion !== LATEST_RELEASE && !isSupportedVersion(languageServerVersion)) {
        promptUnsupportedVersion(languageServerVersion);
        throw new Error(`Unsupported smithy-language-server version: ${languageServerVersion}`);
    }

    const javaHome = config.getServerJavaHome();
    const javaExecutable = javaHome && join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    if (javaExecutable && !existsSync(javaExecutable)) {
        const message = `smithy.server.javaHome is set to ${javaHome}, but ${javaExecutable} doesn't exist.`;
        vscode.window.showErrorMessage(message);
        throw new Error(message);
    }

    const { version, launchScript, classpath } = await downloadLanguageServerIfRequired(
        context.globalStoragePath,
        languageServerVersion
    );
    if (javaExecutable) {
        // The launch scripts always use the bundled Java runtime, so run the server's main class directly.
        logger.info(`Launching smithy-language-server ${version} with ${javaExecutable}`);
        return { command: javaExecutable, args: ['-cp', classpath, 'software.amazon.smithy.lsp.Main', '0'] };
    }
    logger.info(`Launching smithy-language-server ${version} via ${launchScript}`);

    if (process.platform === 'win32') {
        // Node can only run .bat files through a shell. Quote the path, which may contain spaces.
        // Pass the argument in the command, since Node deprecates args with shell (DEP0190).
        return { command: `"${launchScript}" 0`, args: [], options: { shell: true } };
    }

    return { command: launchScript, args: ['0'] };
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
