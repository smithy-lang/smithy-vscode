import * as assert from 'assert';
import * as sinon from 'sinon';
import * as vscode from 'vscode';
import { getDocUri, SMITHY_COMMANDS } from './helper';

const NOT_RUNNING = /Smithy Language Server is not running/;

/**
 * Tests for when the language server can't be used, shared by the suites that make server setup or
 * server start fail.
 */
export function serverUnavailableTests(fixture: string) {
    teardown(() => sinon.restore());

    test('Activates and registers commands', async () => {
        const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
        await ext.activate();
        assert.ok(ext.isActive);

        const commands = await vscode.commands.getCommands(true);
        for (const command of SMITHY_COMMANDS) {
            assert.ok(commands.includes(command), `${command} is not registered`);
        }
    });

    test('Selector reports that the server is not running', async () => {
        const doc = await vscode.workspace.openTextDocument(getDocUri(`${fixture}/main.smithy`));
        await vscode.window.showTextDocument(doc);

        // Server setup or start may still be in progress, so the selector may get as far as the input box.
        sinon.stub(vscode.window, 'showInputBox').resolves('string');
        const showErrorMessage = sinon.stub(vscode.window, 'showErrorMessage').resolves(undefined);

        await vscode.commands.executeCommand('smithy.runSelector');

        assert.ok(
            showErrorMessage.getCalls().some((call) => NOT_RUNNING.test(call.args[0])),
            `Expected a "not running" error, got: ${JSON.stringify(showErrorMessage.getCalls().map((c) => c.args))}`
        );
    });

    test('smithyjar documents report that the server is not running', async () => {
        const uri = vscode.Uri.parse('smithyjar:/tmp/example.jar!/META-INF/smithy/main.smithy');
        await assert.rejects(Promise.resolve(vscode.workspace.openTextDocument(uri)), NOT_RUNNING);
    });
}
