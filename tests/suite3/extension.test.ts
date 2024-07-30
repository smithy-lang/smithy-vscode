import * as vscode from "vscode";
import { getDocUri, waitForServerStartup } from "./../helper";
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
    // we don't have a way to check the output. as long as this command
    // can run it should be fine - more robust tests are done on the server
    // side.
  }).timeout(10000);
});
