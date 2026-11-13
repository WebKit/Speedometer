import { resolve } from "path";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

// The build settings both apps share: relative URLs (the harness loads the
// build from the repository root), output in dist/<name>/, and the
// resources.txt that tests/unittests/suites.mjs validates.
export function chatStreamBuild(name, plugins) {
    const outDir = resolve(import.meta.dirname, "dist", name);
    return {
        base: "./",
        plugins: [
            ...plugins,
            {
                name: "chat-stream-resources-manifest",
                closeBundle() {
                    generateResourcesFile(outDir);
                },
            },
        ],
        build: {
            outDir,
            emptyOutDir: true,
            modulePreload: { polyfill: false },
            // Vite's default minifier, so the payload matches what a Vite app
            // deploys. The source map keeps the bundle readable while profiling.
            sourcemap: true,
        },
    };
}
