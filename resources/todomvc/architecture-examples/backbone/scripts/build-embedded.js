const fs = require("fs").promises;
const { JSDOM } = require("jsdom");
const path = require("path");

const rootDirectory = "./";
const sourceDirectory = "./src";
const targetDirectory = "./embedded-dist";

const htmlFile = "index.html";
const todoHtmlFile = "index.html";

const filesToMove = [
    "../node_modules/todomvc-common/base.css",
    "../node_modules/todomvc-app-css/index.css",
    "../node_modules/jquery/dist/jquery.min.js",
    "../node_modules/underscore/underscore-min.js",
    "../node_modules/backbone/backbone-min.js",
    "../node_modules/backbone/backbone-min.js.map",
    "../../../big-dom-generator/dist/app.css",
    "../../../big-dom-generator/public/layout.css",
    "../../../big-dom-generator/matchingCss.css",
    "../../../big-dom-generator/nonMatchingCss.css",
    "../../../big-dom-generator/dist/logo.png",
];

async function build() {
    // remove dist directory if it exists
    await fs.rm(targetDirectory, { recursive: true, force: true });

    // re-create the directory.
    await fs.mkdir(targetDirectory);

    // copy src folder
    await fs.cp(sourceDirectory, targetDirectory, { recursive: true }, (err) => {
        if (err)
            console.error(err);
    });

    // copy html file
    await fs.copyFile(`${path.resolve(__dirname, "../../../big-dom-generator/dist/index.html")}`, `${targetDirectory}/${htmlFile}`);

    // copy files to move
    for (let i = 0; i < filesToMove.length; i++) {
        const fileName = filesToMove[i].split("/").pop();
        await fs.copyFile(path.resolve(__dirname, filesToMove[i]), `${targetDirectory}/${fileName}`);
    }

    // read todo.html file
    let todoHtml = await fs.readFile(`${rootDirectory}/${todoHtmlFile}`, "utf8");

    // remove base paths from files to move
    for (let i = 0; i < filesToMove.length; i++) {
        const fileName = filesToMove[i].split("/").pop();
        if (i <= 5)
            todoHtml = todoHtml.replace(filesToMove[i].replace("../", ""), fileName);
        else
            todoHtml = todoHtml.replace(filesToMove[i], fileName);
    }

    // remove basePath from source directory
    const basePath = `${sourceDirectory.split("/")[1]}/`;
    const re = new RegExp(basePath, "g");
    todoHtml = todoHtml.replace(re, "");

    // create a new JSDOM instance with todo.html contents
    const todoDom = new JSDOM(todoHtml);
    const todoHead = todoDom.window.document.querySelector("head");
    const todoBody = todoDom.window.document.querySelector("body");

    // select only the link elements in the todo.html head
    const todoLinks = Array.from(todoHead.querySelectorAll("link"));

    // create a new div element with the class name of todoHolder
    const todoHolder = todoDom.window.document.createElement("div");
    todoHolder.className = "todoholder";

    // insert the todo.html contents into the todoHolder div without the <body> tag
    todoHolder.innerHTML = todoBody.innerHTML;

    // read html file
    let html = await fs.readFile(`${targetDirectory}/${htmlFile}`, "utf8");

    // create a new JSDOM instance with html contents
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // append the contents of the todo.html head to the index.html head
    const head = doc.querySelector("head");
    for (const link of todoLinks)
        head.appendChild(link.cloneNode(true));

    // create a link for app.css and append it to the head
    const appLink = doc.createElement("link");
    appLink.rel = "stylesheet";
    appLink.href = "app.css";
    head.appendChild(appLink);

    // create a link for layout.css and append it to the head
    const layoutLink = doc.createElement("link");
    layoutLink.rel = "stylesheet";
    layoutLink.href = "layout.css";
    head.appendChild(layoutLink);

    // create a link for the matchingCss.css and append it to the head
    const matchingCssGeneratedLink = doc.createElement("link");
    matchingCssGeneratedLink.rel = "stylesheet";
    matchingCssGeneratedLink.href = "matchingCss.css";
    head.appendChild(matchingCssGeneratedLink);

    // create a link for the nonMatchingCss.css and append it to the head
    const nonMatchingCssGeneratedLink = doc.createElement("link");
    nonMatchingCssGeneratedLink.rel = "stylesheet";
    nonMatchingCssGeneratedLink.href = "nonMatchingCss.css";
    head.appendChild(nonMatchingCssGeneratedLink);

    // find the location to insert the todo.html contents
    const todoArea = doc.querySelector(".todo-area");
    todoArea.appendChild(todoHolder);

    // write html files
    await fs.writeFile(`${targetDirectory}/${htmlFile}`, dom.serialize());

    console.log("done!!");
}

build().catch((error) => console.error(error));
