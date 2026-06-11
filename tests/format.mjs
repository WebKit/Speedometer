import { execFileSync } from "child_process";
import fs from "fs";

function formatAll() {
    console.log("Formatting all files...");
    execFileSync("npm", ["run", "pretty:fix"], { stdio: "inherit" });
    execFileSync("npm", ["run", "lint:fix"], { stdio: "inherit" });
}

function runInBatches(command, args, files, batchSize = 100) {
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        execFileSync("npx", [command, ...args, ...batch], { stdio: "inherit" });
    }
}

function runPrettier(files) {
    try {
        console.log(`Running prettier on ${files.length} file(s)`);
        runInBatches("prettier", ["--write", "--ignore-unknown"], files);
    } catch (e) {
        console.error("Prettier formatting failed");
        process.exit(1);
    }
}

function runEslint(files) {
    const jsTsFiles = files.filter((f) => /\.(js|mjs|jsx|ts|tsx)$/.test(f));
    if (jsTsFiles.length === 0)
        return;
    try {
        console.log(`Running eslint on ${jsTsFiles.length} file(s)`);
        runInBatches("eslint", ["--fix"], jsTsFiles);
    } catch (e) {
        console.error("ESLint formatting failed");
        process.exit(1);
    }
}

function getChangedFiles() {
    const diffOut = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "@{upstream}"], { encoding: "utf8" });
    const files = diffOut
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && fs.existsSync(f));
    return [...new Set(files)];
}

const isAll = process.argv.includes("--all");

if (isAll) {
    formatAll();
    process.exit(0);
}

let changedFiles = [];
try {
    changedFiles = getChangedFiles();
} catch (e) {
    console.error("Failed to get changed files from git. Falling back to formatting all files.");
    formatAll();
    process.exit(0);
}

if (changedFiles.length === 0) {
    console.log("No files changed compared to upstream.");
    process.exit(0);
}
console.log(`Formatting ${changedFiles.length} changed files compared to upstream`);

runPrettier(changedFiles);
runEslint(changedFiles);
