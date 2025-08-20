// example url for local testing:
// http://localhost:8080/?developerMode=true&config=http://localhost:8080/resources/config.json
// since the json doesn't contain a default suite, dismiss warning popups and select from the developerMenu
import { defaultSuites } from "./default-tests.mjs";
import { params } from "./shared/params.mjs";

const DEFAULT_TAGS = ["all", "default", "experimental"];
const DISALLOWED_DOMAINS = ["browserbench.org"];
export class BenchmarkConfigurator {
    #tags = new Set(DEFAULT_TAGS);
    #suites = [];

    get tags() {
        return this.#tags;
    }

    get suites() {
        return this.#suites;
    }

    /**
     * Checks if a given string is a valid URL, supporting both absolute and relative paths.
     *
     * This function attempts to construct a URL object. For relative paths, it uses
     * a dummy base URL to allow the URL constructor to parse them successfully.
     *
     * @param {string} url The URL string to validate.
     * @returns {boolean} True if the URL is valid (absolute or relative), false otherwise.
     */
    _isValidUrl(url) {
        if (typeof url !== "string" || url.length === 0)
            return false;

        try {
            new URL(url, "http://www.example.com");
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Reports an error by showing an alert and logging a message to the console.
     * @private
     * @param {string} message The error message to display.
     * @param {object} [debugInfo] An optional object containing additional debug information.
     */
    _reportError(message, debugInfo) {
        alert(message);
        console.error(message, debugInfo);
    }

    _freezeSuites() {
        Object.freeze(this.#suites);
        this.#suites.forEach((suite) => {
            if (!suite.tags)
                suite.tags = [];
            if (suite.url.startsWith("experimental/"))
                suite.tags.unshift("all", "experimental");
            else
                suite.tags.unshift("all");
            suite.enabled = suite.tags.includes("default");
            Object.freeze(suite.tags);
            Object.freeze(suite.steps);
        });
    }

    _freezeTags() {
        Object.freeze(this.#tags);
    }

    async init() {
        if (params.config) {
            try {
                const benchmarkUrl = new URL(window.location);
                if (DISALLOWED_DOMAINS.some((domain) => benchmarkUrl.hostname.endsWith(domain))) {
                    console.warn("Configuration fetch not allowed. Loading default suites.");
                    this._loadDefaultSuites();
                    return;
                }

                const response = await fetch(params.config);

                if (!response.ok)
                    throw new Error(`Could not fetch config: ${response.status}`);

                const config = await response.json();

                if (!config || !Array.isArray(config.suites))
                    throw new Error("Could not find a valid config structure!");

                config.suites.flatMap((suite) => suite.tags || []).forEach((tag) => this.#tags.add(tag));
                config.suites.forEach((suite) => {
                    if (suite && suite.url && this._isValidUrl(suite.url))
                        this.#suites.push(suite);
                    else
                        throw new Error("Invalid suite data");
                });
            } catch (error) {
                console.warn(`Error loading custom configuration: ${error.message}. Loading default suites.`);
                this._loadDefaultSuites();
            }
        } else {
            this._loadDefaultSuites();
        }

        this._freezeTags();
        this._freezeSuites();
    }

    _loadDefaultSuites() {
        defaultSuites.flatMap((suite) => suite.tags).forEach((tag) => this.#tags.add(tag));
        defaultSuites.forEach((suite) => this.#suites.push(suite));
    }

    enableSuites(names, tags) {
        if (names?.length) {
            const lowerCaseNames = names.map((each) => each.toLowerCase());
            this.#suites.forEach((suite) => {
                suite.enabled = lowerCaseNames.includes(suite.name.toLowerCase());
            });
        } else if (tags?.length) {
            tags.forEach((tag) => {
                if (!this.#tags.has(tag))
                    console.error(`Unknown Suites tag: "${tag}"`);
            });
            const tagsSet = new Set(tags);
            this.#suites.forEach((suite) => {
                suite.enabled = suite.tags.some((tag) => tagsSet.has(tag));
            });
        } else {
            console.warn("Neither names nor tags provided. Enabling all default suites.");
            this.#suites.forEach((suite) => {
                suite.enabled = suite.tags.includes("default");
            });
        }
        if (this.#suites.some((suite) => suite.enabled))
            return;

        if (names?.length) {
            this._reportError(`Suites "${names}" does not match any Suite. No tests to run.`, {
                providedNames: names,
                validNames: this.#suites.map((each) => each.name),
            });
        } else if (tags?.length) {
            this._reportError(`Tags "${tags}" does not match any Suite. No tests to run.`, {
                providedTags: tags,
                validTags: Array.from(this.#tags),
            });
        }
    }
}

const benchmarkConfigurator = new BenchmarkConfigurator();
await benchmarkConfigurator.init();

export { benchmarkConfigurator };
