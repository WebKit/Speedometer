import { BenchmarkTestStep } from "../resources/benchmark-runner.mjs";
import { getTodoText } from "../resources/shared/translations.mjs";
import { numberOfItemsToAdd } from "../resources/shared/todomvc-utils.mjs";

export const ExperimentalSuites = [];

ExperimentalSuites.push({
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
});

ExperimentalSuites.push({
    name: "NewsSite-PostMessage",
    url: "resources/newssite/news-next/dist/index.html",
    tags: ["experimental", "newssite", "language"],
    async prepare() {},
    type: "remote",
    /* config: {
        name: "default", // optional param to target non-default tests locally
    }, */
});

Object.freeze(ExperimentalSuites);
