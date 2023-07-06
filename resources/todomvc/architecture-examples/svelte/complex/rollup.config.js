import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-import-css";
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: "complex/src/index.js",
    output: {
        file: "complex/dist/app.js",
        format: "iife",
        sourcemap: true,
        name: "app",
    },
    plugins: [
        css({
            minify: true,
        }),
        svelte({
            include: "shared/src/**/*.svelte",
        }),
        resolve({
            browser: true,
            exportConditions: ["svelte"],
            extensions: [".svelte"],
        }),
        production && terser(),
        production && filesize(),
        copy({
            targets: [
                {
                    src: "shared/public/index.html",
                    dest: "complex/dist/",
                    transform: (contents) => {
                        const title = "TodoMVC: Svlete Complex DOM";
                        contents = contents.toString();
                        const body = getHtmlContent("node_modules/big-dom-generator/dist/index.html");
                        const htmlToInjectForComplex = getHtmlContent("shared/public/partial.html");
                        contents = contents.replace("<html", '<html class="spectrum spectrum--medium spectrum--light"');
                        contents = contents.replace("<title>TodoMVC: Svelte</title>", `<title>${title}</title>`);
                        contents = contents.replace("<body>", `<body>${body}`);
                        contents = contents.replace('<div class="todo-area">', `<div class="todo-area"><div class="todoholder">${htmlToInjectForComplex}</div>`);
                        return contents;
                    },
                },
                { src: "node_modules/big-dom-generator/dist/logo.png", dest: "complex/dist/" },
            ],
        }),
    ],
};
