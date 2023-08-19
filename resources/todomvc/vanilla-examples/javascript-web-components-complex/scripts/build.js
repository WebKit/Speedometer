const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");

const SOURCE_DIRECTORY = "node_modules/todomvc-javascript-web-components/dist/";
const TITLE = "TodoMVC: JavaScript Web Components Complex DOM";
const FILES_TO_MOVE = [
    "app.css",
    "node_modules/big-dom-generator/dist/big-dom-generator.css",
    "node_modules/big-dom-generator/dist/logo.png",
    "node_modules/big-dom-generator/utils/default-variables.css",
    "node_modules/big-dom-generator/utils/todo-list-extra-css.constructable.js",
    "node_modules/big-dom-generator/utils/javascript-web-components/todo-item-extra-css.constructable.js",
];
const EXTRA_CSS_TO_LINK = ["app.css", "default-variables.css"];
const SCRIPTS_TO_LINK = ["todo-item-extra-css.constructable.js", "todo-list-extra-css.constructable.js"];

const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", SOURCE_DIRECTORY),
    title: TITLE,
    filesToMove: FILES_TO_MOVE,
    extraCssToLink: EXTRA_CSS_TO_LINK,
    scriptsToLink: SCRIPTS_TO_LINK,
};

buildComplex(options);
