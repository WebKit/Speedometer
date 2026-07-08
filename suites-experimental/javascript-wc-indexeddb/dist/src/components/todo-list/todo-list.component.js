import template from "./todo-list.template.js";
import TodoItem from "../todo-item/todo-item.component.js";
import { createStorageManager } from "../../storage/storage-factory.js";

import globalStyles from "../../../styles/global.constructable.js";
import listStyles from "../../../styles/todo-list.constructable.js";

const MAX_ON_SCREEN_ITEMS = 10;

const customListStyles = new CSSStyleSheet();
customListStyles.replaceSync(`
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
        this.storageManager = createStorageManager();

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
                this.listNode.setAttribute("route", "active");
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

    async moveToPreviousPage() {
        const items = await this.storageManager.getTodos(this.#firstItemIndexOnScreen, MAX_ON_SCREEN_ITEMS);
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
