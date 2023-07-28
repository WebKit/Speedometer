const fs = require("fs");
const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");

const SOURCE_DIRECTORY = "node_modules/todomvc-backbone/dist/";
const TITLE = "TodoMVC: Backbone Complex DOM";
const FILES_TO_MOVE = ["node_modules/big-dom-generator/dist/big-dom-generator.css", "node_modules/big-dom-generator/dist/logo.png"];

buildComplex(path.resolve(__dirname), path.join("..", SOURCE_DIRECTORY), TITLE, FILES_TO_MOVE);

fs.copyFileSync(path.resolve(__dirname, "..", "node_modules", "big-dom-generator", "utils", "app.css"), path.resolve(__dirname, "..", "dist", "index.css"));
