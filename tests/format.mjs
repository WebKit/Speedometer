import { execFileSync } from "child_process";
import { parseArgs } from "util";
import fs from "fs";

function formatAll() {
    console.log("Formatting all files...");
    execFileSync("npm", ["run", "pretty:fix"], { stdio: "inherit" });
    execFileSync("npm", ["run", "lint:fix"], { stdio: "inherit" });
}

// Chunk files into batches to avoid "Argument list too long" errors on large changelists.
function execFileSyncInBatches(command, args, files, batchSize = 100) {
    for (let i = 0; i < files.length; i += batchSize) {
        const batch = files.slice(i, i + batchSize);
        execFileSync("npx", [command, ...args, ...batch], { stdio: "inherit" });
    }
}

function runPrettier(files) {
    try {
        console.log(`Running prettier on ${files.length} file(s)`);
        execFileSyncInBatches("prettier", ["--write", "--ignore-unknown"], files);
    } catch (e) {
        console.error("Prettier formatting failed");
        process.exit(1);
    }
}

function runEslint(files) {
    const jsTsFiles = files.filter((f) => /\.(js|mjs|jsx|ts|tsx)$/.test(f));
    if (jsTsFiles.length === 0) return;
    try {
        console.log(`Running eslint on ${jsTsFiles.length} file(s)`);
        execFileSyncInBatches("eslint", ["--fix"], jsTsFiles);
    } catch (e) {
        console.error("ESLint formatting failed");
        process.exit(1);
    }
}

function getChangedFiles() {
    // "--diff-filter=ACMR" => ignore deleted files.
    const diffOut = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "@{upstream}"], { encoding: "utf8" });
    const files = diffOut
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && fs.existsSync(f));
    return [...new Set(files)];
}

let values;
try {
    ({ values } = parseArgs({
        options: {
            all: { type: "boolean" },
            help: { type: "boolean", short: "h" },
        },
        strict: true,
    }));
} catch (err) {
    console.error(err.message);
    console.error("Run 'node tests/format.mjs --help' for usage.");
    process.exit(1);
}

if (values.help) {
    console.log(`Usage: node tests/format.mjs [options]

Options:
  --all          Format all files across the repository instead of just changed files
  -h, --help     Show this help message`);
    process.exit(0);
}

if (values.all) {
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
