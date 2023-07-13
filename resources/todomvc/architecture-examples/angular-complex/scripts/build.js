const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");

const SOURCE_DIRECTORY = "node_modules/todomvc-angular/dist/";
const TITLE = "TodoMVC: Angular Complex DOM";
const FILES_TO_MOVE = ["node_modules/big-dom-generator/dist/app.css", "node_modules/big-dom-generator/angular/generated.css", "node_modules/big-dom-generator/dist/logo.png"];

buildComplex(path.resolve(__dirname), path.join("..", SOURCE_DIRECTORY), TITLE, FILES_TO_MOVE);
