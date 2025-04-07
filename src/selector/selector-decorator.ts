import { Range, TextEditor, TextEditorDecorationType, window, workspace } from 'vscode';

export interface ISelectorDecorator {
    getDecorationType(): TextEditorDecorationType;
    clear(): void;
    set(textEditor: TextEditor, ranges: readonly Range[]): void;
}

export class SelectorDecorator {
    private decorationType: TextEditorDecorationType;

    constructor() {
        this.decorationType = this.createDecorationType();
    }

    getDecorationType(): TextEditorDecorationType {
        return this.decorationType;
    }

    clear(): void {
        this.decorationType.dispose();
        this.decorationType = this.createDecorationType();
    }

    createDecorationType(): TextEditorDecorationType {
        return window.createTextEditorDecorationType({
            border: 'dotted',
            borderColor: '#C44536',
        });
    }

    set(textEditor: TextEditor, ranges: readonly Range[]): void {
        textEditor.setDecorations(this.decorationType, ranges);
    }
}
