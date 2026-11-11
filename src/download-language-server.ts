import { createHash } from 'crypto';
import * as fs from 'fs';
import { access, chmod, mkdir, mkdtemp, readdir, rename, rm } from 'fs/promises';
import * as path from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream } from 'stream/web';
import StreamZip from 'node-stream-zip';
import { logger } from './logger';

const RELEASES_URL = 'https://github.com/smithy-lang/smithy-language-server/releases';

// The first release with a self-contained zip for each platform.
export const MINIMUM_VERSION = '0.7.0';

// Parses an exact version such as 0.9.0. Returns undefined for anything else, such as a range.
export function parseVersion(version: string): [number, number, number] | undefined {
    const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
    return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : undefined;
}

export function isSupportedVersion(version: string): boolean {
    const parsed = parseVersion(version);
    return parsed !== undefined && compareVersions(parsed, parseVersion(MINIMUM_VERSION)!) >= 0;
}

function compareVersions(a: number[], b: number[]): number {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return a[i] - b[i];
        }
    }
    return 0;
}

// Names of the release zip for this platform, without the `smithy-language-server-` prefix and
// `.zip` suffix, in order of preference.
function platformNames(): string[] {
    const arch = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : undefined;
    switch (process.platform) {
        case 'darwin':
        case 'linux':
            if (arch) {
                return [`${process.platform}-${arch}`];
            }
            break;
        case 'win32':
            // There is no Windows arm64 build. Windows on arm64 runs the x86_64 build under
            // emulation. 0.7.0 named it windows-x64.
            if (arch) {
                return ['windows-x86_64', 'windows-x64'];
            }
            break;
    }
    throw new Error(`smithy-language-server isn't available for ${process.platform}-${process.arch}`);
}

// Returns the path of the smithy-language-server launch script for `version` (an exact version, or
// latest.release), downloading the release zip into `storagePath` if needed.
export default async function downloadLanguageServerIfRequired(storagePath: string, version: string): Promise<string> {
    const installRoot = path.join(storagePath, 'language-server');
    const resolvedVersion = version === 'latest.release' ? await resolveLatestVersion(installRoot) : version;
    const installDir = path.join(installRoot, resolvedVersion);
    const launchScript = getLaunchScript(installDir);
    if (await exists(launchScript)) {
        return launchScript;
    }

    logger.info(`Downloading smithy-language-server ${resolvedVersion}`);
    await mkdir(installRoot, { recursive: true });
    // Download and extract into a temporary directory that is renamed into place, so a partial
    // download never appears at `installDir`.
    const tempDir = await mkdtemp(path.join(installRoot, '.download-'));
    try {
        const releaseUrl = `${RELEASES_URL}/download/${resolvedVersion}`;
        const checksums = parseChecksums(await fetchText(`${releaseUrl}/checksums_sha256.txt`));
        const asset = platformNames()
            .map((name) => `smithy-language-server-${name}.zip`)
            .find((name) => checksums.has(name));
        if (!asset) {
            throw new Error(`smithy-language-server ${resolvedVersion} has no release zip for this platform`);
        }

        const zipFile = path.join(tempDir, asset);
        const sha256 = await downloadFile(`${releaseUrl}/${asset}`, zipFile);
        if (sha256 !== checksums.get(asset)) {
            throw new Error(`Checksum mismatch for ${asset}: expected ${checksums.get(asset)}, got ${sha256}`);
        }

        const extractDir = path.join(tempDir, 'contents');
        await extractZip(zipFile, extractDir);
        try {
            await rename(await findInstallationRoot(extractDir), installDir);
        } catch (err) {
            // Another window may have finished the same download first.
            if (!(await exists(launchScript))) {
                throw err;
            }
        }
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch((err) =>
            logger.warn(`Couldn't delete ${tempDir}: ${err}`)
        );
    }

    logger.info(`Installed smithy-language-server ${resolvedVersion} at ${installDir}`);
    return launchScript;
}

