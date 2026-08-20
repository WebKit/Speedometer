import assert from "node:assert/strict";
import { HtmlValidate } from "html-validate";
import fs from "node:fs";
import path from "node:path";

describe("HTML Validation", () => {
    const htmlvalidate = new HtmlValidate({
        extends: ["html-validate:recommended"],
        rules: { "void-style": "off" },
    });

    const files = fs.globSync(["*.html", "resources/**/*.html"]);

    for (const file of files) {
        it(`should have valid ${file}`, async () => {
            const report = await htmlvalidate.validateFile(file);
            const absPath = path.resolve(file);
            const messages = report.results[0]?.messages.map((m) => `${absPath}:${m.line}:${m.column} - ${m.message} (${m.ruleId})`).join("\n") || "";
            assert.ok(report.valid, `Validation failed for ${file}:\n${messages}`);
        });
    }
});
