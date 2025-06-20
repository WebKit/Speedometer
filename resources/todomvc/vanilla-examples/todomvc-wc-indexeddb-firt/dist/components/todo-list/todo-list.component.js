import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

import globalStyles from "./../../styles/global.constructable.js";
import listStyles from "./../../styles/todo-list.constructable.js";

console.log("TodoList module");

class TodoList extends HTMLUListElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    #elements = [];
    #route = undefined;
    #maxItems = 10;

    constructor() {
        super();
        this.dir = document.dir || "ltr";
        this.classList.add("todo-list");
        this.classList.add("show-priority");
    }

    addItem(entry) {
        if (this.#elements.length >= this.#maxItems)
            return false;

        const { id, title, completed } = entry;
        const element = new TodoItem();

        element.setAttribute("itemid", id);
        element.setAttribute("itemtitle", title);
        element.setAttribute("itemcompleted", completed);

        const elementIndex = this.#elements.length;
        this.#elements.push(element);
        this.append(element);
        element.setAttribute("data-priority", 4 - (elementIndex % 5));
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

    /**
     * Remove a specific item by ID
     */
    removeItem(itemId) {
        const elementIndex = this.#elements.findIndex(element => element.itemid === itemId);
        if (elementIndex !== -1) {
            const element = this.#elements[elementIndex];
            element.remove();
            this.#elements.splice(elementIndex, 1);
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
