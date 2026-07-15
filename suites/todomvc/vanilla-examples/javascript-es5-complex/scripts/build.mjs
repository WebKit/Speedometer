import { generateResourcesFile } from "../../../../../resources/shared/generate-resources.mjs";
/**
 * Builds the TodoMVC JavaScript Es5 Complex DOM.
 */
import path from "path";
import { buildComplex } from "big-dom-generator/utils/buildComplex.mjs";
const __dirname = import.meta.dirname;

const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", "node_modules", "todomvc-javascript-es5", "dist"),
    title: "TodoMVC: JavaScript Es5 Complex DOM",
    filesToMove: ["node_modules/big-dom-generator/dist/big-dom-with-stacking-context-scrollable.css", "node_modules/big-dom-generator/dist/logo.png"],
    cssFilePath: path.resolve(__dirname, "..", "node_modules", "big-dom-generator", "utils", "app.css"),
    cssFileNamePattern: /^index.*\.css$/,
    standaloneDirectory: path.resolve(__dirname, "..", "..", "javascript-es5"),
    complexDirectory: path.resolve(__dirname, ".."),
    cssFilesToAddLinksFor: ["big-dom-with-stacking-context-scrollable.css"],
};

buildComplex(options);
await generateResourcesFile(path.join(import.meta.dirname, "../dist"));
