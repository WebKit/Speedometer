import { BenchmarkStep, BenchmarkSuite } from "./speedometer-utils/benchmark.mjs";
import { getTodoText, defaultLanguage } from "./speedometer-utils/translations.mjs";
import { numberOfItemsToAdd } from "./speedometer-utils/todomvc-utils.mjs";

export const appName = "todomvc-indexeddb";
export const appVersion = "1.0.0";
export { numberOfItemsToAdd };

export const promisesEventsNames = {
    add: "db-add-completed",
    toggle: "db-toggle-completed",
    delete: "db-delete-completed",
};

const addPromise = new Promise((resolve) => {
    window.addEventListener(promisesEventsNames.add, () => resolve());
});
const togglePromise = new Promise((resolve) => {
    window.addEventListener(promisesEventsNames.toggle, () => resolve());
});
const deletePromise = new Promise((resolve) => {
    window.addEventListener(promisesEventsNames.delete, () => resolve());
});

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
                await addPromise;
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
                    const nextPageButton = document.querySelector("todo-app").shadowRoot.querySelector("todo-bottombar").shadowRoot.querySelector(".next-page-button");
                    nextPageButton.click();
                }
            }
        }),
        new BenchmarkStep(
            "FinishModifyingItemsInDB",
            async () => {
                await togglePromise;
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
                    const previousPageButton = document.querySelector("todo-app").shadowRoot.querySelector("todo-bottombar").shadowRoot.querySelector(".previous-page-button");
                    previousPageButton.click();
                    await iterationFinishedPromise;
                }
            }
        }),
        new BenchmarkStep(
            "FinishDeletingItemsFromDB",
            async () => {
                await deletePromise;
            },
            /* ignoreResult = */ true
        ),
    ]),
};

export default suites;
