class TestInvoker {
    constructor(syncCallback, asyncCallback, reportCallback, params) {
        this._syncCallback = syncCallback;
        this._asyncCallback = asyncCallback;
        this._reportCallback = reportCallback;
        this._params = params;
    }
}

export class TimerTestInvoker extends TestInvoker {
    start() {
        return new Promise((resolve) => {
            setTimeout(() => {
                this._syncCallback();
                setTimeout(() => {
                    this._asyncCallback();
                    requestAnimationFrame(async () => {
                        await this._reportCallback();
                        resolve();
                    });
                }, 0);
            }, this._params.waitBeforeSync);
        });
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
            let gotTimer = false;
            let gotMessage = false;

            const tryTriggerAsyncCallback = () => {
                if (!gotTimer || !gotMessage)
                    return;

                this._asyncCallback();
                setTimeout(async () => {
                    await this._reportCallback();
                    resolve();
                }, 0);
            };

            setTimeout(() => {
                gotTimer = true;
                tryTriggerAsyncCallback();
            });

            const mc = new MessageChannel();
            mc.port1.onmessage = () => {
                mc.port1.close();
                mc.port2.close();

                gotMessage = true;
                tryTriggerAsyncCallback();
            };
            mc.port2.postMessage("speedometer");
        });
    }
}

export const TEST_INVOKER_LOOKUP = {
    __proto__: null,
    timer: TimerTestInvoker,
    raf: RAFTestInvoker,
};
