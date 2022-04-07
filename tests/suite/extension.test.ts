import * as assert from "assert";
import * as vscode from "vscode";
import { getDocUri } from "./helper";

suite("Extension tests", () => {
  test("Should start extension", async () => {
    const smithyMainUri = getDocUri("main.smithy");

    const doc = await vscode.workspace.openTextDocument(smithyMainUri);
    const editor = await vscode.window.showTextDocument(doc);
    const ext = vscode.extensions.getExtension("aws-smithy.smithy-vscode");
    await ext.activate();

    assert.notEqual(doc, undefined);
    assert.notEqual(editor, undefined);
    assert.equal(ext.isActive, true);
  });

  test("Should register language", async () => {
    const languages = await vscode.languages.getLanguages();

    assert.equal(languages.includes("smithy"), true);
  });
});
