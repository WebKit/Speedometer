class StepScheduler {
    constructor(syncCallback, asyncCallback, params) {
        this._syncCallback = syncCallback;
        this._asyncCallback = asyncCallback;
        this._params = params;
    }

    start() {
        return new Promise((resolve) => {
            if (this._params.waitBeforeSync)
                setTimeout(() => this._scheduleCallbacks(resolve), this._params.waitBeforeSync);
            else
                this._scheduleCallbacks(resolve);
        });
    }
}

class RAFStepScheduler extends StepScheduler {
    _scheduleCallbacks(resolve) {
        requestAnimationFrame(() => this._syncCallback());
        requestAnimationFrame(() => {
            setTimeout(() => {
                this._asyncCallback();
                setTimeout(resolve, 0);
            }, 0);
        });
    }
}

class AsyncRAFStepScheduler extends StepScheduler {
    static mc = new MessageChannel();
    _scheduleCallbacks(resolve) {
        let gotTimer = false;
        let gotMessage = false;
        let gotPromise = false;

        const tryTriggerAsyncCallback = () => {
            if (!gotTimer || !gotMessage || !gotPromise)
                return;

            this._asyncCallback();
            setTimeout(resolve, 0);
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

            AsyncRAFStepScheduler.mc.port1.addEventListener(
                "message",
                async function () {
                    await Promise.resolve();
                    gotMessage = true;
                    tryTriggerAsyncCallback();
                },
                { once: true }
            );
            AsyncRAFStepScheduler.mc.port1.start();
            AsyncRAFStepScheduler.mc.port2.postMessage("speedometer");
        });
    }
}

export const STEP_SCHEDULER_LOOKUP = {
    __proto__: null,
    raf: RAFStepScheduler,
    async: AsyncRAFStepScheduler,
};
