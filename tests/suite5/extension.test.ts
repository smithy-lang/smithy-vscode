import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, waitForServerStartup } from "../helper";

suite("formatting tests", () => {
  test("Should register Smithy formatter", async () => {
    const smithyMainUri = getDocUri("suite5/smithy/main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    await vscode.window.showTextDocument(doc);
    await waitForServerStartup();
    const edits: vscode.TextEdit[] = await vscode.commands.executeCommand(
      "vscode.executeFormatDocumentProvider",
      smithyMainUri
    );
    assert.strictEqual(edits.length > 0, true, "expected edits from formatter, but got none");
  }).timeout(10000);
});
