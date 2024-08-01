import { TextDocument, TextEditor, Uri } from "vscode";
import { resolve } from "path";
import { glob } from "glob";
import * as Mocha from "mocha";

export let doc: TextDocument;
export let editor: TextEditor;

export const getDocPath = (p: string) => {
  return resolve(__dirname, "../../test-fixtures", p);
};

export const getDocUri = (p: string) => {
  return Uri.file(getDocPath(p));
};

export async function waitForServerStartup() {
  // Wait for Smithy Language Server to start
  await new Promise((resolve) => setTimeout(resolve, 9000));
}

export function runTests(testsRoot: string, cb: (error: any, failures?: number) => void): void {
  const mocha = new Mocha({
    ui: "tdd",
  });

  glob("**/**.test.js", { cwd: testsRoot })
    .then((files) => {
      files.forEach((f) => mocha.addFile(resolve(testsRoot, f)));

      try {
        mocha.run((failures) => {
          cb(null, failures);
        });
      } catch (err) {
        console.error(err);
        cb(err);
      }
    })
    .catch((err) => {
      return cb(err);
    });
}
