export class Params {
    viewport = {
        width: 800,
        height: 600,
    };
    // Enable a detailed developer menu to change the current Params.
    developerMode = false;
    startAutomatically = false;
    iterationCount = 10;
    suites = [];
    // A list of tags to filter suites
    tags = [];
    // Toggle running a dummy suite once before the normal test suites.
    useWarmupSuite = false;
    // Change how a test measurement is triggered and async time is measured:
    // "timer": The classic (as in Speedometer 2.x) way using setTimeout
    // "raf":   Using rAF callbacks, both for triggering the sync part and for measuring async time.
    measurementMethod = "raf"; // or "timer"
    // Wait time before the sync step in ms.
    waitBeforeSync = 0;
    // Warmup time before the sync step in ms.
    warmupBeforeSync = 0;
    // Seed for shuffling the execution order of suites.
    // "off": do not shuffle
    // "generate": generate a random seed
    // <integer>: use the provided integer as a seed
    shuffleSeed = "off";
    // Emit metrics for the prepare phase.
    measurePrepare = false;
    // Use a new subdomain for each iteration to avoid caching.
    domainPerIteration = false;
    // Force a gc before every suite (chrome specific)
    suiteForceGC = false;
    currentIteration = 0;
    embedded = false;


    constructor(searchParams = undefined, freeze = true) {
        if (searchParams)
            this._copyFromSearchParams(searchParams);
        if (!this.developerMode && freeze) {
            Object.freeze(this.viewport);
            Object.freeze(this);
        }
    }

    _parseInt(value, errorMessage) {
        const number = Number(value);
        if (!Number.isInteger(number) && errorMessage)
            throw new Error(`Invalid ${errorMessage} param: '${value}', expected int.`);
        return parseInt(number);
    }

    _copyFromSearchParams(searchParams) {
        if (searchParams.has("viewport")) {
            const viewportParam = searchParams.get("viewport");
            const [width, height] = viewportParam.split("x");
            this.viewport.width = this._parseInt(width, "viewport.width");
            this.viewport.height = this._parseInt(height, "viewport.height");
            if (this.viewport.width < 800 || this.viewport.height < 600)
                throw new Error(`Invalid viewport param: ${viewportParam}`);
            searchParams.delete("viewport");
        }
        this.startAutomatically = searchParams.has("startAutomatically");
        searchParams.delete("startAutomatically");
        if (searchParams.has("iterationCount")) {
            this.iterationCount = this._parseInt(searchParams.get("iterationCount"), "iterationCount");
            if (this.iterationCount < 1)
                throw new Error(`Invalid iterationCount param: '${this.iterationCount}', must be > 1.`);
            searchParams.delete("iterationCount");
        }
        if (searchParams.has("suite") || searchParams.has("suites")) {
            if (searchParams.has("suite") && searchParams.has("suites"))
                throw new Error("Params 'suite' and 'suites' can not be used together.");
            const value = (searchParams.get("suite") || searchParams.get("suites")).trim();
            if (value.length ) {
                this.suites = value.split(",");
                if (this.suites.length === 0)
                    throw new Error("No suites selected");
            }
            searchParams.delete("suite");
            searchParams.delete("suites");
        }

        if (searchParams.has("tags")) {
            const rawTags = searchParams.get("tags");
            if (rawTags) {
                this.tags = rawTags.split(",");
                if (this.tags.length && this.suites.length)
                    throw new Error("'suites' and 'tags' cannot be used together.");
            }
            searchParams.delete("tags");
        }

        this.embedded = searchParams.has("embedded");
        searchParams.delete("embedded");

        this.developerMode = searchParams.has("developerMode");
        searchParams.delete("developerMode");

        this.measurePrepare = searchParams.has("measurePrepare");
        searchParams.delete("measurePrepare");

        this.domainPerIteration = searchParams.has("domainPerIteration");
        searchParams.delete("domainPerIteration");

        this.suiteForceGC = searchParams.has("suiteForceGC");
        searchParams.delete("suiteForceGC");

        this.currentIteration = searchParams.get("currentIteration") | 0;
        searchParams.delete("currentIteration");

        if (searchParams.has("useWarmupSuite")) {
            this.useWarmupSuite = true;
            searchParams.delete("useWarmupSuite");
        }

        if (searchParams.has("waitBeforeSync")) {
            this.waitBeforeSync = this._parseInt(searchParams.get("waitBeforeSync"), "waitBeforeSync");
            if (this.waitBeforeSync < 0)
                throw new Error(`Invalid waitBeforeSync param: '${this.waitBeforeSync}', must be >= 0.`);
            searchParams.delete("waitBeforeSync");
        }

        if (searchParams.has("warmupBeforeSync")) {
            this.warmupBeforeSync = this._parseInt(searchParams.get("warmupBeforeSync"), "warmupBeforeSync");
            if (this.warmupBeforeSync < 0)
                throw new Error(`Invalid warmupBeforeSync param: '${this.warmupBeforeSync}', must be >= 0.`);
            searchParams.delete("warmupBeforeSync");
        }

        if (searchParams.has("measurementMethod")) {
            this.measurementMethod = searchParams.get("measurementMethod");
            if (this.measurementMethod !== "timer" && this.measurementMethod !== "raf")
                throw new Error(`Invalid measurement method: '${this.measurementMethod}', must be either 'raf' or 'timer'.`);
            searchParams.delete("measurementMethod");
        }

        if (searchParams.has("shuffleSeed")) {
            this.shuffleSeed = searchParams.get("shuffleSeed");
            if (this.shuffleSeed !== "off") {
                if (this.shuffleSeed === "generate") {
                    this.shuffleSeed = Math.floor((Math.random() * 1) << 16);
                    console.log(`Generated a random suite order seed: ${this.shuffleSeed}`);
                } else {
                    this.shuffleSeed = parseInt(this.shuffleSeed);
                }
                if (!Number.isInteger(this.shuffleSeed))
                    throw new Error(`Invalid shuffle seed: '${this.shuffleSeed}', must be either 'off', 'generate' or an integer.`);
            }
            searchParams.delete("shuffleSeed");
        }

        const unused = Array.from(searchParams.keys());
        if (unused.length > 0)
            console.error("Got unused search params", unused);
    }

    toSearchParamsObject() {
        const rawParams = { __proto__: null };
        for (const [key, value] of Object.entries(this)) {
            if (value === defaultParams[key])
                continue;
            rawParams[key] = value;
        }
        // Either suites or params can be used at the same time.
        if (rawParams.suites?.length && rawParams.tags?.length)
            delete rawParams.suites;
        rawParams.viewport = `${this.viewport.width}x${this.viewport.height}`;
        return new URLSearchParams(rawParams);
    }

    toSearchParams() {
        return this.toSearchParamsObject().toString();
    }

    copy() {
        return new Params(this.toSearchParamsObject(), false);
    }
}

export const defaultParams = new Params();

const searchParams = new URLSearchParams(window.location.search);
let maybeCustomParams = new Params();
try {
    maybeCustomParams = new Params(searchParams);
} catch (e) {
    console.error("Invalid URL Param", e, "\nUsing defaults as fallback:", maybeCustomParams);
    alert(`Invalid URL Param: ${e}`);
}
export const params = maybeCustomParams;
globalThis.params = maybeCustomParams;
