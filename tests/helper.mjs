import { execFileSync, spawn } from "child_process";
import { styleText } from "node:util";
import fs from "fs";

export const GITHUB_ACTIONS_OUTPUT = "GITHUB_ACTIONS_OUTPUT" in process.env || "GITHUB_EVENT_PATH" in process.env;

export function getChangedFiles() {
    // "--diff-filter=ACMR" => ignore deleted files.
    const diffOut = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "@{upstream}"], { encoding: "utf8" });
    const files = diffOut
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && fs.existsSync(f));
    return [...new Set(files)];
}

export function logInfo(...args) {
    const text = args.join(" ");
    console.log(styleText("yellow", text));
}

export function logError(...args) {
    let error;
    if (args.length === 1 && args[0] instanceof Error)
        error = args[0];
    const text = args.join(" ");
    if (GITHUB_ACTIONS_OUTPUT) {
        if (error?.stack)
            console.error(`::error::${error.stack.replace(/\n/g, "%0A")}`);
        else
            console.error(`::error::${text.replace(/\n/g, "%0A")}`);
    } else {
        if (error?.stack)
            console.error(styleText("red", error.stack));
        else
            console.error(styleText("red", text));
    }
}

export function logCommand(...args) {
    const cmd = args.join(" ");
    if (GITHUB_ACTIONS_OUTPUT)
        console.log(`::notice::${styleText("blue", cmd)}`);
    else
        console.log(styleText("blue", cmd));
}

export async function runActionGroup(name, body) {
    if (GITHUB_ACTIONS_OUTPUT) {
        console.log(`::group::${name}`);
    } else {
        logInfo("=".repeat(80));
        logInfo(name);
        logInfo(".".repeat(80));
    }
    try {
        const result = body();
        if (result instanceof Promise)
            return await result;
        return result;
    } finally {
        if (GITHUB_ACTIONS_OUTPUT)
            console.log("::endgroup::");
    }
}

const SPAWN_OPTIONS = Object.freeze({
    stdio: ["inherit", "pipe", "inherit"],
});

async function spawnCaptureStdout(binary, args, options = {}) {
    options = Object.assign({}, SPAWN_OPTIONS, options);
    const childProcess = spawn(binary, args, options);
    childProcess.stdout.pipe(process.stdout);
    return new Promise((resolve, reject) => {
        childProcess.stdoutString = "";
        childProcess.stdio[1].on("data", (data) => {
            childProcess.stdoutString += data.toString();
        });
        childProcess.on("close", (code) => {
            if (code === 0) {
                resolve(childProcess);
            } else {
                const error = new Error(`Command failed with exit code ${code}: ${binary} ${args.join(" ")}`);
                error.process = childProcess;
                error.stdout = childProcess.stdoutString;
                error.exitCode = code;
                reject(error);
            }
        });
        childProcess.on("error", reject);
    });
}

export async function sh(binary, ...args) {
    let options = {};
    if (args.length > 0 && typeof args[args.length - 1] === "object" && !Array.isArray(args[args.length - 1]))
        options = args.pop();

    const cmd = `${binary} ${args.join(" ")}`;
    if (GITHUB_ACTIONS_OUTPUT)
        console.log(`::group::${binary}`);
    logCommand(cmd);
    try {
        return await spawnCaptureStdout(binary, args, options);
    } catch (e) {
        if (e.stdoutString)
            logError(e.stdoutString);
        throw e;
    } finally {
        if (GITHUB_ACTIONS_OUTPUT)
            console.log("::endgroup::");
    }
}
