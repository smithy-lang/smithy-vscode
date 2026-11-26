import { afterEach, before, suite, test } from 'node:test';
import * as assert from 'assert';
import type { TextEditor } from 'vscode';
import { getDocUri, waitFor, vscode } from '../helper.ts';

// Tests the snippets and language configuration that package.json contributes, which work without
// the language server.
suite('language-features-declarative', function () {
    const mainUri = getDocUri(import.meta.dirname, 'main.smithy');
    let editor: TextEditor;

    // Runs `command` on main.smithy's last line, which is empty, and returns the text it added, with
    // LF line endings. Emptying the document instead makes the server publish invalid diagnostics:
    // https://github.com/smithy-lang/smithy-language-server/issues/277
    const runOnLastLine = async (command: string, args?: object) => {
        const lastLine = () => editor.document.lineAt(editor.document.lineCount - 1).range;
        const start = lastLine().start;
        assert.ok(lastLine().isEmpty, 'main.smithy should end with a newline');
        editor.selection = new vscode.Selection(start, start);
        await vscode.commands.executeCommand(command, args);
        return editor.document.getText(new vscode.Range(start, lastLine().end)).replace(/\r\n/g, '\n');
    };

    before(async () => {
        editor = await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(mainUri));
    });

    // Discard the test's edits, so the fixture stays unchanged.
    afterEach(async () => {
        await vscode.window.showTextDocument(editor.document);
        await vscode.commands.executeCommand('workbench.action.files.revert');
    });

    test('Should open .smithy files as Smithy', async () => {
        assert.equal(editor.document.languageId, 'smithy');
    });

    test('Should insert snippets', async () => {
        const text = await runOnLastLine('editor.action.insertSnippet', {
            langId: 'smithy',
            name: 'Add Structure shape',
        });
        assert.equal(text, 'structure MyStructure {\n}');
    });

    test('Should toggle line comments', async () => {
        editor.selection = new vscode.Selection(0, 0, 0, 0);
        await vscode.commands.executeCommand('editor.action.commentLine');
        assert.equal(editor.document.lineAt(0).text, '// $version: "2.0"');
    });

    for (const [open, close] of [
        ['{', '}'],
        ['[', ']'],
        ['(', ')'],
        ['"', '"'],
        ['"""', '"""'],
    ]) {
        test(`Should auto-close ${open}`, async () => {
            // VS Code only auto-closes once the lines above the cursor are tokenized, and after a
            // document change, such as the previous test's revert, it tokenizes them again on a web
            // worker. So retry, clearing the line before each try.
            await waitFor(
                `${open} to auto-close`,
                async () => {
                    const lastLine = editor.document.lineAt(editor.document.lineCount - 1).range;
                    await editor.edit((builder) => builder.delete(lastLine));
                    return (await runOnLastLine('type', { text: open })) === open + close;
                },
                30_000
            );
        });
    }
});
