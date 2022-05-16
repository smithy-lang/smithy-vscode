import * as net from "net";
import * as fs from "fs";
import * as child_process from "child_process";
import { workspace, ExtensionContext } from "vscode";
import * as vscode from "vscode";
import { SelectorDecorator } from "./selector/selector-decorator";
import { selectorRunCommandHandler, selectorClearCommandHandler } from "./selector/selector-command-handlers";

import {
  CancellationToken,
  LanguageClient,
  LanguageClientOptions,
  RequestType,
  StreamInfo,
  TextDocumentIdentifier,
} from "vscode-languageclient/node";
import { getCoursierExecutable } from "./coursier/coursier";

let client: LanguageClient;

export function activate(context: ExtensionContext) {
  async function createServer(): Promise<StreamInfo> {
    function startServer(executable: string): Promise<StreamInfo> {
      console.log(`Executable located at ${executable}.`);
      return new Promise((resolve, reject) => {
        const server = net
          .createServer((socket) => {
            console.log("Creating server");

            resolve({
              reader: socket,
              writer: socket,
            });

            socket.on("end", () => console.log("Disconnected"));
          })
          .on("error", (err) => {
            // handle errors here
            reject(err);
          });

        // grab a random port.
        server.listen(() => {
          // Start the child java process
          let options = { cwd: context.extensionPath };

          let port = (server.address() as net.AddressInfo).port;

          let version = vscode.workspace.getConfiguration("smithyLsp").get("version", "`");

          // Downloading latest poms
          let resolveArgs = [
            "resolve",
            "--mode",
            "force",
            "software.amazon.smithy:smithy-language-server:" + version,
            "-r",
            "m2local",
          ];
          let resolveProcess = child_process.spawn(executable, resolveArgs, options);
          console.log(resolveArgs);
          resolveProcess.on("exit", (exitCode) => {
            console.log("Exit code : " + exitCode);
            if (exitCode == 0) {
              console.log("Launching smithy-language-server version:" + version);

              let launchargs = [
                "launch",
                "software.amazon.smithy:smithy-language-server:" + version,
                "-r",
                "m2local",
                "--",
                port.toString(),
              ];

              console.log(launchargs);

              let childProcess = child_process.spawn(executable, launchargs, options);

              childProcess.stdout.on("data", (data) => {
                console.log(`stdout: ${data}`);
              });

              childProcess.stderr.on("data", (data) => {
                console.error(`stderr: ${data}`);
              });

              childProcess.on("close", (code) => {
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

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [
      { scheme: "file", language: "smithy" },
      { scheme: "smithyjar", language: "smithy" },
    ],
    synchronize: {
      // Notify the server about file changes to 'smithy-build.json' files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/{smithy-build}.json"),
    },
    outputChannelName: "Smithy Language Server",
  };

  // Create the language client and start the client.

  client = new LanguageClient("smithyLsp", "Smithy LSP", createServer, clientOptions);

  // Set client on `this` context to use with command handlers.
  this.client = client;

  const smithyContentProvider = createSmithyContentProvider(client);
  context.subscriptions.push(workspace.registerTextDocumentContentProvider("smithyjar", smithyContentProvider));

  // Set default expression input, and use context to hold state between command invocations.
  this.expression = "Enter Selector Expression";
  this.selectorDecorator = new SelectorDecorator();

  // Register selector commands.
  context.subscriptions.push(vscode.commands.registerCommand("smithy.runSelector", selectorRunCommandHandler, this));
  context.subscriptions.push(
    vscode.commands.registerCommand("smithy.clearSelector", selectorClearCommandHandler, this)
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

function createSmithyContentProvider(languageClient: LanguageClient): vscode.TextDocumentContentProvider {
  return <vscode.TextDocumentContentProvider>{
    provideTextDocumentContent: async (uri: vscode.Uri, token: CancellationToken): Promise<string> => {
      return languageClient
        .sendRequest(ClassFileContentsRequest.type, { uri: uri.toString() }, token)
        .then((v: string): string => {
          return v || "";
        });
    },
  };
}

export namespace ClassFileContentsRequest {
  export const type = new RequestType<TextDocumentIdentifier, string, void>("smithy/jarFileContents");
}
