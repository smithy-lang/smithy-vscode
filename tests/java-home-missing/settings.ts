import { resolve } from 'path';

// Points smithy.server.javaHome at a directory that doesn't exist.
export default function settings({ testDataPath }: { testDataPath: string }) {
    return { 'smithy.server.javaHome': resolve(testDataPath, 'java-home-missing') };
}
