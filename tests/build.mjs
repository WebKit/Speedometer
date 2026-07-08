import { execFileSync } from "child_process";
import { parseArgs } from "util";
import fs from "fs";
import path from "path";
import { getChangedFiles } from "./helper.mjs";

// Find all workspaces/workloads by looking for package.json files in suites/ and suites-experimental/
function getWorkloads() {
    const workloads = [];
    const findWorkloads = (dir) => {
        if (!fs.existsSync(dir))
            return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (entry.name === "node_modules")
                    continue;
                findWorkloads(path.join(dir, entry.name));
            } else if (entry.name === "package.json") {
                const pkgPath = path.join(dir, entry.name);
                const content = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
                if (content.scripts && content.scripts.build)
                    workloads.push(dir);
            }
        }
    };
    findWorkloads("suites");
    findWorkloads("suites-experimental");
    return workloads;
}

function buildWorkloads(workloads) {
    if (workloads.length === 0) {
        console.log("No workloads to build.");
        return;
    }
    console.log(`Building ${workloads.length} workload(s)...`);
    for (const workload of workloads) {
        console.log(`Building ${workload}...`);
        try {
            execFileSync("npm", ["ci"], { cwd: workload, stdio: "inherit" });
            execFileSync("npm", ["run", "build"], { cwd: workload, stdio: "inherit" });
        } catch (e) {
            console.error(`Failed to build workload: ${workload}`);
            process.exit(1);
        }
    }
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
    console.error("Run 'node tests/build.mjs --help' for usage.");
    process.exit(1);
}

if (values.help) {
    console.log(`Usage: node tests/build.mjs [options]

Options:
  --all          Build all workloads instead of just changed workloads
  -h, --help     Show this help message`);
    process.exit(0);
}

const allWorkloads = getWorkloads();

if (values.all) {
    buildWorkloads(allWorkloads);
    process.exit(0);
}

let changedFiles = [];
try {
    changedFiles = getChangedFiles();
} catch (e) {
    console.error("Failed to get changed files from git. Falling back to building all workloads.");
    buildWorkloads(allWorkloads);
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
    process.exit(0);
}

buildWorkloads([...changedWorkloads]);
