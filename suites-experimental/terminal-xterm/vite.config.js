import { resolve } from "path";
import { defineConfig } from "vite";
import fs from "fs";

/**
 * Rollup plugin to ingest source maps from node_modules dependencies (@xterm).
 * Because @xterm npm packages ship pre-compiled code with mangled identifiers
 * (e.g. class g, class l), this plugin ingests their .map files so generated
 * bundles and browser profiling traces (Chrome DevTools / Firefox Profiler)
 * map 100% cleanly back to original TypeScript symbols (CanvasRenderer, TextRenderLayer, etc.).
 */
function nodeModulesSourcemaps() {
    return {
        name: "node-modules-sourcemaps",
        load(id) {
            if (id.endsWith(".js") && id.includes("node_modules")) {
                try {
                    const code = fs.readFileSync(id, "utf-8");
                    const mapPath = `${id }.map`;
                    if (fs.existsSync(mapPath)) {
                        const map = JSON.parse(fs.readFileSync(mapPath, "utf-8"));
                        return { code, map };
                    }
                } catch (e) {
                    // Ignore errors reading source maps
                }
            }
            return null;
        },
    };
}

function renameIndexHtml() { return { name: 'rename-index-html', closeBundle() { const src = resolve(__dirname, 'dist/index.source.html'); const dest = resolve(__dirname, 'dist/index.html'); if (fs.existsSync(src)) fs.renameSync(src, dest); } }; }

export default defineConfig(({ mode }) => {
    const isDev = mode === "development";
    return {
        base: "./",
        plugins: [nodeModulesSourcemaps(), renameIndexHtml()],
        build: {
            outDir: "dist",
            modulePreload: { polyfill: false },
            minify: false,
            sourcemap: isDev ? "inline" : true,
            rollupOptions: {
                input: {
                    main: resolve(__dirname, "index.source.html"),
                },
                output: isDev
                    ? {
                        entryFileNames: "assets/[name].js",
                        chunkFileNames: "assets/[name].js",
                        assetFileNames: "assets/[name].[ext]",
                    }
                    : undefined,
            },
        },
    };
});
