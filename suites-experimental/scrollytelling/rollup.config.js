import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import fs from "fs";
import process from "process";

const DEV_OUTPUT_DIR = "build-dev";
const PROD_OUTPUT_DIR = "dist";

const outputDir = process.env.ROLLUP_WATCH ? DEV_OUTPUT_DIR : PROD_OUTPUT_DIR;

if (!process.env.ROLLUP_WATCH && fs.existsSync(outputDir)) {
    // Clean previous build output
    fs.rmSync(outputDir, { recursive: true, force: true });
}

export default {
    input: "src/main.js",
    output: [
        {
            file: `${outputDir}/app.js`,
            format: "es",
            name: "app",
            plugins: process.env.ROLLUP_WATCH ? [] : [terser()],
        },
    ],
    plugins: [
        resolve(),
        copy({
            targets: [
                { src: "index.html", dest: `${outputDir}/` },
                { src: "src/styles.css", dest: `${outputDir}/` },
                { src: "public/*", dest: `${outputDir}/public/`, noErrorOnMissing: true },
            ],
        }),
    ],
};
