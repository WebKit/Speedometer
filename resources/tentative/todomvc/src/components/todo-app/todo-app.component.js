import template from "./todo-app.template.js";
import TodoTopbar from "../todo-topbar/todo-topbar.component.js";
import TodoList from "../todo-list/todo-list.component.js";
import TodoBottombar from "../todo-bottombar/todo-bottombar.component.js";
import { useRouter } from "../../hooks/useRouter.js";

// import { data } from "../../data.js";

class TodoApp extends HTMLElement {
    constructor() {
        super();

        // elements
        this.topbar = undefined;
        this.list = undefined;
        this.bottombar = undefined;
        // state
        this.connected = false;
        this._isReady = false;
        // this._data = [...data];
        this._data = [];

        this.addItem = this.addItem.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.toggleItems = this.toggleItems.bind(this);
        this.clearCompletedItems = this.clearCompletedItems.bind(this);

        this.router = useRouter();

        this.shadow = this.attachShadow({ mode: "open" });
    }

    get isReady() {
        return this._isReady;
    }

    getInstance() {
        return this;
    }

    addItem(e) {
        const { detail: item } = e;

        this._data.push(item);
        this.list.addItem(item);

        this.update("add-item", item.id);
    }

    toggleItem(e) {
        this._data.forEach((entry) => {
            if (entry.id === e.detail.id)
                entry.completed = e.detail.completed;

        });

        this.update("toggle-item", e.detail.id);
    }

    removeItem(e) {
        this._data.forEach((entry, index) => {
            if (entry.id === e.detail.id)
                this._data.splice(index, 1);

        });

        this.update("remove-item", e.detail.id);
    }

    updateItem(e) {
        this._data.forEach((entry) => {
            if (entry.id === e.detail.id)
                entry.title = e.detail.title;

        });

        this.update("update-item", e.detail.id);
    }

    toggleItems(e) {
        this.list.toggleItems(e.detail.completed);
    }

    clearCompletedItems() {
        this.list.removeCompletedItems();
    }

    update(type = "", id = "") {
        const totalItems = this._data.length;
        const activeItems = this._data.filter((e) => !e.completed).length;
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
        this.connected = true;
        const node = document.importNode(template.content, true);

        this.topbar = new TodoTopbar();
        this.list = new TodoList();
        this.bottombar = new TodoBottombar();

        node.querySelector("[name=\"topbar\"]").append(this.topbar);
        node.querySelector("[name=\"list\"]").append(this.list);
        node.querySelector("[name=\"bottombar\"]").append(this.bottombar);

        this.list.addItems(this._data);
        this.addListeners();
        this.update("connected");

        this.shadow.append(node);

        this.router.initRouter(this.routeChange);
        this._isReady = true;
    }

    disconnectedCallback() {
        this.connected = false;
        this.removeListeners();
    }
}

customElements.define("todo-app", TodoApp);

export default TodoApp;
