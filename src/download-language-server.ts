import { createHash, randomUUID } from 'crypto';
import { createWriteStream } from 'fs';
import { access, chmod, mkdir, mkdtemp, readdir, rename, rm, stat, writeFile } from 'fs/promises';
import { basename, dirname, join } from 'path';
import { pipeline } from 'stream/promises';
import StreamZip from 'node-stream-zip';
import { logger } from './logger';

const RELEASES_URL = 'https://github.com/smithy-lang/smithy-language-server/releases';

// The oldest release with a self-contained zip for each platform.
export const MINIMUM_VERSION = '0.4.0';

// Matches an exact version such as 0.9.0, and not anything else, such as a range.
const EXACT_VERSION = /^\d+\.\d+\.\d+$/;

// Compares the numbers in versions, so 0.10.0 sorts after 0.9.0.
const compareVersions = new Intl.Collator('en', { numeric: true }).compare;

export function isSupportedVersion(version: string): boolean {
    return EXACT_VERSION.test(version) && compareVersions(version, MINIMUM_VERSION) >= 0;
}

// Names of the release zip for this platform, without the `smithy-language-server-` prefix and
// `.zip` suffix, in order of preference.
function platformNames(): string[] {
    const arch = process.arch === 'arm64' ? 'aarch64' : process.arch === 'x64' ? 'x86_64' : undefined;
    if (!arch || !['darwin', 'linux', 'win32'].includes(process.platform)) {
        throw new Error(`smithy-language-server isn't available for ${process.platform}-${process.arch}`);
    }
    // There is no Windows arm64 build. Windows on arm64 runs the x86_64 build under emulation.
    // 0.7.0 named it windows-x64.
    return process.platform === 'win32' ? ['windows-x86_64', 'windows-x64'] : [`${process.platform}-${arch}`];
}

// Returns the path of the smithy-language-server launch script for `version` (an exact version, or
// latest.release) and the exact version it runs, downloading the release zip into `storagePath` if
// needed. Then deletes the versions that no window uses.
export default async function downloadLanguageServerIfRequired(
    storagePath: string,
    version: string
): Promise<{ launchScript: string; version: string }> {
    const installed = await installLanguageServer(storagePath, version);
    const { launchScript } = installed;
    const installDir = dirname(dirname(launchScript));
    try {
        await writeFile(join(installDir, `${IN_USE_PREFIX}${process.pid}`), '');
        // Not awaited, so pruning doesn't delay starting the server.
        pruneInstalls(dirname(installDir), basename(installDir)).catch((err) =>
            logger.warn(`Couldn't delete old smithy-language-server versions: ${err}`)
        );
    } catch (err) {
        logger.warn(`Couldn't mark ${installDir} as in use: ${err}`);
    }
    return installed;
}

async function installLanguageServer(
    storagePath: string,
    version: string
): Promise<{ launchScript: string; version: string }> {
    const installRoot = join(storagePath, 'language-server');
    const resolvedVersion = version === 'latest.release' ? await resolveLatestVersion(installRoot) : version;
    const installDir = join(installRoot, resolvedVersion);
    const launchScript = getLaunchScript(installDir);
    if (await exists(launchScript)) {
        return { launchScript, version: resolvedVersion };
    }

    logger.info(`Downloading smithy-language-server ${resolvedVersion}`);
    await mkdir(installRoot, { recursive: true });
    // Download and extract into a temporary directory that is renamed into place, so a partial
    // download never appears at `installDir`.
    const tempDir = await mkdtemp(join(installRoot, '.download-'));
    try {
        const releaseUrl = `${RELEASES_URL}/download/${resolvedVersion}`;
        const checksums = parseChecksums(await fetchText(`${releaseUrl}/checksums_sha256.txt`));
        const asset = platformNames()
            .map((name) => `smithy-language-server-${name}.zip`)
            .find((name) => checksums.has(name));
        if (!asset) {
            throw new Error(`smithy-language-server ${resolvedVersion} has no release zip for this platform`);
        }

        const zipFile = join(tempDir, asset);
        const sha256 = await downloadFile(`${releaseUrl}/${asset}`, zipFile);
        if (sha256 !== checksums.get(asset)) {
            throw new Error(`Checksum mismatch for ${asset}: expected ${checksums.get(asset)}, got ${sha256}`);
        }

        const extractDir = join(tempDir, 'contents');
        await extractZip(zipFile, extractDir);
        try {
            await rename(await findInstallationRoot(extractDir), installDir);
        } catch (err) {
            // Another window may have finished the same download first.
            if (!(await exists(launchScript))) {
                throw err;
            }
        }
    } catch (err) {
        const installed = version === 'latest.release' ? await newestInstalledVersion(installRoot) : undefined;
        if (!installed) {
            throw err;
        }
        logger.warn(`Couldn't download smithy-language-server ${resolvedVersion}, using ${installed}: ${err}`);
        return { launchScript: getLaunchScript(join(installRoot, installed)), version: installed };
    } finally {
        await rm(tempDir, { recursive: true, force: true }).catch((err) =>
            logger.warn(`Couldn't delete ${tempDir}: ${err}`)
        );
    }

    logger.info(`Installed smithy-language-server ${resolvedVersion} at ${installDir}`);
    return { launchScript, version: resolvedVersion };
}