// Deletes Coursier binaries downloaded by earlier versions of the extension.
export async function deleteCoursier(storagePath: string): Promise<void> {
    for (const name of ['coursier', 'coursier.exe']) {
        await rm(path.join(storagePath, name), { force: true }).catch(() => {});
    }
}

function getLaunchScript(installDir: string): string {
    const name = process.platform === 'win32' ? 'smithy-language-server.bat' : 'smithy-language-server';
    return path.join(installDir, 'bin', name);
}

// Resolves latest.release to the newest released version. Offline, uses the newest installed one.
async function resolveLatestVersion(installRoot: string): Promise<string> {
    try {
        const version = (await fetchText(`${RELEASES_URL}/latest/download/VERSION`)).trim();
        if (!parseVersion(version)) {
            throw new Error(`Unexpected latest smithy-language-server version: ${version}`);
        }
        return version;
    } catch (err) {
        const installed = await newestInstalledVersion(installRoot);
        if (!installed) {
            throw err;
        }
        logger.warn(`Couldn't resolve the latest smithy-language-server version, using ${installed}: ${err}`);
        return installed;
    }
}

async function newestInstalledVersion(installRoot: string): Promise<string | undefined> {
    const entries = await readdir(installRoot).catch(() => []);
    const versions = entries
        .filter(isSupportedVersion)
        .sort((a, b) => compareVersions(parseVersion(a)!, parseVersion(b)!));
    for (const version of versions.reverse()) {
        if (await exists(getLaunchScript(path.join(installRoot, version)))) {
            return version;
        }
    }
    return undefined;
}

// Parses `<sha256>  <file name>` lines.
function parseChecksums(text: string): Map<string, string> {
    const checksums = new Map<string, string>();
    for (const line of text.split('\n')) {
        const match = /^([0-9a-f]{64})\s+\*?(\S+)$/.exec(line.trim());
        if (match) {
            checksums.set(match[2], match[1]);
        }
    }
    return checksums;
}

async function fetchText(url: string): Promise<string> {
    // fetch follows redirects by default, which GitHub release asset URLs rely on.
    const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`${url} responded with ${response.status}: ${response.statusText}`);
    }
    return response.text();
}

// Downloads `url` to `file` and returns its SHA-256.
async function downloadFile(url: string, file: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        await response.body?.cancel();
        throw new Error(`${url} responded with ${response.status}: ${response.statusText}`);
    }
    const hash = createHash('sha256');
    await pipeline(
        Readable.fromWeb(response.body as ReadableStream<Uint8Array>),
        async function* (source: AsyncIterable<Buffer>) {
            for await (const chunk of source) {
                hash.update(chunk);
                yield chunk;
            }
        },
        fs.createWriteStream(file)
    );
    return hash.digest('hex');
}

// node-stream-zip rejects entries with absolute paths or `..` segments, so entries can't escape `dest`.
async function extractZip(zipFile: string, dest: string): Promise<void> {
    await mkdir(dest, { recursive: true });
    const zip = new StreamZip.async({ file: zipFile });
    try {
        await zip.extract(null, dest);
        // extract() ignores Unix permissions, so restore the exec bits on bin/* and lib/jspawnhelper.
        for (const entry of Object.values(await zip.entries())) {
            const mode = (entry.attr >>> 16) & 0o777;
            if (!entry.isDirectory && mode & 0o111) {
                await chmod(path.join(dest, entry.name), mode);
            }
        }
    } finally {
        await zip.close();
    }
}

// Zips up to 0.7.0 put the installation in a top-level directory; later ones don't.
async function findInstallationRoot(extractDir: string): Promise<string> {
    const entries = await readdir(extractDir);
    if (!entries.includes('bin') && entries.length === 1) {
        return path.join(extractDir, entries[0]);
    }
    return extractDir;
}

function exists(file: string): Promise<boolean> {
    return access(file).then(
        () => true,
        () => false
    );
}
