import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import * as config from './config';
import JarFileContentsProvider from './jar-file-contents';
import SelectorHandler from './selector';
import getCoursierExecutable from './coursier/coursier';

let client: lsp.LanguageClient;
let versionStatusBarItem: vscode.StatusBarItem;

const VERSION_POLICY_PROMPTED_KEY = 'smithy.versionPolicyPrompted';
const LATEST_RELEASE = 'latest.release';

export async function activate(context: vscode.ExtensionContext) {
    promptVersionPolicy(context);
    createVersionStatusBarItem(context);

    const server = await getServer(context);
    const clientOptions = getClientOptions();

    // Create the language client and start the client.
    client = new lsp.LanguageClient('smithy', 'Smithy', server, clientOptions);

    const jarFileContentsProvider = new JarFileContentsProvider(client);
    const selectorHandler = new SelectorHandler(client);

    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider('smithyjar', jarFileContentsProvider),
        vscode.commands.registerCommand('smithy.runSelector', selectorHandler.run, selectorHandler),
        vscode.commands.registerCommand('smithy.clearSelector', selectorHandler.clear, selectorHandler),
        vscode.commands.registerCommand('smithy.toggleVersionPolicy', () => toggleVersionPolicy(context))
    );

    // Start the client. This will also launch the server
    client.start();
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
        await pickAndPinVersion();
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
        versionStatusBarItem.tooltip =
            'Smithy Language Server: using latest from Maven Central. Click to pin a version.';
    } else {
        versionStatusBarItem.text = '$(pin) Smithy LS v' + version;
        versionStatusBarItem.tooltip = 'Smithy Language Server: pinned to v' + version + '. Click to switch to latest.';
    }
}

async function fetchAvailableVersions(): Promise<string[]> {
    const metadataUrl =
        'https://repo1.maven.org/maven2/software/amazon/smithy/smithy-language-server/maven-metadata.xml';
    try {
        const response = await fetch(metadataUrl);
        const text = await response.text();
        const versions = [...text.matchAll(/<version>([^<]+)<\/version>/g)].map((m) => m[1]).reverse();
        return versions;
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
        vscode.window.showErrorMessage('Could not fetch Smithy Language Server versions from Maven Central.');
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
        await pickAndPinVersion();
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
        outputChannelName: 'Smithy Language Server',
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

// Couriser uses an index to determine where to download jvms from: https://get-coursier.io/docs/2.0.6/cli-java#jvm-index
// Newer versions of coursier use this index, which is more up to date than the one
// used by the coursier version used by the extension.
// This is a temporary solution to avoid adding logic that determines the version of
// coursier on the local machine. In the near future, we will vend the language server
// as a standalone executable, and will no longer need couriser to manage the jvm version.
const COURSIER_JVM_INDEX = 'https://raw.githubusercontent.com/coursier/jvm-index/master/index.json';

async function getServer(context: vscode.ExtensionContext): Promise<lsp.Executable> {
    const serverExecutable = config.getServerExecutable();
    if (serverExecutable) {
        return {
            command: serverExecutable,
            args: ['0'],
        };
    } else {
        const coursierExecutable = await getCoursierExecutable(context);
        const languageServerVersion = config.getServerVersion();
        return {
            command: coursierExecutable,
            args: [
                'launch',
                'software.amazon.smithy:smithy-language-server:' + languageServerVersion,
                // Configure couriser to use java 21
                '--jvm',
                // By default, coursier uses AdoptOpenJDK: https://get-coursier.io/docs/2.0.6/cli-java
                // We could just say '21' here, and let coursier default to adopt jdk
                // 21, but later versions of the jdk are released under the name adoptium.
                'corretto:21',
                // The location to download the jvm from is provided by the jvm index.
                '--jvm-index',
                COURSIER_JVM_INDEX,
                '-r',
                'm2local',
                '-M',
                'software.amazon.smithy.lsp.Main',
                '--',
                '0',
            ],
        };
    }
}
