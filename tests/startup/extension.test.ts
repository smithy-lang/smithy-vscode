import { suite, test } from 'node:test';
import * as assert from 'assert';
import { getDocUri, waitForPublishedDiagnostics, vscode } from '../helper.ts';

suite('startup', function () {
    test('Should start extension and Language Server', async () => {
        const smithyMainUri = getDocUri(import.meta.dirname, 'main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        const editor = await vscode.window.showTextDocument(doc);
        const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        await waitForPublishedDiagnostics(smithyMainUri);
        const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);

        // Grab model file directly
        const modelFile = await vscode.workspace.openTextDocument(getDocUri(import.meta.dirname, 'main.smithy'));
        const modelFileText = modelFile.getText();

        assert.match(modelFileText, /namespace example.weather/);

        assert.notEqual(doc, undefined);
        assert.notEqual(editor, undefined);
        assert.ok(ext);
        assert.equal(ext.isActive, true);
        assert.deepStrictEqual(diagnostics, []);
    });

    test('Should register language', async () => {
        const languages = await vscode.languages.getLanguages();
        assert.equal(languages.includes('smithy'), true);
    });
});
