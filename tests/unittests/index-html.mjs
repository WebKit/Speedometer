import assert from "assert";
import fs from "fs";
import path from "path";

describe("index.html", () => {
    it("should have valid modulepreload links", () => {
        const indexPath = path.join(process.cwd(), "index.html");
        const html = fs.readFileSync(indexPath, "utf-8");

        const preloadRegex = /<link\s+rel="modulepreload"\s+href="([^"]+)"/g;
        let match;
        const preloads = [];
        
        while ((match = preloadRegex.exec(html)) !== null) {
            preloads.push(match[1]);
        }

        assert.ok(preloads.length > 0, "Should have at least one modulepreload link");

        for (const url of preloads) {
            const filePath = path.join(process.cwd(), url);
            const exists = fs.existsSync(filePath);
            assert.ok(exists, `The modulepreload link '${url}' points to a non-existent file`);
        }
    });
});
