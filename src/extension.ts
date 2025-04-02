import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import * as config from './config';
import JarFileContentsProvider from './jar-file-contents';
import SelectorHandler from './selector';
import getCoursierExecutable from './coursier/coursier';

let client: lsp.LanguageClient;

export async function activate(context: vscode.ExtensionContext) {
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

    // Start the client. This will also launch the server
    client.start();
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
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
                '-M',
                'software.amazon.smithy.lsp.Main',
                '--',
                '0',
            ],
        };
    }
}
