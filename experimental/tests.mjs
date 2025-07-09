import { BenchmarkTestStep } from "../resources/benchmark-runner.mjs";
import { todos } from "../resources/translations.mjs";

// TODO: merge with main tests.mjs
const numberOfItemsToAdd = 100;
const defaultLanguage = "en";

function getTodoText(lang, index) {
    const todosSelection = todos[lang] ?? todos[defaultLanguage];
    const currentIndex = index % todosSelection.length;
    return todosSelection[currentIndex];
}

export const ExperimentalSuites = [];

ExperimentalSuites.push({
    name: "TodoMVC-LocalStorage",
    url: "experimental/todomvc-localstorage/dist/index.html",
    tags: ["todomvc", "experimental"],
    disabled: true,
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
    disabled: true,
    async prepare() {},
    type: "remote",
    /* config: {
        name: "default", // optional param to target non-default tests locally
    }, */
});

Object.freeze(ExperimentalSuites);
