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
    input: "standalone/src/index.js",
    output: [
        {
            file: "standalone/dist/app.js",
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
        commonjs(),
        copy({
            targets: [
                {
                    src: "shared/public/index.html",
                    dest: "standalone/dist/",
                    transform: (contents) => {
                        contents = contents.toString();
                        const body = getHtmlContent("shared/public/partial.html");
                        contents = contents.replace("<body>", `<body>${body}`);
                        return contents;
                    },
                },
            ],
        }),
        production && terser(),
    ],
};
