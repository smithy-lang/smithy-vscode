import { TextDocument, TextEditor, Uri } from 'vscode';
import { globSync } from 'fs';
import { resolve } from 'path';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';

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
    let files: string[];
    try {
        files = globSync('**/**.test.js', { cwd: testsRoot }).map((f) => resolve(testsRoot, f));
    } catch (err) {
        return cb(err);
    }
    if (files.length === 0) {
        return cb(null, 0);
    }

    // Tests must run inside the extension host to reach the `vscode` API, so they can't use the
    // default per-file child processes.
    const stream = run({ files, isolation: 'none', concurrency: false });
    const reporter = new spec();
    reporter.on('data', (data) => process.stdout.write(data));

    // With isolation 'none', node:test only ends the run once the event loop drains, which never
    // happens in the extension host. Instead, wait until every top-level test has reported its
    // result, then end the reporter so it flushes all output before reporting back. Results
    // (test:pass/test:fail) arrive in report order after test:complete, so they mark the end.
    let pending = 0;
    let failures = 0;
    reporter.on('end', () => cb(null, failures));
    stream.on('data', (event) => {
        if (reporter.writableEnded) {
            return;
        }
        reporter.write(event);
        if (event.type === 'test:enqueue' && event.data.nesting === 0) {
            pending++;
        }
        if (event.type === 'test:pass' || event.type === 'test:fail') {
            if (event.type === 'test:fail' && event.data.details.type !== 'suite') {
                failures++;
            }
            if (event.data.nesting === 0 && --pending === 0) {
                reporter.end();
            }
        }
    });
    stream.on('error', (err) => cb(err));
}
