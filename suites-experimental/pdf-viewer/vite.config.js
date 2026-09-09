import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

// The suite entry declares a resources.txt, which tests/unittests/suites.mjs validates.
function resourcesManifest() {
    return {
        name: "pdf-viewer-resources-manifest",
        closeBundle() {
            generateResourcesFile(new URL("dist", import.meta.url).pathname);
        },
    };
}

export default defineConfig({
    // The harness loads dist/ from the repo root.
    base: "./",
    plugins: [resourcesManifest()],
    // pdf.worker.mjs is an ES module, so it has to be bundled as one.
    worker: {
        format: "es",
        rollupOptions: {
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
    build: {
        modulePreload: { polyfill: false },
        // pdfjs-dist ships pdf.mjs unminified and leaves minification to the bundler.
        minify: "esbuild",
        sourcemap: true,
        rollupOptions: {
            input: {
                index: `${rootDir}index.html`,
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
