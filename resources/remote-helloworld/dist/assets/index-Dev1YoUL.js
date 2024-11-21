var __typeError = (msg) => {
  throw TypeError(msg);
};
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateAdd = (obj, member, value) => member.has(obj) ? __typeError("Cannot add the same private member more than once") : member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var _frame, _page, _params, _suite, _test, _callback;
function setupCounter(element) {
  let counter = 0;
  const setCounter = (count) => {
    counter = count;
    element.innerHTML = `count is ${counter}`;
  };
  element.addEventListener("click", () => setCounter(counter + 1));
  setCounter(0);
}
class TestInvoker {
  constructor(syncCallback, asyncCallback, reportCallback, params) {
    this._syncCallback = syncCallback;
    this._asyncCallback = asyncCallback;
    this._reportCallback = reportCallback;
    this._params = params;
  }
}
class TimerTestInvoker extends TestInvoker {
  start() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this._syncCallback();
        setTimeout(() => {
          this._asyncCallback();
          requestAnimationFrame(async () => {
            const result = await this._reportCallback();
            resolve(result);
          });
        }, 0);
      }, this._params.waitBeforeSync);
    });
  }
}
class RAFTestInvoker extends TestInvoker {
  start() {
    return new Promise((resolve) => {
      if (this._params.waitBeforeSync) setTimeout(() => this._scheduleCallbacks(resolve), this._params.waitBeforeSync);
      else this._scheduleCallbacks(resolve);
    });
  }
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
const TEST_INVOKER_LOOKUP = {
  __proto__: null,
  timer: TimerTestInvoker,
  raf: RAFTestInvoker
};
class TestRunner {
  constructor(frame, page, params, suite, test, callback) {
    __privateAdd(this, _frame);
    __privateAdd(this, _page);
    __privateAdd(this, _params);
    __privateAdd(this, _suite);
    __privateAdd(this, _test);
    __privateAdd(this, _callback);
    __privateSet(this, _suite, suite);
    __privateSet(this, _test, test);
    __privateSet(this, _params, params);
    __privateSet(this, _callback, callback);
    __privateSet(this, _page, page);
    __privateSet(this, _frame, frame);
  }
  async runTest() {
    const suiteName = __privateGet(this, _suite).name;
    const testName = __privateGet(this, _test).name;
    const syncStartLabel = `${suiteName}.${testName}-start`;
    const syncEndLabel = `${suiteName}.${testName}-sync-end`;
    const asyncStartLabel = `${suiteName}.${testName}-async-start`;
    const asyncEndLabel = `${suiteName}.${testName}-async-end`;
    let syncTime;
    let asyncStartTime;
    let asyncTime;
    const runSync = () => {
      if (__privateGet(this, _params).warmupBeforeSync) {
        performance.mark("warmup-start");
        const startTime = performance.now();
        while (performance.now() - startTime < __privateGet(this, _params).warmupBeforeSync) continue;
        performance.mark("warmup-end");
      }
      performance.mark(syncStartLabel);
      const syncStartTime = performance.now();
      __privateGet(this, _test).run(__privateGet(this, _page));
      const syncEndTime = performance.now();
      performance.mark(syncEndLabel);
      syncTime = syncEndTime - syncStartTime;
      performance.mark(asyncStartLabel);
      asyncStartTime = performance.now();
    };
    const measureAsync = () => {
      const bodyReference = __privateGet(this, _frame) ? __privateGet(this, _frame).contentDocument.body : document.body;
      const windowReference = __privateGet(this, _frame) ? __privateGet(this, _frame).contentWindow : window;
      const height = bodyReference.getBoundingClientRect().height;
      windowReference._unusedHeightValue = height;
      const asyncEndTime = performance.now();
      performance.mark(asyncEndLabel);
      asyncTime = asyncEndTime - asyncStartTime;
      if (__privateGet(this, _params).warmupBeforeSync) performance.measure("warmup", "warmup-start", "warmup-end");
      performance.measure(`${suiteName}.${testName}-sync`, syncStartLabel, syncEndLabel);
      performance.measure(`${suiteName}.${testName}-async`, asyncStartLabel, asyncEndLabel);
    };
    const report = () => __privateGet(this, _callback).call(this, __privateGet(this, _test), syncTime, asyncTime);
    const invokerClass = TEST_INVOKER_LOOKUP[__privateGet(this, _params).measurementMethod];
    const invoker = new invokerClass(runSync, measureAsync, report, __privateGet(this, _params));
    return invoker.start();
  }
}
_frame = new WeakMap();
_page = new WeakMap();
_params = new WeakMap();
_suite = new WeakMap();
_test = new WeakMap();
_callback = new WeakMap();
class BenchmarkTestStep {
  constructor(name, run) {
    this.name = name;
    this.run = run;
  }
  async runAndRecord(params, suite, test, callback) {
    const testRunner = new TestRunner(null, null, params, suite, test, callback);
    const result = await testRunner.runTest();
    return result;
  }
}
class BenchmarkTestSuite {
  constructor(name, tests) {
    this.name = name;
    this.tests = tests;
  }
  record(_test2, syncTime, asyncTime) {
    const total = syncTime + asyncTime;
    const results = {
      tests: { Sync: syncTime, Async: asyncTime },
      total
    };
    return results;
  }
  async runAndRecord(params, onProgress) {
    const measuredValues = {
      tests: {},
      total: 0
    };
    const suiteStartLabel = `suite-${this.name}-start`;
    const suiteEndLabel = `suite-${this.name}-end`;
    performance.mark(suiteStartLabel);
    for (const test of this.tests) {
      const result = await test.runAndRecord(params, this, test, this.record);
      measuredValues.tests[test.name] = result;
      measuredValues.total += result.total;
      onProgress == null ? void 0 : onProgress(test.name);
    }
    performance.mark(suiteEndLabel);
    performance.measure(`suite-${this.name}`, suiteStartLabel, suiteEndLabel);
    return {
      type: "suite-tests-complete",
      status: "success",
      result: measuredValues,
      suitename: this.name
    };
  }
}
class BenchmarkSuitesManager {
  constructor(name, suites) {
    this.name = name;
    this.suites = suites;
  }
  getSuiteByName(name) {
    return this.suites.find((suite) => suite.name === name);
  }
}
function isBoolean(value) {
  if (value === "true" || value === "false")
    return true;
  return false;
}
function isNumber(value) {
  const number = Number(value);
  return Number.isInteger(number);
}
function convertToBoolean(value) {
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  return value;
}
function convertToNumber(value) {
  return Number(value);
}
function getConvertedValue(value) {
  if (isBoolean(value))
    return convertToBoolean(value);
  if (isNumber(value))
    return convertToNumber(value);
  return value;
}
function getParams(value) {
  const params = /* @__PURE__ */ Object.create(null);
  const searchParams = new URLSearchParams(value);
  for (const entry of searchParams.entries()) {
    const [key, value2] = entry;
    params[key] = getConvertedValue(value2);
  }
  return Object.freeze(params);
}
function getParent(lookupStartNode, path) {
  lookupStartNode = lookupStartNode.shadowRoot ?? lookupStartNode;
  const parent = path.reduce((root, selector) => {
    const node = root.querySelector(selector);
    return node.shadowRoot ?? node;
  }, lookupStartNode);
  return parent;
}
function getElement(selector, path = [], lookupStartNode = document) {
  const element = getParent(lookupStartNode, path).querySelector(selector);
  return element;
}
function forceLayout() {
  const rect = document.body.getBoundingClientRect();
  const e = document.elementFromPoint(rect.width / 2 | 0, rect.height / 2 | 0);
  return e;
}
function connectFromRemote(name, version) {
  const appId = `${name}-${version}`;
  function sendMessage(message) {
    window.top.postMessage(message, "*");
  }
  window.onmessage = async (event) => {
    if (event.data.id !== appId || event.data.key !== "benchmark-connector")
      return;
    switch (event.data.type) {
      case "benchmark-suite":
        const params = getParams(window.location.search);
        const { result } = await window.benchmarkSuitesManager.getSuiteByName(event.data.name).runAndRecord(params, (test) => sendMessage({ type: "step-complete", status: "success", appId, name, test }));
        sendMessage({ type: "suite-complete", status: "success", appId, result });
        break;
    }
  };
  sendMessage({ type: "app-ready", status: "success", appId });
}
window.benchmarkSuitesManager = new BenchmarkSuitesManager(window.name, [
  new BenchmarkTestSuite("default", [
    new BenchmarkTestStep("Click counter (1000)", () => {
      for (let i = 0; i < 1e3; i++) {
        getElement("#counter").click();
        forceLayout();
      }
    }),
    new BenchmarkTestStep("Click counter (5000)", () => {
      for (let i = 0; i < 5e3; i++) {
        getElement("#counter").click();
        forceLayout();
      }
    })
  ])
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
//# sourceMappingURL=index-Dev1YoUL.js.map
