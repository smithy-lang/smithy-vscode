import * as child_process from 'child_process';
import * as vscode from 'vscode';
import downloadCoursierIfRequired from './download-coursier';

export default async function getCoursierExecutable(context: vscode.ExtensionContext): Promise<string> {
    for (const command of ['cs', 'coursier']) {
        if (await availableOnPath(command, ['--help'])) {
            return command;
        }
    }

    console.log('Coursier not found on path, downloading it instead.');
    return await downloadCoursierIfRequired(context.globalStoragePath, 'v2.0.6');
}

function availableOnPath(command: string, args: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        child_process.execFile(command, args, (e, _, __) => {
            resolve(e == null);
        });
    });
}
