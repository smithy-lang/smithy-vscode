import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

namespace JarFileContentsRequest {
    type Params = lsp.TextDocumentIdentifier;

    type Result = string;

    const method = 'smithy/jarFileContents';

    export const type = new lsp.RequestType<Params, Result, void>(method);
}

export default class JarFileContentsProvider implements vscode.TextDocumentContentProvider {
    private client: lsp.LanguageClient;

    constructor(client: lsp.LanguageClient) {
        this.client = client;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return this.client.sendRequest(JarFileContentsRequest.type, { uri: uri.toString() }, token);
    }
}
