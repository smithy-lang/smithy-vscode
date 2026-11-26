// Pins smithy.server.version to a release older than latest.release, so switching between them
// restarts the language server with a different version.
export default function settings() {
    return { 'smithy.server.version': '0.9.0' };
}
