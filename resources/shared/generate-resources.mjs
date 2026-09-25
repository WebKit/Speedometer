import fs from "fs";
import path from "path";

function walkDir(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory())
            walkDir(filePath, fileList);
        else
            fileList.push(filePath);
    }
    return fileList;
}

export function generateResourcesFile(distPath) {
    if (!fs.existsSync(distPath)) {
        console.warn(`Directory ${distPath} does not exist, skipping resources.txt generation.`);
        return;
    }
    const absoluteDist = path.resolve(distPath);
    const files = walkDir(absoluteDist);
    const relativePaths = files.map((f) => path.relative(absoluteDist, f)).filter((f) => f !== "resources.txt");
    fs.writeFileSync(path.join(absoluteDist, "resources.txt"), `${relativePaths.join("\n")}\n`, "utf8");
    console.log(`Generated resources.txt at ${distPath}`);
}

import { fileURLToPath } from "node:url";

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
    const targetDir = process.argv[2] || "dist";
    generateResourcesFile(path.resolve(process.cwd(), targetDir));
}
