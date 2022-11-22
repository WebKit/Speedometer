import { BenchmarkTestStep } from "./benchmark-runner.mjs";

const numberOfItemsToAdd = 100;
export const Suites = [];
const ENTER_KEY_CODE = 13;

Suites.push({
    name: 'VanillaJS-TodoMVC',
    url: 'todomvc/vanilla-examples/vanillajs/index.html',
    async prepare(page) {
        (await page.waitForElement('.new-todo')).focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('change'));
                page.triggerEnter(newTodo, 'keypress');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'Vanilla-ES2015-TodoMVC',
    url: 'todomvc/vanilla-examples/es2015/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('change'));
                page.triggerEnter(newTodo, 'keypress');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'Vanilla-ES2015-Babel-Webpack-TodoMVC',
    url: 'todomvc/vanilla-examples/es2015-babel-webpack/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('change'));
                page.triggerEnter(newTodo, 'keypress');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'React-TodoMVC',
    url: 'todomvc/architecture-examples/react/index.html',
    async prepare(page) {
        // FIXME: Move this custom code to the react app.
        page._frame.contentWindow.app.Utils.store = () => {};
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('input', {
                  bubbles: true,
                  cancelable: true
                }));
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'React-Redux-TodoMVC',
    url: 'todomvc/architecture-examples/react-redux/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'EmberJS-TodoMVC',
    url: 'todomvc/architecture-examples/emberjs/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'EmberJS-Debug-TodoMVC',
    url: 'todomvc/architecture-examples/emberjs-debug/index.html',
    async prepare(page) {
        const element = await page.waitForElement('#new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.getElementById("new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'BackboneJS-TodoMVC',
    url: 'todomvc/architecture-examples/backbone/index.html',
    async prepare(page) {
        // FIXME: Move this custom code to the backboneJS app.
        page._frame.contentWindow.Backbone.sync  = () => {};
        await page.waitForElement('#appIsReady');
        const newTodo = page.querySelector('.new-todo');
        newTodo.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keypress');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < numberOfItemsToAdd; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < numberOfItemsToAdd; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'AngularJS-TodoMVC',
    url: 'todomvc/architecture-examples/angularjs/index.html',
    async prepare(page) {
        const element = await page.waitForElement('#new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const submitEvent = document.createEvent('Event');
            submitEvent.initEvent('submit', true, true);
            const inputEvent = document.createEvent('Event');
            inputEvent.initEvent('input', true, true);
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(inputEvent);
                newTodo.form.dispatchEvent(submitEvent);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            for (let i = 0; i < numberOfItemsToAdd; i++)
                page.querySelector('.destroy').click();
        }),
    ]
});

Suites.push({
    name: 'Angular2-TypeScript-TodoMVC',
    url: 'todomvc/architecture-examples/angular/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('input', {
                  bubbles: true,
                  cancelable: true
                }));
                page.triggerEnter(newTodo, 'keyup');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'VueJS-TodoMVC',
    url: 'todomvc/architecture-examples/vuejs-cli/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('input', {
                  bubbles: true,
                  cancelable: true
                }));
                page.triggerEnter(newTodo, 'keyup');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'jQuery-TodoMVC',
    url: 'todomvc/architecture-examples/jquery/index.html',
    async prepare(page) {
        await page.waitForElement('#appIsReady');
        const newTodo = page.getElementById('new-todo');
        newTodo.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keyup');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingAllItems', page => {
            for (let i = 0; i < numberOfItemsToAdd; i++)
                page.querySelector('.destroy').click();
        }),
    ]
})

Suites.push({
    name: 'Preact-TodoMVC',
    url: 'todomvc/architecture-examples/preact/dist/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});

Suites.push({
    name: 'Inferno-TodoMVC',
    url: 'todomvc/architecture-examples/inferno/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('change', {
                  bubbles: true,
                  cancelable: true
                }));
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            const checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            const deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < numberOfItemsToAdd; i++)
                page.querySelector('.destroy').click();
        }),
    ]
});

function processElmWorkQueue(page)
{
    // FIXME: Move code to the Elm app itself.
    const contentWindow = page._frame.contentWindow;
    contentWindow.elmWork();
    const callbacks = contentWindow.rAFCallbackList;
    let i = 0;
    while (i < callbacks.length) {
        callbacks[i]();
        i++;
    }
    contentWindow.rAFCallbackList = [];
}

Suites.push({
    name: 'Elm-TodoMVC',
    url: 'todomvc/functional-prog-examples/elm/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.new-todo');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.querySelector(".new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                newTodo.dispatchEvent(new Event('input', {
                  bubbles: true,
                  cancelable: true
                }));
                processElmWorkQueue(page);
                page.triggerEnter(newTodo, 'keydown');
                processElmWorkQueue(page);
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            let checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++) {
                checkboxes[i].click();
                processElmWorkQueue(page);
            }
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                page.querySelector('.destroy').click();
                processElmWorkQueue(page);
            }
        }),
    ]
});

Suites.push({
    name: 'Flight-TodoMVC',
    url: 'todomvc/dependency-examples/flight/flight/index.html',
    async prepare(page) {
        await page.waitForElement('#appIsReady');
        const newTodo = page.getElementById('new-todo');
        newTodo.focus();
    },
    tests: [
        new BenchmarkTestStep('Adding' + numberOfItemsToAdd + 'Items', page => {
            const newTodo = page.getElementById("new-todo");
            for (let i = 0; i < numberOfItemsToAdd; i++) {
                newTodo.value = 'Something to do ' + i;
                page.triggerEnter(newTodo, 'keydown');
            }
        }),
        new BenchmarkTestStep('CompletingAllItems', page => {
            let checkboxes = page.querySelectorAll('.toggle');
            for (let i = 0; i < checkboxes.length; i++)
                checkboxes[i].click();
        }),
        new BenchmarkTestStep('DeletingItems', page => {
            let deleteButtons = page.querySelectorAll('.destroy');
            for (let i = 0; i < deleteButtons.length; i++)
                deleteButtons[i].click();
        }),
    ]
});
