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
    "node_modules/jquery/dist/jquery.min.js",
    "node_modules/handlebars/dist/handlebars.min.js",
    "node_modules/director/build/director.min.js",
    "node_modules/big-dom-generator/generated.css",
    "node_modules/big-dom-generator/dist/logo.png",
];

const CSS_FILES_TO_ADD_LINKS_FOR = ["generated.css"];

const build = async () => {
    // remove dist directory if it exists
    await fs.rm(TARGET_DIRECTORY, { recursive: true, force: true });

    // re-create the directory.
    await fs.mkdir(TARGET_DIRECTORY);

    // copy src folder
    await fs.cp(SOURCE_DIRECTORY, TARGET_DIRECTORY, { recursive: true });

    // copy files to move
    for (let i = 0; i < FILES_TO_MOVE.length; i++)
        await fs.copyFile(path.resolve(__dirname, "../../", FILES_TO_MOVE[i]), path.join(TARGET_DIRECTORY, path.basename(FILES_TO_MOVE[i])));

    // read todo.html file
    let html = await fs.readFile(path.join(ROOT_DIRECTORY, TODO_HTML_FILE), "utf8");

    // remove base paths from files to move
    for (let i = 0; i < FILES_TO_MOVE.length; i++)
        html = html.replace(FILES_TO_MOVE[i], path.basename(FILES_TO_MOVE[i]));

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
    body.innerHTML = getHtmlContent("node_modules/big-dom-generator/dist/index.html");

    const title = head.querySelector("title");
    title.innerHTML = "jQuery • TodoMVC Complex DOM";

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

    // combine two css files
    const css1 = await fs.readFile(path.resolve(__dirname, "../../shared/src/app.css"), "utf8");
    const css2 = await fs.readFile(path.resolve(__dirname, "../../node_modules/big-dom-generator/dist/app.css"), "utf8");
    const css = css1 + css2;

    await fs.writeFile(path.join(TARGET_DIRECTORY, "app.css"), css);

    console.log("done!!");
};

build();
