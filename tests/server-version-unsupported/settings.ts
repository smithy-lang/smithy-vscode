// Pins smithy.server.version to a version the extension doesn't support, so activation fails.
export default function settings() {
    return { 'smithy.server.version': '0.1' };
}
