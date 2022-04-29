import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri } from "./helper";

suite("Extension tests", () => {
  test("Should start extension and Language Server", async () => {
    const smithyMainUri = getDocUri("main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    const editor = await vscode.window.showTextDocument(doc);
    const ext = vscode.extensions.getExtension("aws-smithy.smithy-vscode");
    await waitForServerStartup();

    // Grab Language Server logs
    const smithyLogUri = getDocUri(".smithy.lsp.log");
    const smithyLog = await vscode.workspace.openTextDocument(smithyLogUri);
    const logText = smithyLog.getText();

    assert.notEqual(doc, undefined);
    assert.notEqual(editor, undefined);
    assert.equal(ext.isActive, true);
    assert.match(logText, /Downloaded external jars.*smithy-aws-traits-1\.19\.0\.jar/);
    assert.match(logText, /Discovered smithy files.*test-fixture\/main.smithy]/);

    const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);
    console.log(diagnostics.length);
  }).timeout(7000);

  test("Should register language", async () => {
    const languages = await vscode.languages.getLanguages();
    assert.equal(languages.includes("smithy"), true);
  });

  test("Should provide diagnostics", async () => {
    const smithyMainUri = getDocUri("main.smithy");
    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    const editor = await vscode.window.showTextDocument(doc);
    await waitForServerStartup();
    const diagnostics = vscode.languages.getDiagnostics(smithyMainUri);

    assert.match(diagnostics[0].message, /relationship to an unresolved shape `example.weather#DeleteCity`/);
    assert.equal(diagnostics[0].range.start.line, 13);
    assert.equal(diagnostics[0].range.start.character, 0);
  }).timeout(7000);

  async function waitForServerStartup() {
    // Wait for Smithy Language Server to start
    await new Promise((resolve) => setTimeout(resolve, 6000));
  }
});
