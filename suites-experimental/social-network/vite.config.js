import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

// The suite entry declares a resources.txt, which tests/unittests/suites.mjs
// validates, so emit it once the bundle is on disk.
function resourcesManifest() {
    return {
        name: "social-network-resources-manifest",
        closeBundle() {
            generateResourcesFile(resolve(__dirname, "dist"));
        },
    };
}

export default defineConfig({
    // Since this will be loaded from the project root.
    base: "./",
    // Every element goes through the interaction interceptor's JSX runtime.
    plugins: [react({ jsxImportSource: "social-network-jsx" }), resourcesManifest()],
    resolve: {
        alias: {
            "social-network-jsx/jsx-runtime": resolve(__dirname, "src/analytics/jsx-runtime.js"),
            "social-network-jsx/jsx-dev-runtime": resolve(__dirname, "src/analytics/jsx-runtime.js"),
        },
    },
    build: {
        modulePreload: { polyfill: false },
        // React 19 leaves minification to the bundler, so minify to ship a payload
        // the size a real React app deploys.
        minify: "esbuild",
        sourcemap: true,
        rollupOptions: {
            input: {
                index: resolve(__dirname, "index.html"),
            },
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
