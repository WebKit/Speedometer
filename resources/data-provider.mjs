import { defaultSuites, Suites, Tags } from "./tests.mjs";
import { params } from "./shared/params.mjs";

// http://localhost:8080/?configUrl=http://localhost:8080/resources/config.json

export async function getData() {
    const tags = new Tags();
    const suites = new Suites();

    if (params.configUrl) {
        const response = await fetch(params.configUrl);
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
