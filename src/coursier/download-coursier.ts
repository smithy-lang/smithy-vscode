import * as path from 'path';
import * as fs from 'fs';
import { access, mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream } from 'stream/web';

export default function downloadCoursierIfRequired(extensionPath: string, versionPath: string): Promise<string> {
    function binPath(filename: string) {
        return path.join(extensionPath, filename);
    }

    function createDir() {
        return mkdir(extensionPath).catch((err: { code?: string }) => {
            return err && err.code === 'EEXIST' ? Promise.resolve() : Promise.reject(err);
        });
    }

    const urls = {
        darwin: {
            default: `https://github.com/coursier/coursier/releases/download/${versionPath}/cs-x86_64-apple-darwin`,
        },
        linux: {
            arm64: `https://github.com/coursier/coursier/releases/download/${versionPath}/cs-aarch64-pc-linux`,
            default: `https://github.com/coursier/coursier/releases/download/${versionPath}/cs-x86_64-pc-linux`,
        },
        win32: {
            default: `https://github.com/coursier/coursier/releases/download/${versionPath}/cs-x86_64-pc-win32.exe`,
        },
    };
    const targets = {
        darwin: binPath('coursier'),
        linux: binPath('coursier'),
        win32: binPath('coursier.exe'),
    };

    const targetFile = targets[process.platform];
    const downloadUrl = urls[process.platform]?.[process.arch] ?? urls[process.platform].default;
    return validBinFileExists(targetFile).then((valid) => {
        return valid ? targetFile : createDir().then(() => downloadFile(downloadUrl, targetFile));
    });
}

function validBinFileExists(file: string): Promise<boolean> {
    return access(file, fs.constants.X_OK)
        .then(() => true)
        .catch(() => false);
}

async function downloadFile(url: string, targetFile: string): Promise<string> {
    // fetch follows redirects by default, which GitHub release asset URLs rely on.
    const response = await fetch(url);
    if (response.status !== 200 || !response.body) {
        await response.body?.cancel();
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    try {
        await pipeline(
            Readable.fromWeb(response.body as ReadableStream<Uint8Array>),
            fs.createWriteStream(targetFile, { flags: 'wx', mode: 0o755 })
        );
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
            console.log(`File already exists at ${targetFile}`);
            return targetFile;
        }
        fs.unlink(targetFile, () => {}); // Delete partially written file
        console.error(`File error while downloading file at ${targetFile}`);
        console.error(err);
        throw err;
    }

    console.log(`Finished downloaded file at ${targetFile}`);
    return targetFile;
}
