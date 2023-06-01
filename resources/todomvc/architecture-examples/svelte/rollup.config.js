import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import filesize from "rollup-plugin-filesize";
import copy from "rollup-plugin-copy";
import css from "rollup-plugin-import-css";

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;
const embedded = process.env.EMBEDDED;

const htmlToInjectForEmbedded = `
<div class="todo-area">
<div class="todoholder">
<section class="todoapp"></section>
<footer class="info">
    <p>Click on input field to write your todo.</p>
    <p>At least two characters are needed to be a valid entry.</p>
    <p>Press 'enter' to add the todo.</p>
    <p>Double-click to edit a todo</p>
</footer>
</div>
</div>
</div>
<script src="app.js"></script>
`;

export default {
    input: embedded ? "src/embedded.js" : "src/index.js",
    output: {
        file: embedded ? "embedded-dist/app.js" : "dist/app.js",
        format: "iife",
        sourcemap: true,
        name: "app",
    },
    plugins: [
        css({
            minify: true,
        }),
        svelte({
            include: "src/**/*.svelte",
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
                { src: "public/index.html", dest: "dist/" },
                {
                    src: "../../big-dom-generator/dist/index.html",
                    dest: "embedded-dist/",
                    transform: (contents) => {
                        // Add a link to the app.css file in the head of the HTML
                        contents = contents.toString().replace("</head>", "<link rel=\"stylesheet\" href=\"app.css\" />\n</head>");
                        // Replace the todo-area div with the HTML to inject for embedded mode
                        return contents.toString().replace("<div class=\"todo-area\">", `${htmlToInjectForEmbedded}`);
                    },
                },
                { src: "../../big-dom-generator/dist/logo.png", dest: "embedded-dist/" }
            ],
        }),
    ],
};
