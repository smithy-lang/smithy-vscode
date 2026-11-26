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
    // The version settings.ts pinned, which is older than latest.release. The extension installs it
    // when it activates.
    let installedVersion: string;
    // The newest version, which the unsupported version prompt picks. Later tests assume
    // latest.release resolves to it, which fails if GitHub marks an older release as latest.
    let newestVersion: string | undefined;

    // Times at which the language server stopped. The client clears its diagnostics when the server
    // stops, and the new server publishes them again once it starts.
    const stops: number[] = [];

    // Whether the listener last saw diagnostics for main.smithy. VS Code delays diagnostics change
    // events by up to 50 ms and merges them, so this can lag isPublished(). Tests wait on this, so the
    // listener sees a publish before the next change clears it.
    let published = true;

    // The time at which diagnostics last changed.
    let lastChange = 0;

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
            () => stops.length >= since + count && published,
            RESTART_TIMEOUT_MS
        );
        assert.equal(stops.length, since + count);
    };

    before(async () => {
        installedVersion = vscode.workspace.getConfiguration('smithy').get<string>('server.version')!;
        assert.notEqual(installedVersion, LATEST_RELEASE, 'settings.ts should pin smithy.server.version');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(mainUri));
        await waitForPublishedDiagnostics(mainUri);

        listener = vscode.languages.onDidChangeDiagnostics(() => {
            lastChange = Date.now();
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

        // The second restart can stop the server before it publishes diagnostics, which leaves no
        // stop to count. So wait for diagnostics to settle, and rely on the next test, which times
        // out if the second restart didn't switch to latest.release.
        await waitFor(
            'the language server to restart and settle',
            () => stops.length > since && published && Date.now() - lastChange >= 2000,
            RESTART_TIMEOUT_MS
        );
        assert.ok(stops.length <= since + 2, `stopped ${stops.length - since} times`);
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

    test('Should restart the server when a version is picked from the unsupported version prompt', async (t) => {
        const since = stops.length;
        // Restored automatically when the test finishes.
        t.mock.method(vscode.window, 'showErrorMessage', async () => 'Pick a version');
        let picked: string | undefined;
        t.mock.method(vscode.window, 'showQuickPick', async (items: readonly string[]) => (picked = items[0]));

        await setVersion('0.2');
        await waitForRestarts(since, 1);
        assert.ok(picked);
        assert.equal(vscode.workspace.getConfiguration('smithy').get('server.version'), picked);
        newestVersion = picked;
    });

    test("Should keep the server running when the version can't be downloaded", async () => {
        const since = stops.length;
        // A supported version that was never released.
        await setVersion('0.4.99');
        await setTimeout(5000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test('Should keep the server running when changed back to its version after a failed switch', async () => {
        const since = stops.length;
        assert.ok(newestVersion);
        await setVersion(newestVersion);
        await setTimeout(3000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test('Should keep the server running when the status bar switches from the latest version to latest.release', async () => {
        const since = stops.length;
        // Pinned to the newest version, so this switches to latest.release without opening the picker.
        await vscode.commands.executeCommand('smithy.toggleVersionPolicy');
        assert.equal(vscode.workspace.getConfiguration('smithy').get('server.version'), LATEST_RELEASE);
        await setTimeout(3000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test('Should keep the server running when the status bar picks the version it runs', async () => {
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
        assert.equal(vscode.workspace.getConfiguration('smithy').get('server.version'), newestVersion);
        await setTimeout(3000);
        assert.equal(stops.length, since);
        assert.ok(isPublished());
    });

    test('Should run selectors with the restarted server', async (t) => {
        // Restored automatically when the test finishes.
        t.mock.method(vscode.window, 'showInputBox', async () => 'string');
        await vscode.commands.executeCommand('smithy.runSelector');
    });
});
