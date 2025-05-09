import { defaultSuites, Suites, Tags } from "./tests.mjs";
const DEFAULT_CONFIG_PATH = "resources/config.json";

// http://localhost:8080/?config=http://localhost:8080/resources/config.json

function isValidJsonUrl(url) {
    try {
        return new URL(url) && url.toLowerCase().endsWith(".json");
    } catch (_) {
        return false;
    }
}

export async function getData() {
    const tags = new Tags();
    const suites = new Suites();

    const urlParams = new URLSearchParams(window.location.search);
    const configParam = urlParams.get("config");

    if (configParam) {
        const configUrl = isValidJsonUrl(configParam) ? configParam : DEFAULT_CONFIG_PATH;
        const response = await fetch(configUrl);
        const config = await response.json();

        config.suites.flatMap((suite) => suite.tags).forEach(tag => tags.add(tag));
        config.suites.forEach(suite => suites.push(suite));
    } else {
        defaultSuites.flatMap((suite) => suite.tags).forEach(tag => tags.add(tag));
        defaultSuites.forEach(suite => suites.push(suite));
    }

    tags.freeze();
    suites.freeze();

    function getSuites() {
        return suites;
    }

    function getTags() {
        return tags;
    }

    return {
        getSuites,
        getTags,
    };
}
