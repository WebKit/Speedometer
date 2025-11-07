import { BenchmarkStep, BenchmarkSuite } from "./speedometer-utils/benchmark.mjs";
import { getTodoText, defaultLanguage } from "./speedometer-utils/translations.mjs";
import { numberOfItemsToAdd } from "./speedometer-utils/todomvc-utils.mjs";

export const appName = "todomvc-indexeddb";
export const appVersion = "1.0.0";

const suites = {
    default: new BenchmarkSuite("indexeddb", [
        new BenchmarkStep(`Adding${numberOfItemsToAdd}Items`, async () => {
            const input = document.querySelector("todo-app").shadowRoot.querySelector("todo-topbar").shadowRoot.querySelector(".new-todo-input");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                input.value = getTodoText(defaultLanguage, i);
                input.dispatchEvent(new Event("input"));
                input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
            }
        }),
        new BenchmarkStep(
            "FinishAddingItemsToDB",
            async () => {
                await window.addPromise;
            },
            /* ignoreResult = */ true
        ),
        new BenchmarkStep("CompletingAllItems", async () => {
            const numberOfItemsPerIteration = 10;
            const numberOfIterations = 10;
            window.numberOfItemsToAdd = numberOfItemsToAdd;
            for (let j = 0; j < numberOfIterations; j++) {
                const todoList = document.querySelector("todo-app").shadowRoot.querySelector("todo-list");
                const items = todoList.shadowRoot.querySelectorAll("todo-item");
                for (let i = 0; i < numberOfItemsPerIteration; i++) {
                    const item = items[i].shadowRoot.querySelector(".toggle-todo-input");
                    item.click();
                }
                if (j < 9) {
                    const nextPageButton = document
                        .querySelector("todo-app")
                        .shadowRoot.querySelector("todo-bottombar")
                        .shadowRoot.querySelector(".next-page-button");
                    console.log('Clicking next page button', j);
                    nextPageButton.click();
                }
            }
        }),
        new BenchmarkStep(
            "FinishModifyingItemsInDB",
            async () => {
                await window.togglePromise;
            },
            /* ignoreResult = */ true
        ),
        new BenchmarkStep("DeletingAllItems", async () => {
            const numberOfItemsPerIteration = 10;
            const numberOfIterations = 10;
            window.numberOfItemsToAdd = numberOfItemsToAdd;
            function iterationFinishedListener() {
                iterationFinishedListener.promiseResolve();
            }
            window.addEventListener("previous-page-loaded", iterationFinishedListener);
            for (let j = 0; j < numberOfIterations; j++) {
                const iterationFinishedPromise = new Promise((resolve) => {
                    iterationFinishedListener.promiseResolve = resolve;
                });
                const todoList = document.querySelector("todo-app").shadowRoot.querySelector("todo-list");
                const items = todoList.shadowRoot.querySelectorAll("todo-item");
                for (let i = numberOfItemsPerIteration - 1; i >= 0; i--) {
                    const item = items[i].shadowRoot.querySelector(".remove-todo-button");
                    item.click();
                }
                if (j < 9) {
                    const previousPageButton = document
                        .querySelector("todo-app")
                        .shadowRoot.querySelector("todo-bottombar")
                        .shadowRoot.querySelector(".previous-page-button");
                    previousPageButton.click();
                    await iterationFinishedPromise;
                }
            }
        }),
        new BenchmarkStep(
            "FinishDeletingItemsFromDB",
            async () => {
                await window.removePromise;
            },
            /* ignoreResult = */ true
        ),
    ]),
    dexie: new BenchmarkSuite("dexie", [
        new BenchmarkStep(`Adding${numberOfItemsToAdd}Items`, async () => {
            const input = document.querySelector("todo-app").shadowRoot.querySelector("todo-topbar").shadowRoot.querySelector(".new-todo-input");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                input.value = getTodoText(defaultLanguage, i);
                input.dispatchEvent(new Event("input"));
                input.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
            }
        }),
        new BenchmarkStep(
            "FinishAddingItemsToDB",
            async () => {
                await window.addPromise;
            },
            /* ignoreResult = */ true
        ),
        new BenchmarkStep("CompletingAllItems", async () => {
            const numberOfItemsPerIteration = 10;
            const numberOfIterations = 10;
            window.numberOfItemsToAdd = numberOfItemsToAdd;
            for (let j = 0; j < numberOfIterations; j++) {
                const todoList = document.querySelector("todo-app").shadowRoot.querySelector("todo-list");
                const items = todoList.shadowRoot.querySelectorAll("todo-item");
                for (let i = 0; i < numberOfItemsPerIteration; i++) {
                    const item = items[i].shadowRoot.querySelector(".toggle-todo-input");
                    item.click();
                }
                if (j < 9) {
                    const nextPageButton = document
                        .querySelector("todo-app")
                        .shadowRoot.querySelector("todo-bottombar")
                        .shadowRoot.querySelector(".next-page-button");
                    nextPageButton.click();
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }
        }),
        new BenchmarkStep(
            "FinishModifyingItemsInDB",
            async () => {
                await window.completePromise;
            },
            /* ignoreResult = */ true
        ),
        new BenchmarkStep("DeletingAllItems", async () => {
            const numberOfItemsPerIteration = 10;
            const numberOfIterations = 10;
            window.numberOfItemsToAdd = numberOfItemsToAdd;
            function iterationFinishedListener() {
                iterationFinishedListener.promiseResolve();
            }
            window.addEventListener("previous-page-loaded", iterationFinishedListener);
            for (let j = 0; j < numberOfIterations; j++) {
                const iterationFinishedPromise = new Promise((resolve) => {
                    iterationFinishedListener.promiseResolve = resolve;
                });
                const todoList = document.querySelector("todo-app").shadowRoot.querySelector("todo-list");
                const items = todoList.shadowRoot.querySelectorAll("todo-item");
                for (let i = numberOfItemsPerIteration - 1; i >= 0; i--) {
                    const item = items[i].shadowRoot.querySelector(".remove-todo-button");
                    item.click();
                }
                if (j < 9) {
                    const previousPageButton = document
                        .querySelector("todo-app")
                        .shadowRoot.querySelector("todo-bottombar")
                        .shadowRoot.querySelector(".previous-page-button");
                    previousPageButton.click();
                    await iterationFinishedPromise;
                }
            }
        }),
        new BenchmarkStep(
            "FinishDeletingItemsFromDB",
            async () => {
                await window.removePromise;
            },
            /* ignoreResult = */ true
        ),
    ]),
};

export default suites;