// Each window writes `.in-use-<extension host pid>` into the version it runs, so other windows don't
// delete that version while its server is running, or for 30 days after it last started.
const IN_USE_PREFIX = '.in-use-';
const DAY_MS = 24 * 60 * 60 * 1000;
const KEEP_UNUSED_MS = 30 * DAY_MS;

// Deletes installed versions other than `keep` that no running window uses and that no window
// started in the last 30 days, and temporary directories left by interrupted downloads or deletions.
async function pruneInstalls(installRoot: string, keep: string): Promise<void> {
    for (const name of await readdir(installRoot)) {
        let dir = join(installRoot, name);
        try {
            if (name === keep) {
                // Delete the markers of windows that have exited, so they don't pile up.
                for (const marker of await readMarkers(dir)) {
                    if (!marker.running) {
                        await rm(marker.path, { force: true });
                    }
                }
                continue;
            }
            if (name.startsWith('.download-')) {
                // Another window may still be downloading into it.
                if (Date.now() - (await stat(dir)).mtimeMs < DAY_MS) {
                    continue;
                }
            } else if (!name.startsWith('.delete-')) {
                const markers = await readMarkers(dir);
                if (markers.some((marker) => marker.running || Date.now() - marker.mtimeMs < KEEP_UNUSED_MS)) {
                    continue;
                }
                // Rename first, so a partly deleted version is never used. On Windows, this fails
                // if the version is running.
                const deleteDir = join(installRoot, `.delete-${randomUUID()}`);
                await rename(dir, deleteDir);
                dir = deleteDir;
            }
            await rm(dir, { recursive: true, force: true });
            logger.info(`Deleted ${join(installRoot, name)}`);
        } catch (err) {
            logger.warn(`Couldn't delete ${dir}: ${err}`);
        }
    }
}

async function readMarkers(installDir: string): Promise<{ path: string; running: boolean; mtimeMs: number }[]> {
    const names = (await readdir(installDir)).filter((name) => name.startsWith(IN_USE_PREFIX));
    return Promise.all(
        names.map(async (name) => {
            const markerPath = join(installDir, name);
            return {
                path: markerPath,
                running: isRunning(Number(name.slice(IN_USE_PREFIX.length))),
                mtimeMs: (await stat(markerPath)).mtimeMs,
            };
        })
    );
}

function isRunning(pid: number): boolean {
    try {
        process.kill(pid, 0);
        return true;
    } catch (err) {
        // EPERM means the process exists but belongs to another user.
        return (err as NodeJS.ErrnoException).code === 'EPERM';
    }
}

// Deletes Coursier binaries downloaded by earlier versions of the extension.
export async function deleteCoursier(storagePath: string): Promise<void> {
    for (const name of ['coursier', 'coursier.exe']) {
        await rm(join(storagePath, name), { force: true }).catch(() => {});
    }
}

function getLaunchScript(installDir: string): string {
    const name = process.platform === 'win32' ? 'smithy-language-server.bat' : 'smithy-language-server';
    return join(installDir, 'bin', name);
}

// Resolves latest.release to the newest released version. Offline, uses the newest installed one.
async function resolveLatestVersion(installRoot: string): Promise<string> {
    try {
        const version = (await fetchText(`${RELEASES_URL}/latest/download/VERSION`)).trim();
        if (!EXACT_VERSION.test(version)) {
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
    // Newest first.
    const versions = entries.filter(isSupportedVersion).sort((a, b) => compareVersions(b, a));
    for (const version of versions) {
        if (await exists(getLaunchScript(join(installRoot, version)))) {
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

// Fetches `url`, and throws unless it responds with a body and a 2xx status.
async function fetchOk(url: string, init?: RequestInit): Promise<Response> {
    // fetch follows redirects by default, which GitHub release asset URLs rely on.
    const response = await fetch(url, init);
    if (!response.ok || !response.body) {
        await response.body?.cancel();
        throw new Error(`${url} responded with ${response.status}: ${response.statusText}`);
    }
    return response;
}

async function fetchText(url: string): Promise<string> {
    return (await fetchOk(url, { signal: AbortSignal.timeout(30_000) })).text();
}

// Downloads `url` to `file` and returns its SHA-256.
async function downloadFile(url: string, file: string): Promise<string> {
    const response = await fetchOk(url);
    const hash = createHash('sha256');
    await pipeline(
        response.body!,
        async function* (source: AsyncIterable<Uint8Array>) {
            for await (const chunk of source) {
                hash.update(chunk);
                yield chunk;
            }
        },
        createWriteStream(file)
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
                await chmod(join(dest, entry.name), mode);
            }
        }
    } finally {
        await zip.close();
    }
}

// The 0.7.0 zips put the installation in a top-level directory; other versions don't.
async function findInstallationRoot(extractDir: string): Promise<string> {
    const entries = await readdir(extractDir);
    if (!entries.includes('bin') && entries.length === 1) {
        return join(extractDir, entries[0]);
    }
    return extractDir;
}

function exists(file: string): Promise<boolean> {
    return access(file).then(
        () => true,
        () => false
    );
}
