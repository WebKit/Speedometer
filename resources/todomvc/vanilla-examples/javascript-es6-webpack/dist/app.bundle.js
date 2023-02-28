/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/helpers.js


// Get element(s) by CSS selector:
const qs = (selector, scope) => {
    return (scope || document).querySelector(selector);
};

const qsa = (selector, scope) => {
    return (scope || document).querySelectorAll(selector);
};

// addEventListener wrapper:
const $on = (target, type, callback, useCapture) => {
    target.addEventListener(type, callback, !!useCapture);
};

// Attach a handler to event for all elements that match the selector,
// now or in the future, based on a root element
const $delegate = (target, selector, type, handler) => {
    // https://developer.mozilla.org/en-US/docs/Web/Events/blur
    const useCapture = type === "blur" || type === "focus";
    $on(target, type, dispatchEvent, useCapture);

    function dispatchEvent(event) {
        const targetElement = event.target;
        const potentialElements = qsa(selector, target);
        const hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

        if (hasMatch) {
            handler.call(targetElement, event);
        }
    }
};

// Find the element's parent with the given tag name:
// $parent(qs('a'), 'div');
const $parent = (element, tagName) => {
    if (!element.parentNode) {
        return undefined;
    }
    if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
        return element.parentNode;
    }
    return $parent(element.parentNode, tagName);
};

// removes an element from an array
// const x = [1,2,3]
// remove(x, 2)
// x ~== [1,3]
const remove = (array, thing) => {
    const index = array.indexOf(thing);
    if (index === -1) {
        return array;
    }

    return array.splice(index, 1);
};

// Allow for looping on nodes by chaining:
// qsa('.foo').forEach(function () {})
NodeList.prototype.forEach = Array.prototype.forEach;

;// CONCATENATED MODULE: ./src/view.js
/* eslint no-invalid-this: 0, complexity:[2, 9] */


const ENTER_KEY = 13;
const ESCAPE_KEY = 27;

const _setFilter = (currentPage) => {
    qs(".filters .selected").className = "";
    qs(`.filters [href="#/${currentPage}"]`).className = "selected";
};

const _elementComplete = (id, completed) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem) {
        return;
    }

    listItem.className = completed ? "completed" : "";

    // In case it was toggled from an event and not by clicking the checkbox
    qs("input", listItem).checked = completed;
};

const _editItem = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem) {
        return;
    }

    listItem.className = `${listItem.className} editing`;

    const input = document.createElement("input");
    input.className = "edit";

    listItem.appendChild(input);
    input.focus();
    input.value = title;
};

const _editItemDone = (id, title) => {
    const listItem = qs(`[data-id="${id}"]`);

    if (!listItem) {
        return;
    }

    const input = qs("input.edit", listItem);
    listItem.removeChild(input);

    listItem.className = listItem.className.replace(" editing", "");

    qsa("label", listItem).forEach((label) => {
        label.textContent = title;
    });
};

const _itemId = (element) => {
    const li = $parent(element, "li");
    return parseInt(li.dataset.id, 10);
};

const _removeItem = (id, list) => {
    const elem = qs(`[data-id="${id}"]`);

    if (elem) {
        list.removeChild(elem);
    }
};

/**
 * View that abstracts away the browser's DOM completely.
 * It has two simple entry points:
 *
 *   - bind(eventName, handler)
 *     Takes a todo application event and registers the handler
 *   - render(command, parameterObject)
 *     Renders the given command with the options
 */
class View {
    constructor(template) {
        this.template = template;

        this.$todoList = qs(".todo-list");
        this.$todoItemCounter = qs(".todo-count");
        this.$clearCompleted = qs(".clear-completed");
        this.$main = qs(".main");
        this.$footer = qs(".footer");
        this.$toggleAll = qs(".toggle-all");
        this.$newTodo = qs(".new-todo");

        this.render = this.render.bind(this);
        this.bindCallback = this.bindCallback.bind(this);
    }

    _clearCompletedButton(completedCount, visible) {
        this.$clearCompleted.innerHTML = this.template.clearCompletedButton(completedCount);
        this.$clearCompleted.style.display = visible ? "block" : "none";
    }

