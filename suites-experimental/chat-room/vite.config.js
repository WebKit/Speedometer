import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

// The suite entry declares a resources.txt, which tests/unittests/suites.mjs
// validates, so emit it once the bundle is on disk.
function resourcesManifest() {
    return {
        name: "chat-room-resources-manifest",
        closeBundle() {
            generateResourcesFile(resolve(__dirname, "dist"));
        },
    };
}

export default defineConfig({
    // Since this will be loaded from the project root.
    base: "./",
    plugins: [react(), resourcesManifest()],
    build: {
        modulePreload: { polyfill: false },
        // React 19 ships its production build unminified and leaves minification
        // to the bundler, so the workload has to minify to keep a payload size
        // that matches what a real React app deploys, like the other suites do.
        // The source map still points back at the unminified React sources, so
        // the bundle stays readable while profiling.
        minify: "esbuild",
        sourcemap: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
            },
        },
    },
});
