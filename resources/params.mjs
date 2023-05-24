class Params {
    viewport = {
        width: 800,
        height: 600,
    };
    developerMode = false;
    startAutomatically = false;
    iterationCount = 10;
    suites = [];
    useWarmupSuite = false;
    measurementMethod = "timer";

    constructor(searchParams = undefined) {
        if (searchParams)
            this._copyFromSearchParams(searchParams);
    }

    _copyFromSearchParams(searchParams) {
        if (searchParams.has("viewport")) {
            const viewportParam = searchParams.get("viewport");
            const [width, height] = viewportParam.split("x");
            this.viewport.width = parseInt(width) || this.viewport.width;
            this.viewport.height = parseInt(height) || this.viewport.height;
            if (this.viewport.width < 800 || this.viewport.height < 600)
                throw new Error(`Invalid viewport param: ${viewportParam}`);
            searchParams.delete("viewport");
        }
        this.startAutomatically = searchParams.has("startAutomatically");
        searchParams.delete("startAutomatically");
        if (searchParams.has("iterationCount")) {
            this.iterationCount = parseInt(searchParams.get("iterationCount")) || this.iterationCount;
            if (this.iterationCount < 1)
                throw new Error(`Invalid iterationCount param: ${this.iterationCount}`);
            searchParams.delete("iterationCount");
        }
        if (searchParams.has("suite") || searchParams.has("suites")) {
            if (searchParams.has("suite") && searchParams.has("suites"))
                throw new Error("Params 'suite' and 'suites' can not be used together.");
            const value = searchParams.get("suite") || searchParams.get("suites");
            this.suites = value.split(",");
            if (this.suites.length === 0)
                throw new Error("No suites selected");
            searchParams.delete("suite");
            searchParams.delete("suites");
        }
        this.developerMode = searchParams.has("developerMode");
        searchParams.delete("developerMode");

        if (searchParams.has("useWarmupSuite")) {
            this.useWarmupSuite = true;
            searchParams.delete("useWarmupSuite");
        }

        if (searchParams.has("measurementMethod")) {
            this.measurementMethod = searchParams.get("measurementMethod");
            if (this.measurementMethod !== "timer" && this.measurementMethod !== "raf")
                throw new Error(`Invalid measurement method: ${this.measurementMethod}`);
            searchParams.delete("measurementMethod");
        }

        const unused = Array.from(searchParams.keys());
        if (unused.length > 0)
            console.error("Got unused search params", unused);
    }

    toSearchParams() {
        const rawParams = { ...this };
        rawParams["viewport"] = `${this.viewport.width}x${this.viewport.height}`;
        return new URLSearchParams(rawParams).toString();
    }
}

export const defaultParams = new Params();
Object.freeze(defaultParams.viewport);
Object.freeze(defaultParams);

const searchParams = new URLSearchParams(window.location.search);
let maybeCustomParams = new Params();
try {
    maybeCustomParams = new Params(searchParams);
} catch (e) {
    console.error("Invalid URL Param", e, "\nUsing defaults as fallback:", maybeCustomParams);
    alert(`Invalid URL Param: ${e}`);
}
export const params = maybeCustomParams;