    // eslint-disable-next-line complexity
    render(viewCmd, parameter) {
        switch (viewCmd) {
            case "showEntries":
                this.$todoList.innerHTML = this.template.show(parameter);
                break;
            case "updateElementCount":
                this.$todoItemCounter.innerHTML = this.template.itemCounter(parameter);
                break;
            case "contentBlockVisibility":
                this.$main.style.display = this.$footer.style.display = parameter.visible ? "block" : "none";
                break;
            case "toggleAll":
                this.$toggleAll.checked = parameter.checked;
                break;
            case "clearNewTodo":
                this.$newTodo.value = "";
                break;
            case "removeItem":
                _removeItem(parameter, this.$todoList);
                break;
            case "setFilter":
                _setFilter(parameter);
                break;
            case "elementComplete":
                _elementComplete(parameter.id, parameter.completed);
                break;
            case "editItem":
                _editItem(parameter.id, parameter.title);
                break;
            case "editItemDone":
                _editItemDone(parameter.id, parameter.title);
                break;
            case "clearCompletedButton":
                this._clearCompletedButton(parameter.completed, parameter.visible, this.clearCompletedButton);
                break;
        }
    }

    bindCallback(event, handler) {
        switch (event) {
            case "newTodo":
                $on(this.$newTodo, "change", () => handler(this.$newTodo.value));
                break;
            case "removeCompleted":
                $on(this.$clearCompleted, "click", handler);
                break;
            case "toggleAll":
                $on(this.$toggleAll, "click", (e) => handler({ completed: e.target.checked }));
                break;
            case "itemEdit":
                $delegate(this.$todoList, "li label", "dblclick", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemRemove":
                $delegate(this.$todoList, ".destroy", "click", (e) => handler({ id: _itemId(e.target) }));
                break;
            case "itemToggle":
                $delegate(this.$todoList, ".toggle", "click", (e) => handler({ id: _itemId(e.target), completed: e.target.checked }));
                break;
            case "itemEditDone":
                $delegate(this.$todoList, "li .edit", "blur", function (e) {
                    if (!e.target.dataset.iscanceled) {
                        handler({
                            id: _itemId(e.target),
                            title: e.target.value,
                        });
                    }
                });
                $delegate(this.$todoList, "li .edit", "keypress", function (e) {
                    if (e.keyCode === ENTER_KEY) {
                        e.target.blur();
                    }
                });
                break;
            case "itemEditCancel":
                $delegate(this.$todoList, "li .edit", "keyup", (e) => {
                    if (e.keyCode === ESCAPE_KEY) {
                        e.target.dataset.iscanceled = true;
                        e.target.blur();
                        handler({ id: _itemId(e.target) });
                    }
                });
                break;
        }
    }
}

;// CONCATENATED MODULE: ./src/controller.js
class Controller {
    /**
     * Take a model & view, then act as controller between them
     * @param  {object} model The model instance
     * @param  {object} view  The view instance
     */
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.bindCallback("newTodo", (title) => this.addItem(title));
        this.view.bindCallback("itemEdit", (item) => this.editItem(item.id));
        this.view.bindCallback("itemEditDone", (item) => this.editItemSave(item.id, item.title));
        this.view.bindCallback("itemEditCancel", (item) => this.editItemCancel(item.id));
        this.view.bindCallback("itemRemove", (item) => this.removeItem(item.id));
        this.view.bindCallback("itemToggle", (item) => this.toggleComplete(item.id, item.completed));
        this.view.bindCallback("removeCompleted", () => this.removeCompletedItems());
        this.view.bindCallback("toggleAll", (status) => this.toggleAll(status.completed));
    }

    /**
     * Load & Initialize the view
     * @param {string}  '' | 'active' | 'completed'
     */
    setView(hash) {
        const route = hash.split("/")[1];
        const page = route || "";
        this._updateFilter(page);
    }

    /**
     * Event fires on load. Gets all items & displays them
     */
    showAll() {
        this.model.read((data) => this.view.render("showEntries", data));
    }

    /**
     * Renders all active tasks
     */
    showActive() {
        this.model.read({ completed: false }, (data) => this.view.render("showEntries", data));
    }

    /**
     * Renders all completed tasks
     */
    showCompleted() {
        this.model.read({ completed: true }, (data) => this.view.render("showEntries", data));
    }

    /**
     * An event to fire whenever you want to add an item. Simply pass in the event
     * object and it'll handle the DOM insertion and saving of the new item.
     */
    addItem(title) {
        if (title.trim() === "") {
            return;
        }

        this.model.create(title, () => {
            this.view.render("clearNewTodo");
            this._filter(true);
        });
    }

    /*
     * Triggers the item editing mode.
     */
    editItem(id) {
        this.model.read(id, (data) => {
            let title = data[0].title;
            this.view.render("editItem", { id, title });
        });
    }

