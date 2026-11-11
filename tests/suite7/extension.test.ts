import { suite, test } from 'node:test';
import * as assert from 'assert';
import { vscode } from '../helper.ts';

suite('Unsupported version', function () {
    test('Should fail to start with a version older than 0.7.0', async () => {
        const extension = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        assert.ok(extension);
        await assert.rejects(
            Promise.resolve(extension.activate()),
            /Unsupported smithy-language-server version: 0\.6\.0/
        );
    });
});
