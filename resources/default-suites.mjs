import { BenchmarkTestStep } from "./benchmark-runner.mjs";
import { getTodoText, defaultLanguage } from "./shared/translations.mjs";
import { numberOfItemsToAdd } from "./shared/todomvc-utils.mjs";
import { freezeSuites } from "../resources/suites-helper.mjs";

export const DefaultSuites = freezeSuites([
    {
        name: "TodoMVC-JavaScript-ES5",
        url: "resources/todomvc/vanilla-examples/javascript-es5/dist/index.html",
        tags: ["default", "todomvc"],
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
        name: "TodoMVC-JavaScript-ES5-Complex-DOM",
        url: "resources/todomvc/vanilla-examples/javascript-es5-complex/dist/index.html",
        tags: ["todomvc", "complex"],
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
        name: "TodoMVC-JavaScript-ES6-Webpack",
        url: "resources/todomvc/vanilla-examples/javascript-es6-webpack/dist/index.html",
        tags: ["todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ru", i));
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
        name: "TodoMVC-JavaScript-ES6-Webpack-Complex-DOM",
        url: "resources/todomvc/vanilla-examples/javascript-es6-webpack-complex/dist/index.html",
        tags: ["default", "todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText("ru", i));
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
        name: "TodoMVC-WebComponents",
        url: "resources/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
        tags: ["default", "todomvc", "webcomponents"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText(defaultLanguage, i));
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
        name: "TodoMVC-WebComponents-Complex-DOM",
        url: "resources/todomvc/vanilla-examples/javascript-web-components-complex/dist/index.html",
        tags: ["todomvc", "webcomponents", "complex"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const input = page.querySelector(".new-todo-input", ["todo-app", "todo-topbar"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    input.setValue(getTodoText(defaultLanguage, i));
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
        name: "TodoMVC-React",
        url: "resources/todomvc/architecture-examples/react/dist/index.html#/home",
        tags: ["todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keydown");
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
        name: "TodoMVC-React-Complex-DOM",
        url: "resources/todomvc/architecture-examples/react-complex/dist/index.html#/home",
        tags: ["default", "todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keydown");
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
        name: "TodoMVC-React-Redux",
        url: "resources/todomvc/architecture-examples/react-redux/dist/index.html",
        tags: ["default", "todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-React-Redux-Complex-DOM",
        url: "resources/todomvc/architecture-examples/react-redux-complex/dist/index.html",
        tags: ["todomvc", "complex"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-Backbone",
        url: "resources/todomvc/architecture-examples/backbone/dist/index.html",
        tags: ["default", "todomvc"],
        async prepare(page) {
            await page.waitForElement("#appIsReady");
            const newTodo = page.querySelector(".new-todo");
            newTodo.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
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
        name: "TodoMVC-Backbone-Complex-DOM",
        url: "resources/todomvc/architecture-examples/backbone-complex/dist/index.html",
        tags: ["todomvc", "complex"],
        async prepare(page) {
            await page.waitForElement("#appIsReady");
            const newTodo = page.querySelector(".new-todo");
            newTodo.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
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
        name: "TodoMVC-Angular",
        url: "resources/todomvc/architecture-examples/angular/dist/index.html",
        tags: ["todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keyup");
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
        name: "TodoMVC-Angular-Complex-DOM",
        url: "resources/todomvc/architecture-examples/angular-complex/dist/index.html",
        tags: ["default", "todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keyup");
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
        name: "TodoMVC-Vue",
        url: "resources/todomvc/architecture-examples/vue/dist/index.html",
        tags: ["default", "todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keyup");
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
        name: "TodoMVC-Vue-Complex-DOM",
        url: "resources/todomvc/architecture-examples/vue-complex/dist/index.html",
        tags: ["todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.dispatchEvent("input");
                    newTodo.enter("keyup");
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
        name: "TodoMVC-jQuery",
        url: "resources/todomvc/architecture-examples/jquery/dist/index.html",
        tags: ["default", "todomvc"],
        async prepare(page) {
            await page.waitForElement("#appIsReady");
            const newTodo = page.getElementById("new-todo");
            newTodo.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keyup");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                for (let i = 1; i <= numberOfItemsToAdd; i++)
                    page.querySelector(`li:nth-child(${i}) .toggle`).click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    page.querySelector(".destroy").click();
            }),
        ],
    },
    {
        name: "TodoMVC-jQuery-Complex-DOM",
        url: "resources/todomvc/architecture-examples/jquery-complex/dist/index.html",
        tags: ["todomvc", "complex"],
        async prepare(page) {
            await page.waitForElement("#appIsReady");
            const newTodo = page.getElementById("new-todo");
            newTodo.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keyup");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                for (let i = 1; i <= numberOfItemsToAdd; i++)
                    page.querySelector(`li:nth-child(${i}) .toggle`).click();
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--)
                    page.querySelector(".destroy").click();
            }),
        ],
    },
    {
        name: "TodoMVC-Preact",
        url: "resources/todomvc/architecture-examples/preact/dist/index.html#/home",
        tags: ["todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-Preact-Complex-DOM",
        url: "resources/todomvc/architecture-examples/preact-complex/dist/index.html#/home",
        tags: ["default", "todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-Svelte",
        url: "resources/todomvc/architecture-examples/svelte/dist/index.html",
        tags: ["todomvc"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-Svelte-Complex-DOM",
        url: "resources/todomvc/architecture-examples/svelte-complex/dist/index.html",
        tags: ["default", "todomvc", "complex", "complex-default"],
        async prepare(page) {
            const element = await page.waitForElement(".new-todo");
            element.focus();
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo");
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
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
        name: "TodoMVC-Lit",
        url: "resources/todomvc/architecture-examples/lit/dist/index.html",
        tags: ["todomvc", "webcomponents"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo", ["todo-app", "todo-form"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const todoItems = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    const checkbox = todoItems[i].querySelectorInShadowRoot(".toggle");
                    checkbox.click();
                }
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const todoItems = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--) {
                    const deleteButton = todoItems[i].querySelectorInShadowRoot(".destroy");
                    deleteButton.click();
                }
            }),
        ],
    },
    {
        name: "TodoMVC-Lit-Complex-DOM",
        url: "resources/todomvc/architecture-examples/lit-complex/dist/index.html",
        tags: ["default", "todomvc", "webcomponents", "complex", "complex-default"],
        async prepare(page) {
            await page.waitForElement("todo-app");
        },
        tests: [
            new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
                const newTodo = page.querySelector(".new-todo", ["todo-app", "todo-form"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    newTodo.setValue(getTodoText(defaultLanguage, i));
                    newTodo.enter("keydown");
                }
            }),
            new BenchmarkTestStep("CompletingAllItems", (page) => {
                const todoItems = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = 0; i < numberOfItemsToAdd; i++) {
                    const checkbox = todoItems[i].querySelectorInShadowRoot(".toggle");
                    checkbox.click();
                }
            }),
            new BenchmarkTestStep("DeletingAllItems", (page) => {
                const todoItems = page.querySelectorAll("todo-item", ["todo-app", "todo-list"]);
                for (let i = numberOfItemsToAdd - 1; i >= 0; i--) {
                    const deleteButton = todoItems[i].querySelectorInShadowRoot(".destroy");
                    deleteButton.click();
                }
            }),
        ],
    },
    {
        name: "NewsSite-Next",
        url: "resources/newssite/news-next/dist/index.html",
        tags: ["default", "newssite", "language"],
        async prepare(page) {
            await page.waitForElement("#navbar-dropdown-toggle");
        },
        tests: [
            new BenchmarkTestStep("NavigateToUS", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-us-link").click();
                page.layout();
            }),
            new BenchmarkTestStep("NavigateToWorld", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-world-link").click();
                page.layout();
            }),
            new BenchmarkTestStep("NavigateToPolitics", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-politics-link").click();
                page.layout();
            }),
        ],
    },
    {
        name: "NewsSite-Nuxt",
        url: "resources/newssite/news-nuxt/dist/index.html",
        tags: ["default", "newssite"],
        async prepare(page) {
            await page.waitForElement("#navbar-dropdown-toggle");
        },
        tests: [
            new BenchmarkTestStep("NavigateToUS", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-us-link").click();
                page.layout();
            }),
            new BenchmarkTestStep("NavigateToWorld", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-world-link").click();
                page.layout();
            }),
            new BenchmarkTestStep("NavigateToPolitics", (page) => {
                for (let i = 0; i < 25; i++) {
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                    page.querySelector("#navbar-dropdown-toggle").click();
                    page.layout();
                }
                page.querySelector("#navbar-navlist-politics-link").click();
                page.layout();
            }),
        ],
    },
    {
        name: "Editor-CodeMirror",
        url: "resources/editors/dist/codemirror.html",
        tags: ["default", "editor"],
        async prepare(page) {},
        tests: [
            new BenchmarkTestStep("Long", (page) => {
                page.querySelector("#create").click();
                page.querySelector("#layout").click();
                page.querySelector("#long").click();
                page.querySelector("#layout").click();
            }),
            new BenchmarkTestStep("Highlight", (page) => {
                page.querySelector("#highlight").click();
                page.querySelector("#layout").click();
            }),
        ],
    },
    {
        name: "Editor-TipTap",
        url: "resources/editors/dist/tiptap.html",
        tags: ["default", "editor"],
        async prepare(page) {},
        tests: [
            new BenchmarkTestStep("Long", (page) => {
                page.querySelector("#create").click();
                page.querySelector("#layout").click();
                page.querySelector("#long").click();
                page.querySelector("#layout").click();
            }),
            new BenchmarkTestStep("Highlight", (page) => {
                page.querySelector("#highlight").click();
                page.querySelector("#layout").click();
            }),
        ],
    },
    {
        name: "Charts-observable-plot",
        url: "resources/charts/dist/observable-plot.html",
        tags: ["default", "chart"],
        async prepare(page) {},
        tests: [
            new BenchmarkTestStep("Stacked by 6", (page) => {
                page.querySelector("#prepare").click();
                page.querySelector("#reset").click();
                page.querySelector("#add-stacked-chart-button").click();
            }),
            new BenchmarkTestStep("Stacked by 20", (page) => {
                const sizeSlider = page.querySelector("#airport-group-size-input");
                sizeSlider.setValue(20);
                sizeSlider.dispatchEvent("input");
                sizeSlider.dispatchEvent("change");
                page.querySelector("#prepare").click();
                page.querySelector("#reset").click();
                page.querySelector("#add-stacked-chart-button").click();
            }),
            new BenchmarkTestStep("Dotted", (page) => {
                page.querySelector("#reset").click();
                page.querySelector("#add-dotted-chart-button").click();
            }),
        ],
    },
    {
        name: "Charts-chartjs",
        url: "resources/charts/dist/chartjs.html",
        tags: ["default", "chart"],
        async prepare(page) {},
        tests: [
            new BenchmarkTestStep("Draw scatter", (page) => {
                page.querySelector("#prepare").click();
                page.querySelector("#add-scatter-chart-button").click();
            }),
            new BenchmarkTestStep("Show tooltip", (page) => {
                page.querySelector("#open-tooltip").click();
            }),
            new BenchmarkTestStep("Draw opaque scatter", (page) => {
                page.querySelector("#opaque-color").click();
                page.querySelector("#add-scatter-chart-button").click();
            }),
        ],
    },
    {
        name: "React-Stockcharts-SVG",
        url: "resources/react-stockcharts/build/index.html?type=svg",
        tags: ["default", "chart", "svg"],
        async prepare(page) {
            await page.waitForElement("#render");
        },
        tests: [
            new BenchmarkTestStep("Render", (page) => {
                page.getElementById("render").click();
            }),
            new BenchmarkTestStep("PanTheChart", (page) => {
                const cursor = page.querySelector(".react-stockcharts-crosshair-cursor");
                let x = 150;
                let y = 200;
                const coords = (i) => ({ clientX: x + i * 10, clientY: y + i * 2, bubbles: true, cancelable: true });
                for (let i = 0; i < 5; i++) {
                    cursor.dispatchEvent("mousedown", coords(0), MouseEvent);
                    for (let j = 0; j < 10; j++)
                        cursor.dispatchEvent("mousemove", coords(j), MouseEvent);
                    cursor.dispatchEvent("mouseup", coords(10), MouseEvent);
                }
            }),
            new BenchmarkTestStep("ZoomTheChart", (page) => {
                const cursor = page.querySelector(".react-stockcharts-crosshair-cursor");
                let event = {
                    clientX: 200,
                    clientY: 200,
                    deltaMode: 0,
                    delta: -10,
                    deltaY: -10,
                    bubbles: true,
                    cancelable: true,
                };
                for (let i = 0; i < 15; i++)
                    cursor.dispatchEvent("wheel", event, WheelEvent);
            }),
        ],
    },
    {
        name: "Perf-Dashboard",
        url: "resources/perf.webkit.org/public/v3/#/charts/?since=1678991819934&paneList=((55-1974-null-null-(5-2.5-500)))",
        tags: ["default", "chart", "webcomponents"],
        async prepare(page) {
            await page.waitForElement("#app-is-ready");
            page.call("startTest");
            page.callAsync("serviceRAF");
            await new Promise((resolve) => setTimeout(resolve, 1));
        },
        tests: [
            new BenchmarkTestStep("Render", (page) => {
                page.call("openCharts");
                page.call("serviceRAF");
            }),
            new BenchmarkTestStep("SelectingPoints", (page) => {
                const chartPane = page.callToGetElement("getChartPane");
                for (let i = 0; i < 20; ++i) {
                    chartPane.dispatchKeyEvent("keydown", 39 /* Right */, "ArrowRight");
                    page.call("serviceRAF");
                }
            }),
            new BenchmarkTestStep("SelectingRange", (page) => {
                const canvas = page.callToGetElement("getChartCanvas");
                const startingX = 118;
                const startingY = 155;
                const endingX = 210;
                const endingY = 121;
                canvas.dispatchMouseEvent("mousedown", startingX, startingY);
                page.call("serviceRAF");
                const movementCount = 20;
                for (let i = 0; i <= movementCount; ++i) {
                    canvas.dispatchMouseEvent("mousemove", startingX + ((endingX - startingX) * i) / movementCount, startingY + ((endingY - startingY) * i) / movementCount);
                    page.call("serviceRAF");
                }
                canvas.dispatchMouseEvent("mouseup", endingX, endingY);
                page.call("serviceRAF");
            }),
        ],
    },
]);
