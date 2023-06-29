const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const path = require("path");
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

const ROOT_DIRECTORY = "./";
const SOURCE_DIRECTORY = "./shared/src";
const TARGET_DIRECTORY = "./complex/dist";

const COMPLEX_DOM_HTML_FILE = "index.html";
const TODO_HTML_FILE = "index.html";

const FILES_TO_MOVE = [
    "node_modules/todomvc-common/base.css",
    "node_modules/todomvc-app-css/index.css",
    "node_modules/big-dom-generator/dist/app.css",
    "node_modules/big-dom-generator/generated.css",
    "node_modules/big-dom-generator/public/layout.css",
    "node_modules/big-dom-generator/dist/logo.png",
];

const CSS_FILES_TO_ADD_LINKS_FOR = ["app.css", "generated.css", "layout.css"];

async function build() {
    // remove dist directory if it exists
    await fs.rm(path.resolve(TARGET_DIRECTORY), { recursive: true, force: true });

    // re-create the directory.
    await fs.mkdir(path.resolve(TARGET_DIRECTORY));

    // copy src folder
    await fs.cp(path.resolve(SOURCE_DIRECTORY), path.resolve(TARGET_DIRECTORY), { recursive: true }, (err) => {
        if (err)
            console.error(err);
    });

    // copy html file
    await fs.copyFile(path.resolve(__dirname, "../../", "node_modules/big-dom-generator/dist/index.html"), path.resolve(TARGET_DIRECTORY, COMPLEX_DOM_HTML_FILE));

    // copy files to move
    for (let i = 0; i < FILES_TO_MOVE.length; i++) {
        const fileName = FILES_TO_MOVE[i].split("/").pop();
        await fs.copyFile(path.resolve(__dirname, "../../", FILES_TO_MOVE[i]), path.resolve(TARGET_DIRECTORY, fileName));
    }

    // read todo.html file
    let html = await fs.readFile(path.join(ROOT_DIRECTORY, TODO_HTML_FILE), "utf8");

    // remove base paths from files to move
    for (let i = 0; i < FILES_TO_MOVE.length; i++) {
        const fileName = FILES_TO_MOVE[i].split("/").pop();
        html = html.replace(FILES_TO_MOVE[i], fileName);
    }

    // remove basePath from source directory
    const sourceDirectoryPathParts = SOURCE_DIRECTORY.split("/");
    const basePath = `${sourceDirectoryPathParts[1]}/${sourceDirectoryPathParts[2]}/`;
    const re = new RegExp(basePath, "g");
    html = html.replace(re, "");

    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const head = dom.window.document.querySelector("head");

    doc.documentElement.setAttribute("class", "spectrum spectrum--medium spectrum--light");

    const body = dom.window.document.querySelector("body");
    const htmlToInjectInTodoHolder = body.innerHTML;
    body.innerHTML = getHtmlContent("node_modules/big-dom-generator/dist/index.html", true);

    const title = head.querySelector("title");
    title.innerHTML = "TodoMVC: JavaScript Es5 Complex DOM";

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