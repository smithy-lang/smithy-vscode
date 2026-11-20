import { suite, test } from 'node:test';
import * as assert from 'assert';
import { getDocUri, waitForPublishedDiagnostics, vscode } from '../helper.ts';

suite('Java home', function () {
    test('Should run the language server with smithy.server.javaHome', async () => {
        const javaHome = vscode.workspace.getConfiguration('smithy').get<string>('server.javaHome');
        assert.ok(javaHome, 'runTest.ts should set smithy.server.javaHome for this suite');
        const smithyMainUri = getDocUri('suite7/main.smithy');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(smithyMainUri));
        await waitForPublishedDiagnostics(smithyMainUri);
        assert.deepStrictEqual(vscode.languages.getDiagnostics(smithyMainUri), []);
    });
});
