import { TextDocument, TextEditor, Uri } from 'vscode';
import { resolve } from 'path';
import { glob } from 'glob';
import * as mochaModule from 'mocha';

// mocha 12 is ESM-only, so the shape `require('mocha')` returns depends on the Node.js version of the
// extension host: the module namespace on Node.js 22 (VS Code 1.114) and the Mocha class itself on
// Node.js 24. The named `Mocha` export is present in both.
const { Mocha } = mochaModule as unknown as { Mocha: typeof mochaModule };

export let doc: TextDocument;
export let editor: TextEditor;

export const getDocPath = (p: string) => {
    return resolve(__dirname, '../../test-fixtures', p);
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
        ui: 'tdd',
    });

    glob('**/**.test.js', { cwd: testsRoot })
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

export const SMITHY_COMMANDS = ['smithy.runSelector', 'smithy.clearSelector', 'smithy.toggleVersionPolicy'];
