import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, waitForServerStartup } from "./../helper";

suite("broken model tests", () => {
  test("Should provide diagnostics", async () => {
    const smithyMainUri = getDocUri("suite2/main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    await vscode.window.showTextDocument(doc);
    await waitForServerStartup();
    const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);

    assert.match(diagnostics[0].message, /Cannot apply `smithy.api#deprecated` to an immutable prelude shape/);
    assert.equal(diagnostics[0].range.start.line, 4);
    assert.equal(diagnostics[0].range.start.character, 0);
  }).timeout(10000);
});
