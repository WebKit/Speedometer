const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");
const fs = require("fs");

const SOURCE_DIRECTORY = "node_modules/todomvc-lit/dist/";
const TITLE = "TodoMVC: Lit Complex DOM";
const FILES_TO_MOVE = [
    "node_modules/big-dom-generator/dist/app.css",
    "node_modules/big-dom-generator/generated.css",
    "node_modules/big-dom-generator/javascript-web-components/generated-variables.css",
    "node_modules/big-dom-generator/javascript-web-components/add-extra-css.js",
    "node_modules/big-dom-generator/dist/logo.png",
];
const EXTRA_CSS_TO_LINK = ["generated-variables.css"];
const SCRIPTS_TO_LINK = ["add-extra-css.js"];

buildComplex(path.resolve(__dirname), path.join("..", SOURCE_DIRECTORY), TITLE, FILES_TO_MOVE, EXTRA_CSS_TO_LINK, SCRIPTS_TO_LINK);

// Remove the second half of generated.css
let generatedCss = fs.readFileSync(path.resolve(__dirname, path.join("..", "dist", "generated.css")), "utf8");
generatedCss = generatedCss.split("}\n");
generatedCss = `${generatedCss.slice(0, generatedCss.length / 2).join("}\n")}}\n`;
fs.writeFileSync(path.resolve(__dirname, path.join("..", "dist", "generated.css")), generatedCss);
