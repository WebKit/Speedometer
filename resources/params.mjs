
class Params {
    viewport = {
        width: 800,
        height: 600,
    };
    startAutomatically = false;
    iterationCount = 10;
    unit = "ms";

    constructor(searchParams = undefined)
    {
        if (searchParams)
            this._copyFromParams(searchParams)
        Object.freeze(this.viewport);
        Object.freeze(this);
    }

    _copyFromParams(searchParams) {
        const viewportParam = searchParams.get("viewport");
        if (viewportParam) {
            const [width, height] = viewportParam.split("x");
            this.viewport.width = parseInt(width) || this.viewport.width;
            this.viewport.height = parseInt(height) || this.viewport.height;
            if (this.viewport.width < 800 || this.viewport.height < 600) {
                throw Error(`Invalid viewport param: ${viewportParam}`);
            }
        }
        this.startAutomatically = searchParams.has("startAutomatically")
        this.iterationCount = parseInt(searchParams.get("iterationCount"))
                || this.iterationCount;
        if (this.iterationCount <= 1)
            throw Error(`Invalid iterationCount param: ${this.iterationCount}`);
    }

    toSearchParams()
    {
        const rawParams = {... this}
        rawParams["viewport"] = `${this.viewport.width}x${this.viewport.height}`
        return new URLSearchParams(rawParams).toString();
    }

}

export const defaultParams = new Params();

const searchParams = new URLSearchParams(window.location.search);
export const params = new Params(searchParams);
