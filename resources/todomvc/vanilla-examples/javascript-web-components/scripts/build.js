const fs = require("fs").promises;
const { dirname } = require("path");

/**
 * createDirectory
 *
 * Removes and recreates a directory.
 *
 * @param {string} directory Directory name.
 */
async function createDirectory(directory) {
    await fs.rm(directory, { recursive: true, force: true });
    await fs.mkdir(directory);
}

/**
 * copyDirectory
 *
 * Copies a source folder to a destination folder.
 *
 * @param {string} src Source directory.
 * @param {string} dest Destination directory.
 */
async function copyDirectory(src, dest) {
    await fs.cp(src, dest, { recursive: true }, (err) => {
        if (err)
            console.error(err);
    });
}

/**
 * copyFile
 *
 * Copies a file from a source to a destination.
 *
 * @param {string} src Source file.
 * @param {string} dest Destination file.
 */
async function copyFile(src, dest) {
    await fs.mkdir(dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
}

/**
 * copyFiles
 *
 * Copies multiple files from a source to a destination.
 *
 * @param {string[]} files Array of files to copy.
 */
async function copyFiles(files) {
    for (const file of files)
        await copyFile(file.src, file.dest);
}

/**
 * updateImportsInFile
 *
 * Reads a file and replaces a source path with a destination path.
 *
 * @param {Object} config - Config to update imports
 * @param {string} config.src - The source path.
 * @param {string} config.dest - The destination path.
 * @param {string} config.file - File to read from.
 */
async function updateImportsInFile({ file, src, dest }) {
    let contents = await fs.readFile(file, "utf8");
    contents = contents.replaceAll(src, dest);
    await fs.writeFile(file, contents);
}

/**
 * updateImports
 *
 * Updates imports in multiple files.
 *
 * @param {Object} config - Config to update imports
 * @param {string} config.src - The source path.
 * @param {string} config.dest - The destination path.
 * @param {string} config.file - Files to read from.
 */
async function updateImports({ files, src, dest }) {
    for (const file of files)
        await updateImportsInFile({ file, src, dest });
}

const filesToMove = [
    { src: "index.html", dest: "./dist/index.html" },
    { src: "node_modules/todomvc-css/dist/global.css", dest: "./dist/styles/global.css" },
    { src: "node_modules/todomvc-css/dist/header.css", dest: "./dist/styles/header.css" },
    { src: "node_modules/todomvc-css/dist/footer.css", dest: "./dist/styles/footer.css" },
    { src: "node_modules/todomvc-css/dist/global.constructable.js", dest: "./dist/styles/global.constructable.js" },
    { src: "node_modules/todomvc-css/dist/app.constructable.js", dest: "./dist/styles/app.constructable.js" },
    { src: "node_modules/todomvc-css/dist/topbar.constructable.js", dest: "./dist/styles/topbar.constructable.js" },
    { src: "node_modules/todomvc-css/dist/main.constructable.js", dest: "./dist/styles/main.constructable.js" },
    { src: "node_modules/todomvc-css/dist/bottombar.constructable.js", dest: "./dist/styles/bottombar.constructable.js" },
    { src: "node_modules/todomvc-css/dist/todo-list.constructable.js", dest: "./dist/styles/todo-list.constructable.js" },
    { src: "node_modules/todomvc-css/dist/todo-item.constructable.js", dest: "./dist/styles/todo-item.constructable.js" },
    { src: "node_modules/speedometer-utils/test-invoker.mjs", dest: "./dist/src/speedometer-utils/test-invoker.mjs" },
    { src: "node_modules/speedometer-utils/test-runner.mjs", dest: "./dist/src/speedometer-utils/test-runner.mjs" },
    { src: "node_modules/speedometer-utils/params.mjs", dest: "./dist/src/speedometer-utils/params.mjs" },
    { src: "node_modules/speedometer-utils/benchmark.mjs", dest: "./dist/src/speedometer-utils/benchmark.mjs" },
    { src: "node_modules/speedometer-utils/helpers.mjs", dest: "./dist/src/speedometer-utils//helpers.mjs" },
    { src: "node_modules/speedometer-utils/translations.mjs", dest: "./dist/src/speedometer-utils/translations.mjs" },
    { src: "node_modules/speedometer-utils/todomvc-utils.mjs", dest: "./dist/src/speedometer-utils/todomvc-utils.mjs" },
];

const importsToRename = [
    {
        src: "node_modules/todomvc-css/dist/",
        dest: "styles/",
        files: ["./dist/index.html"],
    },
    {
        src: "../../../node_modules/todomvc-css/dist/",
        dest: "../../../styles/",
        files: [
            "./dist/src/components/todo-app/todo-app.component.js",
            "./dist/src/components/todo-bottombar/todo-bottombar.component.js",
            "./dist/src/components/todo-item/todo-item.component.js",
            "./dist/src/components/todo-list/todo-list.component.js",
            "./dist/src/components/todo-topbar/todo-topbar.component.js",
        ],
    },
    {
        src: "/src/",
        dest: "./",
        files: ["./dist/src/index.mjs"],
    },
    {
        src: "/node_modules/speedometer-utils/",
        dest: "./speedometer-utils/",
        files: ["./dist/src/index.mjs", "./dist/src/workload-test.mjs"],
    },
];

const build = async () => {
    // create dist folder
    await createDirectory("./dist");

    // copy src folder
    await copyDirectory("./src", "./dist/src");

    // copy files to Move
    await copyFiles(filesToMove);

    // rename imports files
    for (const entry of importsToRename) {
        const { files, src, dest } = entry;
        await updateImports({ files, src, dest });
    }

    console.log("Done with building!");
};

build();
