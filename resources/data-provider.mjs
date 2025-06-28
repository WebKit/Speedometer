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

    _isAllowedUrl(url) {
        // 1. Check for relative URL
        if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("//") && !url.startsWith("./")) {
            const baseUrl = "http://www.example.com";
            try {
                const parsedUrl = new URL(url, baseUrl);
                if (parsedUrl.origin === baseUrl)
                    return true;
            } catch (error) {
                return false;
            }
        }

        // 2. Check for localhost URL
        if (url.startsWith("http://localhost:") || url.startsWith("https://localhost:")) {
            try {
                const parsedUrl = new URL(url);
                if (parsedUrl.hostname === "localhost")
                    return true;
            } catch (e) {
                // Invalid URL format for localhost
            }
            return false;
        }

        // 3. Check for allowed domains
        try {
            const parsedUrl = new URL(url);
            if (ALLOWED_DOMAINS[parsedUrl.hostname] && ALLOWED_DOMAINS[parsedUrl.hostname].includes(parsedUrl.pathname))
                return true;
        } catch (e) {
            // invalid URL
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
        console.log("params.config", params.config);
        if (params.config) {
            const response = await fetch(params.config);
            const config = await response.json();

            config.suites.flatMap((suite) => suite.tags).forEach((tag) => this._tags.add(tag));
            config.suites.forEach((suite) => {
                if (this._isAllowedUrl(suite.url))
                    this._suites.push(suite);
            });
        } else {
            defaultSuites.flatMap((suite) => suite.tags).forEach((tag) => this._tags.add(tag));
            defaultSuites.forEach((suite) => this._suites.push(suite));
        }

        this._freezeTags();
        this._freezeSuites();
    }

    enableSuites(names, tags) {
        if (names?.length) {
            const lowerCaseNames = names.map((each) => each.toLowerCase());
            this._suites.forEach((suite) => {
                if (lowerCaseNames.includes(suite.name.toLowerCase()))
                    suite.disabled = false;
                else
                    suite.disabled = true;
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
                suite.disabled = !("default" in suite.tags);
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
