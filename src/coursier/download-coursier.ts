import * as path from 'path';
import * as fs from 'fs';
import { access, mkdir } from 'fs/promises';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream } from 'stream/web';
import { createGunzip } from 'zlib';
import { logger } from '../logger';

interface CoursierAsset {
    url: string;
    file: string;
    // Whether the release asset is gzip-compressed and must be decompressed after download.
    gzipped?: boolean;
}

export default function downloadCoursierIfRequired(
    extensionPath: string,
    versionPath: string,
    appleSiliconVersionPath: string
): Promise<string> {
    function binPath(filename: string) {
        return path.join(extensionPath, filename);
    }

    function createDir() {
        return mkdir(extensionPath).catch((err: { code?: string }) => {
            return err && err.code === 'EEXIST' ? Promise.resolve() : Promise.reject(err);
        });
    }

    function releaseUrl(version: string, asset: string) {
        return `https://github.com/coursier/coursier/releases/download/${version}/${asset}`;
    }

    const assets: Partial<
        Record<NodeJS.Platform, Partial<Record<NodeJS.Architecture, CoursierAsset>> & { default: CoursierAsset }>
    > = {
        darwin: {
            // Uses its own file name so that an x86_64 binary downloaded by an earlier version of
            // the extension isn't reused on Apple Silicon.
            arm64: {
                url: releaseUrl(appleSiliconVersionPath, 'cs-aarch64-apple-darwin.gz'),
                file: binPath('coursier-aarch64'),
                gzipped: true,
            },
            default: { url: releaseUrl(versionPath, 'cs-x86_64-apple-darwin'), file: binPath('coursier') },
        },
        linux: {
            arm64: { url: releaseUrl(versionPath, 'cs-aarch64-pc-linux'), file: binPath('coursier') },
            default: { url: releaseUrl(versionPath, 'cs-x86_64-pc-linux'), file: binPath('coursier') },
        },
        win32: {
            default: { url: releaseUrl(versionPath, 'cs-x86_64-pc-win32.exe'), file: binPath('coursier.exe') },
        },
    };

    const platformAssets = assets[process.platform];
    if (!platformAssets) {
        return Promise.reject(new Error(`Coursier download is not supported on platform: ${process.platform}`));
    }
    const asset = platformAssets[process.arch] ?? platformAssets.default;
    return validBinFileExists(asset.file).then((valid) => {
        if (valid) {
            return asset.file;
        }
        logger.info(`Coursier not found on path, downloading it from ${asset.url}`);
        return createDir().then(() => downloadFile(asset.url, asset.file, asset.gzipped ?? false));
    });
}

function validBinFileExists(file: string): Promise<boolean> {
    return access(file, fs.constants.X_OK)
        .then(() => true)
        .catch(() => false);
}

async function downloadFile(url: string, targetFile: string, gzipped: boolean): Promise<string> {
    // fetch follows redirects by default, which GitHub release asset URLs rely on.
    const response = await fetch(url);
    if (response.status !== 200 || !response.body) {
        await response.body?.cancel();
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }

    try {
        const source = Readable.fromWeb(response.body as ReadableStream<Uint8Array>);
        const destination = fs.createWriteStream(targetFile, { flags: 'wx', mode: 0o755 });
        if (gzipped) {
            await pipeline(source, createGunzip(), destination);
        } else {
            await pipeline(source, destination);
        }
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'EEXIST') {
            logger.info(`File already exists at ${targetFile}`);
            return targetFile;
        }
        fs.unlink(targetFile, () => {}); // Delete partially written file
        logger.error(`File error while downloading file at ${targetFile}`);
        logger.error(err instanceof Error ? err : String(err));
        throw err;
    }

    logger.info(`Finished downloading file at ${targetFile}`);
    return targetFile;
}
