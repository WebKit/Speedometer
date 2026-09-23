export class RequestLimiter {
    constructor(limit) {
        this._limit = limit;
        this._active = 0;
        this._queue = [];
    }

    async _processQueue() {
        while (this._queue.length > 0) {
            const task = this._queue.shift();
            try {
                await task();
            } catch (e) {
                // Individual task errors are handled by their respective promises
            }
        }
        this._active--;
    }

    schedule(fn) {
        return new Promise((resolve, reject) => {
            const task = () => fn().then(resolve, reject);
            task.resolve = resolve;
            this._queue.push(task);

            if (this._active < this._limit) {
                this._active++;
                this._processQueue(); // Intentionally not awaited
            }
        });
    }

    clear() {
        for (const task of this._queue)
            task.resolve?.(0);
        this._queue.length = 0;
    }
}
