import { DOMParser } from '@xmldom/xmldom';

// Pins smithy.server.version to the second newest release, which is older than latest.release, so
// switching between them restarts the language server with a different version.
export default async function settings() {
    const releasesFeedUrl = 'https://github.com/smithy-lang/smithy-language-server/releases.atom';
    const response = await fetch(releasesFeedUrl, { signal: AbortSignal.timeout(30_000) });

    if (!response.ok) {
        throw new Error(`${releasesFeedUrl} responded with ${response.status}: ${response.statusText}`);
    }

    const releasesFeed = new DOMParser().parseFromString(await response.text(), 'text/xml');
    // Each entry's id ends with the release tag, e.g. tag:github.com,2008:Repository/318516123/0.10.0.
    const versions = Array.from(
        releasesFeed.getElementsByTagName('entry'),
        (entry) => entry.getElementsByTagName('id')[0]?.textContent?.split('/').pop() ?? ''
    ).filter((version) => /^\d+\.\d+\.\d+$/.test(version));

    const previous = versions.sort(new Intl.Collator('en', { numeric: true }).compare).at(-2);
    if (!previous) {
        throw new Error(`Fewer than two releases in ${releasesFeedUrl}`);
    }

    return { 'smithy.server.version': previous };
}
