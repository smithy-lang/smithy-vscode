// @ts-check
import { defineConfig } from 'rolldown';

export default defineConfig({
    input: 'src/extension.ts',
    platform: 'node',
    // Provided by VS Code at runtime.
    external: ['vscode'],
    // engines.vscode ^1.114.0 ships Node 22, so lower only syntax newer than that.
    transform: { target: 'node22' },
    output: {
        // Matches "main" in package.json.
        file: 'out/src/extension.js',
        format: 'cjs',
        minify: true,
        // Emit the .map file without a sourceMappingURL comment in the bundle.
        sourcemap: 'hidden',
    },
});
