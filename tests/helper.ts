import type { Uri } from 'vscode';
import { globSync } from 'fs';
import { createRequire } from 'module';
import { resolve } from 'path';
import { run as runNodeTests } from 'node:test';
import { spec } from 'node:test/reporters';
import { setTimeout } from 'node:timers/promises';

// TODO: Replace with `import * as vscode from 'vscode'` once the engines.vscode floor supports it.
// On VS Code 1.114.0, importing 'vscode' from an ES module hangs the extension host.
export const vscode: typeof import('vscode') = createRequire(import.meta.url)('vscode');

export const getDocUri = (p: string) => vscode.Uri.file(resolve(import.meta.dirname, '../test-fixtures', p));

// Generous, since the first suite on a fresh machine has Coursier download a JVM and the language server.
const DEFAULT_TIMEOUT_MS = 180_000;
const POLL_INTERVAL_MS = 100;

// Polls `condition` until it returns a truthy value, which is then returned. Errors thrown by
// `condition` count as "not yet" and are reported if the timeout is reached.
export async function waitFor<T>(
    description: string,
    condition: () => T | Thenable<T>,
    timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Exclude<T, false | 0 | '' | null | undefined>> {
    const deadline = Date.now() + timeoutMs;
    let lastError: unknown;
    while (Date.now() < deadline) {
        try {
            const result = await condition();
            if (result) {
                return result as Exclude<T, false | 0 | '' | null | undefined>;
            }
        } catch (err) {
            lastError = err;
        }
        await setTimeout(POLL_INTERVAL_MS);
    }
    throw new Error(`Timed out after ${timeoutMs} ms waiting for ${description}`, { cause: lastError });
}

// Waits for the extension to activate, which completes once the language server has finished
// `initialize`. That loads the workspace's projects and their Maven dependencies.
export async function waitForServerStartup(timeoutMs = DEFAULT_TIMEOUT_MS): Promise<void> {
    const ext = vscode.extensions.getExtension('smithy.smithy-vscode-extension');
    if (!ext) {
        throw new Error('Smithy extension is not installed');
    }
    let timer: NodeJS.Timeout | undefined;
    const timedOut = new Promise<never>((_, reject) => {
        timer = globalThis.setTimeout(
            () => reject(new Error(`Timed out after ${timeoutMs} ms waiting for the language server to start`)),
            timeoutMs
        );
    });
    try {
        await Promise.race([ext.activate(), timedOut]);
    } finally {
        clearTimeout(timer);
    }
}

// Waits until the server has published diagnostics for `uri`, even an empty list. Polling
// `languages.getDiagnostics(uri)` can't tell "none yet" from "none", but the no-argument overload
// lists every URI a diagnostic collection has an entry for, including empty ones.
export async function waitForPublishedDiagnostics(uri: Uri): Promise<void> {
    await waitForServerStartup();
    await waitFor(`diagnostics to be published for ${uri.fsPath}`, () =>
        vscode.languages.getDiagnostics().some(([published]) => published.toString() === uri.toString())
    );
}

// Test runner entry point for the extension host (runTest.ts sets this file as extensionTestsPath),
// which fails the run if the returned promise rejects. The suite directory comes from SUITE_DIR.
export async function run(): Promise<void> {
    const testsRoot = process.env.SUITE_DIR;
    if (!testsRoot) {
        throw new Error('SUITE_DIR is not set');
    }
    const files = globSync('**/*.test.ts', { cwd: testsRoot }).map((f) => resolve(testsRoot, f));
    if (files.length === 0) {
        return;
    }

    // Tests must run inside the extension host to reach the `vscode` API, so they can't use the
    // default per-file child processes.
    const stream = runNodeTests({ files, isolation: 'none', concurrency: false });
    const reporter = new spec();
    // VS Code relays extension host stdout at info level and stderr at error level. runTest.ts sets
    // --log=warn to hide VS Code's own info logs, so the report goes to stderr to stay visible.
    reporter.on('data', (data) => process.stderr.write(data));

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
