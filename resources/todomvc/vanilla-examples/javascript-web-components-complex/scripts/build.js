const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");
const fs = require("fs");

const SOURCE_DIRECTORY = "node_modules/todomvc-javascript-web-components/dist/";
const TITLE = "TodoMVC: JavaScript Web Components Complex DOM";
const FILES_TO_MOVE = [
    "node_modules/big-dom-generator/dist/app.css",
    "node_modules/big-dom-generator/generated.css",
    "node_modules/big-dom-generator/javascript-web-components/generated-variables.css",
    "node_modules/big-dom-generator/javascript-web-components/additional-stylesheets.constructable.js",
    "node_modules/big-dom-generator/dist/logo.png",
];
const EXTRA_CSS_TO_LINK = ["generated-variables.css"];

buildComplex(path.resolve(__dirname), path.join("..", SOURCE_DIRECTORY), TITLE, FILES_TO_MOVE, EXTRA_CSS_TO_LINK);

fs.rename(path.join(__dirname, "..", "dist", "additional-stylesheets.constructable.js"), path.join(__dirname, "..", "dist", "utils", "additional-stylesheets.constructable.js"), (err) => {
    if (err)
        console.error(err);
});

// Remove the second half of generated.css
let generatedCss = fs.readFileSync(path.resolve(__dirname, path.join("..", "dist", "generated.css")), "utf8");
generatedCss = generatedCss.split("}\n");
generatedCss = `${generatedCss.slice(0, generatedCss.length / 2).join("}\n")}}\n`;
fs.writeFileSync(path.resolve(__dirname, path.join("..", "dist", "generated.css")), generatedCss);
