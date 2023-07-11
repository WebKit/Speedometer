const path = require("path");
const { buildComplex } = require("big-dom-generator/utils/buildComplex");

const SOURCE_DIRECTORY = "node_modules/todomvc-react-redux/dist";
const TITLE = "TodoMVC: React-Redux Complex DOM";
const FILES_TO_MOVE = ["node_modules/big-dom-generator/dist/app.css", "node_modules/big-dom-generator/generated.css", "node_modules/big-dom-generator/dist/logo.png"];

buildComplex(path.resolve(__dirname), path.join("..", SOURCE_DIRECTORY), TITLE, FILES_TO_MOVE);
