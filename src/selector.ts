import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

import LanguageClientHandle, { SERVER_NOT_RUNNING_MESSAGE } from './language-client';

namespace SelectorCommandRequest {
    type Params = {
        expression: string;
    };

    type Result = lsp.Location[];

    const method = 'smithy/selectorCommand';

    export const type = new lsp.RequestType<Params, Result, void>(method);
}

export default class SelectorHandler {
    private client: LanguageClientHandle;
    private expression: string = 'Enter selector expression';
    private decorationType: vscode.TextEditorDecorationType;

    constructor(client: LanguageClientHandle) {
        this.client = client;
        this.decorationType = createDecorationType();
    }

    async run() {
        if (this.client.isUnavailable()) {
            vscode.window.showErrorMessage(SERVER_NOT_RUNNING_MESSAGE);
            return;
        }

        const expression = await vscode.window.showInputBox({
            title: 'Run a selector',
            value: this.expression,
        });

        // Don't do anything if expression was not populated.
        if (!expression) {
            return;
        }

        // Don't do anything if there's no active editor.
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return;
        }

        await this.clear();
        this.expression = expression;

        // The server may still be starting, so show progress while waiting for it.
        const response = await vscode.window.withProgress(
            { location: vscode.ProgressLocation.Window, title: 'Running Smithy selector' },
            async () => {
                const client = await this.client.get();
                return client?.sendRequest(SelectorCommandRequest.type, { expression });
            }
        );
        if (!response) {
            vscode.window.showErrorMessage(SERVER_NOT_RUNNING_MESSAGE);
            return;
        }

        const ranges: vscode.Range[] = [];
        for (const location of response) {
            if (location.uri.endsWith(activeEditor.document.fileName)) {
                const range = new vscode.Range(
                    location.range.start.line,
                    location.range.start.character,
                    location.range.end.line,
                    location.range.end.character
                );
                ranges.push(range);
            }
        }

        activeEditor.setDecorations(this.decorationType, ranges);
    }

    async clear() {
        this.decorationType.dispose();
        this.decorationType = createDecorationType();
    }
}

function createDecorationType(): vscode.TextEditorDecorationType {
    return vscode.window.createTextEditorDecorationType({
        border: 'dotted',
        borderColor: '#C44536',
    });
}
