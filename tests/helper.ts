import { Uri } from 'vscode';
import { globSync } from 'fs';
import { resolve } from 'path';
import { run as runNodeTests } from 'node:test';
import { spec } from 'node:test/reporters';
import { setTimeout } from 'node:timers/promises';

export const getDocUri = (p: string) => Uri.file(resolve(__dirname, '../../test-fixtures', p));

// Wait for Smithy Language Server to start
export const waitForServerStartup = () => setTimeout(9000);

// Test runner entry point for the extension host (runTest.ts sets this file as extensionTestsPath),
// which fails the run if the returned promise rejects. The suite directory comes from SUITE_DIR.
export async function run(): Promise<void> {
    const testsRoot = process.env.SUITE_DIR;
    if (!testsRoot) {
        throw new Error('SUITE_DIR is not set');
    }
    const files = globSync('**/*.test.js', { cwd: testsRoot }).map((f) => resolve(testsRoot, f));
    if (files.length === 0) {
        return;
    }

    // Tests must run inside the extension host to reach the `vscode` API, so they can't use the
    // default per-file child processes.
    const stream = runNodeTests({ files, isolation: 'none', concurrency: false });
    const reporter = new spec();
    reporter.on('data', (data) => process.stdout.write(data));

    // With isolation 'none', node:test only ends the run once the event loop drains, which never
    // happens in the extension host. Instead, wait until every top-level test has reported its
    // result, then end the reporter so it flushes all output before reporting back. Results
    // (test:pass/test:fail) arrive in report order after test:complete, so they mark the end.
    const failures = await new Promise<number>((resolve, reject) => {
        let pending = 0;
        let failures = 0;
        reporter.on('end', () => resolve(failures));
        stream.on('error', reject);
        stream.on('data', (event) => {
            if (reporter.writableEnded) {
                return;
            }
            reporter.write(event);
            if (event.type === 'test:enqueue' && event.data.nesting === 0) {
                pending++;
            }
            if (event.type === 'test:pass' || event.type === 'test:fail') {
                // A suite that fails only because its tests failed is already counted through them. Any
                // other suite failure, such as a throwing hook or suite body, is a failure of its own.
                if (event.type === 'test:fail' && event.data.details.error?.failureType !== 'subtestsFailed') {
                    failures++;
                }
                if (event.data.nesting === 0 && --pending === 0) {
                    reporter.end();
                }
            }
        });
    });
    if (failures > 0) {
        throw new Error(`${failures} test(s) failed`);
    }
}
