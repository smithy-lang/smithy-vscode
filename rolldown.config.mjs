// @ts-check
import { defineConfig } from 'rolldown';

// Set by the "bundle" task in .vscode/tasks.json for the launch config. The debugger needs the
// sourceMappingURL comment to map breakpoints in src/*.ts, and an unminified bundle keeps the real
// function names in the call stack.
const debug = process.env.SMITHY_VSCODE_DEBUG_BUNDLE === '1';

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
        minify: !debug,
        // For publishing, emit the .map file without a sourceMappingURL comment in the bundle.
        sourcemap: debug ? true : 'hidden',
    },
});
