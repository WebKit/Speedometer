import { resolve } from "path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

// The suite entry declares a resources.txt, which tests/unittests/suites.mjs
// validates, so emit it once the bundle is on disk.
function resourcesManifest() {
    return {
        name: "chat-room-svelte-resources-manifest",
        closeBundle() {
            generateResourcesFile(resolve(import.meta.dirname, "dist"));
        },
    };
}

export default defineConfig({
    // Since this will be loaded from the project root.
    base: "./",
    plugins: [svelte(), resourcesManifest()],
    build: {
        modulePreload: { polyfill: false },
        sourcemap: true,
        rollupOptions: {
            input: {
                index: resolve(import.meta.dirname, "index.html"),
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
