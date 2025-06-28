// example url for local testing:
// http://localhost:8080/?config=http://localhost:8080/resources/config.json
import { defaultSuites } from "./tests.mjs";
import { params } from "./shared/params.mjs";

const DEFAULT_TAGS = ["all", "default", "experimental"];
const ALLOWED_DOMAINS = {
    "app.netlify.com": "/sites/webkit-speedometer-preview/",
};
export class DataProvider {
    _tags = new Set(DEFAULT_TAGS);
    _suites = [];

    get tags() {
        return this._tags;
    }

    get suites() {
        return this._suites;
    }

    /**
     * Checks if a given URL is allowed based on a set of rules.
     * We allow:
     * - Relative URLs (e.g., "/path/to/resource", "path/to/resource").
     * - Absolute URLs from a list of allowed domains.
     * - Localhost URLs for development purposes.
     *
     * @param {string} url The URL to validate.
     * @returns {boolean} True if the URL is allowed, false otherwise.
     */
    _isAllowedUrl(url) {
        // We don't allow protocol-relative URLs (e.g., "//example.com")
        if (url.startsWith("//"))
            return false;

        // 1. Handle relative URLs by attempting to resolve them against a base URL.
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            const baseUrl = "http://www.example.com";
            try {
                // new URL() successfully parsing indicates a valid relative URL structure.
                new URL(url, baseUrl);
                return true;
            } catch (error) {
                return false;
            }
        }

        // 2. Handle absolute URLs (including localhost).
        try {
            const parsedUrl = new URL(url);

            // Allow localhost URLs.
            if (parsedUrl.hostname === "localhost")
                return true;

            // Check against the allowed domains and paths.
            if (ALLOWED_DOMAINS[parsedUrl.hostname] && ALLOWED_DOMAINS[parsedUrl.hostname].includes(parsedUrl.pathname))
                return true;

        } catch {
            return false;
        }
        return false;
    }

    _freezeSuites() {
        Object.freeze(this._suites);
        this._suites.forEach((suite) => {
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

    _freezeTags() {
        Object.freeze(this._tags);
    }

    async init() {
        if (params.config) {
            try {
                const response = await fetch(params.config);
                // ✅ Validate that the network request was successful
                if (!response.ok)
                    throw new Error(`Could not fetch config: ${response.status}`);

                const config = await response.json();
                // ✅ Validate the structure of the fetched config object
                if (!config || !Array.isArray(config.suites))
                    throw new Error("Could not find a valid config structure!");

                config.suites.flatMap((suite) => suite.tags || []).forEach((tag) => this._tags.add(tag));
                config.suites.forEach((suite) => {
                    // ✅ Validate each suite object before processing
                    if (suite && suite.url && this._isAllowedUrl(suite.url))
                        this._suites.push(suite);
                });
            } catch (error) {
                this._loadDefaultSuites();
            }
        } else {
            this._loadDefaultSuites();
        }

        this._freezeTags();
        this._freezeSuites();
    }

    _loadDefaultSuites() {
        defaultSuites.flatMap((suite) => suite.tags).forEach((tag) => this._tags.add(tag));
        defaultSuites.forEach((suite) => this._suites.push(suite));
    }

    enableSuites(names, tags) {
        if (names?.length) {
            const lowerCaseNames = names.map((each) => each.toLowerCase());
            this._suites.forEach((suite) => {
                suite.disabled = !lowerCaseNames.includes(suite.name.toLowerCase());
            });
        } else if (tags?.length) {
            tags.forEach((tag) => {
                if (!this._tags.has(tag))
                    console.error(`Unknown Suites tag: "${tag}"`);
            });
            const tagsSet = new Set(tags);
            this._suites.forEach((suite) => {
                suite.disabled = !suite.tags.some((tag) => tagsSet.has(tag));
            });
        } else {
            console.warn("Neither names nor tags provided. Enabling all default suites.");
            this._suites.forEach((suite) => {
                suite.disabled = !suite.tags.includes("default");
            });
        }
        if (this._suites.some((suite) => !suite.disabled))
            return;
        let message, debugInfo;
        if (names?.length) {
            message = `Suites "${names}" does not match any Suite. No tests to run.`;
            debugInfo = {
                providedNames: names,
                validNames: this._suites.map((each) => each.name),
            };
        } else if (tags?.length) {
            message = `Tags "${tags}" does not match any Suite. No tests to run.`;
            debugInfo = {
                providedTags: tags,
                validTags: Array.from(this._tags),
            };
        }
        alert(message);
        console.error(message, debugInfo);
    }
}

const dataProvider = new DataProvider();
await dataProvider.init();

export { dataProvider };
