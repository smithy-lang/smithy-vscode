import { spawnSync } from 'child_process';
import { cpSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
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
    'suite7', // Language server run with smithy.server.javaHome
    'suite8', // smithy.server.javaHome without a java executable
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
    // smithy.server.javaHome can only be set in user settings, so those suites get their own.
    const suiteSettings: Record<string, () => Record<string, unknown>> = {
        suite7: () => ({ 'smithy.server.javaHome': copyJavaRuntime(userDataDir, resolve(testDataPath, 'java-home')) }),
        suite8: () => ({ 'smithy.server.javaHome': resolve(testDataPath, 'missing-java-home') }),
    };

    // Resolve and download VS Code once, rather than have runTests log the lookup for every suite.
    const vscodeExecutablePath = await downloadAndUnzipVSCode(version);
    for (const suite of suites) {
        writeFileSync(
            resolve(userDataDir, 'User', 'settings.json'),
            JSON.stringify({
                'chat.disableAIFeatures': true,
                ...suiteSettings[suite]?.(),
            })
        );
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

    const installArgs = [...args, '--install-extension', 'smithy-vscode.vsix', '--force'];
    // On Windows the CLI is a .cmd file, which Node can only run through a shell. Quote each
    // argument, since the paths may contain spaces.
    const result =
        process.platform === 'win32'
            ? spawnSync([cli, ...installArgs].map((arg) => `"${arg}"`).join(' '), { encoding: 'utf-8', shell: true })
            : spawnSync(cli, installArgs, { encoding: 'utf-8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /Extension 'smithy-vscode.vsix' was successfully installed./);
}

// Copies the Java runtime included in the language server download, which earlier suites installed,
// to `javaHome`, so the server can run with a Java installation outside its own directory.
function copyJavaRuntime(userDataDir: string, javaHome: string): string {
    const installRoot = resolve(
        userDataDir,
        'User',
        'globalStorage',
        'smithy.smithy-vscode-extension',
        'language-server'
    );
    const versions = readdirSync(installRoot).filter((name) => /^\d+\.\d+\.\d+$/.test(name));
    assert.ok(versions.length > 0, `No language server installed in ${installRoot}`);
    const newest = versions.sort(new Intl.Collator(undefined, { numeric: true }).compare).at(-1)!;
    rmSync(javaHome, { recursive: true, force: true });
    for (const dir of ['bin', 'conf', 'lib']) {
        cpSync(resolve(installRoot, newest, dir), resolve(javaHome, dir), { recursive: true });
    }
    return javaHome;
}

go().catch((err) => {
    console.error('Test Failure');
    console.log(err);
    process.exit(1);
});
