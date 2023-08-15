const fs = require("fs");
const { JSDOM } = require("jsdom");
const path = require("path");

function buildComplex(options) {
    const {
        callerDirectory,
        sourceDirectory,
        title,
        filesToMove,
        cssFilePath,
        cssFolder = "", // sometimes the css file we are looking for may be nested in another folder.
        cssFileNamePattern, // The css file name pattern is used to find the css file in the source dist directory.
        extraCssToLink = [],
        scriptsToLink = [],
        targetDirectory = "./dist",
        complexDomHtmlFile = "index.html",
        todoHtmlFile = "index.html",
        cssFilesToAddLinksFor = ["big-dom-generator.css"],
    } = options;

    // remove dist directory if it exists
    fs.rmSync(path.resolve(targetDirectory), { recursive: true, force: true });

    // re-create the directory.
    fs.mkdirSync(path.resolve(targetDirectory));

    // copy dist folder from javascript-es6-webpack
    fs.cpSync(path.join(callerDirectory, sourceDirectory), path.resolve(targetDirectory), { recursive: true });

    // copy files to move
    for (let i = 0; i < filesToMove.length; i++) {
        // rename app.css to big-dom-generator.css so it's unique.
        const sourcePath = path.resolve(callerDirectory, "..", filesToMove[i]);
        const fileName = path.basename(filesToMove[i]);
        const targetPath = path.join(targetDirectory, fileName);
        fs.copyFileSync(sourcePath, targetPath);
    }

    if (cssFilePath) {
        // get the name of the css file that's in the dist, we do this because the name of the css file may change
        const cssFile = fs.readdirSync(path.join(callerDirectory, sourceDirectory, cssFolder), { withFileTypes: true }).find((dirent) => dirent.isFile() && cssFileNamePattern.test(dirent.name))?.name;
        // overwrite the css file in the dist directory with the one from the big-dom-generator module
        // but keep the existing name so we don't need to add a new link
        fs.copyFileSync(cssFilePath, path.resolve(targetDirectory, cssFolder, cssFile));
    }

    // read todo.html file
    let html = fs.readFileSync(path.resolve(callerDirectory, path.join("..", "dist", todoHtmlFile)), "utf8");

    const dom = new JSDOM(html);
    const doc = dom.window.document;
    const head = dom.window.document.querySelector("head");

    doc.documentElement.setAttribute("class", "spectrum spectrum--medium spectrum--light");

    const body = dom.window.document.querySelector("body");
    const htmlToInjectInTodoHolder = body.innerHTML;
    body.innerHTML = getHtmlBodySync("node_modules/big-dom-generator/dist/index.html");

    const titleElement = head.querySelector("title");
    titleElement.innerHTML = title;

    const todoHolder = dom.window.document.createElement("div");
    todoHolder.className = "todoholder";
    todoHolder.innerHTML = htmlToInjectInTodoHolder;

    const todoArea = dom.window.document.querySelector(".todo-area");
    todoArea.appendChild(todoHolder);

    const cssFilesToAddLinksForFinal = [...cssFilesToAddLinksFor, ...extraCssToLink];
    for (const cssFile of cssFilesToAddLinksForFinal) {
        const cssLink = doc.createElement("link");
        cssLink.rel = "stylesheet";
        cssLink.href = cssFile;
        head.appendChild(cssLink);
    }

    for (const script of scriptsToLink) {
        const scriptLink = doc.createElement("script");
        scriptLink.src = script;
        head.appendChild(scriptLink);
    }

    const destinationFilePath = path.join(targetDirectory, complexDomHtmlFile);
    fs.writeFileSync(destinationFilePath, dom.serialize());

    console.log(`The complex code for ${sourceDirectory} has been written to ${destinationFilePath}.`);
}

function getHtmlBodySync(filePath) {
    let htmlContent = fs.readFileSync(filePath, "utf8");
    const bodyStartIndex = htmlContent.indexOf("<body>");
    const bodyEndIndex = htmlContent.lastIndexOf("</body>");

    return htmlContent.substring(bodyStartIndex + 6, bodyEndIndex);
}

module.exports = { buildComplex };
