import * as vscode from 'vscode';

export function getServerDiagnosticsMinimumSeverity(): string | undefined {
    return getConfig('server.diagnostics.minimumSeverity') ?? getOldConfig('diagnostics.minimumSeverity');
}

export function getServerOnlyReloadOnSave(): boolean | undefined {
    return getOldConfig('onlyReloadOnSave');
}

export function getServerExecutable(): string | undefined {
    return getConfig('server.executable');
}

export function getServerVersion(): string {
    return getConfig('server.version') ?? getOldConfig('version');
}

function getConfig<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration('smithy').get<T>(key);
}

function getOldConfig<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration('smithyLsp').get<T>(key);
}
