// @ts-check
import { defineConfig } from 'rolldown';

export default defineConfig({
    input: 'src/extension.ts',
    platform: 'node',
    // Provided by VS Code at runtime.
    external: ['vscode'],
    output: {
        // Matches "main" in package.json.
        file: 'out/src/extension.js',
        format: 'cjs',
        minify: true,
        // Emit the .map file without a sourceMappingURL comment in the bundle.
        sourcemap: 'hidden',
    },
});
