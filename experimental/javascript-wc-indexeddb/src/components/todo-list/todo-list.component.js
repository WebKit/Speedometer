import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

import globalStyles from "todomvc-css/dist/global.constructable.js";
import listStyles from "todomvc-css/dist/todo-list.constructable.js";

class IndexedDBManager {
    constructor() {
        this.dbName = "todoDB";
        this.dbVersion = 1;
        this.storeName = "todos";
        this.db = null;
        this.pendingAdditions = 0;
        this.totalItemsToggled = 0;
        this.totalItemsDeleted = 0;
        this.initDB().then(() => {
            const newDiv = document.createElement("div");
            newDiv.classList.add("indexeddb-ready");
            newDiv.style.display = "none";
            document.body.append(newDiv);
        });
    }

    initDB() {
        return new Promise((resolve, reject) => {
            // Delete the existing database first for clean state
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);

            deleteRequest.onerror = (event) => {
                // Continue despite error in deletion
                this.openDatabase(resolve, reject);
            };

            deleteRequest.onsuccess = () => {
                this.openDatabase(resolve, reject);
            };

            deleteRequest.onblocked = () => {
                // Try opening anyway
                this.openDatabase(resolve, reject);
            };
        });
    }

    openDatabase(resolve, reject) {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store (since we're always creating a fresh DB now)
            const store = db.createObjectStore(this.storeName, { keyPath: "itemNumber" });
            store.createIndex("id", "id", { unique: true });
            store.createIndex("title", "title", { unique: false });
            store.createIndex("completed", "completed", { unique: false });
            store.createIndex("priority", "priority", { unique: false });
        };
    }

    addTodo(todo) {
        return new Promise((resolve, reject) => {
            // Ensure the database connection is established
            if (!this.db) {
                this.initDB()
                    .then(() => this.addTodo(todo))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Add todo item to IndexedDB
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);

            const request = store.add(todo);
            this.pendingAdditions++;

            request.onsuccess = () => {
                if (--this.pendingAdditions === 0)
                    window.dispatchEvent(new CustomEvent("indexeddb-add-completed", {}));

                resolve(todo);
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    getTodos(upperItemNumber, count) {
        return new Promise((resolve, reject) => {
            // Ensure the database connection is established
            if (!this.db) {
                this.initDB()
                    .then(() => this.getTodos(upperItemNumber, count))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            const transaction = this.db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);

            // Use IDBKeyRange to get items with itemNumber less than upperItemNumber
            const range = IDBKeyRange.upperBound(upperItemNumber, true); // true = exclusive bound

            // Open a cursor to iterate through records in descending order
            const request = store.openCursor(range, "prev");

            const items = [];
            let itemsProcessed = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;

                // Check if we have a valid cursor and haven't reached our count limit
                if (cursor && itemsProcessed < count) {
                    items.push(cursor.value);
                    itemsProcessed++;
                    cursor.continue(); // Move to next item
                } else {
                    // We're done - sort items by itemNumber in descending order
                    // for proper display order (newest to oldest)
                    items.sort((a, b) => a.itemNumber - b.itemNumber);

                    resolve(items);
                }
            };

            request.onerror = (event) => {
                reject(event.target.error);
            };

            // Also handle transaction errors
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    toggleTodo(itemNumber, completed) {
        return new Promise((resolve, reject) => {
            // Ensure the database connection is established
            if (!this.db) {
                this.initDB()
                    .then(() => this.toggleTodo(itemNumber, completed))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Access the todo item directly by its itemNumber (keyPath)
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);

            // Get the todo item directly using its primary key (itemNumber)
            const getRequest = store.get(itemNumber);

            getRequest.onsuccess = (event) => {
                const todoItem = getRequest.result;

                if (!todoItem) {
                    reject(new Error(`Todo item with itemNumber '${itemNumber}' not found`));
                    return;
                }

                // Update the completed status
                todoItem.completed = completed;

                // Save the updated item back to the database
                const updateRequest = store.put(todoItem);

                updateRequest.onsuccess = () => {
                    if (window.numberOfItemsToAdd && ++this.totalItemsToggled === window.numberOfItemsToAdd)
                        window.dispatchEvent(new CustomEvent("indexeddb-toggle-completed", {}));

                    resolve(todoItem);
                };

                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                reject(event.target.error);
            };

            // Handle potential errors in finding the item
            transaction.onerror = (event) => {
                reject(event.target.error);
            };

            // Handle transaction errors
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    removeTodo(itemNumber) {
        return new Promise((resolve, reject) => {
            // Ensure the database connection is established
            if (!this.db) {
                this.initDB()
                    .then(() => this.removeTodo(itemNumber))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // Access the todo item directly by its itemNumber (keyPath)
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);

            // Delete the todo item directly using its primary key (itemNumber)
            const deleteRequest = store.delete(itemNumber);

            deleteRequest.onsuccess = () => {
                if (window.numberOfItemsToAdd && ++this.totalItemsDeleted === window.numberOfItemsToAdd)
                    window.dispatchEvent(new CustomEvent("indexeddb-remove-completed", {}));

                resolve(itemNumber);
            };

            deleteRequest.onerror = (event) => {
                reject(event.target.error);
            };

            // Handle transaction errors
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }
}

const MAX_ON_SCREEN_ITEMS = 10;

const customListStyles = new CSSStyleSheet();
customListStyles.replaceSync(`
    .todo-list > todo-item {
        display: block;
    }

    .todo-list[route="completed"] > [itemcompleted="false"] {
        display: none;
    }

    .todo-list[route="active"] > [itemcompleted="true"] {
        display: none;
    }

    :nth-child(${MAX_ON_SCREEN_ITEMS}) ~ todo-item {
        display: none;
    }
`);

class TodoList extends HTMLElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    #route = undefined;
    #firstItemIndexOnScreen = 0;

    constructor() {
        super();

        const node = document.importNode(template.content, true);
        this.listNode = node.querySelector(".todo-list");

        this.shadow = this.attachShadow({ mode: "open" });
        this.htmlDirection = document.dir || "ltr";
        this.setAttribute("dir", this.htmlDirection);
        this.shadow.adoptedStyleSheets = [globalStyles, listStyles, customListStyles];
        this.shadow.append(node);
        this.classList.add("show-priority");
        this.storageManager = new IndexedDBManager();

        if (window.extraTodoListCssToAdopt) {
            let extraAdoptedStyleSheet = new CSSStyleSheet();
            extraAdoptedStyleSheet.replaceSync(window.extraTodoListCssToAdopt);
            this.shadow.adoptedStyleSheets.push(extraAdoptedStyleSheet);
        }
    }

    addItem(entry, itemIndex) {
        const { id, title, completed } = entry;
        const priority = 4 - (itemIndex % 5);
        const element = new TodoItem();

        element.setAttribute("itemid", id);
        element.setAttribute("itemtitle", title);
        element.setAttribute("itemcompleted", completed);
        element.setAttribute("data-priority", priority);
        element.itemIndex = itemIndex;

        this.listNode.append(element);

        this.#addItemToStorage(itemIndex, id, title, priority, completed);
    }

    removeItem(itemIndex) {
        this.storageManager.removeTodo(itemIndex);
    }

    addItems(items) {
        items.forEach((entry) => this.addItem(entry));
    }

    removeCompletedItems() {
        Array.from(this.listNode.children).forEach((element) => {
            if (element.itemcompleted === "true")
                element.removeItem();
        });
    }

    toggleItems(completed) {
        Array.from(this.listNode.children).forEach((element) => {
            if (completed && element.itemcompleted === "false")
                element.toggleInput.click();
            else if (!completed && element.itemcompleted === "true")
                element.toggleInput.click();
        });
    }

    toggleItem(itemNumber, completed) {
        // Update the item in the IndexedDB
        this.storageManager.toggleTodo(itemNumber, completed);
    }

    updateStyles() {
        if (parseInt(this["total-items"]) !== 0)
            this.listNode.style.display = "block";
        else
            this.listNode.style.display = "none";
    }

    updateRoute(route) {
        this.#route = route;
        switch (route) {
            case "completed":
                this.listNode.setAttribute("route", "completed");
                break;
            case "active":
                this.listNode.setAttribute("rout", "active");
                break;
            default:
                this.listNode.setAttribute("route", "all");
        }
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;
        if (this.isConnected)
            this.updateStyles();
    }

    connectedCallback() {
        this.updateStyles();
    }

    moveToNextPage() {
        for (let i = 0; i < MAX_ON_SCREEN_ITEMS; i++) {
            const child = this.listNode.firstChild;
            if (!child)
                break;
            child.remove();
        }
        this.#firstItemIndexOnScreen = this.listNode.firstChild.itemIndex;
    }

    moveToPreviousPage() {
        return this.storageManager
            .getTodos(this.#firstItemIndexOnScreen, MAX_ON_SCREEN_ITEMS)
            .then((items) => {
                const elements = items.map((item) => {
                    const { id, title, completed, priority } = item;
                    const element = new TodoItem();
                    element.setAttribute("itemid", id);
                    element.setAttribute("itemtitle", title);
                    element.setAttribute("itemcompleted", completed);
                    element.setAttribute("data-priority", priority);
                    element.itemIndex = item.itemNumber;
                    return element;
                });
                this.#firstItemIndexOnScreen = items[0].itemNumber;
                this.listNode.replaceChildren(...elements);
            })
            .catch((error) => {
                // Error retrieving previous todos
            });
    }

    #addItemToStorage(itemIndex, id, title, priority, completed) {
        // Create a todo object with the structure expected by IndexedDB
        const todoItem = {
            itemNumber: itemIndex,
            id,
            title,
            completed,
            priority,
        };

        // Add the item to IndexedDB and handle the Promise
        this.storageManager.addTodo(todoItem);
    }
}

customElements.define("todo-list", TodoList);

export default TodoList;
