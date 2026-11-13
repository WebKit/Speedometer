import { defineConfig } from "vite";
import { octane } from "octane/compiler/vite";
import { chatStreamBuild } from "../speedometer-vite.mjs";

export default defineConfig({
    ...chatStreamBuild("octane", [octane()]),
    optimizeDeps: {
        exclude: ["octane", "octane/compiler"],
    },
});
