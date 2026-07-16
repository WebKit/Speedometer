import expect from "expect.js";
import fs from "node:fs/promises";
import path from "node:path";
import normalize from "normalize-package-data";
import { sh, ROOT_DIR } from "../setup-node.mjs";

function getCheckedInPackageJsonFiles() {
    const output = sh('git ls-files -- ":**/*package.json" "package.json"');
    const files = output
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((relativePath) => path.resolve(ROOT_DIR, relativePath));
    return files.sort();
}

function assertPkg(relPath, condition, message) {
    if (!condition) {
        throw new Error(`[${relPath}] ${message}`);
    }
}

describe("package.json validation", () => {
    let packages = [];

    before(async () => {
        const packageFiles = getCheckedInPackageJsonFiles();
        expect(packageFiles).to.be.an("array");
        expect(packageFiles.length).to.be.greaterThan(0, "Should find at least one checked-in package.json file");

        packages = await Promise.all(
            packageFiles.map(async (file) => {
                const relPath = path.relative(ROOT_DIR, file);
                const content = await fs.readFile(file, "utf-8");
                let pkg = null;
                let parseError = null;
                try {
                    pkg = JSON.parse(content);
                } catch (e) {
                    parseError = e.message;
                }
                return { file, relPath, content, pkg, parseError };
            })
        );
    });

    it("should contain valid JSON syntax for all checked-in package.json files", () => {
        for (const { relPath, parseError } of packages) {
            assertPkg(relPath, parseError === null, `Failed to parse JSON: ${parseError}`);
        }
    });

    it("should pass normalize-package-data schema validation when present", () => {
        for (const { relPath, pkg } of packages) {
            if (!pkg) continue;
            const clone = structuredClone(pkg);
            let normalizeError = null;
            try {
                normalize(clone, true);
            } catch (e) {
                normalizeError = e.message;
            }
            assertPkg(relPath, normalizeError === null, `normalize-package-data error: ${normalizeError}`);

            if (clone.warnings && clone.warnings.length > 0) {
                const criticalWarnings = clone.warnings.filter((w) => !w.includes("No repository field") && !w.includes("No README data") && !w.includes("No license field"));
                assertPkg(relPath, criticalWarnings.length === 0, `normalize-package-data warnings: ${criticalWarnings.join("; ")}`);
            }
        }
    });
});
