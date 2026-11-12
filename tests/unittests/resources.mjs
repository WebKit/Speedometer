import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ExperimentalSuites } from "../../suites-experimental/suites.mjs";
import { DefaultSuites } from "../../suites/default-suites.mjs";

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../");

const Suites = [...ExperimentalSuites, ...DefaultSuites];

describe("resources", () => {
    it("should have resources.txt listing only valid files via local filesystem", async function () {
        // validating all resource files can take a bit longer than the default timeout.
        this.timeout(10000);
        const brokenResourcesList = [];
        for (const suite of Suites) {
            if (!suite.resources)
                continue;
            const resourcesPath = path.resolve(ROOT_DIR, suite.resources);
            let text;
            try {
                text = await fs.readFile(resourcesPath, "utf-8");
            } catch (error) {
                brokenResourcesList.push(`${suite.resources} (for ${suite.name}) [error: ${error.message}]`);
                continue;
            }

            if (text.trim().length === 0) {
                brokenResourcesList.push(`${suite.resources} (for ${suite.name}) [error: resources.txt is empty]`);
                continue;
            }

            const files = text.trim().split("\n");
            for (const file of files)
                expect(file.trim().length).to.be.greaterThan(0, `Found empty line in resources.txt for ${suite.name}`);

            await Promise.all(
                files.map(async (file) => {
                    const cleanFile = file.trim();
                    if (!cleanFile)
                        return;
                    const filePath = cleanFile.startsWith("/") ? path.join(ROOT_DIR, cleanFile) : path.resolve(path.dirname(resourcesPath), cleanFile);
                    try {
                        const stat = await fs.stat(filePath);
                        if (!stat.isFile())
                            brokenResourcesList.push(`${cleanFile} (listed in ${suite.resources}) [error: not a file]`);
                    } catch (error) {
                        brokenResourcesList.push(`${cleanFile} (listed in ${suite.resources}) [error: ${error.message}]`);
                    }
                })
            );
        }
        if (brokenResourcesList.length > 0)
            throw new Error(`Failed to check the following resources:\n${brokenResourcesList.join("\n")}`);
    });
});
