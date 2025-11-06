import { BenchmarkTestStep } from "../resources/benchmark-runner.mjs";
import { getTodoText, defaultLanguage } from "../resources/shared/translations.mjs";
import { numberOfItemsToAdd } from "../resources/shared/todomvc-utils.mjs";
import { freezeSuites } from "../resources/suites-helper.mjs";

export const ExperimentalSuites = freezeSuites([
    {
        name: "TodoMVC-LocalStorage",
        url: "experimental/todomvc-localstorage/dist/index.html",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
            page.getLocalStorage().getItem("javascript-es5");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "TodoMVC-Emoji",
        url: "resources/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText("emoji", i));
                    input.dispatchEvent("input");
                    input.enter("keyup");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    const item = items[i].querySelectorInShadowRoot(".toggle-todo-input");
                    item.click();
                }
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--) {
                    const item = items[i].querySelectorInShadowRoot(".remove-todo-button");
                    item.click();
                }
            }),
        ],
    },
    {
        name: "TodoMVC-WebComponents-PostMessage",
        url: "resources/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        tags: ["experimental", "todomvc", "webcomponents"],
        async prepare() {},
        type: "remote",
        /* config: {
            name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "TodoMVC-Jaspr-Dart2JS-O4",
        url: "experimental/todomvc-dart-jaspr/dist/out-dart2js-O4/index.html",
        tags: ["todomvc", "experimental"],
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "TodoMVC-Jaspr-Dart2Wasm-O2",
        url: "experimental/todomvc-dart-jaspr/dist/out-dart2wasm-O2/index.html",
        tags: ["todomvc", "experimental"],
        disabled: true,
        async prepare(page) {
            (await page.waitForElement(".new-todo")).focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ja", i));
                    newTodo.dispatchEvent("change");
                    newTodo.enter("keypress");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const checkboxes = page.querySelectorAll(".toggle");
                for (let i = 0; i < numberOfItemsToAdd; i++)
                    checkboxes[i].click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const deleteButtons = page.querySelectorAll(".destroy");
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    deleteButtons[i].click();
            }),
        ],
    },
    {
        name: "NewsSite-PostMessage",
        url: "resources/newssite/news-next/dist/index.html",
        tags: ["experimental", "newssite", "language"],
        async prepare() {},
        type: "remote",
        /* config: {
          name: "default", // optional param to target non-default tests locally
        }, */
    },
    {
        name: "TodoMVC-WebComponents-IndexedDB",
        url: "experimental/javascript-wc-indexeddb/dist/index.html#/indexeddb",
        tags: ["todomvc", "webcomponents", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement("todo-app");
            await page.waitForElement(".indexeddb-ready");
            page.setGlobalVariable(
                "addPromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-add-completed", () => {
                        resolve();
                    });
                })
            );
            page.setGlobalVariable(
                "completePromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-toggle-completed", () => {
                        resolve();
                    });
                })
            );
            page.setGlobalVariable(
                "removePromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-remove-completed", () => {
                        resolve();
                    });
                })
            );
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, async (page) => {
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText(defaultLanguage, i));
                    input.dispatchEvent("input");
                    input.enter("keyup");
                }
            }),
            new BenchmarkTestStep(
                "FinishAddingItemsToDB",
                async (page) => {
                    await page.getGlobalVariable("addPromise");
                },
                /* ignoreResult =*/ true
            ),
            new BenchmarkTestStep("CompletingAllItems", async (page) => {
                const numberOfItemsPerIteration = 10;
                const numberOfIterations = 10;
                page.setGlobalVariable("numberOfItemsToAdd", numberOfItemsToAdd);
                for (let j = 0; j < numberOfIterations; j++) {
                    const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                    for (let i = 0; i < numberOfItemsPerIteration; i++) {
                        const item = items[i].querySelectorInShadowRoot(".toggle-todo-input");
                        item.click();
                    }
                    if (j < 9) {
                        const nextPageButton = page.querySelector(".next-page-button", ["todo-app", "todo-bottombar"]);
                        nextPageButton.click();
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep(
                "FinishModifyingItemsInDB",
                async (page) => {
                    await page.getGlobalVariable("completePromise");
                },
                /* ignoreResult =*/ true
            ),
            new BenchmarkTestStep("DeletingAllItems", async (page) => {
                const numberOfItemsPerIteration = 10;
                const numberOfIterations = 10;
                page.setGlobalVariable("numberOfItemsToAdd", numberOfItemsToAdd);
                function iterationFinishedListener() {
                    iterationFinishedListener.promiseResolve();
                }
                page.addEventListener("previous-page-loaded", iterationFinishedListener);
                for (let j = 0; j < numberOfIterations; j++) {
                    const iterationFinishedPromise = new Promise((resolve) => {
                        iterationFinishedListener.promiseResolve = resolve;
                    });
                    const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                    for (let i = numberOfItemsPerIteration - 1; i >= 0; i--) {
                        const item = items[i].querySelectorInShadowRoot(".remove-todo-button");
                        item.click();
                    }
                    if (j < 9) {
                        const previousPageButton = page.querySelector(".previous-page-button", ["todo-app", "todo-bottombar"]);
                        previousPageButton.click();
                        await iterationFinishedPromise;
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep(
                "FinishDeletingItemsFromDB",
                async (page) => {
                    await page.getGlobalVariable("removePromise");
                },
                /* ignoreResult =*/ true
            ),
        ],
    },
    {
        name: "TodoMVC-WebComponents-DexieJS",
        url: "experimental/javascript-wc-indexeddb/dist/index.html#/dexie",
        tags: ["todomvc", "webcomponents", "experimental"],
        type: "async",
        async prepare(page) {
            await page.waitForElement("todo-app");
            await page.waitForElement(".indexeddb-ready");
            page.setGlobalVariable(
                "addPromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-add-completed", () => {
                        resolve();
                    });
                })
            );
            page.setGlobalVariable(
                "completePromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-toggle-completed", () => {
                        resolve();
                    });
                })
            );
            page.setGlobalVariable(
                "removePromise",
                new Promise((resolve) => {
                    page.addEventListener("indexeddb-remove-completed", () => {
                        resolve();
                    });
                })
            );
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, async (page) => {
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText(defaultLanguage, i));
                    input.dispatchEvent("input");
                    input.enter("keyup");
                }
            }),
            new BenchmarkTestStep(
                "FinishAddingItemsToDB",
                async (page) => {
                    await page.getGlobalVariable("addPromise");
                },
                /* ignoreResult =*/ true
            ),
            new BenchmarkTestStep("CompletingAllItems", async (page) => {
                const numberOfItemsPerIteration = 10;
                const numberOfIterations = 10;
                page.setGlobalVariable("numberOfItemsToAdd", numberOfItemsToAdd);
                for (let j = 0; j < numberOfIterations; j++) {
                    const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                    for (let i = 0; i < numberOfItemsPerIteration; i++) {
                        const item = items[i].querySelectorInShadowRoot(".toggle-todo-input");
                        item.click();
                    }
                    if (j < 9) {
                        const nextPageButton = page.querySelector(".next-page-button", ["todo-app", "todo-bottombar"]);
                        nextPageButton.click();
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep(
                "FinishModifyingItemsInDB",
                async (page) => {
                    await page.getGlobalVariable("completePromise");
                },
                /* ignoreResult =*/ true
            ),
            new BenchmarkTestStep("DeletingAllItems", async (page) => {
                const numberOfItemsPerIteration = 10;
                const numberOfIterations = 10;
                page.setGlobalVariable("numberOfItemsToAdd", numberOfItemsToAdd);
                function iterationFinishedListener() {
                    iterationFinishedListener.promiseResolve();
                }
                page.addEventListener("previous-page-loaded", iterationFinishedListener);
                for (let j = 0; j < numberOfIterations; j++) {
                    const iterationFinishedPromise = new Promise((resolve) => {
                        iterationFinishedListener.promiseResolve = resolve;
                    });
                    const items = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                    for (let i = numberOfItemsPerIteration - 1; i >= 0; i--) {
                        const item = items[i].querySelectorInShadowRoot(".remove-todo-button");
                        item.click();
                    }
                    if (j < 9) {
                        const previousPageButton = page.querySelector(".previous-page-button", ["todo-app", "todo-bottombar"]);
                        previousPageButton.click();
                        await iterationFinishedPromise;
                        page.layout();
                    }
                }
            }),
            new BenchmarkTestStep(
                "FinishDeletingItemsFromDB",
                async (page) => {
                    await page.getGlobalVariable("removePromise");
                },
                /* ignoreResult =*/ true
            ),
        ],
    },
]);
