import { suite, test } from 'node:test';
import * as assert from 'assert';
import * as vscode from 'vscode';
import { getDocUri, waitFor, waitForServerStartup } from './../helper';

suite('broken model tests', function () {
    test('Should provide diagnostics', async () => {
        const smithyMainUri = getDocUri('suite2/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();
        const diagnostics = await waitFor('diagnostics for the broken model', () => {
            const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);
            return diagnostics.length > 0 && diagnostics;
        });

        assert.match(diagnostics[0].message, /Cannot apply `smithy.api#deprecated` to an immutable prelude shape/);
        assert.equal(diagnostics[0].range.start.line, 4);
        assert.equal(diagnostics[0].range.start.character, 24);
        return Promise.resolve();
    });
});
