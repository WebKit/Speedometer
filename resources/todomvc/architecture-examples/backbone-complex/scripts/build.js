const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const path = require("path");
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

const SOURCE_DIRECTORY = "node_modules/backbone/dist/";
const TARGET_DIRECTORY = "./dist";

const COMPLEX_DOM_HTML_FILE = "index.html";
const TODO_HTML_FILE = "index.html";

const FILES_TO_MOVE = ["node_modules/big-dom-generator/dist/app.css", "node_modules/big-dom-generator/generated.css", "node_modules/big-dom-generator/dist/logo.png"];

const CSS_FILES_TO_ADD_LINKS_FOR = ["big-dom-generator.css", "generated.css"];

async function build() {
    // remove dist directory if it exists
    await fs.rm(path.resolve(TARGET_DIRECTORY), { recursive: true, force: true });

    // re-create the directory.
    await fs.mkdir(path.resolve(TARGET_DIRECTORY));

    // copy dist folder from javascript-es6-webpack
    await fs.cp(path.resolve(SOURCE_DIRECTORY), path.resolve(TARGET_DIRECTORY), { recursive: true }, (err) => {
        if (err)
            console.error(err);
    });

    // copy files to move
    for (let i = 0; i < FILES_TO_MOVE.length; i++) {
        // rename app.css to big-dom-generator.css so it's unique.
        const sourcePath = path.resolve(__dirname, "..", FILES_TO_MOVE[i]);
        const fileName = path.basename(FILES_TO_MOVE[i]);
        const targetPath = fileName === "app.css" ? path.join(TARGET_DIRECTORY, "big-dom-generator.css") : path.join(TARGET_DIRECTORY, fileName);
        await fs.copyFile(sourcePath, targetPath);
    }

    // read todo.html file
    let html = await fs.readFile(path.resolve(__dirname, path.join("..", "dist", TODO_HTML_FILE)), "utf8");

    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const head = dom.window.document.querySelector("head");

    doc.documentElement.setAttribute("class", "spectrum spectrum--medium spectrum--light");

    const body = dom.window.document.querySelector("body");
    const htmlToInjectInTodoHolder = body.innerHTML;
    body.innerHTML = getHtmlContent("node_modules/big-dom-generator/dist/index.html");

    const title = head.querySelector("title");
    title.innerHTML = "TodoMVC: Backbone Complex DOM";

    const todoHolder = dom.window.document.createElement("div");
    todoHolder.className = "todoholder";
    todoHolder.innerHTML = htmlToInjectInTodoHolder;

    const todoArea = dom.window.document.querySelector(".todo-area");
    todoArea.appendChild(todoHolder);

    for (const cssFile of CSS_FILES_TO_ADD_LINKS_FOR) {
        const cssLink = doc.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = cssFile;
        head.appendChild(cssLink);
    }

    await fs.writeFile(path.join(TARGET_DIRECTORY, COMPLEX_DOM_HTML_FILE), dom.serialize());

    console.log("done!!");
}

build();
