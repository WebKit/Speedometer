import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { generateResourcesFile } from "../../resources/shared/generate-resources.mjs";

// SvelteKit writes dist/ from the adapter, after every Vite hook, so the
// post-processing has to run from the adapter too.
function speedometerAdapter(options) {
    const staticAdapter = adapter(options);
    return {
        ...staticAdapter,
        async adapt(builder) {
            await staticAdapter.adapt(builder);
            const dist = resolve(import.meta.dirname, options.pages);

            // SPA fallback pages always reference the bundle root-relatively,
            // but the harness serves the workload from a subdirectory.
            const indexPath = resolve(dist, options.fallback);
            const html = readFileSync(indexPath, "utf8").replaceAll('"/_app/', '"./_app/');
            writeFileSync(indexPath, html);

            // The suite entry declares a resources.txt, which
            // tests/unittests/suites.mjs validates.
            generateResourcesFile(dist);
        },
    };
}

export default defineConfig({
    plugins: [
        sveltekit({
            compilerOptions: {
                runes: true,
                cssHash: ({ hash, css }) => `qb-${hash(css)}`,
            },
            adapter: speedometerAdapter({
                pages: "dist",
                assets: "dist",
                fallback: "index.html",
            }),
            router: {
                type: "hash",
            },
            output: {
                bundleStrategy: "single",
            },
            version: {
                name: "speedometer",
                pollInterval: 0,
            },
        }),
    ],
    build: {
        sourcemap: true,
    },
});
