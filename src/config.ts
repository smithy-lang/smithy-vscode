import * as vscode from 'vscode';

export function getServerDiagnosticsMinimumSeverity(): string | undefined {
    return getOldOrNewConfig('diagnostics.minimumSeverity', 'server.diagnostics.minimumSeverity');
}

export function getServerOnlyReloadOnSave(): boolean | undefined {
    return getOldConfig('onlyReloadOnSave');
}

export function getServerExecutable(): string | undefined {
    return getConfig('server.executable');
}

export function getServerVersion(): string {
    // Fall back to the contributed default if the setting is explicitly set to null.
    return getOldOrNewConfig<string>('version', 'server.version') ?? 'latest.release';
}

function getOldOrNewConfig<T>(oldKey: string, newKey: string): T | undefined {
    return getOldConfig(oldKey) || getConfig(newKey);
}

function getConfig<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration('smithy').get<T>(key);
}

function getOldConfig<T>(key: string): T | undefined {
    return vscode.workspace.getConfiguration('smithyLsp').get<T>(key);
}
