import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { delimiter, join, resolve } from 'path';

import {
    runTests,
    downloadAndUnzipVSCode,
    resolveCliPathFromVSCodeExecutablePath,
    resolveCliArgsFromVSCodeExecutablePath,
} from '@vscode/test-electron';
import * as assert from 'assert';

async function go() {
    try {
        const extensionDevelopmentPath = resolve(__dirname, '../../');
        // VS Code version to test against, such as `1.114.0`. Defaults to the latest Stable release.
        const version = process.env.VSCODE_TEST_VERSION || 'stable';
        console.log(`Running extension tests against VS Code ${version}`);

        // Suite 1 - Extension registration and launching language server
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite1'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite1')],
        });

        // Suite 2 - Diagnostics from broken model
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite2'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite2')],
        });

        // Suite 3 - Selector commands
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite3'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite3')],
        });

        // Suite 4 - User-specific root
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite4'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite4')],
        });

        // Suite 5 - Formatter
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite5'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite5')],
        });

        // Suite 6 - Startup
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite6'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite6')],
        });

        // Suites 7-9 use a fresh profile, so the extension has no cached Coursier download, and hide Coursier
        // from PATH so the extension has to download it.
        const extensionTestsEnv = { PATH: pathWithoutCoursier() };

        // Suite 7 - Server setup failure. A file where the extension's global storage directory goes makes the
        // Coursier download fail.
        await withFreshUserDataDir(async (userDataDir) => {
            const globalStorage = join(userDataDir, 'User', 'globalStorage');
            mkdirSync(globalStorage, { recursive: true });
            writeFileSync(join(globalStorage, 'smithy.smithy-vscode-extension'), '');
            await runTests({
                version,
                extensionDevelopmentPath,
                extensionTestsPath: resolve(__dirname, './suite7'),
                extensionTestsEnv,
                launchArgs: [resolve(__dirname, '../../test-fixtures/suite7'), '--user-data-dir', userDataDir],
            });
        });

        // Suite 8 - Server start failure
        await runTests({
            version,
            extensionDevelopmentPath,
            extensionTestsPath: resolve(__dirname, './suite8'),
            launchArgs: [resolve(__dirname, '../../test-fixtures/suite8')],
        });

        // Suite 9 - Slow server setup
        await withFreshUserDataDir((userDataDir) =>
            runTests({
                version,
                extensionDevelopmentPath,
                extensionTestsPath: resolve(__dirname, './suite9'),
                extensionTestsEnv: { ...extensionTestsEnv, SMITHY_TEST_USER_DATA_DIR: userDataDir },
                launchArgs: [resolve(__dirname, '../../test-fixtures/suite9'), '--user-data-dir', userDataDir],
            })
        );

        // Confirm that webpacked and vsce packaged extension can be installed.
        const vscodeExecutablePath = await downloadAndUnzipVSCode(version);
        const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        const result = spawnSync(cli, [...args, '--install-extension', 'smithy-vscode.vsix', '--force'], {
            encoding: 'utf-8',
        });
        assert.equal(result.status, 0);
        assert.match(result.stdout, /Extension 'smithy-vscode.vsix' was successfully installed./);
    } catch (err) {
        console.error('Test Failure');
        console.log(err);
        process.exit(1);
    }
}

go();

async function withFreshUserDataDir(fn: (userDataDir: string) => Promise<unknown>): Promise<void> {
    const userDataDir = mkdtempSync(join(tmpdir(), 'smithy-vscode-test-'));
    try {
        await fn(userDataDir);
    } finally {
        rmSync(userDataDir, { recursive: true, force: true });
    }
}

function pathWithoutCoursier(): string {
    const executables = process.platform === 'win32' ? ['cs.exe', 'coursier.exe'] : ['cs', 'coursier'];
    return (process.env.PATH ?? '')
        .split(delimiter)
        .filter((dir) => !executables.some((executable) => existsSync(join(dir, executable))))
        .join(delimiter);
}
