import { suite, test } from 'node:test';
import * as assert from 'assert';
import { vscode } from '../helper.ts';

suite('Missing Java home', function () {
    test('Should fail activation when smithy.server.javaHome has no java executable', async () => {
        const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        assert.ok(ext);
        await assert.rejects(
            async () => ext.activate(),
            /smithy\.server\.javaHome is set to .*, but .* doesn't exist\./
        );
    });
});