    /*
     * Finishes the item editing mode successfully.
     */
    editItemSave(id, title) {
        title = title.trim();

        if (title.length !== 0) {
            this.model.update(id, { title }, () => {
                this.view.render("editItemDone", { id, title });
            });
        } else {
            this.removeItem(id);
        }
    }

    /*
     * Cancels the item editing mode.
     */
    editItemCancel(id) {
        this.model.read(id, (data) => {
            const title = data[0].title;
            this.view.render("editItemDone", { id, title });
        });
    }

    /**
     * Find the DOM element with given ID,
     * Then remove it from DOM & Storage
     */
    removeItem(id) {
        this.model.remove(id, () => this.view.render("removeItem", id));
        this._filter();
    }

    /**
     * Will remove all completed items from the DOM and storage.
     */
    removeCompletedItems() {
        this.model.read({ completed: true }, (data) => {
            for (let item of data) {
                this.removeItem(item.id);
            }
        });

        this._filter();
    }

    /**
     * Give it an ID of a model and a checkbox and it will update the item
     * in storage based on the checkbox's state.
     *
     * @param {number} id The ID of the element to complete or uncomplete
     * @param {object} checkbox The checkbox to check the state of complete
     *                          or not
     * @param {boolean|undefined} silent Prevent re-filtering the todo items
     */
    toggleComplete(id, completed, silent) {
        this.model.update(id, { completed }, () => {
            this.view.render("elementComplete", { id, completed });
        });

        if (!silent) {
            this._filter();
        }
    }

    /**
     * Will toggle ALL checkboxes' on/off state and completeness of models.
     * Just pass in the event object.
     */
    toggleAll(completed) {
        this.model.read({ completed: !completed }, (data) => {
            for (let item of data) {
                this.toggleComplete(item.id, completed, true);
            }
        });

        this._filter();
    }

    /**
     * Updates the pieces of the page which change depending on the remaining
     * number of todos.
     */
    _updateCount() {
        this.model.getCount((todos) => {
            const completed = todos.completed;
            const visible = completed > 0;
            const checked = completed === todos.total;

            this.view.render("updateElementCount", todos.active);
            this.view.render("clearCompletedButton", { completed, visible });

            this.view.render("toggleAll", { checked });
            this.view.render("contentBlockVisibility", { visible: todos.total > 0 });
        });
    }

    /**
     * Re-filters the todo items, based on the active route.
     * @param {boolean|undefined} force  forces a re-painting of todo items.
     */
    _filter(force) {
        const active = this._activeRoute;
        const activeRoute = active.charAt(0).toUpperCase() + active.substr(1);

        // Update the elements on the page, which change with each completed todo
        this._updateCount();

        // If the last active route isn't "All", or we're switching routes, we
        // re-create the todo item elements, calling:
        //   this.show[All|Active|Completed]()
        if (force || this._lastActiveRoute !== "All" || this._lastActiveRoute !== activeRoute) {
            this[`show${activeRoute}`]();
        }

        this._lastActiveRoute = activeRoute;
    }

    /**
     * Simply updates the filter nav's selected states
     */
    _updateFilter(currentPage) {
        // Store a reference to the active route, allowing us to re-filter todo
        // items as they are marked complete or incomplete.
        this._activeRoute = currentPage;

        if (currentPage === "") {
            this._activeRoute = "All";
        }

        this._filter();

        this.view.render("setFilter", currentPage);
    }
}

/* harmony default export */ const controller = (Controller);

;// CONCATENATED MODULE: ./src/model.js
/**
 * Creates a new Model instance and hooks up the storage.
 * @constructor
 * @param {object} storage A reference to the client side storage class
 */
class Model {
    constructor(storage) {
        this.storage = storage;
    }

    /**
     * Creates a new todo model
     *
     * @param {string} [title] The title of the task
     * @param {function} [callback] The callback to fire after the model is created
     */
    create(title, callback) {
        title = title || "";

        const newItem = {
            title: title.trim(),
            completed: false,
        };

        this.storage.save(newItem, callback);
    }

