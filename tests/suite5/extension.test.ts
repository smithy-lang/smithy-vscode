import { suite, test } from 'node:test';
import type { TextEdit } from 'vscode';
import { getDocUri, waitFor, waitForServerStartup, vscode } from '../helper.ts';

suite('formatting tests', function () {
    test('Should register Smithy formatter', async () => {
        const smithyMainUri = getDocUri('smithy/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();
        // The formatter is registered once the server is ready, but the server only returns edits
        // after it has received the document, so wait for actual edits.
        await waitFor('the Smithy formatter to return edits', async () => {
            const edits = await vscode.commands.executeCommand<TextEdit[] | undefined>(
                'vscode.executeFormatDocumentProvider',
                smithyMainUri,
                { tabSize: 4, insertSpaces: true }
            );
            return edits && edits.length > 0;
        });

        // editor.action.formatDocument does nothing until the workbench has finished starting up,
        // which takes seconds longer with --hidden-window
        // (https://github.com/microsoft/vscode/issues/349541). Retry it until it changes the document.
        const beforeEditText = doc.getText();
        await waitFor(
            'editor.action.formatDocument to change the document',
            async () => {
                await vscode.commands.executeCommand('editor.action.formatDocument', smithyMainUri);
                return doc.getText() !== beforeEditText;
            },
            30_000
        );
    });
});
