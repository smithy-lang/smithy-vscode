import { suite, test } from 'node:test';
import * as assert from 'assert';
import { getDocUri, waitFor, vscode } from '../helper.ts';

suite('server-version-unsupported', function () {
    test('Should start the server when the status bar switches to latest.release after activation failed', async (t) => {
        const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        assert.ok(ext);
        await assert.rejects(async () => ext.activate(), /Unsupported smithy-language-server version: 0\.1/);

        const mainUri = getDocUri(import.meta.dirname, 'main.smithy');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(mainUri));
        // Pinned to 0.1, so this switches to latest.release without opening the picker.
        await vscode.commands.executeCommand('smithy.toggleVersionPolicy');
        assert.equal(vscode.workspace.getConfiguration('smithy').get('server.version'), 'latest.release');
        await waitFor(
            'diagnostics to be published for main.smithy',
            () => vscode.languages.getDiagnostics().some(([uri]) => uri.toString() === mainUri.toString()),
            30_000
        );

        // Restored automatically when the test finishes.
        t.mock.method(vscode.window, 'showInputBox', async () => 'string');
        await vscode.commands.executeCommand('smithy.runSelector');
    });
});
