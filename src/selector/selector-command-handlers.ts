import { Position, Range, window } from 'vscode';
import { SelectorCommandRequest } from './selector-command-request';

export async function selectorClearCommandHandler() {
    this.selectorDecorator.clear();
}

export async function selectorRunCommandHandler() {
    const expression = await window.showInputBox({
        title: 'Run a selector',
        value: this.expression,
    });
    const decorator = this.selectorDecorator;
    let response = [];
    // Don't do anything if expression was not populated.
    if (expression) {
        decorator.clear();
        this.expression = expression;
        response = await this.client.sendRequest(SelectorCommandRequest.type, { expression: expression });
        const activeEditor = window.activeTextEditor;
        const ranges = [];
        for (const location of response) {
            if (location['uri'].endsWith(activeEditor.document.fileName)) {
                const startPosition = new Position(
                    location['range']['start']['line'],
                    location['range']['start']['character']
                );
                const endPosition = new Position(
                    location['range']['end']['line'],
                    location['range']['end']['character']
                );
                ranges.push(new Range(startPosition, endPosition));
            }
        }
        decorator.set(activeEditor, ranges);
    }
}
