import { ExperimentalSuites } from "../../suites-experimental/suites.mjs";
import { DefaultSuites } from "../../suites/default-suites.mjs";
import { EXCLUDES } from "../excludes.mjs";

const Suites = {
    ExperimentalSuites,
    DefaultSuites,
};

for (const [name, suites] of Object.entries(Suites)) {
    describe(`${name}-common`, () => {
        it("should be frozen", () => {
            // FIXME: freeze suite
            // expect(Object.isFrozen(suites)).to.be(true);
        });
        it("should have tags array", () => {
            suites.forEach((suite) => {
                expect(suite.tags).to.be.an("array");
            });
        });
        it("should have frozen tags array", () => {
            // FIXME: freeze suite and tags
            // suites.forEach((suite) => {
            //     expect(Object.isFrozen(suite.tags)).to.be(true);
            // });
        });
        it("should have frozen steps array", () => {
            suites.forEach((suite) => {
                expect(Object.isFrozen(suite.steps)).to.be(true);
            });
        });
        it("should not have duplicate tags", () => {
            suites.forEach((suite) => {
                const uniqueTags = new Set(suite.tags);
                expect(suite.tags).to.eql(Array.from(uniqueTags));
            });
        });
        it("should have 'all' tag", () => {
            // FIXME: freeze suite and tags
            // suites.forEach((suite) => {
            //     expect(suite.tags.includes("all")).to.be(true);
            // });
        });
        it("should not have enabled property", () => {
            suites.forEach((suite) => {
                expect(suite.enabled).to.be(undefined);
            });
        });
        it("should have a name string", () => {
            suites.forEach((suite) => {
                expect(suite.name).to.be.a("string");
                expect(suite.name.length).to.be.greaterThan(0);
            });
        });
        it("should have unique names", () => {
            const uniqueNames = new Set();
            suites.forEach((suite) => {
                expect(uniqueNames.has(suite.name)).to.be(false);
                uniqueNames.add(suite.name);
            });
        });
        it("should have a url string", () => {
            suites.forEach((suite) => {
                expect(suite.url).to.be.a("string");
                expect(suite.url.length).to.be.greaterThan(0);
            });
        });
        it("should have resources.txt listing only valid files", async function () {
            // validating all resource files can take a bit longer than the default timeout.
            this.timeout(10000);
            const isNode = typeof window === "undefined";
            const baseUrl = isNode ? new URL("../../", import.meta.url).href : `${window.location.origin}/`;
            const brokenResourcesList = [];
            for (const suite of suites) {
                const isExcluded = [...EXCLUDES].some((excludePath) => suite.url.startsWith(excludePath + "/") || suite.url === excludePath);
                if (isExcluded) {
                    console.warn(`        ⚠ Skipping resources check for excluded suite: ${suite.name}`);
                    continue;
                }

                if (!suite.resources)
                    continue;
                const resourcesUrl = new URL(suite.resources, baseUrl).href;
                let text;
                if (isNode) {
                    const fs = await import("node:fs/promises");
                    try {
                        text = await fs.readFile(new URL(resourcesUrl), "utf-8");
                    } catch (e) {
                        throw new Error(`Failed to load resources.txt for ${suite.name} at ${resourcesUrl}`);
                    }
                } else {
                    const res = await fetch(resourcesUrl);
                    if (!res.ok)
                        throw new Error(`Failed to load resources.txt for ${suite.name} at ${resourcesUrl}`);
                    text = await res.text();
                }

                if (text.trim().length === 0)
                    throw new Error(`resources.txt for ${suite.name} is empty`);

                const files = text.trim().split("\n");
                for (const file of files)
                    expect(file.trim().length).to.be.greaterThan(0, `Found empty line in resources.txt for ${suite.name}`);

                await Promise.all(
                    files.map(async (file) => {
                        const fileUrl = new URL(file, resourcesUrl).href;
                        if (isNode) {
                            const fs = await import("node:fs/promises");
                            try {
                                await fs.stat(new URL(fileUrl));
                                expect(true).to.be(true);
                            } catch {
                                brokenResourcesList.push(`${fileUrl} (listed in ${resourcesUrl})`);
                            }
                        } else {
                            const fileRes = await fetch(fileUrl, { method: "HEAD" });
                            if (!fileRes.ok)
                                brokenResourcesList.push(`${fileUrl} (listed in ${resourcesUrl})`);
                            else
                                expect(fileRes.ok).to.be(true);
                        }
                    })
                );
            }
            if (brokenResourcesList.length > 0)
                throw new Error(`Failed to load the following resources:\n${brokenResourcesList.join("\n")}`);
        });
    });
}

describe("ExperimentalSuites", () => {
    it("should have 'experimental' tag", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags.includes("experimental")).to.be(true);
        });
    });
    it("should not have 'default' tag", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.tags.includes("default")).to.be(false);
        });
    });
});

describe("Suites", () => {
    it("should not have 'experimental' tag", () => {
        DefaultSuites.forEach((suite) => {
            expect(suite.tags.includes("experimental")).to.be(false);
        });
    });
    it("should not have enabled property", () => {
        ExperimentalSuites.forEach((suite) => {
            expect(suite.enabled).to.be(undefined);
        });
    });
});
