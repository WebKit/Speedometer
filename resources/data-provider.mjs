const DEFAULT_CONFIG_PATH = "resources/config.json";
const DEFAULT_TAGS = ["all", "default", "experimental"];
const suites = [];
const tags = new Set(DEFAULT_TAGS);

const isValidTag = (tag) => tags.has(tag);
const getValidTags = () => Array.from(tags);
const getValidNames = () => suites.map((suite) => suite.name);

export function enableSuites(suites, providedNames, providedTags) {
    if (providedNames?.length) {
        const lowerCaseNames = providedNames.map((each) => each.toLowerCase());
        suites.forEach((suite) => {
            if (lowerCaseNames.includes(suite.name.toLowerCase()))
                suite.disabled = false;
            else
                suite.disabled = true;
        });
    } else if (providedTags?.length) {
        providedTags.forEach((tag) => {
            if (!isValidTag(tag))
                console.error(`Unknown Suites tag: "${tag}"`);
        });
        const tagsSet = new Set(providedTags);
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
    if (providedNames?.length) {
        message = `Suites "${providedNames}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedNames,
            validNames: getValidNames(),
        };
    } else if (providedTags?.length) {
        message = `Tags "${providedTags}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedTags,
            validTags: getValidTags(),
        };
    }
    alert(message);
    console.error(message, debugInfo);
}

export async function parseConfig() {
    console.log("parseConfig()");
    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get("config");
    const response = await fetch(configParam ?? DEFAULT_CONFIG_PATH);
    const config = await response.json();

    config.suites.forEach(suite => suites.push(suite));

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

    const suiteTags = suites.flatMap(suite => suite.tags);
    suiteTags.forEach(tag => tags.add(tag));

    return {
        suites,
        tags,
    };
}
