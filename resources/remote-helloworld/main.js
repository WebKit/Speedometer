import "./style.css";
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
    <h1>Hello Vite!</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`;

setupCounter(document.querySelector("#counter"));

connectFromRemote("remote-hello-world", 1);
