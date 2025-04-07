import * as assert from 'assert';
import * as vscode from 'vscode';
import { getDocUri, waitForServerStartup } from '../helper';

suite('User-specific root', function () {
    this.timeout(0);

    test('Should download jars even when not in workspace root', async () => {
        const smithyMainUri = getDocUri('suite4/smithy/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();
        const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);

        // We would have diagnostics for unknown traits if the jars weren't downloaded
        assert.equal(diagnostics.length, 0);
        return Promise.resolve();
    });
});
