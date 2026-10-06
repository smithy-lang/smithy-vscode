import * as assert from 'assert';
import { existsSync } from 'fs';
import { join } from 'path';
import * as sinon from 'sinon';
import * as vscode from 'vscode';

// runTest.ts launches this suite with a fresh profile and without Coursier on PATH, so the extension has to
// download Coursier before it can start the server. The workspace has no Smithy files, so the extension is
// activated by running the command below.
suite('Slow server setup', function () {
    this.timeout(0);

    teardown(() => sinon.restore());

    test("Commands don't wait for the server to be set up", async () => {
        const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        assert.ok(!ext.isActive, 'the extension should not be activated before running the command');

        const coursier = join(
            process.env.SMITHY_TEST_USER_DATA_DIR,
            'User',
            'globalStorage',
            'smithy.smithy-vscode-extension',
            'coursier'
        );
        let coursierExistedWhenInputBoxShown: boolean | undefined;
        sinon.stub(vscode.window, 'showInputBox').callsFake(async () => {
            coursierExistedWhenInputBoxShown = existsSync(coursier);
            // Cancel, as there is no Smithy file to run the selector against.
            return undefined;
        });

        await vscode.commands.executeCommand('smithy.runSelector');

        assert.ok(ext.isActive);
        assert.strictEqual(
            coursierExistedWhenInputBoxShown,
            false,
            'the input box should open before Coursier is downloaded'
        );
    });
});
