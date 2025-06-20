import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

import globalStyles from "./../../../node_modules/todomvc-css/dist/global.constructable.js";
import listStyles from "./../../../node_modules/todomvc-css/dist/todo-list.constructable.js";

console.log("TodoList module");

class TodoList extends HTMLUListElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    #backwardCache = [];
    #forwardCache = [];
    #elements = [];
    #route = undefined;
    #maxItems = 10;
    #maxItemsCached = 10;
    #pendingMovestoForwardCache = 0;
    #pendingMovestoBackwardCache = 0;

    constructor() {
        super();
        this.dir = document.dir || "ltr";
        this.classList.add("todo-list");
        this.classList.add("show-priority");
    }

    addItem(entry) {
        const numberOfChildren = this.children.length;
        const forwardCacheLength = this.#forwardCache.length;

        if (numChildren === this.#maxItems && forwardCacheLength === this.#maxItemsCached) {
            // Add to indexedDB
            return false;
        }            

        const { id, title, completed } = entry;
        const element = new TodoItem();

        element.setAttribute("itemid", id);
        element.setAttribute("itemtitle", title);
        element.setAttribute("itemcompleted", completed);
        element.setAttribute("data-priority", 4 - (elementIndex % 5));

        const elementIndex = this.#elements.length;

        if (numChildren < this.#maxItems) {
            this.#elements.push(element);
            this.append(element);
        } else {
            this.#forwardCache.push(element);
        }
        return true;
    }

    addItems(items) {
        items.forEach((entry) => this.addItem(entry));
    }

    removeCompletedItems() {
        this.#elements = this.#elements.filter((element) => {
            if (element.itemcompleted === "true")
                element.removeItem();

            return element.itemcompleted === "false";
        });
    }

    toggleItems(completed) {
        this.#elements.forEach((element) => {
            if (completed && element.itemcompleted === "false")
                element.toggleInput.click();
            else if (!completed && element.itemcompleted === "true")
                element.toggleInput.click();
        });
    }

    updateStyles() {
        if (parseInt(this["total-items"]) !== 0)
            this.style.display = "block";
        else
            this.style.display = "none";
    }

    updateView(element) {
        switch (this.#route) {
            case "completed":
                element.style.display = element.itemcompleted === "true" ? "block" : "none";
                break;
            case "active":
                element.style.display = element.itemcompleted === "true" ? "none" : "block";
                break;
            default:
                element.style.display = "block";
        }
    }

    updateElements(type = "", id = "") {
        switch (type) {
            case "route-change":
                this.#elements.forEach((element) => this.updateView(element));
                break;
            case "toggle-item":
            case "add-item":
                this.#elements.forEach((element) => {
                    if (element.itemid === id)
                        this.updateView(element);
                });
                break;
            case "remove-item":
                this.#elements = this.#elements.filter((element) => element.itemid !== id);
                break;
        }
    }

    updateRoute(route) {
        this.#route = route;
        this.updateElements("route-change");
    }

    #addToForwardCacheFromDB() {
        // Add items from IndexedDB to forward cache
        // This is a placeholder for the actual implementation
    }

    #maybeAddItemFromForwardCache() {
        if (this.#forwardCache.length === 0)
            return;
        
        const element = this.#forwardCache.shift();
        this.#elements.push(element);
        this.append(element);
        this.#addToForwardCacheFromDB();
    }

    /**
     * Remove a specific item by ID
     */
    removeItem(itemId) {
        const elementIndex = this.#elements.findIndex(element => element.itemid === itemId);
        if (elementIndex !== -1) {
            const element = this.#elements[elementIndex];
            element.remove();
            this.#elements.splice(elementIndex, 1);
            this.#maybeAddItemFromForwardCache();
            return true;
        }
        return false;
    }

    /**
     * Update a specific item by ID
     */
    updateItem(updatedItem) {
        const element = this.#elements.find(el => el.itemid === updatedItem.id);
        if (element) {
            element.setAttribute("itemtitle", updatedItem.title);
            element.setAttribute("itemcompleted", updatedItem.completed);
            this.updateView(element);
            return true;
        }
        return false;
    }

    /**
     * Check if the list is at maximum capacity
     */
    isFull() {
        return this.#elements.length >= this.#maxItems;
    }

    /**
     * Get the current number of items in the list
     */
    getCurrentCount() {
        return this.#elements.length;
    }

    /**
     * Get the maximum number of items this list can hold
     */
    getMaxCapacity() {
        return this.#maxItems;
    }

    /**
     * Get the number of available slots in the list
     */
    getAvailableSlots() {
        return this.#maxItems - this.#elements.length;
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
}

customElements.define("todo-list", TodoList, { extends: "ul" });

export default TodoList;
