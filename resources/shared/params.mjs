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
    // toggle async type vs default raf type.
    useAsyncSteps = false;
    // Change how a test measurement is triggered and async time is measured:
    // "timer": The classic (as in Speedometer 2.x) way using setTimeout
    // "raf":   Using rAF callbacks, both for triggering the sync part and for measuring async time.
    measurementMethod = "raf";
    // Wait time before the sync step in ms.
    waitBeforeSync = 0;
    // Warmup time before the sync step in ms.
    warmupBeforeSync = 0;
    // Seed for shuffling the execution order of suites.
    // "off": do not shuffle
    // "generate": generate a random seed
    // <integer>: use the provided integer as a seed
    shuffleSeed = "off";

    constructor(searchParams = undefined) {
        if (searchParams)
            this._copyFromSearchParams(searchParams);
        if (!this.developerMode) {
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
        this.viewport = this._parseViewport(searchParams);
        this.startAutomatically = this._parseBooleanParam(searchParams, "startAutomatically");
        this.iterationCount = this._parseIntParam(searchParams, "iterationCount", 1);
        this.suites = this._parseSuites(searchParams);
        this.tags = this._parseTags(searchParams);
        this.developerMode = this._parseBooleanParam(searchParams, "developerMode");
        this.useWarmupSuite = this._parseBooleanParam(searchParams, "useWarmupSuite");
        this.useAsyncSteps = this._parseBooleanParam(searchParams, "useAsyncSteps");
        this.waitBeforeSync = this._parseIntParam(searchParams, "waitBeforeSync", 0);
        this.warmupBeforeSync = this._parseIntParam(searchParams, "warmupBeforeSync", 0);
        this.measurementMethod = this._parseMeasurementMethod(searchParams);
        this.shuffleSeed = this._parseShuffleSeed(searchParams);

        const unused = Array.from(searchParams.keys());
        if (unused.length > 0)
            console.error("Got unused search params", unused);
    }

    _parseBooleanParam(searchParams, paramKey) {
        if (!searchParams.has(paramKey))
            return false;
        searchParams.delete(paramKey);
        return true;
    }

    _parseIntParam(searchParams, paramKey, minValue) {
        if (!searchParams.has(paramKey))
            return defaultParams[paramKey];

        const parsedValue = this._parseInt(searchParams.get(paramKey), "waitBeforeSync");
        if (parsedValue < minValue)
            throw new Error(`Invalid ${paramKey} param: '${parsedValue}', value must be >= ${minValue}.`);
        searchParams.delete(paramKey);
        return parsedValue;
    }

    _parseViewport(searchParams) {
        if (!searchParams.has("viewport"))
            return defaultParams.viewport;
        const viewportParam = searchParams.get("viewport");
        const [width, height] = viewportParam.split("x");
        const viewport = {
            width: this._parseInt(width, "viewport.width"),
            height: this._parseInt(height, "viewport.height"),
        };
        if (this.viewport.width < 800 || this.viewport.height < 600)
            throw new Error(`Invalid viewport param: ${viewportParam}`);
        searchParams.delete("viewport");
        return viewport;
    }

    _parseSuites(searchParams) {
        if (searchParams.has("suite") || searchParams.has("suites")) {
            if (searchParams.has("suite") && searchParams.has("suites"))
                throw new Error("Params 'suite' and 'suites' can not be used together.");
            const value = searchParams.get("suite") || searchParams.get("suites");
            const suites = value.split(",");
            if (suites.length === 0)
                throw new Error("No suites selected");
            searchParams.delete("suite");
            searchParams.delete("suites");
            return suites;
        }
        return defaultParams.suites;
    }

    _parseTags(searchParams) {
        if (!searchParams.has("tags"))
            return defaultParams.tags;
        if (this.suites.length)
            throw new Error("'suites' and 'tags' cannot be used together.");
        const tags = searchParams.get("tags").split(",");
        searchParams.delete("tags");
        return tags;
    }

    _parseMeasurementMethod(searchParams) {
        if (!searchParams.has("measurementMethod"))
            return defaultParams.measurementMethod;
        const measurementMethod = searchParams.get("measurementMethod");
        if (measurementMethod !== "raf")
            throw new Error(`Invalid measurement method: '${measurementMethod}', must be 'raf'.`);
        searchParams.delete("measurementMethod");
        return measurementMethod;
    }

    _parseShuffleSeed(searchParams) {
        if (!searchParams.has("shuffleSeed"))
            return defaultParams.shuffleSeed;
        let shuffleSeed = searchParams.get("shuffleSeed");
        if (shuffleSeed !== "off") {
            if (shuffleSeed === "generate") {
                shuffleSeed = Math.floor((Math.random() * 1) << 16);
                console.log(`Generated a random suite order seed: ${shuffleSeed}`);
            } else {
                shuffleSeed = parseInt(shuffleSeed);
            }
            if (!Number.isInteger(shuffleSeed))
                throw new Error(`Invalid shuffle seed: '${shuffleSeed}', must be either 'off', 'generate' or an integer.`);
        }
        searchParams.delete("shuffleSeed");
        return shuffleSeed;
    }

    toCompleteSearchParamsObject() {
        return this.toSearchParamsObject(false);
    }

    toSearchParamsObject(filter = true) {
        const rawUrlParams = { __proto__: null };
        for (const [key, value] of Object.entries(this)) {
            // Handle composite values separately.
            if (key === "viewport" || key === "suites" || key === "tags")
                continue;
            // Skip over default values.
            if (filter && value === defaultParams[key])
                continue;
            rawUrlParams[key] = value;
        }

        if (this.viewport.width !== defaultParams.viewport.width || this.viewport.height !== defaultParams.viewport.height)
            rawUrlParams.viewport = `${this.viewport.width}x${this.viewport.height}`;

        if (this.suites.length)
            rawUrlParams.suites = this.suites.join(",");
        else if (this.tags.length)
            rawUrlParams.tags = this.tags.join(",");

        return new URLSearchParams(rawUrlParams);
    }

    toSearchParams() {
        return this.toSearchParamsObject().toString();
    }
}

export const defaultParams = new Params();

let maybeCustomParams = defaultParams;
if (globalThis?.location?.search) {
    const searchParams = new URLSearchParams(globalThis.location.search);
    try {
        maybeCustomParams = new Params(searchParams);
    } catch (e) {
        console.error("Invalid URL Param", e, "\nUsing defaults as fallback:", maybeCustomParams);
    }
}
export const params = maybeCustomParams;
