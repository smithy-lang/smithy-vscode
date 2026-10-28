import { spawnSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as assert from 'assert';

// Each suite runs the *.test.ts files in its directory in its own VS Code instance, opened on
// test-fixtures/<suite>.
const suites = [
    'suite1', // Extension registration and launching language server
    'suite2', // Diagnostics from broken model
    'suite3', // Selector commands
    'suite4', // User-specific root
    'suite5', // Formatter
    'suite6', // Startup
];

async function go() {
    const extensionDevelopmentPath = resolve(import.meta.dirname, '..');
    // VS Code version to test against, such as `1.114.0`. Defaults to the latest Stable release.
    const version = process.env.VSCODE_TEST_VERSION || 'stable';
    console.log(`Running extension tests against VS Code ${version}`);

    // VS Code prints its own log to stdout during extension tests. To keep the test output readable:
    // - An empty built-in extensions folder skips scanning built-ins such as Copilot Chat, whose API
    //   proposal mismatch is otherwise logged in full for every suite.
    // - Disabling AI features in user settings stops the chat and agent host services from logging.
    const testDataPath = resolve(extensionDevelopmentPath, '.vscode-test');
    const builtinExtensionsDir = resolve(testDataPath, 'empty-builtin-extensions');
    mkdirSync(builtinExtensionsDir, { recursive: true });

    const userDataDir = resolve(testDataPath, 'user-data');
    mkdirSync(resolve(userDataDir, 'User'), { recursive: true });
    writeFileSync(
        resolve(userDataDir, 'User', 'settings.json'),
        JSON.stringify({
            'chat.disableAIFeatures': true,
        })
    );

    // Resolve and download VS Code once, rather than have runTests log the lookup for every suite.
    const vscodeExecutablePath = await downloadAndUnzipVSCode(version);
    for (const suite of suites) {
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(import.meta.dirname, 'helper.ts'),
            extensionTestsEnv: { SUITE_DIR: resolve(import.meta.dirname, suite) },
            launchArgs: [
                resolve(extensionDevelopmentPath, 'test-fixtures', suite),
                // xvfb has no GPU, so Chromium otherwise logs GPU process init errors.
                '--disable-gpu',
                `--builtin-extensions-dir=${builtinExtensionsDir}`,
                `--user-data-dir=${userDataDir}`,
                // VS Code logs its own info messages (startup, storage, accounts, extension host)
                // for every suite. Only show warnings and errors. This also hides extension host
                // stdout, so helper.ts writes the test report to stderr.
                '--log=warn',
            ],
        });
    }

    // Confirm that bundled and vsce packaged extension can be installed.
    const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    const result = spawnSync(cli, [...args, '--install-extension', 'smithy-vscode.vsix', '--force'], {
        encoding: 'utf-8',
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Extension 'smithy-vscode.vsix' was successfully installed./);
}

go().catch((err) => {
    console.error('Test Failure');
    console.log(err);
    process.exit(1);
});
