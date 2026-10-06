import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import LanguageClientHandle, { SERVER_NOT_RUNNING_MESSAGE } from './language-client';

namespace JarFileContentsRequest {
    type Params = lsp.TextDocumentIdentifier;

    type Result = string;

    const method = 'smithy/jarFileContents';

    export const type = new lsp.RequestType<Params, Result, void>(method);
}

export default class JarFileContentsProvider implements vscode.TextDocumentContentProvider {
    private client: LanguageClientHandle;

    constructor(client: LanguageClientHandle) {
        this.client = client;
    }

    async provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): Promise<string> {
        const client = await this.client.get();
        if (!client) {
            throw new Error(SERVER_NOT_RUNNING_MESSAGE);
        }
        return client.sendRequest(JarFileContentsRequest.type, { uri: uri.toString() }, token);
    }
}
