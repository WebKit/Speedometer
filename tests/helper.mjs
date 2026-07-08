import { execFileSync } from "child_process";
import fs from "fs";

export function getChangedFiles() {
    // "--diff-filter=ACMR" => ignore deleted files.
    const diffOut = execFileSync("git", ["diff", "--name-only", "--diff-filter=ACMR", "@{upstream}"], { encoding: "utf8" });
    const files = diffOut
        .split("\n")
        .map((f) => f.trim())
        .filter((f) => f.length > 0 && fs.existsSync(f));
    return [...new Set(files)];
}
