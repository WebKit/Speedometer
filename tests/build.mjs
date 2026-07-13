import { parseArgs } from "util";
import fs from "fs";
import path from "path";
import { DefaultSuites } from "../suites/default-suites.mjs";
import { ExperimentalSuites } from "../suites-experimental/suites.mjs";
import { getChangedFiles, runActionGroup, sh } from "./helper.mjs";

const EXCLUDES = new Set([
    // TODO: Re-enable once packages are udpated and node 24 is supported
    "suites/todomvc/architecture-examples/vue",
    "suites/todomvc/architecture-examples/vue-complex",
    "suites/newssite/news-nuxt",
]);

function findWorkloadForUrl(suiteUrl) {
    let currentDir = path.dirname(suiteUrl);
    while (currentDir !== "." && currentDir !== "/") {
        const pkgPath = path.join(currentDir, "package.json");
        if (fs.existsSync(pkgPath)) {
            const content = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
            if (content.scripts && content.scripts.build)
                return currentDir;
        }
        currentDir = path.dirname(currentDir);
    }
    return null;
}

function getWorkloads() {
    const workloads = new Set();
    const suites = [...DefaultSuites, ...ExperimentalSuites];
    for (const suite of suites) {
        if (suite.url) {
            const workload = findWorkloadForUrl(suite.url);
            if (workload && !EXCLUDES.has(workload))
                workloads.add(workload);
        }
    }
    return Array.from(workloads);
}

async function buildWorkloads(workloads) {
    if (workloads.length === 0) {
        console.log("No workloads to build.");
        return;
    }
    console.log(`Building ${workloads.length} workload(s)...`);
    const failedWorkloads = [];
    const successfulWorkloads = [];

    for (const workload of workloads) {
        try {
            await runActionGroup(`Building ${workload}...`, async () => {
                await sh("npm", "ci", { cwd: workload });
                await sh("npm", "run", "build", { cwd: workload });
            });
            successfulWorkloads.push(workload);
        } catch (e) {
            console.error(`Failed to build workload: ${workload}`);
            failedWorkloads.push(workload);
        }
    }

    console.log("\n================================================================================");
    console.log(`Build Summary: ${successfulWorkloads.length} succeeded, ${failedWorkloads.length} failed.`);
    console.log("================================================================================\n");

    if (failedWorkloads.length > 0) {
        console.error("Failed Workloads:");
        for (const workload of failedWorkloads)
            console.error(` - ${workload}`);

        process.exit(1);
    }
}

let values;
try {
    ({ values } = parseArgs({
        options: {
            all: { type: "boolean" },
            check: { type: "boolean" },
            help: { type: "boolean", short: "h" },
        },
        strict: true,
    }));
} catch (err) {
    console.error(err.message);
    console.error("Run 'node tests/build.mjs --help' for usage.");
    process.exit(1);
}

if (values.help) {
    console.log(`Usage: node tests/build.mjs [options]

Options:
  --all          Build all workloads instead of just changed workloads
  --check        Check that no files were modified after building
  -h, --help     Show this help message`);
    process.exit(0);
}

async function checkGitStatus() {
    if (!values.check)
        return;
    try {
        await runActionGroup("Checking for uncommitted build changes...", async () => {
            const status = await sh("git", "status", "--porcelain", "suites", "suites-experimental");
            if (status.stdoutString.trim() !== "") {
                console.error(status.stdoutString);
                throw new Error("Git tree is dirty");
            }
        });
        console.log("Git tree is clean. All build files match the source.");
    } catch (e) {
        console.error("Build files have changed or new files were created. Please commit them.");
        process.exit(1);
    }
}

const allWorkloads = getWorkloads();

if (values.all) {
    await buildWorkloads(allWorkloads);
    await checkGitStatus();
    process.exit(0);
}

let changedFiles = [];
try {
    changedFiles = getChangedFiles();
} catch (e) {
    console.error("Failed to get changed files from git. Falling back to building all workloads.");
    await buildWorkloads(allWorkloads);
    await checkGitStatus();
    process.exit(0);
}

// Map changed files to workloads
const changedWorkloads = new Set();
for (const file of changedFiles) {
    for (const workload of allWorkloads) {
        if (file.startsWith(workload + path.sep) || file === workload)
            changedWorkloads.add(workload);
    }

}

if (changedWorkloads.size === 0) {
    console.log("No workloads changed compared to upstream.");
    await checkGitStatus();
    process.exit(0);
}

await buildWorkloads([...changedWorkloads]);
await checkGitStatus();
