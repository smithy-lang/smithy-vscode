import { suite, test } from 'node:test';
import * as vscode from 'vscode';
import { getDocUri, waitForServerStartup } from './../helper';

suite('Selector tests', function () {
    test('Can run selectors', async (t) => {
        const smithyMainUri = getDocUri('suite3/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();

        // Restored automatically when the test finishes.
        t.mock.method(vscode.window, 'showInputBox', async () => 'operation [id|namespace=example.weather]');
        await vscode.commands.executeCommand('smithy.runSelector');
        // we don't have a way to check the output. as long as this command
        // can run it should be fine - more robust tests are done on the server
        // side.
        return Promise.resolve();
    });
});
