export class Suites extends Array {
    enable(names, tags, referenceTags) {
        if (names?.length) {
            const lowerCaseNames = names.map((each) => each.toLowerCase());
            this.forEach((suite) => {
                if (lowerCaseNames.includes(suite.name.toLowerCase()))
                    suite.disabled = false;
                else
                    suite.disabled = true;
            });
        } else if (tags?.length) {
            tags.forEach((tag) => {
                if (!referenceTags.has(tag))
                    console.error(`Unknown Suites tag: "${tag}"`);
            });
            const tagsSet = new Set(tags);
            this.forEach((suite) => {
                suite.disabled = !suite.tags.some((tag) => tagsSet.has(tag));
            });
        } else {
            console.warn("Neither names nor tags provided. Enabling all default suites.");
            this.forEach((suite) => {
                suite.disabled = !("default" in suite.tags);
            });
        }
        if (this.some((suite) => !suite.disabled))
            return;
        let message, debugInfo;
        if (names?.length) {
            message = `Suites "${names}" does not match any Suite. No tests to run.`;
            debugInfo = {
                providedNames: names,
                validNames: this.map((each) => each.name),
            };
        } else if (tags?.length) {
            message = `Tags "${tags}" does not match any Suite. No tests to run.`;
            debugInfo = {
                providedTags: tags,
                validTags: Array.from(referenceTags),
            };
        }
        alert(message);
        console.error(message, debugInfo);
    }

    freeze() {
        Object.freeze(this);
        this.forEach((suite) => {
            if (!suite.tags)
                suite.tags = [];
            if (suite.url.startsWith("experimental/"))
                suite.tags.unshift("all", "experimental");
            else if (suite.disabled)
                suite.tags.unshift("all");
            else
                suite.tags.unshift("all", "default");
            Object.freeze(suite.tags);
            Object.freeze(suite.steps);
        });
    }
}
