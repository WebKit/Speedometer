import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        /* legacy({
            targets: ["defaults"],
        }), */
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
