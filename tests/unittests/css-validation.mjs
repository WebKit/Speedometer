import assert from "node:assert/strict";
import stylelint from "stylelint";
import fs from "node:fs";

describe("CSS Validation", () => {
    const files = fs.globSync(["*.css", "resources/**/*.css"]);

    for (const file of files) {
        it(`should have valid ${file}`, async () => {
            const result = await stylelint.lint({ files: [file] });
            const report = result.results[0];

            let messages = "";
            if (report && report.warnings.length > 0)
                messages = report.warnings.map((w) => `${w.line}:${w.column} ${w.text}`).join("\n");

            assert.ok(!result.errored, `Validation failed for ${file}:\n${messages}`);
        });
    }
});
