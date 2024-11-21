
import { setupCounter } from "./counter.js";
import { BenchmarkTestStep, BenchmarkTestSuite, BenchmarkSuitesManager, forceLayout, getElement, connectFromRemote } from "speedometer/resources/workload-testing-utils.mjs";

window.benchmarkSuitesManager = new BenchmarkSuitesManager(window.name, [
    new BenchmarkTestSuite("default", [
        new BenchmarkTestStep("Click counter (1000)", () => {
            for (let i = 0; i < 1000; i++) {
                getElement("#counter").click();
                forceLayout();
            }
        }),
        new BenchmarkTestStep("Click counter (5000)", () => {
            for (let i = 0; i < 5000; i++) {
                getElement("#counter").click();
                forceLayout();
            }
        }),
    ]),
]);

document.querySelector("#app").innerHTML = `
  <div>
    <h1>Remote Workload - Hello World</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
  </div>
`;

setupCounter(document.querySelector("#counter"));

connectFromRemote("remote-hello-world", 1);
