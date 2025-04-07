import { RequestType } from 'vscode-languageclient';

interface SelectorParams {
    expression: String;
}

export namespace SelectorCommandRequest {
    export const type = new RequestType<SelectorParams, [], void>('smithy/selectorCommand');
}
