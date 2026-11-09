import * as child_process from 'child_process';
import * as vscode from 'vscode';
import downloadCoursierIfRequired from './download-coursier';
import { logger } from '../logger';

// Version of Coursier downloaded when neither `cs` nor `coursier` is on the PATH. It must have a
// native build for each supported platform, including Apple Silicon, which 2.0.x doesn't.
const COURSIER_VERSION = 'v2.1.26';

export default async function getCoursierExecutable(context: vscode.ExtensionContext): Promise<string> {
    for (const command of ['cs', 'coursier']) {
        if (await availableOnPath(command, ['--help'])) {
            logger.info(`Using Coursier from PATH: ${command}`);
            return command;
        }
    }

    return await downloadCoursierIfRequired(context.globalStoragePath, COURSIER_VERSION);
}

function availableOnPath(command: string, args: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        child_process.execFile(command, args, (e, _, __) => {
            resolve(e == null);
        });
    });
}
