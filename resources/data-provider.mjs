import { defaultSuites } from "./tests.mjs";
import { params } from "./shared/params.mjs";

const DEFAULT_TAGS = ["all", "default", "experimental"];

// http://localhost:8080/?config=http://localhost:8080/resources/config.json

export async function getData() {
    const tags = new Set(DEFAULT_TAGS);
    const suites = [];

    function getSuites() {
        return suites;
    }

    function getTags() {
        return tags;
    }

    function enableSuites(names, tags, referenceTags) {
        if (names?.length) {
            const lowerCaseNames = names.map((each) => each.toLowerCase());
            suites.forEach((suite) => {
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
            suites.forEach((suite) => {
                suite.disabled = !suite.tags.some((tag) => tagsSet.has(tag));
            });
        } else {
            console.warn("Neither names nor tags provided. Enabling all default suites.");
            suites.forEach((suite) => {
                suite.disabled = !("default" in suite.tags);
            });
        }
        if (suites.some((suite) => !suite.disabled))
            return;
        let message, debugInfo;
        if (names?.length) {
            message = `Suites "${names}" does not match any Suite. No tests to run.`;
            debugInfo = {
                providedNames: names,
                validNames: suites.map((each) => each.name),
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

    function freezeSuites() {
        Object.freeze(suites);
        suites.forEach((suite) => {
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

    function freezeTags() {
        Object.freeze(tags);
    }

    if (params.config) {
        const response = await fetch(params.config);
        const config = await response.json();

        config.suites.flatMap((suite) => suite.tags).forEach(tag => tags.add(tag));
        config.suites.forEach(suite => suites.push(suite));
    } else {
        defaultSuites.flatMap((suite) => suite.tags).forEach(tag => tags.add(tag));
        defaultSuites.forEach(suite => suites.push(suite));
    }

    freezeTags();
    freezeSuites();

    return {
        getSuites,
        getTags,
        enableSuites
    };
}
