import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri, getLangServerLogs, waitForServerStartup } from "./../helper";

suite("Extension tests", () => {
  test("Should start extension and Language Server", async () => {
    const smithyMainUri = getDocUri("suite1/main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    const editor = await vscode.window.showTextDocument(doc);
    const ext = vscode.extensions.getExtension("smithy.smithy-vscode-extension");
    await waitForServerStartup();

    // Grab model file directly
    const modelFile = await vscode.workspace.openTextDocument(getDocUri("suite1/main.smithy"));
    const modelFileText = modelFile.getText();

    assert.match(modelFileText, /namespace example.weather/);

    // Grab Language Server logs
    const logText = await getLangServerLogs("suite1");

    assert.notEqual(doc, undefined);
    assert.notEqual(editor, undefined);
    assert.equal(ext.isActive, true);
    assert.match(logText, /Downloaded external jars.*smithy-aws-traits-1\.19\.0\.jar/);
    assert.match(logText, /Discovered smithy files.*\/main.smithy]/);
  }).timeout(10000);

  test("Should register language", async () => {
    const languages = await vscode.languages.getLanguages();
    assert.equal(languages.includes("smithy"), true);
  }).timeout(1000);
});
