import * as vscode from 'vscode';
import * as lsp from 'vscode-languageclient/node';

namespace SelectorCommandRequest {
    type Params = {
        expression: string;
    };

    type Result = lsp.Location[];

    const method = 'smithy/selectorCommand';

    export const type = new lsp.RequestType<Params, Result, void>(method);
}

export default class SelectorHandler {
    private client: lsp.LanguageClient;
    private expression: string = 'Enter selector expression';
    private decorationType: vscode.TextEditorDecorationType;

    constructor(client: lsp.LanguageClient) {
        this.client = client;
        this.decorationType = createDecorationType();
    }

    async run() {
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

        const response = await this.client.sendRequest(SelectorCommandRequest.type, { expression });

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
