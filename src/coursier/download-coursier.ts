import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { access, mkdir, mkdtemp, rename, rm } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream } from 'stream/web';
import { promisify } from 'util';
import { createGunzip } from 'zlib';
import { logger } from '../logger';

const execFile = promisify(child_process.execFile);

// Coursier release assets are compressed: gzip on macOS and Linux, and zip on Windows.
type CoursierAsset = { name: string; format: 'gzip' } | { name: string; format: 'zip'; entry: string };

const assets: Partial<
    Record<NodeJS.Platform, Partial<Record<NodeJS.Architecture, CoursierAsset>> & { default: CoursierAsset }>
> = {
    darwin: {
        arm64: { name: 'cs-aarch64-apple-darwin.gz', format: 'gzip' },
        default: { name: 'cs-x86_64-apple-darwin.gz', format: 'gzip' },
    },
    linux: {
        arm64: { name: 'cs-aarch64-pc-linux.gz', format: 'gzip' },
        default: { name: 'cs-x86_64-pc-linux.gz', format: 'gzip' },
    },
    win32: {
        default: { name: 'cs-x86_64-pc-win32.zip', format: 'zip', entry: 'cs-x86_64-pc-win32.exe' },
    },
};

export default function downloadCoursierIfRequired(extensionPath: string, versionPath: string): Promise<string> {
    function createDir() {
        return mkdir(extensionPath).catch((err: { code?: string }) => {
            return err && err.code === 'EEXIST' ? Promise.resolve() : Promise.reject(err);
        });
    }

    const platformAssets = assets[process.platform];
    if (!platformAssets) {
        return Promise.reject(new Error(`Coursier download is not supported on platform: ${process.platform}`));
    }
    const asset = platformAssets[process.arch] ?? platformAssets.default;
    const downloadUrl = `https://github.com/coursier/coursier/releases/download/${versionPath}/${asset.name}`;
    // The version is part of the file name so that changing it replaces binaries downloaded by
    // earlier versions of the extension, such as the x86_64 binary 2.0.x used on Apple Silicon.
    const targetFile = path.join(extensionPath, `coursier-${versionPath}${process.platform === 'win32' ? '.exe' : ''}`);
    return validBinFileExists(targetFile).then((valid) => {
        if (valid) {
            return targetFile;
        }
        logger.info(`Coursier not found on path, downloading it from ${downloadUrl}`);
        return createDir().then(() => downloadFile(downloadUrl, targetFile, asset));
    });
}

function validBinFileExists(file: string): Promise<boolean> {
    return access(file, fs.constants.X_OK)
        .then(() => true)
        .catch(() => false);
}

async function downloadFile(url: string, targetFile: string, asset: CoursierAsset): Promise<string> {
    // fetch follows redirects by default, which GitHub release asset URLs rely on.
    const response = await fetch(url);
    if (response.status !== 200 || !response.body) {
        await response.body?.cancel();
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    const body = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);

    try {
        if (asset.format === 'zip') {
            await saveZipEntry(body, asset.entry, targetFile);
        } else {
            await pipeline(body, createGunzip(), fs.createWriteStream(targetFile, { flags: 'wx', mode: 0o755 }));
        }
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
            logger.info(`File already exists at ${targetFile}`);
            return targetFile;
        }
        if (asset.format === 'gzip') {
            fs.unlink(targetFile, () => {}); // Delete partially written file
        }
        logger.error(`File error while downloading file at ${targetFile}`);
        logger.error(err instanceof Error ? err : String(err));
        throw err;
    }

    logger.info(`Finished downloading file at ${targetFile}`);
    return targetFile;
}

// Extracts `entry` from a zip archive into `targetFile`. The archive is extracted into a temporary
// directory and the entry is then moved into place, so a partial file never appears at `targetFile`.
async function saveZipEntry(zip: Readable, entry: string, targetFile: string): Promise<void> {
    const tempDir = await mkdtemp(path.join(path.dirname(targetFile), 'download-'));
    try {
        const zipFile = path.join(tempDir, 'coursier.zip');
        await pipeline(zip, fs.createWriteStream(zipFile));
        // Windows 10 and later include bsdtar as System32\tar.exe, which can extract zip files. Use
        // its full path so that a GNU tar on the PATH, such as Git for Windows', which can't read
        // zip files, isn't used instead.
        const tar = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tar.exe');
        await execFile(tar, ['-xf', zipFile, '-C', tempDir, entry]);
        try {
            await rename(path.join(tempDir, entry), targetFile);
        } catch (err) {
            // Another window may have finished the same download first, and be running it.
            if (!(await validBinFileExists(targetFile))) {
                throw err;
            }
        }
    } finally {
        await rm(tempDir, { recursive: true, force: true });
    }
}
