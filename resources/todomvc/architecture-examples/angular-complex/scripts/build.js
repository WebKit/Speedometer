const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");

const SOURCE_DIRECTORY = "node_modules/todomvc-angular/dist/";
const TITLE = "TodoMVC: Angular Complex DOM";
const FILES_TO_MOVE = ["node_modules/big-dom-generator/dist/big-dom-generator.css", "node_modules/big-dom-generator/dist/logo.png"];

const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", SOURCE_DIRECTORY),
    title: TITLE,
    filesToMove: FILES_TO_MOVE,
    cssFilePath: path.resolve(__dirname, "..", "node_modules", "big-dom-generator", "utils", "app.css"),
    cssFileNamePattern: /^styles.*\.css$/,
};

buildComplex(options);
