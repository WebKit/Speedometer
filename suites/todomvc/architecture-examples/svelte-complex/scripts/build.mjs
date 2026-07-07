import { generateResourcesFile } from "../../../../shared/generate-resources.mjs";
/**
 * Builds the TodoMVC Svelte Complex DOM.
 */
import path from "path";
import { buildComplex } from "big-dom-generator/utils/buildComplex.mjs";
const __dirname = import.meta.dirname;

const options = {
    callerDirectory: path.resolve(__dirname),
    sourceDirectory: path.join("..", "node_modules", "todomvc-svelte", "dist"),
    title: "TodoMVC: Svelte Complex DOM",
    filesToMove: ["node_modules/big-dom-generator/dist/big-dom-with-stacking-context-scrollable.css", "node_modules/big-dom-generator/dist/logo.png", "node_modules/big-dom-generator/utils/app.css"],
    standaloneDirectory: path.resolve(__dirname, "..", "..", "svelte"),
    complexDirectory: path.resolve(__dirname, ".."),
    cssFilesToAddLinksFor: ["big-dom-with-stacking-context-scrollable.css"],
};

buildComplex(options);
await generateResourcesFile(path.join(import.meta.dirname, "../dist"));
