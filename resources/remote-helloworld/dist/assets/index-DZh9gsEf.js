var __defProp = Object.defineProperty;
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
  constructor(syncCallback, asyncCallback, reportCallback, params2) {
    this._syncCallback = syncCallback;
    this._asyncCallback = asyncCallback;
    this._reportCallback = reportCallback;
    this._params = params2;
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
      if (this._params.waitBeforeSync)
        setTimeout(() => this._scheduleCallbacks(resolve), this._params.waitBeforeSync);
      else
        this._scheduleCallbacks(resolve);
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
  constructor(frame, page, params2, suite, test, callback) {
    __privateAdd(this, _frame);
    __privateAdd(this, _page);
    __privateAdd(this, _params);
    __privateAdd(this, _suite);
    __privateAdd(this, _test);
    __privateAdd(this, _callback);
    __privateSet(this, _suite, suite);
    __privateSet(this, _test, test);
    __privateSet(this, _params, params2);
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
        while (performance.now() - startTime < __privateGet(this, _params).warmupBeforeSync)
          continue;
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
      if (__privateGet(this, _params).warmupBeforeSync)
        performance.measure("warmup", "warmup-start", "warmup-end");
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
class Params {
  constructor(searchParams2 = void 0) {
    __publicField(this, "viewport", {
      width: 800,
      height: 600
    });
    // Enable a detailed developer menu to change the current Params.
    __publicField(this, "developerMode", false);
    __publicField(this, "startAutomatically", false);
    __publicField(this, "iterationCount", 10);
    __publicField(this, "suites", []);
    // A list of tags to filter suites
    __publicField(this, "tags", []);
    // Toggle running a dummy suite once before the normal test suites.
    __publicField(this, "useWarmupSuite", false);
    // Change how a test measurement is triggered and async time is measured:
    // "timer": The classic (as in Speedometer 2.x) way using setTimeout
    // "raf":   Using rAF callbacks, both for triggering the sync part and for measuring async time.
    __publicField(this, "measurementMethod", "raf");
    // or "timer"
    // Wait time before the sync step in ms.
    __publicField(this, "waitBeforeSync", 0);
    // Warmup time before the sync step in ms.
    __publicField(this, "warmupBeforeSync", 0);
    // Seed for shuffling the execution order of suites.
    // "off": do not shuffle
    // "generate": generate a random seed
    // <integer>: use the provided integer as a seed
    __publicField(this, "shuffleSeed", "off");
    if (searchParams2)
      this._copyFromSearchParams(searchParams2);
    if (!this.developerMode) {
      Object.freeze(this.viewport);
      Object.freeze(this);
    }
  }
  _parseInt(value, errorMessage) {
    const number = Number(value);
    if (!Number.isInteger(number) && errorMessage)
      throw new Error(`Invalid ${errorMessage} param: '${value}', expected int.`);
    return parseInt(number);
  }
  _copyFromSearchParams(searchParams2) {
    this.viewport = this._parseViewport(searchParams2);
    this.startAutomatically = this._parseBooleanParam(searchParams2, "startAutomatically");
    this.iterationCount = this._parseIntParam(searchParams2, "iterationCount", 1);
    this.suites = this._parseSuites(searchParams2);
    this.tags = this._parseTags(searchParams2);
    this.developerMode = this._parseBooleanParam(searchParams2, "developerMode");
    this.useWarmupSuite = this._parseBooleanParam(searchParams2, "useWarmupSuite");
    this.waitBeforeSync = this._parseIntParam(searchParams2, "waitBeforeSync", 0);
    this.warmupBeforeSync = this._parseIntParam(searchParams2, "warmupBeforeSync", 0);
    this.measurementMethod = this._parseMeasurementMethod(searchParams2);
    this.shuffleSeed = this._parseShuffleSeed(searchParams2);
    const unused = Array.from(searchParams2.keys());
    if (unused.length > 0)
      console.error("Got unused search params", unused);
  }
  _parseBooleanParam(searchParams2, paramKey) {
    if (!searchParams2.has(paramKey))
      return false;
    searchParams2.delete(paramKey);
    return true;
  }
  _parseIntParam(searchParams2, paramKey, minValue) {
    if (!searchParams2.has(paramKey))
      return defaultParams[paramKey];
    const parsedValue = this._parseInt(searchParams2.get(paramKey), "waitBeforeSync");
    if (parsedValue < minValue)
      throw new Error(`Invalid ${paramKey} param: '${parsedValue}', value must be >= ${minValue}.`);
    searchParams2.delete(paramKey);
    return parsedValue;
  }
  _parseViewport(searchParams2) {
    if (!searchParams2.has("viewport"))
      return defaultParams.viewport;
    const viewportParam = searchParams2.get("viewport");
    const [width, height] = viewportParam.split("x");
    const viewport = {
      width: this._parseInt(width, "viewport.width"),
      height: this._parseInt(height, "viewport.height")
    };
    if (this.viewport.width < 800 || this.viewport.height < 600)
      throw new Error(`Invalid viewport param: ${viewportParam}`);
    searchParams2.delete("viewport");
    return viewport;
  }
  _parseSuites(searchParams2) {
    if (searchParams2.has("suite") || searchParams2.has("suites")) {
      if (searchParams2.has("suite") && searchParams2.has("suites"))
        throw new Error("Params 'suite' and 'suites' can not be used together.");
      const value = searchParams2.get("suite") || searchParams2.get("suites");
      const suites = value.split(",");
      if (suites.length === 0)
        throw new Error("No suites selected");
      searchParams2.delete("suite");
      searchParams2.delete("suites");
      return suites;
    }
    return defaultParams.suites;
  }
  _parseTags() {
    if (!searchParams.has("tags"))
      return defaultParams.tags;
    if (this.suites.length)
      throw new Error("'suites' and 'tags' cannot be used together.");
    const tags = searchParams.get("tags").split(",");
    searchParams.delete("tags");
    return tags;
  }
  _parseMeasurementMethod(searchParams2) {
    if (!searchParams2.has("measurementMethod"))
      return defaultParams.measurementMethod;
    const measurementMethod = searchParams2.get("measurementMethod");
    if (measurementMethod !== "timer" && measurementMethod !== "raf")
      throw new Error(`Invalid measurement method: '${measurementMethod}', must be either 'raf' or 'timer'.`);
    searchParams2.delete("measurementMethod");
    return measurementMethod;
  }
  _parseShuffleSeed(searchParams2) {
    if (!searchParams2.has("shuffleSeed"))
      return defaultParams.shuffleSeed;
    let shuffleSeed = searchParams2.get("shuffleSeed");
    if (shuffleSeed !== "off") {
      if (shuffleSeed === "generate") {
        shuffleSeed = Math.floor(Math.random() * 1 << 16);
        console.log(`Generated a random suite order seed: ${shuffleSeed}`);
      } else {
        shuffleSeed = parseInt(shuffleSeed);
      }
      if (!Number.isInteger(shuffleSeed))
        throw new Error(`Invalid shuffle seed: '${shuffleSeed}', must be either 'off', 'generate' or an integer.`);
    }
    searchParams2.delete("shuffleSeed");
    return shuffleSeed;
  }
  toSearchParams(forRemote = false) {
    const rawParams = { ...this };
    rawParams["viewport"] = `${this.viewport.width}x${this.viewport.height}`;
    if (forRemote) {
      delete rawParams["suites"];
      delete rawParams["tags"];
    }
    return new URLSearchParams(rawParams).toString();
  }
}
const defaultParams = new Params();
const searchParams = new URLSearchParams(window.location.search);
let maybeCustomParams = new Params();
try {
  maybeCustomParams = new Params(searchParams);
} catch (e) {
  console.error("Invalid URL Param", e, "\nUsing defaults as fallback:", maybeCustomParams);
  alert(`Invalid URL Param: ${e}`);
}
const params = maybeCustomParams;
class BenchmarkTestStep {
  constructor(name, run) {
    this.name = name;
    this.run = run;
  }
  async runAndRecord(params2, suite, test, callback) {
    const testRunner = new TestRunner(null, null, params2, suite, test, callback);
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
  async runAndRecord(params2, onProgress) {
    const measuredValues = {
      tests: {},
      total: 0
    };
    const suiteStartLabel = `suite-${this.name}-start`;
    const suiteEndLabel = `suite-${this.name}-end`;
    performance.mark(suiteStartLabel);
    for (const test of this.tests) {
      const result = await test.runAndRecord(params2, this, test, this.record);
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
//# sourceMappingURL=index-DZh9gsEf.js.map
