import { suite, test } from 'node:test';
import * as assert from 'assert';
import type { TextEdit } from 'vscode';
import { getDocUri, waitFor, waitForServerStartup, vscode } from '../helper.ts';

// DEBUG: diagnostics for formatDocument leaving the document unchanged with --hidden-window.
const log = (msg: string) => process.stderr.write(`DIAG ${msg}\n`);
const state = () => {
    const ed = vscode.window.activeTextEditor;
    return JSON.stringify({
        focused: vscode.window.state.focused,
        active: ed?.document.uri.path.split('/').pop(),
        visible: vscode.window.visibleTextEditors.map((e) => e.document.uri.path.split('/').pop()),
        selection: ed && `${ed.selection.active.line}:${ed.selection.active.character}`,
        visibleRanges: ed?.visibleRanges.map((r) => `${r.start.line}-${r.end.line}`),
        version: ed?.document.version,
        dirty: ed?.document.isDirty,
    });
};

suite('formatting tests', function () {
    test('Should register Smithy formatter', async () => {
        const smithyMainUri = getDocUri('suite5/smithy/main.smithy');
        const doc = await vscode.workspace.openTextDocument(smithyMainUri);
        await vscode.window.showTextDocument(doc);
        await waitForServerStartup();
        // The formatter is registered once the server is ready, but the server only returns edits
        // after it has received the document, so wait for actual edits.
        await waitFor('the Smithy formatter to return edits', async () => {
            const edits = await vscode.commands.executeCommand<TextEdit[] | undefined>(
                'vscode.executeFormatDocumentProvider',
                smithyMainUri,
                { tabSize: 4, insertSpaces: true }
            );
            return edits && edits.length > 0;
        });

        // Record selection and text changes while the command runs: either one cancels the
        // format through EditorStateCancellationTokenSource.
        const events: string[] = [];
        const subs = [
            vscode.window.onDidChangeTextEditorSelection((e) =>
                events.push(`selection ${e.kind} ${e.selections[0].active.line}:${e.selections[0].active.character}`)
            ),
            vscode.workspace.onDidChangeTextDocument((e) =>
                events.push(`text v${e.document.version} changes=${e.contentChanges.length}`)
            ),
            vscode.window.onDidChangeActiveTextEditor((e) => events.push(`activeEditor ${e?.document.uri.path}`)),
            vscode.window.onDidChangeWindowState((e) => events.push(`windowState focused=${e.focused}`)),
        ];

        const beforeEditText = doc.getText();
        const before = state();
        await vscode.commands.executeCommand('editor.action.formatDocument', smithyMainUri);
        const after = state();
        const changed = doc.getText() !== beforeEditText;
        log(`before=${before}`);
        log(`after=${after}`);
        log(`changed=${changed} events=${JSON.stringify(events)}`);

        if (!changed) {
            const edits = await vscode.commands.executeCommand<TextEdit[] | undefined>(
                'vscode.executeFormatDocumentProvider',
                smithyMainUri,
                { tabSize: 4, insertSpaces: true }
            );
            log(`provider edits now=${edits?.length}`);
            events.length = 0;
            await vscode.commands.executeCommand('editor.action.formatDocument', smithyMainUri);
            log(`retry changed=${doc.getText() !== beforeEditText} events=${JSON.stringify(events)}`);
            await vscode.commands.executeCommand('workbench.action.focusActiveEditorGroup');
            events.length = 0;
            await vscode.commands.executeCommand('editor.action.formatDocument', smithyMainUri);
            log(
                `after focusActiveEditorGroup changed=${
                    doc.getText() !== beforeEditText
                } state=${state()} events=${JSON.stringify(events)}`
            );
        }
        subs.forEach((s) => s.dispose());
        // Discard the edits so a repeated suite5 starts from the unformatted file.
        await vscode.commands.executeCommand('workbench.action.files.revert');

        assert.ok(changed, 'formatDocument did not change the document');
    });
});
