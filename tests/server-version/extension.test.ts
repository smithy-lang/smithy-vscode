import { after, before, suite, test } from 'node:test';
import { setTimeout } from 'node:timers/promises';
import * as assert from 'assert';
import { getDocUri, waitFor, waitForPublishedDiagnostics, vscode } from '../helper.ts';

const LATEST_RELEASE = 'latest.release';
// A restart takes a few seconds, since this suite's versions are already installed.
const RESTART_TIMEOUT_MS = 30_000;

// Each test changes smithy.server.version from the value the previous test left.
suite('server-version', function () {
    const mainUri = getDocUri(import.meta.dirname, 'main.smithy');
    // The version runTest.ts pinned, which is installed.
    let installedVersion: string;
    // Times at which the language server stopped. The client clears its diagnostics when the server
    // stops, and the new server publishes them again once it starts.
    const stops: number[] = [];
    let listener: { dispose(): void } | undefined;

    const isPublished = () => vscode.languages.getDiagnostics().some(([uri]) => uri.toString() === mainUri.toString());
    const setVersion = (version: string | undefined) =>
        vscode.workspace
            .getConfiguration('smithy')
            .update('server.version', version, vscode.ConfigurationTarget.Global);
    // Waits until the server has stopped `count` more times and the last server has started.
    const waitForRestarts = async (since: number, count: number) => {
        await waitFor(
            `${count} language server restart(s)`,
            () => stops.length >= since + count && isPublished(),
            RESTART_TIMEOUT_MS
        );
        assert.equal(stops.length, since + count);
    };

    before(async () => {
        installedVersion = vscode.workspace.getConfiguration('smithy').get<string>('server.version')!;
        assert.notEqual(installedVersion, LATEST_RELEASE, 'runTest.ts should pin smithy.server.version');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(mainUri));
        await waitForPublishedDiagnostics(mainUri);
        let published = true;
        listener = vscode.languages.onDidChangeDiagnostics(() => {
            if (published && !isPublished()) {
                stops.push(Date.now());
            }
            published = isPublished();
        });
    });

    after(() => listener?.dispose());

    test('Should restart the server when changed to latest.release', async () => {
        const since = stops.length;
        await setVersion(LATEST_RELEASE);
        await waitForRestarts(since, 1);
    });

    test('Should restart again when changed during a restart', async () => {
        const since = stops.length;
        await setVersion(installedVersion);
        await waitFor('the server to stop', () => stops.length > since, RESTART_TIMEOUT_MS);
        await setVersion(LATEST_RELEASE);
        await waitForRestarts(since, 2);
    });

    test('Should restart the server when changed to a supported version', async () => {
        const since = stops.length;
        await setVersion(installedVersion);
        await waitForRestarts(since, 1);
    });

    test('Should keep the server running when changed to an unsupported version', async () => {
        const since = stops.length;
        await setVersion('0.1');
        await setTimeout(3000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test("Should keep the server running when the version can't be downloaded", async () => {
        const since = stops.length;
        // A supported version that was never released.
        await setVersion('0.4.99');
        await setTimeout(5000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test('Should restart the server when the status bar switches to latest.release', async () => {
        const since = stops.length;
        // Pinned to 0.4.99, so this switches to latest.release without opening the picker.
        await vscode.commands.executeCommand('smithy.toggleVersionPolicy');
        assert.equal(vscode.workspace.getConfiguration('smithy').get('server.version'), LATEST_RELEASE);
        await waitForRestarts(since, 1);
    });

    test('Should restart the server when a version is picked from the status bar', async () => {
        const since = stops.length;
        let done = false;
        const toggled = Promise.resolve(vscode.commands.executeCommand('smithy.toggleVersionPolicy')).finally(
            () => (done = true)
        );
        // Accept the newest version, which the picker lists first, once the picker opens.
        await waitFor(
            'the version picker to accept a version',
            async () => {
                await vscode.commands.executeCommand('workbench.action.acceptSelectedQuickOpenItem');
                await setTimeout(100);
                return done;
            },
            RESTART_TIMEOUT_MS
        );
        await toggled;
        assert.notEqual(vscode.workspace.getConfiguration('smithy').get('server.version'), LATEST_RELEASE);
        await waitForRestarts(since, 1);
    });
});
