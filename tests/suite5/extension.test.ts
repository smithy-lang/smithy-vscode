import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, waitForServerStartup } from "../helper";

suite("formatting tests", () => {
  test("Should register Smithy formatter", async () => {
    const smithyMainUri = getDocUri("suite5/smithy/main.smithy");
    await waitForServerStartup();
    const edits: vscode.TextEdit[] = await vscode.commands.executeCommand("vscode.executeFormatDocumentProvider", smithyMainUri);
    const edit: vscode.TextEdit = edits[0];
    const expectedRange = new vscode.Range(new vscode.Position(12, 0), new vscode.Position(12, 0))
    const range = edit.range;
    const newText = edit.newText;

    assert.equal(edits.length, 1);
    assert.equal(range.isEqual(expectedRange), true);
    assert.equal(newText, "    ");
  }).timeout(10000);
});
