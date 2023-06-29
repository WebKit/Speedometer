import terser from "@rollup/plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import css from "rollup-plugin-import-css";
import copy from "rollup-plugin-copy";
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
    input: "complex/src/index.js",
    output: [
        {
            file: "complex/dist/app.js",
            format: "iife",
            sourcemap: true,
        },
    ],
    plugins: [
        css({
            minify: true,
        }),
        babel({
            babelrc: false,
            presets: [
                ["@babel/preset-env", { targets: "defaults" }],
                ["@babel/preset-react", { runtime: "automatic" }],
            ],
            plugins: [
                [
                    "@babel/plugin-transform-react-jsx",
                    {
                        pragma: "h",
                        pragmaFrag: "Fragment",
                    },
                ],
            ],
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        copy({
            targets: [
                { src: "node_modules/big-dom-generator/dist/logo.png", dest: "complex/dist/" },
                {
                    src: "shared/public/index.html",
                    dest: "complex/dist/",
                    transform: (contents) => {
                        const title = "TodoMVC: Preact Complex DOM";
                        contents = contents.toString();
                        const body = getHtmlContent("node_modules/big-dom-generator/dist/index.html", true);
                        const htmlToInjectForComplex = getHtmlContent("shared/public/partial.html");
                        contents = contents.replace("<html", '<html class="spectrum spectrum--medium spectrum--light"');
                        contents = contents.replace("<title>TodoMVC: Preact</title>", `<title>${title}</title>`);
                        contents = contents.replace("<body>", `<body>${body}`);
                        contents = contents.replace('<div class="todo-area">', `<div class="todo-area"><div class="todoholder">${htmlToInjectForComplex}</div>`);
                        return contents;
                    },
                },
            ],
        }),
        commonjs(),
        production && terser(),
    ],
};
