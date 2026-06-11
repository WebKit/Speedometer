/**
 * Builds the TodoMVC Vue Complex DOM.
 */
import path from "path";
import { buildComplex } from "big-dom-generator/utils/buildComplex.js";
import { fileURLToPath as _fileURLToPath } from "url";
import { dirname as _dirname } from "path";
const __filename = _fileURLToPath(import.meta.url);
const __dirname = _dirname(__filename);


const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", "node_modules", "todomvc-vue", "dist"),
    title: "TodoMVC: Vue Complex DOM",
    filesToMove: ["node_modules/big-dom-generator/dist/big-dom.css", "node_modules/big-dom-generator/dist/logo.png"],
    cssFilePath: path.resolve(__dirname, "..", "node_modules", "big-dom-generator", "utils", "app.css"),
    cssFolder: "css",
    cssFileNamePattern: /^app.*\.css$/,
    standaloneDirectory: path.resolve(__dirname, "..", "..", "vue"),
    complexDirectory: path.resolve(__dirname, ".."),
};

buildComplex(options);
