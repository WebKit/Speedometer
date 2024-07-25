import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    base: "./", // Since this will be loaded from the project root
    plugins: [react()],
    build: {
        modulePreload: { polyfill: false },
        minify: false,
        sourcemap: true,
    },
});
