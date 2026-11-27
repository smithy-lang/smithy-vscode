import * as assert from 'assert';
import type { Range, TextDocument, TextEditorDecorationType } from 'vscode';
import { suite, test, type TestContext } from 'node:test';
import { getDocUri, waitForServerStartup, vscode } from '../helper.ts';

// Runs the `operation` selector with an active editor on `document`, and returns the lines it decorated, in order.
async function runSelector(t: TestContext, document: Pick<TextDocument, 'uri' | 'fileName'>): Promise<number[]> {
    await waitForServerStartup();
    let decorated: readonly Range[] | undefined;
    const editor = {
        document,
        setDecorations: (_type: TextEditorDecorationType, ranges: readonly Range[]) => {
            decorated = ranges;
        },
    };
    // Restored automatically when the test finishes.
    t.mock.method(vscode.window, 'showInputBox', async () => 'operation');
    t.mock.getter(vscode.window, 'activeTextEditor', () => editor);
    await vscode.commands.executeCommand('smithy.runSelector');
    assert.ok(decorated, 'setDecorations was not called');
    return decorated.map((range) => range.start.line).sort((a, b) => a - b);
}

// Lines of the operations in `document`, which the `operation` selector decorates.
function operationLines(document: TextDocument): number[] {
    return document
        .getText()
        .split('\n')
        .flatMap((line, i) => (line.startsWith('operation ') ? [i] : []));
}

suite('selector', function () {
    test('Decorates the selected shapes in the active file', async (t) => {
        const doc = await vscode.workspace.openTextDocument(getDocUri(import.meta.dirname, 'main.smithy'));
        assert.deepEqual(await runSelector(t, doc), operationLines(doc));
    });

    test('Decorates the selected shapes when the file path has a space', async (t) => {
        const doc = await vscode.workspace.openTextDocument(getDocUri(import.meta.dirname, 'weather alerts.smithy'));
        assert.deepEqual(await runSelector(t, doc), operationLines(doc));
    });

    test('Decorates the selected shapes when the file path has backslashes, as on Windows', async (t) => {
        const doc = await vscode.workspace.openTextDocument(getDocUri(import.meta.dirname, 'main.smithy'));
        const fileName = doc.fileName.replaceAll('/', '\\');
        assert.deepEqual(await runSelector(t, { uri: doc.uri, fileName }), operationLines(doc));
    });

    test("Doesn't decorate shapes in a file whose path ends with the active file's path", async (t) => {
        const uri = vscode.Uri.file('/selector/workspace/main.smithy');
        assert.deepEqual(await runSelector(t, { uri, fileName: uri.fsPath }), []);
    });
});
