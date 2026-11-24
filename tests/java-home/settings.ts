import { cpSync, readdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import * as assert from 'assert';

// Runs the language server with a Java installation outside its own directory.
export default function settings({ testDataPath, userDataDir }: { testDataPath: string; userDataDir: string }) {
    return { 'smithy.server.javaHome': copyJavaRuntime(userDataDir, resolve(testDataPath, 'java-home')) };
}

// Copies the Java runtime included in the language server download, which the activation suite
// installed, to `javaHome`.
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
