import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

class TodoList extends HTMLElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    constructor() {
        super();

        // elements
        this.element = undefined;
        // state
        this.connected = false;
        this._elements = [];
        this._route = undefined;

        this.shadow = this.attachShadow({ mode: "open" });
    }

    addItem = (entry) => {
        const element = new TodoItem();
        Object.keys(entry).forEach(key => element.setAttribute(key, entry[key]));

        this._elements.push(element);
        this.append(element);
    };

    addItems = (items) => {
        items.forEach((entry) => this.addItem(entry));
    };

    removeCompletedItems = () => {
        this._elements = this._elements.filter((element) => {
            if (element.completed === "true")
                element.removeItem();

            return element.completed === "false";
        });
    };

    toggleItems = (completed) => {
        this._elements.forEach((element) => {
            if (completed && element.completed === "false")
                element.toggleInput.click();
            else if (!completed && element.completed === "true")
                element.toggleInput.click();

        });
    };

    updateStyles = () => {
        if (this["total-items"] !== "0")
            this.element.style.display = "block";
        else
            this.element.style.display = "none";

    };

    updateView = (element) => {
        switch (this._route) {
            case "completed":
                element.style.display
                    = element.completed === "true" ? "block" : "none";
                break;
            case "active":
                element.style.display
                    = element.completed === "true" ? "none" : "block";
                break;
            default:
                element.style.display = "block";
        }
    };

    updateElements = (type = "", id = "") => {
        switch (type) {
            case "route-change":
                this._elements.forEach((element) => this.updateView(element));
                break;
            case "toggle-item":
            case "add-item":
                this._elements.forEach((element) => {
                    if (element.id === id)
                        this.updateView(element);

                });
                break;
            case "remove-item":
                this._elements = this._elements.filter(
                    (element) => element.id !== id
                );

                break;
        }
    };

    updateRoute = (route) => {
        this._route = route;
        this.updateElements("route-change");
    };

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;
        if (this.connected)
            this.updateStyles();

    }

    connectedCallback() {
        this.connected = true;
        const node = document.importNode(template.content, true);
        this.element = node.querySelector(".todo-list");
        this.updateStyles();
        this.shadow.append(node);
    }

    disconnectedCallback() {
        this.connected = false;
    }
}

customElements.define("todo-list", TodoList);

export default TodoList;
