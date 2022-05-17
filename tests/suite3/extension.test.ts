import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, getLangServerLogs, waitForServerStartup } from "./../helper";
import * as sinon from "sinon";

suite("Selector tests", () => {
  test("Can run selectors", async () => {
    const smithyMainUri = getDocUri("suite3/main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    await vscode.window.showTextDocument(doc);
    await waitForServerStartup();

    const showInputBox = sinon.stub(vscode.window, "showInputBox");
    showInputBox.resolves("operation [id|namespace=example.weather]");
    await vscode.commands.executeCommand("smithy.runSelector");
    const logText = await getLangServerLogs("suite3");

    assert.match(logText, /Selector command found 4 matching shapes/);
  }).timeout(10000);
});
