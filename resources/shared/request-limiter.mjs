export class RequestLimiter {
    constructor(limit = 20) {
        this.limit = limit;
        this.active = 0;
        this.queue = [];
    }

    async _processQueue() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            try {
                await task();
            } catch (e) {
                // Individual task errors are handled by their respective promises
            }
        }
        this.active--;
    }

    schedule(fn) {
        return new Promise((resolve, reject) => {
            const task = () => fn().then(resolve, reject);
            this.queue.push(task);

            if (this.active < this.limit) {
                this.active++;
                this._processQueue();
            }
        });
    }
}
