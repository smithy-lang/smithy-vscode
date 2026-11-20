import { spawnSync } from 'child_process';
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { delimiter, resolve } from 'path';

import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as assert from 'assert';

// Each directory under tests/ with a workspace is a suite, which runs the *.test.ts files in its
// directory against tests/<suite>/workspace. To save starting VS Code and the language server for
// every suite, suites share one VS Code instance, opened on a multi-root workspace with each suite's
// workspace as a folder.
const suites = readdirSync(import.meta.dirname)
    .filter((name) => existsSync(resolve(import.meta.dirname, name, 'workspace')))
    .sort();

// Suites that need their own VS Code instance:
// - activation: checks that smithy-build.json alone activates the extension, which the other
//   suites' .smithy files would also do.
// - java-home: sets smithy.server.javaHome, which applies to the whole instance, so the shared
//   suites keep using the Java runtime included in the download.
// - java-home-missing: sets smithy.server.javaHome to a path without Java, which fails activation.
const isolatedSuites = ['activation', 'java-home', 'java-home-missing'];

async function go() {
    const extensionDevelopmentPath = resolve(import.meta.dirname, '..');
    // VS Code version to test against, such as `1.114.0`. Defaults to the latest Stable release.
    const version = process.env.VSCODE_TEST_VERSION || 'stable';
    console.log(`Running extension tests against VS Code ${version}`);

    // TODO: Remove this check once the minimum VS Code version (engines.vscode) is 1.147.0 or later.
    const [major, minor] = version.split('.').map(Number);
    const supportsHiddenWindow = version === 'stable' || major > 1 || minor >= 147;

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
        'java-home': () => ({
            'smithy.server.javaHome': copyJavaRuntime(userDataDir, resolve(testDataPath, 'java-home')),
        }),
        'java-home-missing': () => ({ 'smithy.server.javaHome': resolve(testDataPath, 'java-home-missing') }),
    };

    // Resolve and download VS Code once, rather than have runTests log the lookup for every suite.
    const vscodeExecutablePath = await downloadAndUnzipVSCode(version);
    const sharedSuites = suites.filter((suite) => !isolatedSuites.includes(suite));
    const sharedWorkspace = resolve(testDataPath, 'suites.code-workspace');
    writeFileSync(
        sharedWorkspace,
        JSON.stringify({
            folders: sharedSuites.map((suite) => ({ path: resolve(import.meta.dirname, suite, 'workspace') })),
        })
    );
    const runs = [
        ...suites
            .filter((suite) => isolatedSuites.includes(suite))
            .map((suite) => ({
                suites: [suite],
                workspace: resolve(import.meta.dirname, suite, 'workspace'),
                settings: suiteSettings[suite],
            })),
        { suites: sharedSuites, workspace: sharedWorkspace, settings: undefined },
    ];

    for (const run of runs) {
        writeFileSync(
            resolve(userDataDir, 'User', 'settings.json'),
            JSON.stringify({
                'chat.disableAIFeatures': true,
                ...run.settings?.(),
            })
        );
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(import.meta.dirname, 'helper.ts'),
            extensionTestsEnv: {
                SUITE_DIRS: run.suites.map((suite) => resolve(import.meta.dirname, suite)).join(delimiter),
            },
            launchArgs: [
                run.workspace,
                // xvfb has no GPU, so Chromium otherwise logs GPU process init errors.
                '--disable-gpu',
                `--builtin-extensions-dir=${builtinExtensionsDir}`,
                `--user-data-dir=${userDataDir}`,
                // VS Code logs its own info messages (startup, storage, accounts, extension host)
                // for every suite. Only show warnings and errors. This also hides extension host
                // stdout, so helper.ts writes the test report to stderr.
                '--log=warn',
                // Keep test windows hidden so they don't take focus.
                ...(supportsHiddenWindow ? ['--hidden-window'] : []),
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

// Copies the Java runtime included in the language server download, which the activation suite
// installed, to `javaHome`, so the server can run with a Java installation outside its own directory.
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
