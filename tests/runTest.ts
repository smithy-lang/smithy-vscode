import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'fs';
import { delimiter, resolve } from 'path';
import { pathToFileURL } from 'url';

import { runTests, downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as assert from 'assert';

// Each directory under tests/ with a workspace is a suite, which runs the *.test.ts files in its
// directory against tests/<suite>/workspace. A suite can also have a settings.ts, whose default
// export returns user settings for its run. To save starting VS Code and the language server for
// every suite, suites share one VS Code instance, opened on a multi-root workspace with each suite's
// workspace as a folder.
const suites = readdirSync(import.meta.dirname)
    .filter((name) => existsSync(resolve(import.meta.dirname, name, 'workspace')))
    .sort();

// Suites that need their own VS Code instance:
// - activation: checks that smithy-build.json alone activates the extension, which the other
//   suites' .smithy files would also do.
// - Suites with a settings.ts, since user settings apply to the whole instance.
const isolatedSuites = [
    'activation',
    ...suites.filter((suite) => existsSync(resolve(import.meta.dirname, suite, 'settings.ts'))),
];

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
                settingsPath: resolve(import.meta.dirname, suite, 'settings.ts'),
            })),
        { suites: sharedSuites, workspace: sharedWorkspace, settingsPath: undefined },
    ];

    for (const run of runs) {
        // Load the settings only now, since they may depend on earlier runs, such as the language
        // server they downloaded.
        let settings = {};
        if (run.settingsPath && existsSync(run.settingsPath)) {
            const { default: getSettings } = await import(pathToFileURL(run.settingsPath).href);
            settings = await getSettings({ testDataPath, userDataDir });
        }
        writeFileSync(
            resolve(userDataDir, 'User', 'settings.json'),
            JSON.stringify({
                'chat.disableAIFeatures': true,
                ...settings,
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

go().catch((err) => {
    console.error('Test Failure');
    console.log(err);
    process.exit(1);
});
