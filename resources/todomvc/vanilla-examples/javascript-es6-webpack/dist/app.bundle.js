/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};

;// CONCATENATED MODULE: ./src/helpers.js


// Get element(s) by CSS selector:
function qs(selector, scope) {
    return (scope || document).querySelector(selector);
}

function qsa(selector, scope) {
    return (scope || document).querySelectorAll(selector);
}

// addEventListener wrapper:
function $on(target, type, callback, useCapture) {
    target.addEventListener(type, callback, !!useCapture);
}

// Attach a handler to event for all elements that match the selector,
// now or in the future, based on a root element
function $delegate(target, selector, type, handler) {
    // https://developer.mozilla.org/en-US/docs/Web/Events/blur
    var useCapture = type === "blur" || type === "focus";
    $on(target, type, dispatchEvent, useCapture);

    function dispatchEvent(event) {
        var targetElement = event.target;
        var potentialElements = qsa(selector, target);
        var hasMatch = Array.prototype.indexOf.call(potentialElements, targetElement) >= 0;

        if (hasMatch) {
            handler.call(targetElement, event);
        }
    }
}

// Find the element's parent with the given tag name:
// $parent(qs('a'), 'div');
function $parent(element, tagName) {
    if (!element.parentNode) {
        return undefined;
    }
    if (element.parentNode.tagName.toLowerCase() === tagName.toLowerCase()) {
        return element.parentNode;
    }
    return $parent(element.parentNode, tagName);
}

// removes an element from an array
// const x = [1,2,3]
// remove(x, 2)
// x ~== [1,3]
function remove(array, thing) {
    const index = array.indexOf(thing);
    if (index === -1) {
        return array;
    }

    return array.splice(index, 1);
}

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
    let listItem = qs(`[data-id="${id}"]`);

    if (!listItem) {
        return;
    }

    let input = qs("input.edit", listItem);
    listItem.removeChild(input);

    listItem.className = listItem.className.replace(" editing", "");

    qsa("label", listItem).forEach((label) => {
        label.textContent = title;
    });
};

