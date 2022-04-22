import * as vscode from "vscode";
import * as path from "path";

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;

export const getDocPath = (p: string) => {
  return path.resolve(__dirname, "../../../test-fixture", p);
};

export const getDocUri = (p: string) => {
  return vscode.Uri.file(getDocPath(p));
};
