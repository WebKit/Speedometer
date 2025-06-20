import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";

import globalStyles from "../../styles/global.constructable.js";
import listStyles from "../../styles/todo-list.constructable.js";


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

    .todo-list > :nth-child(10) ~ todo-item {
        display: none;
    }
`);

console.log(customListStyles);

class TodoList extends HTMLElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    #route = undefined;

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

        if (window.extraTodoListCssToAdopt) {
            let extraAdoptedStyleSheet = new CSSStyleSheet();
            extraAdoptedStyleSheet.replaceSync(window.extraTodoListCssToAdopt);
            this.shadow.adoptedStyleSheets.push(extraAdoptedStyleSheet);
        }
    }

    addItem(entry, itemIndex) {
        const { id, title, completed } = entry;
        const element = new TodoItem();

        element.setAttribute("itemid", id);
        element.setAttribute("itemtitle", title);
        element.setAttribute("itemcompleted", completed);
        element.setAttribute("data-priority", 4 - (itemIndex % 5));

        this.listNode.append(element);
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
}

customElements.define("todo-list", TodoList);

export default TodoList;
