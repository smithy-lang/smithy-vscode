import * as assert from 'assert';
import * as vscode from 'vscode';
import { getDocUri, waitForServerStartup } from '../helper';

suite('formatting tests', function () {
    this.timeout(0);

    test('Should register Smithy formatter', async () => {
        const smithyMainUri = getDocUri('suite5/smithy/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();

        const beforeEditText = doc.getText();
        await vscode.commands.executeCommand('editor.action.formatDocument', smithyMainUri);
        const afterEditText = doc.getText();
        assert.notStrictEqual(afterEditText, beforeEditText);
    });
});
