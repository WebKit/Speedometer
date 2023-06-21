import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

class TodoList extends HTMLElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    constructor() {
        super();
        // state
        this._elements = [];
        this._route = undefined;
        // elements
        const node = document.importNode(template.content, true);
        this.listNode = node.querySelector(".todo-list");
        // shadow dom
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(node);
    }

    addItem(entry) {
        const element = new TodoItem();
        Object.keys(entry).forEach(key => element.setAttribute(key, entry[key]));

        this._elements.push(element);
        this.listNode.append(element);
    }

    addItems(items) {
        items.forEach((entry) => this.addItem(entry));
    }

    removeCompletedItems() {
        this._elements = this._elements.filter((element) => {
            if (element.completed === "true")
                element.removeItem();

            return element.completed === "false";
        });
    }

    toggleItems(completed) {
        this._elements.forEach((element) => {
            if (completed && element.completed === "false")
                element.toggleInput.click();
            else if (!completed && element.completed === "true")
                element.toggleInput.click();

        });
    }

    updateStyles() {
        if (parseInt(this["total-items"]) !== 0)
            this.listNode.style.display = "block";
        else
            this.listNode.style.display = "none";

    }

    updateView(element) {
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
    }

    updateElements(type = "", id = "") {
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
    }

    updateRoute(route) {
        this._route = route;
        this.updateElements("route-change");
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

customElements.define("todo-list", TodoList);

export default TodoList;
