import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

const JarFileContentsRequest = {
    type: new lsp.RequestType<lsp.TextDocumentIdentifier, string, void>('smithy/jarFileContents'),
};

export default class JarFileContentsProvider implements vscode.TextDocumentContentProvider {
    private client: lsp.LanguageClient;

    constructor(client: lsp.LanguageClient) {
        this.client = client;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return this.client.sendRequest(JarFileContentsRequest.type, { uri: uri.toString() }, token);
    }
}
