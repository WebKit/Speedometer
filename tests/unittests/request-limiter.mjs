import { RequestLimiter } from "../../resources/shared/request-limiter.mjs";

describe("RequestLimiter", () => {
    it("should limit the number of concurrent tasks", async () => {
        const limiter = new RequestLimiter(2);
        let activeCount = 0;
        let maxActive = 0;

        const createTask = () => {
            return limiter.schedule(async () => {
                activeCount++;
                if (activeCount > maxActive) {
                    maxActive = activeCount;
                }
                // Simulate async work
                await new Promise((resolve) => setTimeout(resolve, 10));
                activeCount--;
            });
        };

        const promises = [createTask(), createTask(), createTask(), createTask(), createTask()];
        await Promise.all(promises);

        // Maximum concurrent tasks should not exceed the limit of 2
        expect(maxActive).to.be(2);
        // All tasks should have finished
        expect(activeCount).to.be(0);
    });

    it("should resolve individual promises with correct values", async () => {
        const limiter = new RequestLimiter(1);

        const p1 = limiter.schedule(async () => 1);
        const p2 = limiter.schedule(async () => 2);
        const p3 = limiter.schedule(async () => { throw new Error("task failed"); });

        expect(await p1).to.be(1);
        expect(await p2).to.be(2);

        let errorCaught = false;
        try {
            await p3;
        } catch (e) {
            errorCaught = true;
            expect(e.message).to.be("task failed");
        }
        expect(errorCaught).to.be(true);
    });
});
