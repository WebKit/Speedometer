import { generateResourcesFile } from "../../../../../resources/shared/generate-resources.mjs";
/**
 * Build the TodoMVC Preact Complex DOM example.
 */
import path from "path";
import { buildComplex } from "big-dom-generator/utils/buildComplex.mjs";
const __dirname = import.meta.dirname;

const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", "node_modules", "todomvc-preact", "dist"),
    title: "TodoMVC: Preact Complex DOM",
    filesToMove: ["node_modules/big-dom-generator/dist/big-dom-with-stacking-context-scrollable.css", "node_modules/big-dom-generator/dist/logo.png", "node_modules/big-dom-generator/utils/app.css"],
    standaloneDirectory: path.resolve(__dirname, "..", "..", "preact"),
    complexDirectory: path.resolve(__dirname, ".."),
    cssFilesToAddLinksFor: ["big-dom-with-stacking-context-scrollable.css"],
};

buildComplex(options);
await generateResourcesFile(path.join(import.meta.dirname, "../dist"));