    /**
     * Finds and returns a model in storage. If no query is given it'll simply
     * return everything. If you pass in a string or number it'll look that up as
     * the ID of the model to find. Lastly, you can pass it an object to match
     * against.
     *
     * @param {string|number|object} [query] A query to match models against
     * @param {function} [callback] The callback to fire after the model is found
     *
     * @example
     * model.read(1, func) // Will find the model with an ID of 1
     * model.read('1') // Same as above
     * //Below will find a model with foo equalling bar and hello equalling world.
     * model.read({ foo: 'bar', hello: 'world' })
     */
    read(query, callback) {
        const queryType = typeof query;

        if (queryType === "function") {
            callback = query;
            this.storage.findAll(callback);
        } else if (queryType === "string" || queryType === "number") {
            query = parseInt(query, 10);
            this.storage.find({ id: query }, callback);
        } else {
            this.storage.find(query, callback);
        }
    }

    /**
     * Updates a model by giving it an ID, data to update, and a callback to fire when
     * the update is complete.
     *
     * @param {number} id The id of the model to update
     * @param {object} data The properties to update and their new value
     * @param {function} callback The callback to fire when the update is complete.
     */
    update(id, data, callback) {
        this.storage.save(data, callback, id);
    }

    /**
     * Removes a model from storage
     *
     * @param {number} id The ID of the model to remove
     * @param {function} callback The callback to fire when the removal is complete.
     */
    remove(id, callback) {
        this.storage.remove(id, callback);
    }

    /**
     * WARNING: Will remove ALL data from storage.
     *
     * @param {function} callback The callback to fire when the storage is wiped.
     */
    removeAll(callback) {
        this.storage.drop(callback);
    }

    /**
     * Returns a count of all todos
     */
    getCount(callback) {
        const todos = {
            active: 0,
            completed: 0,
            total: 0,
        };

        this.storage.findAll((data) => {
            for (let todo of data) {
                if (todo.completed) {
                    todos.completed++;
                } else {
                    todos.active++;
                }

                todos.total++;
            }

            if (callback) {
                callback(todos);
            }
        });
    }
}

/* harmony default export */ const model = (Model);

;// CONCATENATED MODULE: ./src/store.js
let uniqueID = 1;
/* HOT MODULE SPECIFIC
 * Since hot reload blows away class instances, storage object is
 * moved outside of the class.
 */
let memoryStorage = {};

/**
 * Creates a new client side storage object and will create an empty
 * collection if no collection already exists.
 *
 * @param {string} name The name of our DB we want to use
 * @param {function} callback Our fake DB uses callbacks because in
 * real life you probably would be making AJAX calls
 */
class Store {
    constructor(name, callback) {
        this._dbName = name;

        if (!memoryStorage[name]) {
            const data = {
                todos: [],
            };

            memoryStorage[name] = JSON.stringify(data);
        }

        if (callback) {
            callback.call(this, JSON.parse(memoryStorage[name]));
        }
    }

    /**
     * Finds items based on a query given as a JS object
     *
     * @param {object} query The query to match against (i.e. {foo: 'bar'})
     * @param {function} callback   The callback to fire when the query has
     * completed running
     *
     * @example
     * db.find({foo: 'bar', hello: 'world'}, function (data) {
     *   // data will return any items that have foo: bar and
     *   // hello: world in their properties
     * })
     */
    find(query, callback) {
        if (!callback) {
            return;
        }

        const { todos } = JSON.parse(memoryStorage[this._dbName]);

        callback.call(
            this,
            todos.filter((todo) => {
                for (let q in query) {
                    if (query[q] !== todo[q]) {
                        return false;
                    }
                }
                return true;
            })
        );
    }

    /**
     * Will retrieve all data from the collection
     *
     * @param {function} callback The callback to fire upon retrieving data
     */
    findAll(callback) {
        if (!callback) {
            return;
        }

        callback.call(this, JSON.parse(memoryStorage[this._dbName]).todos);
    }

    /**
     * Will save the given data to the DB. If no item exists it will create a new
     * item, otherwise it'll simply update an existing item's properties
     *
     * @param {object} updateData The data to save back into the DB
     * @param {function} callback The callback to fire after saving
     * @param {number} id An optional param to enter an ID of an item to update
     */
    save(updateData, callback, id) {
        const data = JSON.parse(memoryStorage[this._dbName]);
        const { todos } = data;

        // If an ID was actually given, find the item and update each property
        if (id) {
            for (let i = 0; i < todos.length; i++) {
                if (todos[i].id === id) {
                    for (let key in updateData) {
                        todos[i][key] = updateData[key];
                    }
                    break;
                }
            }

            memoryStorage[this._dbName] = JSON.stringify(data);

            if (callback) {
                callback.call(this, JSON.parse(memoryStorage[this._dbName]).todos);
            }
        } else {
            // Generate an ID
            updateData.id = uniqueID++;

            todos.push(updateData);
            memoryStorage[this._dbName] = JSON.stringify(data);

            if (callback) {
                callback.call(this, [updateData]);
            }
        }
    }

