import { readdirSync } from 'fs';
import { resolve } from 'path';
import * as assert from 'assert';

// Pins smithy.server.version to the language server version the activation suite installed, so
// switching between it and latest.release doesn't download another version.
export default function settings({ userDataDir }: { userDataDir: string }) {
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
    return { 'smithy.server.version': newest };
}