const _itemId = (element) => {
    var li = $parent(element, "li");
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
        this.bindCallbacks = this.bindCallbacks.bind(this);
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

    bindCallbacks(event, handler) {
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
/* harmony default export */ const controller = (Controller);

/**
 * Takes a model and view and acts as the controller between them
 *
 * @constructor
 * @param {object} model The model instance
 * @param {object} view The view instance
 */
function Controller(model, view) {
    var that = this;
    that.model = model;
    that.view = view;

    that.view.bindCallbacks("newTodo", function (title) {
        that.addItem(title);
    });

    that.view.bindCallbacks("itemEdit", function (item) {
        that.editItem(item.id);
    });

    that.view.bindCallbacks("itemEditDone", function (item) {
        that.editItemSave(item.id, item.title);
    });

    that.view.bindCallbacks("itemEditCancel", function (item) {
        that.editItemCancel(item.id);
    });

    that.view.bindCallbacks("itemRemove", function (item) {
        that.removeItem(item.id);
    });

    that.view.bindCallbacks("itemToggle", function (item) {
        that.toggleComplete(item.id, item.completed);
    });

    that.view.bindCallbacks("removeCompleted", function () {
        that.removeCompletedItems();
    });

    that.view.bindCallbacks("toggleAll", function (status) {
        that.toggleAll(status.completed);
    });
}

/**
 * Loads and initialises the view
 *
 * @param {string} '' | 'active' | 'completed'
 */
Controller.prototype.setView = function (locationHash) {
    var route = locationHash.split("/")[1];
    var page = route || "";
    this._updateFilterState(page);
};

/**
 * An event to fire on load. Will get all items and display them in the
 * todo-list
 */
Controller.prototype.showAll = function () {
    var that = this;
    that.model.read(function (data) {
        that.view.render("showEntries", data);
    });
};

/**
 * Renders all active tasks
 */
Controller.prototype.showActive = function () {
    var that = this;
    that.model.read({ completed: false }, function (data) {
        that.view.render("showEntries", data);
    });
};

/**
 * Renders all completed tasks
 */
Controller.prototype.showCompleted = function () {
    var that = this;
    that.model.read({ completed: true }, function (data) {
        that.view.render("showEntries", data);
    });
};

/**
 * An event to fire whenever you want to add an item. Simply pass in the event
 * object and it'll handle the DOM insertion and saving of the new item.
 */
Controller.prototype.addItem = function (title) {
    var that = this;

    if (title.trim() === "") {
        return;
    }

    that.model.create(title, function () {
        that.view.render("clearNewTodo");
        that._filter(true);
    });
};

/*
 * Triggers the item editing mode.
 */
Controller.prototype.editItem = function (id) {
    var that = this;
    that.model.read(id, function (data) {
        that.view.render("editItem", { id, title: data[0].title });
    });
};

/*
 * Finishes the item editing mode successfully.
 */
Controller.prototype.editItemSave = function (id, title) {
    var that = this;
    if (title.trim()) {
        that.model.update(id, { title }, function () {
            that.view.render("editItemDone", { id, title });
        });
    } else {
        that.removeItem(id);
    }
};

/*
 * Cancels the item editing mode.
 */
Controller.prototype.editItemCancel = function (id) {
    var that = this;
    that.model.read(id, function (data) {
        that.view.render("editItemDone", { id, title: data[0].title });
    });
};

/**
 * By giving it an ID it'll find the DOM element matching that ID,
 * remove it from the DOM and also remove it from storage.
 *
 * @param {number} id The ID of the item to remove from the DOM and
 * storage
 */
Controller.prototype.removeItem = function (id) {
    var that = this;
    that.model.remove(id, function () {
        that.view.render("removeItem", id);
    });

    that._filter();
};

/**
 * Will remove all completed items from the DOM and storage.
 */
Controller.prototype.removeCompletedItems = function () {
    var that = this;
    that.model.read({ completed: true }, function (data) {
        data.forEach(function (item) {
            that.removeItem(item.id);
        });
    });

    that._filter();
};

/**
 * Give it an ID of a model and a checkbox and it will update the item
 * in storage based on the checkbox's state.
 *
 * @param {number} id The ID of the element to complete or uncomplete
 * @param {object} checkbox The checkbox to check the state of complete
 *                          or not
 * @param {boolean|undefined} silent Prevent re-filtering the todo items
 */
Controller.prototype.toggleComplete = function (id, completed, silent) {
    var that = this;
    that.model.update(id, { completed }, function () {
        that.view.render("elementComplete", {
            id,
            completed,
        });
    });

    if (!silent) {
        that._filter();
    }
};

/**
 * Will toggle ALL checkboxes' on/off state and completeness of models.
 * Just pass in the event object.
 */
Controller.prototype.toggleAll = function (completed) {
    var that = this;
    that.model.read({ completed: !completed }, function (data) {
        data.forEach(function (item) {
            that.toggleComplete(item.id, completed, true);
        });
    });

    that._filter();
};

/**
 * Updates the pieces of the page which change depending on the remaining
 * number of todos.
 */
Controller.prototype._updateCount = function () {
    var that = this;
    that.model.getCount(function (todos) {
        that.view.render("updateElementCount", todos.active);
        that.view.render("clearCompletedButton", {
            completed: todos.completed,
            visible: todos.completed > 0,
        });

        that.view.render("toggleAll", { checked: todos.completed === todos.total });
        that.view.render("contentBlockVisibility", { visible: todos.total > 0 });
    });
};

/**
 * Re-filters the todo items, based on the active route.
 * @param {boolean|undefined} force  forces a re-painting of todo items.
 */
Controller.prototype._filter = function (force) {
    var activeRoute = this._activeRoute.charAt(0).toUpperCase() + this._activeRoute.substr(1);

    // Update the elements on the page, which change with each completed todo
    this._updateCount();

    // If the last active route isn't "All", or we're switching routes, we
    // re-create the todo item elements, calling:
    //   this.show[All|Active|Completed]();
    if (force || this._lastActiveRoute !== "All" || this._lastActiveRoute !== activeRoute) {
        this[`show${activeRoute}`]();
    }

    this._lastActiveRoute = activeRoute;
};

/**
 * Simply updates the filter nav's selected states
 */
Controller.prototype._updateFilterState = function (currentPage) {
    // Store a reference to the active route, allowing us to re-filter todo
    // items as they are marked complete or incomplete.
    currentPage = currentPage.split("?")[0];
    this._activeRoute = currentPage;

    if (currentPage === "") {
        this._activeRoute = "All";
    }

    this._filter();

    this.view.render("setFilter", currentPage);
};

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

        let newItem = {
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
            let data = {
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