    /**
     * Will remove an item from the Store based on its ID
     *
     * @param {number} id The ID of the item you want to remove
     * @param {function} callback The callback to fire after saving
     */
    remove(id, callback) {
        const data = JSON.parse(memoryStorage[this._dbName]);
        const { todos } = data;

        for (let i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todos.splice(i, 1);
                break;
            }
        }

        memoryStorage[this._dbName] = JSON.stringify(data);

        if (callback) {
            callback.call(this, JSON.parse(memoryStorage[this._dbName]).todos);
        }
    }

    /**
     * Will drop all storage and start fresh
     *
     * @param {function} callback The callback to fire after dropping the data
     */
    drop(callback) {
        memoryStorage[this._dbName] = JSON.stringify({ todos: [] });

        if (callback) {
            callback.call(this, JSON.parse(memoryStorage[this._dbName]).todos);
        }
    }
}

/* harmony default export */ const store = (Store);

;// CONCATENATED MODULE: ./src/template.js


const htmlEscapes = {
    "&": "&amp",
    "<": "&lt",
    ">": "&gt",
    '"': "&quot",
    "'": "&#x27",
    "`": "&#x60",
};

const reUnescapedHtml = /[&<>"'`]/g;
const reHasUnescapedHtml = new RegExp(reUnescapedHtml.source);

const template_escape = (str) => str && reHasUnescapedHtml.test(str) ? str.replace(reUnescapedHtml, escapeHtmlChar) : str;
const escapeHtmlChar = (chr) => htmlEscapes[chr];

class Template {
    constructor() {
        this.defaultTemplate = `
            <li data-id="{{id}}" class="{{completed}}">
                <div class="view">
                    <input class="toggle" type="checkbox" {{checked}}>
                    <label>{{title}}</label>
                    <button class="destroy"></button>
                </div>
            </li>
        `;
    }

    /**
     * Creates an <li> HTML string and returns it for placement in your app.
     *
     * NOTE: In real life you should be using a templating engine such as Mustache
     * or Handlebars, however, this is a vanilla JS example.
     *
     * @param {object} data The object containing keys you want to find in the
     *                      template to replace.
     * @returns {string} HTML String of an <li> element
     *
     * @example
     * view.show({
     *  id: 1,
     *  title: "Hello World",
     *  completed: 0,
     * })
     */
    show(data) {
        let view = "";
        const len = data.length;

        for (let i = 0; i < len; i++) {
            let completed = "";
            let checked = "";
            let template = this.defaultTemplate;

            if (data[i].completed) {
                completed = "completed";
                checked = "checked";
            }

            template = template.replace("{{id}}", data[i].id);
            template = template.replace("{{title}}", template_escape(data[i].title));
            template = template.replace("{{completed}}", completed);
            template = template.replace("{{checked}}", checked);

            view += template;
        }

        return view;
    }

    /**
     * Displays a counter of how many to dos are left to complete
     *
     * @param {number} activeTodos The number of active todos.
     * @returns {string} String containing the count
     */
    itemCounter(activeTodos) {
        const plural = activeTodos === 1 ? "" : "s";
        return `<strong>${activeTodos}</strong> item${plural} left`;
    }

    /**
     * Updates the text within the "Clear completed" button
     *
     * @param  {[type]} completedTodos The number of completed todos.
     * @returns {string} String containing the count
     */
    clearCompletedButton(completedTodos) {
        return completedTodos > 0 ? "Clear completed" : "";
    }
}

/* harmony default export */ const template = (Template);

;// CONCATENATED MODULE: ./src/app.js









let todo;
const onChange = () => {
    todo.controller.setView(document.location.hash);
};

const onLoad = () => {
    todo = new Todo("javascript-es6-webpack");
    onChange();
};

function Todo(name) {
    this.storage = new store(name);
    this.model = new model(this.storage);
    this.template = new template();
    this.view = new View(this.template);
    this.controller = new controller(this.model, this.view);
}

/* HOT MODULE SPECIFIC */
if (false) {}

window.addEventListener("load", onLoad);
window.addEventListener("hashchange", onChange);

/******/ })()
;
//# sourceMappingURL=app.bundle.js.map