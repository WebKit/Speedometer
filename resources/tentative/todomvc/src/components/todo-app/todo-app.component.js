import template from "./todo-app.template.js";
import TodoTopbar from "../todo-topbar/todo-topbar.component.js";
import TodoList from "../todo-list/todo-list.component.js";
import TodoBottombar from "../todo-bottombar/todo-bottombar.component.js";
import { useRouter } from "../../hooks/useRouter.js";
class TodoApp extends HTMLElement {
    constructor() {
        super();
        // state
        this._isReady = false;
        this._data = [];
        // elements
        const node = document.importNode(template.content, true);
        this.topbar = new TodoTopbar();
        this.list = new TodoList();
        this.bottombar = new TodoBottombar();
        node.querySelector("[name=\"topbar\"]").append(this.topbar);
        node.querySelector("[name=\"list\"]").append(this.list);
        node.querySelector("[name=\"bottombar\"]").append(this.bottombar);
        // add items, if data
        this.list.addItems(this._data);
        // shadow dom
        this.shadow = this.attachShadow({ mode: "open" });
        this.shadow.append(node);
        // router
        this.router = useRouter();
        this.router.initRouter(this.routeChange);
        // bind event handlers
        this.addItem = this.addItem.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.toggleItems = this.toggleItems.bind(this);
        this.clearCompletedItems = this.clearCompletedItems.bind(this);
    }

    get isReady() {
        return this._isReady;
    }

    getInstance() {
        return this;
    }

    addItem(event) {
        const { detail: item } = event;

        this._data.push(item);
        this.list.addItem(item);

        this.update("add-item", item.id);
    }

    toggleItem(event) {
        this._data.forEach((entry) => {
            if (entry.id === event.detail.id)
                entry.completed = event.detail.completed;

        });

        this.update("toggle-item", event.detail.id);
    }

    removeItem(event) {
        this._data.forEach((entry, index) => {
            if (entry.id === event.detail.id)
                this._data.splice(index, 1);

        });

        this.update("remove-item", event.detail.id);
    }

    updateItem(event) {
        this._data.forEach((entry) => {
            if (entry.id === event.detail.id)
                entry.title = event.detail.title;

        });

        this.update("update-item", event.detail.id);
    }

    toggleItems(event) {
        this.list.toggleItems(event.detail.completed);
    }

    clearCompletedItems() {
        this.list.removeCompletedItems();
    }

    update(type = "", id = "") {
        const totalItems = this._data.length;
        const activeItems = this._data.filter((entry) => !entry.completed).length;
        const completedItems = totalItems - activeItems;

        this.list.setAttribute("total-items", totalItems);
        this.list.updateElements(type, id);

        this.topbar.setAttribute("total-items", totalItems);
        this.topbar.setAttribute("active-items", activeItems);
        this.topbar.setAttribute("completed-items", completedItems);

        this.bottombar.setAttribute("total-items", totalItems);
        this.bottombar.setAttribute("active-items", activeItems);
    }

    addListeners() {
        this.topbar.addEventListener("toggle-all", this.toggleItems);
        this.topbar.addEventListener("add-item", this.addItem);

        this.list.addEventListener("toggle-item", this.toggleItem);
        this.list.addEventListener("remove-item", this.removeItem);
        this.list.addEventListener("update-item", this.updateItem);

        this.bottombar.addEventListener(
            "clear-completed-items",
            this.clearCompletedItems
        );
    }

    removeListeners() {
        this.topbar.removeEventListener("toggle-all", this.toggleItems);
        this.topbar.removeEventListener("add-item", this.addItem);

        this.list.removeEventListener("toggle-item", this.toggleItem);
        this.list.removeEventListener("remove-item", this.removeItem);
        this.list.removeEventListener("update-item", this.updateItem);

        this.bottombar.removeEventListener(
            "clear-completed-items",
            this.clearCompletedItems
        );
    }

    routeChange = (route) => {
        const routeName = route.split("/")[1] || "all";
        this.list.updateRoute(routeName);
        this.bottombar.updateRoute(routeName);
        this.topbar.updateRoute(routeName);
    };

    connectedCallback() {
        this.update("connected");
        this.addListeners();
        this._isReady = true;
    }

    disconnectedCallback() {
        this.removeListeners();
        this._isReady = false;
    }
}

customElements.define("todo-app", TodoApp);

export default TodoApp;
