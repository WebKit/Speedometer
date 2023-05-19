describe("Speedometer 3.0", () => {
    it("should run until completion", () => {
        return new Promise((resolve) => {
            const iframe = document.createElement('iframe');
            iframe.onload = () => {
                const originalDidFinishLastIteration = iframe.contentWindow.benchmarkClient.didFinishLastIteration;
                iframe.contentWindow.benchmarkClient.didFinishLastIteration = function (...args) {
                    originalDidFinishLastIteration.apply(this, args);
                    iframe.remove();
                    resolve(true);
                }
                iframe.contentDocument.querySelector(".start-tests-button").click();
            }
            iframe.src = '../index.html?iterationCount=1';
            document.body.appendChild(iframe);
            iframe.width = '800';
            iframe.height = '600';
        });
    }).timeout(20000);
});
