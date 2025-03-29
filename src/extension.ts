import * as net from 'net';
import * as fs from 'fs';
import * as child_process from 'child_process';
import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import { getCoursierExecutable } from './coursier/coursier';
import JarFileContentsProvider from './jar-file-contents';
import SelectorHandler from './selector';

// Couriser uses an index to determine where to download jvms from: https://get-coursier.io/docs/2.0.6/cli-java#jvm-index
// Newer versions of coursier use this index, which is more up to date than the one
// used by the coursier version used by the extension.
// This is a temporary solution to avoid adding logic that determines the version of
// coursier on the local machine. In the near future, we will vend the language server
// as a standalone executable, and will no longer need couriser to manage the jvm version.
const COURSIER_JVM_INDEX = 'https://raw.githubusercontent.com/coursier/jvm-index/master/index.json';

let client: lsp.LanguageClient;

type RunCmd = {
    command: string;
    args: string[];
};

function runWithCmd(context: vscode.ExtensionContext, cmd: RunCmd): lsp.StreamInfo {
    const options = { cwd: context.extensionPath };
    const cp = child_process.spawn(cmd.command, cmd.args, options);

    return {
        writer: cp.stdin,
        reader: cp.stdout,
    };
}

async function runWithCoursier(context: vscode.ExtensionContext): Promise<lsp.StreamInfo> {
    function startServer(executable: string): Promise<lsp.StreamInfo> {
        console.log(`Executable located at ${executable}.`);
        return new Promise((resolve, reject) => {
            const server = net
                .createServer((socket) => {
                    console.log('Creating server');

                    resolve({
                        reader: socket,
                        writer: socket,
                    });

                    socket.on('end', () => console.log('Disconnected'));
                })
                .on('error', (err) => {
                    // handle errors here
                    reject(err);
                });

            // grab a random port.
            server.listen(() => {
                // Start the child java process
                let options = { cwd: context.extensionPath };

                let port = (server.address() as net.AddressInfo).port;

                let version = vscode.workspace.getConfiguration('smithyLsp').get('version', '`');

                // Downloading latest poms
                let resolveArgs = [
                    'resolve',
                    '--mode',
                    'force',
                    'software.amazon.smithy:smithy-language-server:' + version,
                    '-r',
                    'm2local',
                ];
                let resolveProcess = child_process.spawn(executable, resolveArgs, options);
                console.log(resolveArgs);
                resolveProcess.on('exit', (exitCode) => {
                    console.log('Exit code : ' + exitCode);
                    if (exitCode == 0) {
                        console.log('Launching smithy-language-server version:' + version);

                        let launchargs = [
                            'launch',
                            'software.amazon.smithy:smithy-language-server:' + version,
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
                            port.toString(),
                        ];

                        console.log(launchargs);

                        let childProcess = child_process.spawn(executable, launchargs, options);

                        childProcess.stdout.on('data', (data) => {
                            console.log(`stdout: ${data}`);
                        });

                        childProcess.stderr.on('data', (data) => {
                            console.error(`stderr: ${data}`);
                        });

                        childProcess.on('close', (code) => {
                            console.log(`LSP exited with code ${code}`);
                        });
                    } else {
                        console.log(`Could not resolve smithy-language-server implementation`);
                    }
                });

                // Send raw output to a file
                if (context.storageUri) {
                    if (!fs.existsSync(context.storageUri.fsPath)) {
                        fs.mkdirSync(context.storageUri.fsPath);
                    }
                }
            });
        });
    }

    const binaryPath = await getCoursierExecutable(context.globalStoragePath);
    return await startServer(binaryPath);
}

export function activate(context: vscode.ExtensionContext) {
    async function createServer(): Promise<lsp.StreamInfo> {
        const cmd: RunCmd | undefined = vscode.workspace.getConfiguration('smithyLsp').get('runCmd');
        if (cmd) {
            console.log('Running with command: ', JSON.stringify(cmd, null, 4));
            return runWithCmd(context, cmd);
        } else {
            console.log('Running with coursier');
            return await runWithCoursier(context);
        }
    }

    // Create the language client and start the client.
    client = new lsp.LanguageClient('smithyLsp', 'Smithy LSP', createServer, getClientOptions());

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

function getClientOptions(): lsp.LanguageClientOptions {
    let workspaceFolder: vscode.WorkspaceFolder | undefined;

    let rootPath: string | undefined = vscode.workspace.getConfiguration('smithyLsp').get('rootPath');

    if (rootPath) {
        const workspaceRoot = getWorkspaceRoot();
        if (rootPath.startsWith('${workspaceRoot}') && workspaceRoot === '') {
            console.warn(`Unable to retrieve the workspace root.`);
        }
        workspaceFolder = {
            uri: vscode.Uri.file(rootPath.replace('${workspaceRoot}', workspaceRoot)),
            name: 'smithy-lsp-root-path',
            index: 1,
        };
    }

    // Configure file patterns relative to the workspace folder.
    let filePattern: vscode.GlobPattern = '**/{smithy-build}.json';
    let selectorPattern: string | undefined;
    if (workspaceFolder) {
        filePattern = new vscode.RelativePattern(workspaceFolder, filePattern);
        selectorPattern = `${workspaceFolder.uri.fsPath}/**/*`;
    }

    lsp.DocumentSelector;
    // Options to control the language client
    return {
        // Register the server for plain text documents
        documentSelector: [
            { scheme: 'file', language: 'smithy', pattern: selectorPattern },
            { scheme: 'smithyjar', language: 'smithy', pattern: selectorPattern },
            { scheme: 'file', language: 'json', pattern: '**/{smithy-build,.smithy-project}.json' },
        ],
        synchronize: {
            // Notify the server about file changes to 'smithy-build.json' files contained in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher(filePattern),
        },
        outputChannelName: 'Smithy Language Server',

        workspaceFolder,

        initializationOptions: {
            'diagnostics.minimumSeverity': vscode.workspace
                .getConfiguration('smithyLsp')
                .get('diagnostics.minimumSeverity'),
            onlyReloadOnSave: vscode.workspace.getConfiguration('smithyLsp').get('onlyReloadOnSave'),
        },

        // Don't switch to output window when the server returns output.
        revealOutputChannelOn: lsp.RevealOutputChannelOn.Never,
        progressOnInitialization: true,
    };
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}

function getWorkspaceRoot(): string {
    let folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) {
        return '';
    }
    let folder = folders[0];
    if (folder.uri.scheme === 'file') {
        return folder.uri.fsPath;
    }
    return '';
}
