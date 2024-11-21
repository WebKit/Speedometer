import { defineConfig } from "vite";
export default defineConfig({
    base: "./", // Since this will be loaded from the project root
    build: {
        modulePreload: { polyfill: false },
        minify: false,
        sourcemap: true,
    },
});
