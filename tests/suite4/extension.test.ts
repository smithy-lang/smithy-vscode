import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, getLangServerLogs, waitForServerStartup } from "../helper";

suite("User-specific root", () => {
  test("Should download jars even when not in workspace root", async () => {
    const smithyMainUri = getDocUri("suite4/smithy/main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    await vscode.window.showTextDocument(doc);
    await waitForServerStartup();
    const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);
    const logText = await getLangServerLogs("suite4/smithy");

    assert.match(logText, /Downloaded external jars.*smithy-aws-traits-1\.40\.0\.jar/);
    assert.match(logText, /Downloaded external jars.*smithy-waiters-1\.40\.0\.jar/);
    assert.doesNotMatch(logText, /Unable to resolve trait/);
    assert.equal(diagnostics.length, 0);
  }).timeout(10000);
});
