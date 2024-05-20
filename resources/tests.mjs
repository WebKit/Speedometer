import { BenchmarkTestStep } from "./benchmark-runner.mjs";
import { todos } from "./translations.mjs";

const numberOfItemsToAdd = 100;
const defaultLanguage = "en";

function getTodoText(lang, index) {
    const todosSelection = todos[lang] ?? todos[defaultLanguage];
    const currentIndex = index % todosSelection.length;
    return todosSelection[currentIndex];
}

export const Suites = [];

Suites.enable = function (names, tags) {
    if (names?.length) {
        const lowerCaseNames = names.map((each) => each.toLowerCase());
        this.forEach((suite) => {
            if (lowerCaseNames.includes(suite.name.toLowerCase()))
                suite.disabled = false;
            else
                suite.disabled = true;
        });
    } else if (tags?.length) {
        tags.forEach((tag) => {
            if (!Tags.has(tag))
                console.error(`Unknown Suites tag: "${tag}"`);
        });
        const tagsSet = new Set(tags);
        this.forEach((suite) => {
            suite.disabled = !suite.tags.some((tag) => tagsSet.has(tag));
        });
    } else {
        console.warn("Neither names nor tags provided. Enabling all default suites.");
        this.forEach((suite) => {
            suite.disabled = !("default" in suite.tags);
        });
    }
    if (this.some((suite) => !suite.disabled))
        return;
    let message, debugInfo;
    if (names?.length) {
        message = `Suites "${names}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedNames: names,
            validNames: this.map((each) => each.name),
        };
    } else if (tags?.length) {
        message = `Tags "${tags}" does not match any Suite. No tests to run.`;
        debugInfo = {
            providedTags: tags,
            validTags: Array.from(Tags),
        };
    }
    alert(message);
    console.error(message, debugInfo);
};

Suites.push({
    name: "TodoMVC-LocalStorage",
    url: "experimental/todomvc-localstorage/dist/index.html",
    tags: ["todomvc"],
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

Suites.push({
    name: "TodoMVC-Emoji",
    url: "/workloads/todomvc-web-components/",
    tags: ["todomvc", "experimental"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-JavaScript-ES5",
    url: "/workloads/todomvc-es5/",
    tags: ["todomvc"],
    async prepare(page) {},
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

Suites.push({
    name: "TodoMVC-JavaScript-ES5-Complex-DOM",
    url: "/workloads/todomvc-es5-complex/",
    tags: ["todomvc", "complex"],
    disabled: true,
    async prepare(page) {},
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

Suites.push({
    name: "TodoMVC-JavaScript-ES6-Webpack",
    url: "/workloads/todomvc-es6-webpack/",
    tags: ["todomvc"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-JavaScript-ES6-Webpack-Complex-DOM",
    url: "/workloads/todomvc-es6-webpack-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-WebComponents",
    url: "/workloads/todomvc-web-components/",
    tags: ["todomvc", "webcomponents"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-WebComponents-Complex-DOM",
    url: "/workloads/todomvc-web-components-complex/",
    tags: ["todomvc", "webcomponents", "complex"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-React",
    url: "/workloads/todomvc-react/",
    tags: ["todomvc"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-React-Complex-DOM",
    url: "/workloads/todomvc-react-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-React-Redux",
    url: "/workloads/todomvc-react-redux/",
    tags: ["todomvc"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-React-Redux-Complex-DOM",
    url: "/workloads/todomvc-react-redux-complex/",
    tags: ["todomvc", "complex"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Backbone",
    url: "/workloads/todomvc-backbone/",
    tags: ["todomvc"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Backbone-Complex-DOM",
    url: "/workloads/todomvc-backbone-complex/",
    tags: ["todomvc", "complex"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Angular",
    url: "/workloads/todomvc-angular/",
    tags: ["todomvc"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Angular-Complex-DOM",
    url: "/workloads/todomvc-angular-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Vue",
    url: "/workloads/todomvc-vue/",
    tags: ["todomvc"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Vue-Complex-DOM",
    url: "/workloads/todomvc-vue-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-jQuery",
    url: "/workloads/todomvc-jquery/",
    tags: ["todomvc"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-jQuery-Complex-DOM",
    url: "/workloads/todomvc-jquery-complex/",
    tags: ["todomvc", "complex"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Preact",
    url: "/workloads/todomvc-preact/",
    tags: ["todomvc"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Preact-Complex-DOM",
    url: "/workloads/todomvc-preact-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Svelte",
    url: "/workloads/todomvc-svelte/",
    tags: ["todomvc"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Svelte-Complex-DOM",
    url: "/workloads/todomvc-svelte-complex/",
    tags: ["todomvc", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Lit",
    url: "/workloads/todomvc-lit/",
    tags: ["todomvc", "webcomponents"],
    disabled: true,
    async prepare(page) {},
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
});

Suites.push({
    name: "TodoMVC-Lit-Complex-DOM",
    url: "/workloads/todomvc-lit-complex/",
    tags: ["todomvc", "webcomponents", "complex", "complex-default"],
    async prepare(page) {},
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
});

Suites.push({
    name: "NewsSite-Next",
    url: "/workloads/news-site-next/",
    tags: ["newssite", "language"],
    async prepare(page) {},
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
});

Suites.push({
    name: "NewsSite-Nuxt",
    url: "/workloads/news-site-nuxt/",
    tags: ["newssite"],
    async prepare(page) {},
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
});

Suites.push({
    name: "Editor-CodeMirror",
    url: "/workloads/editors-codemirror/",
    tags: ["editor"],
    async prepare(page) {},
    disabled: true,
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
});

Suites.push({
    name: "Editor-TipTap",
    url: "/workloads/editors-tiptap/",
    tags: ["editor"],
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
});

Suites.push({
    name: "Charts-observable-plot",
    url: "/workloads/charts-observable-plot/",
    tags: ["chart"],
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
});

Suites.push({
    name: "Charts-chartjs",
    url: "/workloads/charts-chartjs/",
    tags: ["chart"],
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
});

Suites.push({
    name: "React-Stockcharts-SVG",
    url: "/workloads/charts-react-stockcharts/index.html?type=svg",
    tags: ["chart", "svg"],
    async prepare(page) {},
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
});

Suites.push({
    name: "Perf-Dashboard",
    url: "/workloads/perf.webkit.org/v3/#/charts/?since=1678991819934&paneList=((55-1974-null-null-(5-2.5-500)))",
    tags: ["chart", "webcomponents"],
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
});

Object.freeze(Suites);
Suites.forEach((suite) => {
    if (!suite.tags)
        suite.tags = [];
    if (suite.url.startsWith("experimental/"))
        suite.tags.unshift("all", "experimental");
    else if (suite.disabled)
        suite.tags.unshift("all");
    else
        suite.tags.unshift("all", "default");
    Object.freeze(suite.tags);
    Object.freeze(suite.steps);
});

export const Tags = new Set(["all", "default", "experimental", ...Suites.flatMap((suite) => suite.tags)]);
Object.freeze(Tags);

globalThis.Suites = Suites;
globalThis.Tags = Tags;
