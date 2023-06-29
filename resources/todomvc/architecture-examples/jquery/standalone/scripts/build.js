const fs = require("fs").promises;

const rootDirectory = "./";
const sourceDirectory = "./shared/src";
const targetDirectory = "./standalone/dist";

const htmlFile = "index.html";

const filesToMove = ["node_modules/todomvc-common/base.css", "node_modules/todomvc-app-css/index.css", "node_modules/jquery/dist/jquery.min.js", "node_modules/handlebars/dist/handlebars.min.js", "node_modules/director/build/director.min.js"];

const copy = async (src, dest) => {
    await fs.copyFile(src, dest);
};

const build = async () => {
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
    await fs.copyFile(`${rootDirectory}${htmlFile}`, `${targetDirectory}/${htmlFile}`);

    // copy files to move
    for (let i = 0; i < filesToMove.length; i++) {
        const fileName = filesToMove[i].split("/").pop();
        await copy(filesToMove[i], `${targetDirectory}/${fileName}`);
    }

    // read html file
    let html = await fs.readFile(`${targetDirectory}/${htmlFile}`, "utf8");

    // remove base paths from files to move
    for (let i = 0; i < filesToMove.length; i++) {
        const fileName = filesToMove[i].split("/").pop();
        html = html.replace(filesToMove[i], fileName);
    }

    // remove basePath from source directory
    const basePath = `${sourceDirectory.split("/")[1]}/${sourceDirectory.split("/")[2]}/`;
    const re = new RegExp(basePath, "g");
    html = html.replace(re, "");

    // write html files
    await fs.writeFile(`${targetDirectory}/${htmlFile}`, html);

    console.log("done!!");
};

build();
