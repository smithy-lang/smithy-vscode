import { before, suite, test } from 'node:test';
import * as assert from 'assert';
import type {
    CodeAction,
    CompletionList,
    DocumentSymbol,
    FoldingRange,
    Hover,
    InlayHint,
    Location,
    LocationLink,
    MarkdownString,
    Position,
    TextDocument,
    WorkspaceEdit,
} from 'vscode';
import { getDocUri, waitFor, waitForPublishedDiagnostics, vscode } from '../helper.ts';

// Returns the position `offset` characters into the first occurrence of `text` in `doc`.
function positionOf(doc: TextDocument, text: string, offset = 0): Position {
    const index = doc.getText().indexOf(text);
    assert.notEqual(index, -1, `${text} not found in ${doc.uri.fsPath}`);
    return doc.positionAt(index + offset);
}

function hoverText(hovers: Hover[]): string {
    return hovers
        .flatMap((hover) => hover.contents)
        .map((content) => (typeof content === 'string' ? content : (content as MarkdownString).value))
        .join('\n');
}

suite('language-features', function () {
    const mainUri = getDocUri(import.meta.dirname, 'main.smithy');
    let doc: TextDocument;
    // The CityId member target, and the CityId shape definition.
    let cityIdTarget: Position;
    let cityIdDefinition: Position;

    before(async () => {
        doc = await vscode.workspace.openTextDocument(mainUri);

        await vscode.window.showTextDocument(doc);
        await waitForPublishedDiagnostics(mainUri);

        cityIdTarget = positionOf(doc, 'cityId: CityId', 'cityId: '.length);
        cityIdDefinition = positionOf(doc, 'string CityId', 'string '.length);
    });

    test('Should complete shape names', async () => {
        const completions = await vscode.commands.executeCommand<CompletionList>(
            'vscode.executeCompletionItemProvider',
            mainUri,
            cityIdTarget.translate(0, 'CityId'.length)
        );

        const labels = completions.items.map((item) => ({
            label: typeof item.label === 'string' ? item.label : item.label.label,
            kind: item.kind,
        }));

        // Word-based suggestions also list CityId, as a Text item.
        assert.ok(
            labels.some(({ label, kind }) => label === 'CityId' && kind === vscode.CompletionItemKind.Class),
            `CityId not in ${JSON.stringify(labels)}`
        );
    });

    test('Should show hovers for shapes', async () => {
        const hovers = await vscode.commands.executeCommand<Hover[]>(
            'vscode.executeHoverProvider',
            mainUri,
            cityIdTarget
        );
        assert.match(hoverText(hovers), /string CityId/);
    });

    test('Should go to the definition of shapes', async () => {
        const locations = await vscode.commands.executeCommand<(Location | LocationLink)[]>(
            'vscode.executeDefinitionProvider',
            mainUri,
            cityIdTarget
        );
        assert.equal(locations.length, 1);

        const location = locations[0];
        const [uri, range] =
            'uri' in location
                ? [location.uri, location.range]
                : [location.targetUri, location.targetSelectionRange ?? location.targetRange];
        assert.equal(uri.toString(), mainUri.toString());
        assert.equal(range.start.line, cityIdDefinition.line);
    });

    test('Should open definitions in dependency jars', async () => {
        const locations = await vscode.commands.executeCommand<(Location | LocationLink)[]>(
            'vscode.executeDefinitionProvider',
            mainUri,
            positionOf(doc, '@dataPlane', 1)
        );
        assert.equal(locations.length, 1);

        const location = locations[0];
        const uri = 'uri' in location ? location.uri : location.targetUri;
        assert.equal(uri.scheme, 'smithyjar');

        const jarDoc = await vscode.workspace.openTextDocument(uri);
        assert.match(jarDoc.getText(), /structure dataPlane/);
    });

    test('Should find references to shapes', async () => {
        const locations = await vscode.commands.executeCommand<Location[]>(
            'vscode.executeReferenceProvider',
            mainUri,
            cityIdDefinition
        );

        assert.ok(
            locations.some(
                (location) =>
                    location.uri.toString() === mainUri.toString() && location.range.start.isEqual(cityIdTarget)
            ),
            `No reference at the CityId member target in ${JSON.stringify(locations)}`
        );
    });

    test('Should rename shapes', async () => {
        const edit = await vscode.commands.executeCommand<WorkspaceEdit>(
            'vscode.executeDocumentRenameProvider',
            mainUri,
            cityIdDefinition,
            'CityIdentifier'
        );

        const edits = edit.get(mainUri);
        assert.deepStrictEqual(
            edits.map((e) => [e.range.start.line, e.newText]).sort(),
            [
                [cityIdTarget.line, 'CityIdentifier'],
                [cityIdDefinition.line, 'CityIdentifier'],
            ].sort()
        );
    });

    test('Should list document symbols', async () => {
        const symbols = await vscode.commands.executeCommand<DocumentSymbol[]>(
            'vscode.executeDocumentSymbolProvider',
            mainUri
        );

        const names = symbols.flatMap((symbol) => [symbol.name, ...symbol.children.map((child) => child.name)]);
        for (const name of ['Cities', 'GetCity', 'CityId']) {
            assert.ok(names.includes(name), `${name} not in ${names}`);
        }
    });

    test('Should provide folding ranges', async () => {
        const ranges = await vscode.commands.executeCommand<FoldingRange[]>(
            'vscode.executeFoldingRangeProvider',
            mainUri
        );

        const serviceLine = positionOf(doc, 'service Cities').line;
        assert.ok(
            ranges.some((range) => range.start === serviceLine && range.end > serviceLine),
            `No folding range for the service in ${JSON.stringify(ranges)}`
        );
    });

    test('Should show inlay hints for inline input and output', async () => {
        const hints = await vscode.commands.executeCommand<InlayHint[]>(
            'vscode.executeInlayHintProvider',
            mainUri,
            // The server returns no hints for a range that ends at the end of the document:
            // https://github.com/smithy-lang/smithy-language-server/issues/276
            new vscode.Range(positionOf(doc, 'operation GetCity'), cityIdDefinition)
        );

        const labels = hints.map((hint) =>
            typeof hint.label === 'string' ? hint.label : hint.label.map((part) => part.value).join('')
        );
        assert.deepStrictEqual(labels.sort(), ['GetCityInput', 'GetCityOutput']);
    });

    test('Should offer a code action to define the Smithy version', async () => {
        const uri = getDocUri(import.meta.dirname, 'no-version.smithy');
        await vscode.window.showTextDocument(await vscode.workspace.openTextDocument(uri));

        // VS Code passes the diagnostics in the range to the provider, and the server bases its
        // actions on them.
        await waitFor(
            'the missing version diagnostic',
            () => vscode.languages.getDiagnostics(uri).some((diagnostic) => diagnostic.code === 'define-idl-version'),
            30_000
        );

        const actions = await vscode.commands.executeCommand<CodeAction[]>(
            'vscode.executeCodeActionProvider',
            uri,
            new vscode.Range(0, 0, 0, 0)
        );

        assert.ok(
            actions.some((action) => action.title === 'Define the Smithy version'),
            `Not in ${actions.map((action) => action.title)}`
        );
    });

    test('Should show hovers in smithy-build.json', async () => {
        const uri = getDocUri(import.meta.dirname, 'smithy-build.json');
        const buildDoc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(buildDoc);

        // The server only starts handling the file once it has opened it.
        const hovers = await waitFor(
            'a hover for the version key',
            async () => {
                const hovers = await vscode.commands.executeCommand<Hover[]>(
                    'vscode.executeHoverProvider',
                    uri,
                    positionOf(buildDoc, '"version"', 1)
                );
                return hovers.length > 0 && hovers;
            },
            30_000
        );

        assert.match(hoverText(hovers), /Defines the version of smithy-build/);
    });
});
