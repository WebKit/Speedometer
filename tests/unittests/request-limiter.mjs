import { RequestLimiter } from "../../resources/shared/request-limiter.mjs";

describe("RequestLimiter", () => {
    it("should process requests within the limit concurrently", async () => {
        const limiter = new RequestLimiter(2);
        let active = 0;
        let maxActive = 0;

        const task = async () => {
            active++;
            maxActive = Math.max(maxActive, active);
            await new Promise((resolve) => setTimeout(resolve, 10));
            active--;
        };

        const p1 = limiter.schedule(task);
        const p2 = limiter.schedule(task);
        const p3 = limiter.schedule(task);

        await Promise.all([p1, p2, p3]);

        expect(maxActive).to.be(2);
        expect(limiter._active).to.be(0);
    });

    it("should resolve with the correct value", async () => {
        const limiter = new RequestLimiter(1);
        const p = limiter.schedule(async () => "result");
        const result = await p;
        expect(result).to.be("result");
    });

    it("should reject if the task throws", async () => {
        const limiter = new RequestLimiter(1);
        const p = limiter.schedule(async () => {
            throw new Error("task failed");
        });

        let threw = false;
        try {
            await p;
        } catch (e) {
            threw = true;
            expect(e.message).to.be("task failed");
        }
        expect(threw).to.be(true);
        // Wait for microtasks to flush so _processQueue can decrement _active
        await new Promise((r) => setTimeout(r, 0));
        expect(limiter._active).to.be(0);
    });

    it("should continue processing queue if a task rejects", async () => {
        const limiter = new RequestLimiter(1);

        const p1 = limiter.schedule(async () => {
            throw new Error("failed");
        });
        const p2 = limiter.schedule(async () => "success");

        try {
            await p1;
        } catch (e) {
            // expected to throw
        }

        const res2 = await p2;
        expect(res2).to.be("success");
    });

    it("should clear the queue and resolve pending requests with 0", async () => {
        const limiter = new RequestLimiter(1);
        let executed = 0;

        const p1 = limiter.schedule(async () => {
            executed++;
            await new Promise((resolve) => setTimeout(resolve, 10));
            return 1;
        });

        const p2 = limiter.schedule(async () => {
            executed++;
            return 2;
        });

        const p3 = limiter.schedule(async () => {
            executed++;
            return 3;
        });

        limiter.clear();

        const res1 = await p1;
        const res2 = await p2;
        const res3 = await p3;

        // p1 already started, so it finishes normally
        expect(res1).to.be(1);
        // p2 and p3 were cleared, so they resolve with 0
        expect(res2).to.be(0);
        expect(res3).to.be(0);

        // only p1 actually ran
        expect(executed).to.be(1);

        // eventually active count resets when p1 completes
        expect(limiter._active).to.be(0);
    });
});
