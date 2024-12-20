class TestInvoker {
    constructor(syncCallback, asyncCallback, reportCallback, params) {
        this._syncCallback = syncCallback;
        this._asyncCallback = asyncCallback;
        this._reportCallback = reportCallback;
        this._params = params;
    }
}

export class RAFTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            if (this._params.waitBeforeSync)
                setTimeout(() => this._scheduleCallbacks(resolve), this._params.waitBeforeSync);
            else
                this._scheduleCallbacks(resolve);
        });
    }

    _scheduleCallbacks(resolve) {
        requestAnimationFrame(() => this._syncCallback());
        requestAnimationFrame(() => {
            setTimeout(() => {
                this._asyncCallback();
                setTimeout(async () => {
                    const result = await this._reportCallback();
                    resolve(result);
                }, 0);
            }, 0);
        });
    }
}

export const TEST_INVOKER_LOOKUP = {
    __proto__: null,
    raf: RAFTestInvoker,
};
