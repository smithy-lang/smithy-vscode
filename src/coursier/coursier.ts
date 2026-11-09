import * as child_process from 'child_process';
import * as vscode from 'vscode';
import downloadCoursierIfRequired from './download-coursier';
import { logger } from '../logger';

// Version of Coursier downloaded when neither `cs` nor `coursier` is on the PATH.
const COURSIER_VERSION = 'v2.0.10';
// Coursier 2.0.x has no native Apple Silicon build. The x86_64 build only runs there under
// Rosetta, and without Rosetta spawning it fails with EBADARCH ("Unknown system error -86").
const APPLE_SILICON_COURSIER_VERSION = 'v2.1.26';

export default async function getCoursierExecutable(context: vscode.ExtensionContext): Promise<string> {
    for (const command of ['cs', 'coursier']) {
        if (await availableOnPath(command, ['--help'])) {
            logger.info(`Using Coursier from PATH: ${command}`);
            return command;
        }
    }

    return await downloadCoursierIfRequired(
        context.globalStoragePath,
        COURSIER_VERSION,
        APPLE_SILICON_COURSIER_VERSION
    );
}

function availableOnPath(command: string, args: string[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
        child_process.execFile(command, args, (e, _, __) => {
            resolve(e == null);
        });
    });
}
