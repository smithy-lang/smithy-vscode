import * as vscode from 'vscode';

// Shared by the extension and the language client (server stderr, window/logMessage, and LSP
// message traces). The client only traces when this channel's log level is Trace.
export const logger = vscode.window.createOutputChannel('Smithy', { log: true });
