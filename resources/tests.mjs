import { BenchmarkTestStep } from "./benchmark-runner.mjs";

const numberOfItemsToAdd = 100;
export const Suites = [];

Suites.enable = function (names) {
    const lowerCaseNames = names.map((each) => each.toLowerCase());
    let found = false;
    this.forEach((suite) => {
        if (lowerCaseNames.includes(suite.name.toLowerCase())) {
            suite.disabled = false;
            found = true;
        } else {
            suite.disabled = true;
        }
    });
    return found;
};

Suites.push({
    name: "TodoMVC-JavaScript-ES5",
    url: "todomvc/vanilla-examples/javascript-es5/dist/index.html",
    async prepare(page) {
        (await page.waitForElement(".new-todo")).focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-JavaScript-ES6",
    url: "todomvc/vanilla-examples/javascript-es6/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-JavaScript-ES6-Webpack",
    url: "todomvc/vanilla-examples/javascript-es6-webpack/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-React",
    url: "todomvc/architecture-examples/react/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-React-Redux",
    url: "todomvc/architecture-examples/react-redux/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Backbone",
    url: "todomvc/architecture-examples/backbone/dist/index.html",
    async prepare(page) {
        await page.waitForElement("#appIsReady");
        const newTodo = page.querySelector(".new-todo");
        newTodo.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Angular",
    url: "todomvc/architecture-examples/angular/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Vue",
    url: "todomvc/architecture-examples/vue/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-jQuery",
    url: "todomvc/architecture-examples/jquery/dist/index.html",
    async prepare(page) {
        await page.waitForElement("#appIsReady");
        const newTodo = page.getElementById("new-todo");
        newTodo.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
                newTodo.enter("keyup");
            }
        }),
        new BenchmarkTestStep("CompletingAllItems", (page) => {
            const checkboxes = page.querySelectorAll(".toggle");
            for (let i = 0; i < numberOfItemsToAdd; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep("DeletingAllItems", (page) => {
            for (let i = 0; i < numberOfItemsToAdd; i++)
                page.querySelector(".destroy").click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Preact",
    url: "todomvc/architecture-examples/preact/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "TodoMVC-Svelte",
    url: "todomvc/architecture-examples/svelte/dist/index.html",
    async prepare(page) {
        const element = await page.waitForElement(".new-todo");
        element.focus();
    },
    tests: [
        new BenchmarkTestStep(`Adding${numberOfItemsToAdd}Items`, (page) => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.setValue(`Something to do ${i}`);
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
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ],
});

Suites.push({
    name: "Editor-CodeMirror",
    url: "tentative/editors/dist/codemirror.html",
    async prepare(page) {},
    tests: [
        new BenchmarkTestStep("Create", (page) => {
            page.querySelector("#create").click();
            page.querySelector("#layout").click();
        }),
        new BenchmarkTestStep("Big", (page) => {
            page.querySelector("#big").click();
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
    url: "tentative/editors/dist/tiptap.html",
    async prepare(page) {},
    tests: [
        new BenchmarkTestStep("Create", (page) => {
            page.querySelector("#create").click();
            page.querySelector("#layout").click();
        }),
        new BenchmarkTestStep("Big", (page) => {
            page.querySelector("#big").click();
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
    url: "tentative/charts/dist/observable-plot.html",
    async prepare(page) {},
    tests: [
        new BenchmarkTestStep("Prepare", (page) => {
            page.querySelector("#prepare").click();
        }),
        new BenchmarkTestStep("Stacked", (page) => {
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
    name: "React-Stockcharts",
    url: "tentative/react-stockcharts/build/index.html?type=hybrid",
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
            for (let i = 0; i < 100; ) {
                cursor.dispatchEvent("mousedown", coords(i), MouseEvent);
                for (let j = 10; j--; )
                    cursor.dispatchEvent("mousemove", coords(++i), MouseEvent);
                cursor.dispatchEvent("mouseup", coords(i), MouseEvent);
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
            for (let i = 0; i < 30; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);

            event = {
                clientX: 650,
                clientY: 200,
                deltaMode: 0,
                delta: 10,
                deltaY: 10,
                bubbles: true,
                cancelable: true,
            };
            for (let i = 0; i < 10; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);

            event = {
                clientX: 200,
                clientY: 200,
                deltaMode: 0,
                delta: -10,
                deltaY: -10,
                bubbles: true,
                cancelable: true,
            };
            for (let i = 0; i < 10; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);
        }),
    ],
});

Suites.push({
    name: "React-Stockcharts-SVG",
    url: "tentative/react-stockcharts/build/index.html?type=svg",
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
            for (let i = 0; i < 100; ) {
                cursor.dispatchEvent("mousedown", coords(i), MouseEvent);
                for (let j = 10; j--; )
                    cursor.dispatchEvent("mousemove", coords(++i), MouseEvent);
                cursor.dispatchEvent("mouseup", coords(i), MouseEvent);
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
            for (let i = 0; i < 30; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);

            event = {
                clientX: 650,
                clientY: 200,
                deltaMode: 0,
                delta: 10,
                deltaY: 10,
                bubbles: true,
                cancelable: true,
            };
            for (let i = 0; i < 10; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);

            event = {
                clientX: 200,
                clientY: 200,
                deltaMode: 0,
                delta: -10,
                deltaY: -10,
                bubbles: true,
                cancelable: true,
            };
            for (let i = 0; i < 10; i++)
                cursor.dispatchEvent("wheel", event, WheelEvent);
        }),
    ],
});

Object.freeze(Suites);
globalThis.Suites = Suites;
