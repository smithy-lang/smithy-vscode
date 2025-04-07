import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Startup', function () {
    this.timeout(0);

    test('Should start without opening a smithy file', async () => {
        const extension = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        assert.ok(extension.isActive);

        return Promise.resolve();
    });
});
