import { BenchmarkTestStep } from "./benchmark-runner.mjs";

const numberOfItemsToAdd = 100;
export const Suites = [];
const ENTER_KEY_CODE = 13;

let triggerEnter = function (element, type) {
    const event = document.createEvent('Events');
    event.initEvent(type, true, true);
    event.keyCode = ENTER_KEY_CODE;
    event.which = ENTER_KEY_CODE;
    event.key = 'ENTER';
    element.dispatchEvent(event);
}

Suites.push({
    name: 'VanillaJS-TodoMVC',
    url: 'todomvc/vanilla-examples/vanillajs/index.html',
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
                triggerEnter(newTodo, 'keypress');
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
                triggerEnter(newTodo, 'keypress');
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
                triggerEnter(newTodo, 'keypress');
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
        // FIXME: use app code
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
                triggerEnter(newTodo, 'keydown');
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
                triggerEnter(newTodo, 'keydown');
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
                triggerEnter(newTodo, 'keydown');
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
                triggerEnter(newTodo, 'keydown');
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
        // FIXME: use app code
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
                triggerEnter(newTodo, 'keypress');
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
                triggerEnter(newTodo, 'keyup');
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
                triggerEnter(newTodo, 'keyup');
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
                triggerEnter(newTodo, 'keyup');
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
                triggerEnter(newTodo, 'keydown');
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
                triggerEnter(newTodo, 'keydown');
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

function processElmWorkQueue(page) {
    // TODO move workload to test
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
                triggerEnter(newTodo, 'keydown');
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
                triggerEnter(newTodo, 'keydown');
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

const actionCount = 50;
Suites.push({
    disabled: true,
    name: 'FlightJS-MailClient',
    url: 'flightjs-example-app/index.html',
    async prepare(page) {
        const element = await page.waitForElement('.span8');
        element.focus();
    },
    tests: [
        new BenchmarkTestStep('OpeningTabs' + actionCount + 'Times', page => {
            page.getElementById('inbox').click();
            for (let i = 0; i < actionCount; i++) {
                page.getElementById('later').click();
                page.getElementById('sent').click();
                page.getElementById('trash').click();
                page.getElementById('inbox').click();
            }
        }),
        new BenchmarkTestStep('MovingEmails' + actionCount + 'Times', page => {
            page.getElementById('inbox').click();
            for (let i = 0; i < actionCount; i++) {
                page.getElementById('mail_2139').click();
                page.getElementById('move_mail').click();
                page.querySelector('#move_to_selector #later').click();
                page.getElementById('later').click();
                page.getElementById('mail_2139').click();
                page.getElementById('move_mail').click();
                page.querySelector('#move_to_selector #trash').click();
                page.getElementById('trash').click();
                page.getElementById('mail_2139').click();
                page.getElementById('move_mail').click();
                page.querySelector('#move_to_selector #inbox').click();
                page.getElementById('inbox').click();
            }
        }),
        new BenchmarkTestStep('Sending' + actionCount + 'NewEmails', page => {
            for (let i = 0; i < actionCount; i++) {
                page.getElementById('new_mail').click();
                page.getElementById('recipient_select').selectedIndex = 1;
                const subject = page.getElementById('compose_subject');
                const message = page.getElementById('compose_message');
                subject.focus();
                page.$(subject).trigger('keydown');
                page.$(subject).text('Hello');
                message.focus();
                page.$(message).trigger('keydown');
                page.$(message).text('Hello,\n\nThis is a test message.\n\n- WebKitten');
                page.getElementById('send_composed').click();
            }
        }),
    ]
});
