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
    url: "resources/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
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
    url: "resources/todomvc/vanilla-examples/javascript-es5/dist/index.html",
    tags: ["todomvc"],
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
});

Suites.push({
    name: "TodoMVC-JavaScript-ES5-Complex-DOM",
    url: "resources/todomvc/vanilla-examples/javascript-es5-complex/dist/index.html",
    tags: ["todomvc", "complex"],
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
});

Suites.push({
    name: "TodoMVC-JavaScript-ES6-Webpack",
    url: "resources/todomvc/vanilla-examples/javascript-es6-webpack/dist/index.html",
    tags: ["todomvc"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-JavaScript-ES6-Webpack-Complex-DOM",
    url: "resources/todomvc/vanilla-examples/javascript-es6-webpack-complex/dist/index.html",
    tags: ["todomvc", "complex", "complex-default"],
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
});

Suites.push({
    name: "TodoMVC-WebComponents-IndexedDB",
    url: "experimental/javascript-wc-indexeddb/dist/index.html",
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
            true
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
                // // Let the layout update???
                // // Give a change to the pending indexedDB operations to complete in main thread.
                // await new Promise((resolve) => {
                //     setTimeout(() => {resolve();}, 0);
                // });
                if (j < 9) {
                    const nextPageButton = page.querySelector(".next-page-button", ["todo-app", "todo-bottombar"]);
                    nextPageButton.click();
                }
            }
        }),
        new BenchmarkTestStep(
            "FinishModifyingItemsInDB",
            async (page) => {
                await page.getGlobalVariable("completePromise");
            },
            true
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
                // Let the layout update???
                // Give a change to the pending indexedDB operations to complete in main thread.
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve();
                    }, 0);
                });
                if (j < 9) {
                    const previousPageButton = page.querySelector(".previous-page-button", ["todo-app", "todo-bottombar"]);
                    previousPageButton.click();
                    await iterationFinishedPromise;
                }
            }
        }),
        new BenchmarkTestStep(
            "FinishDeletingItemsFromDB",
            async (page) => {
                await page.getGlobalVariable("removePromise");
            },
            true
        ),
    ],
});

Suites.push({
    name: "TodoMVC-WebComponents",
    url: "resources/todomvc/vanilla-examples/javascript-web-components/dist/index.html",
    tags: ["todomvc", "webcomponents"],
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
});

Suites.push({
    name: "TodoMVC-WebComponents-Complex-DOM",
    url: "resources/todomvc/vanilla-examples/javascript-web-components-complex/dist/index.html",
    tags: ["todomvc", "webcomponents", "complex"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-React",
    url: "resources/todomvc/architecture-examples/react/dist/index.html#/home",
    tags: ["todomvc"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-React-Complex-DOM",
    url: "resources/todomvc/architecture-examples/react-complex/dist/index.html#/home",
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
    url: "resources/todomvc/architecture-examples/react-redux/dist/index.html",
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
});

Suites.push({
    name: "TodoMVC-React-Redux-Complex-DOM",
    url: "resources/todomvc/architecture-examples/react-redux-complex/dist/index.html",
    tags: ["todomvc", "complex"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Backbone",
    url: "resources/todomvc/architecture-examples/backbone/dist/index.html",
    tags: ["todomvc"],
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
});

Suites.push({
    name: "TodoMVC-Backbone-Complex-DOM",
    url: "resources/todomvc/architecture-examples/backbone-complex/dist/index.html",
    tags: ["todomvc", "complex"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Angular",
    url: "resources/todomvc/architecture-examples/angular/dist/index.html",
    tags: ["todomvc"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Angular-Complex-DOM",
    url: "resources/todomvc/architecture-examples/angular-complex/dist/index.html",
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
});

Suites.push({
    name: "TodoMVC-Vue",
    url: "resources/todomvc/architecture-examples/vue/dist/index.html",
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
});

Suites.push({
    name: "TodoMVC-Vue-Complex-DOM",
    url: "resources/todomvc/architecture-examples/vue-complex/dist/index.html",
    tags: ["todomvc", "complex", "complex-default"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-jQuery",
    url: "resources/todomvc/architecture-examples/jquery/dist/index.html",
    tags: ["todomvc"],
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
});

Suites.push({
    name: "TodoMVC-jQuery-Complex-DOM",
    url: "resources/todomvc/architecture-examples/jquery-complex/dist/index.html",
    tags: ["todomvc", "complex"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Preact",
    url: "resources/todomvc/architecture-examples/preact/dist/index.html#/home",
    tags: ["todomvc"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Preact-Complex-DOM",
    url: "resources/todomvc/architecture-examples/preact-complex/dist/index.html#/home",
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
    url: "resources/todomvc/architecture-examples/svelte/dist/index.html",
    tags: ["todomvc"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Svelte-Complex-DOM",
    url: "resources/todomvc/architecture-examples/svelte-complex/dist/index.html",
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
    url: "resources/todomvc/architecture-examples/lit/dist/index.html",
    tags: ["todomvc", "webcomponents"],
    disabled: true,
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
});

Suites.push({
    name: "TodoMVC-Lit-Complex-DOM",
    url: "resources/todomvc/architecture-examples/lit-complex/dist/index.html",
    tags: ["todomvc", "webcomponents", "complex", "complex-default"],
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
});

Suites.push({
    name: "NewsSite-Next",
    url: "resources/newssite/news-next/dist/index.html",
    tags: ["newssite", "language"],
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
});

Suites.push({
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

Suites.push({
    name: "NewsSite-Nuxt",
    url: "resources/newssite/news-nuxt/dist/index.html",
    tags: ["newssite"],
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
});

Suites.push({
    name: "Editor-CodeMirror",
    url: "resources/editors/dist/codemirror.html",
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
    name: "Editor-TipTap",
    url: "resources/editors/dist/tiptap.html",
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
    url: "resources/charts/dist/observable-plot.html",
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
    url: "resources/charts/dist/chartjs.html",
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
    url: "resources/react-stockcharts/build/index.html?type=svg",
    tags: ["chart", "svg"],
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
});

Suites.push({
    name: "Perf-Dashboard",
    url: "resources/perf.webkit.org/public/v3/#/charts/?since=1678991819934&paneList=((55-1974-null-null-(5-2.5-500)))",
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
