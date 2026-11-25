import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

const JarFileContentsRequest = {
    type: new lsp.RequestType<lsp.TextDocumentIdentifier, string, void>('smithy/jarFileContents'),
};

export default class JarFileContentsProvider implements vscode.TextDocumentContentProvider {
    // Returns the current client, which changes when the language server restarts.
    private getClient: () => lsp.LanguageClient;

    constructor(getClient: () => lsp.LanguageClient) {
        this.getClient = getClient;
    }

    provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
        return this.getClient().sendRequest(JarFileContentsRequest.type, { uri: uri.toString() }, token);
    }
}
