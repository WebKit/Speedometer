class TestInvoker {
    constructor(syncCallback, asyncCallback, reportCallback, params) {
        this._syncCallback = syncCallback;
        this._asyncCallback = asyncCallback;
        this._reportCallback = reportCallback;
        this._params = params;
    }
}

class BaseRAFTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            if (this._params.waitBeforeSync)
                setTimeout(() => this._scheduleCallbacks(resolve), this._params.waitBeforeSync);
            else
                this._scheduleCallbacks(resolve);
        });
    }
}

class RAFTestInvoker extends BaseRAFTestInvoker {
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

class AsyncRAFTestInvoker extends BaseRAFTestInvoker {
    static mc = new MessageChannel();
    _scheduleCallbacks(resolve) {
        let gotTimer = false;
        let gotMessage = false;
        let gotPromise = false;

        const tryTriggerAsyncCallback = () => {
            if (!gotTimer || !gotMessage || !gotPromise)
                return;

            this._asyncCallback();
            setTimeout(async () => {
                await this._reportCallback();
                resolve();
            }, 0);
        };

        requestAnimationFrame(async () => {
            await this._syncCallback();
            gotPromise = true;
            tryTriggerAsyncCallback();
        });

        requestAnimationFrame(() => {
            setTimeout(async () => {
                await Promise.resolve();
                gotTimer = true;
                tryTriggerAsyncCallback();
            });

            AsyncRAFTestInvoker.mc.port1.addEventListener(
                "message",
                async function () {
                    await Promise.resolve();
                    gotMessage = true;
                    tryTriggerAsyncCallback();
                },
                { once: true }
            );
            AsyncRAFTestInvoker.mc.port1.start();
            AsyncRAFTestInvoker.mc.port2.postMessage("speedometer");
        });
    }
}

export const TEST_INVOKER_LOOKUP = {
    __proto__: null,
    raf: RAFTestInvoker,
    async: AsyncRAFTestInvoker,
};
