import template from "./todo-app.template.js";
import { useRouter } from "../../hooks/useRouter.js";
import TodoListWrapper from "../todo-list-wrapper/todo-list-wrapper.component.js";
import globalStyles from "./../../../node_modules/todomvc-css/dist/global.constructable.js";
import appStyles from "./../../../node_modules/todomvc-css/dist/app.constructable.js";
import mainStyles from "./../../../node_modules/todomvc-css/dist/main.constructable.js";
class TodoApp extends HTMLElement {
    #isReady = false;
    #data = {};

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.htmlDirection = document.dir || "ltr";
        this.setAttribute("dir", this.htmlDirection);
        this.shadow.adoptedStyleSheets = [globalStyles, appStyles, mainStyles];

        const node = document.importNode(template.content, true);
        this.topbar = node.querySelector("todo-topbar");
        this.listWrapper = node.querySelector("todo-list-wrapper");
        this.bottombar = node.querySelector("todo-bottombar");
        this.shadow.append(node);

        this.addItem = this.addItem.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.toggleItems = this.toggleItems.bind(this);
        this.clearCompletedItems = this.clearCompletedItems.bind(this);
        this.routeChange = this.routeChange.bind(this);
        this.moveToPage = this.moveToPage.bind(this);

        this.router = useRouter();
    }

    get isReady() {
        return this.#isReady;
    }

    getInstance() {
        return this;
    }

    addItem(event) {
        const { detail: item } = event;

        // Add to in-memory data
        this.#data[item.id] = item;
        
        // Add to list wrapper (which handles IndexedDB storage)
        this.listWrapper.addItem(item);

        // Ensure UI shows full list when there are more todos available
        this.listWrapper.ensureFullListDisplay();

        this.update("add-item", item.id);
    }

    toggleItem(event) {
        // Update in-memory data
        if (this.#data[event.detail.id]) {
            this.#data[event.detail.id].completed = event.detail.completed;
        }

        // Update in list wrapper (which handles IndexedDB storage asynchronously)
        const item = this.#data[event.detail.id];
        if (item) {
            this.listWrapper.updateItem(item);
        }

        this.update("toggle-item", event.detail.id);
    }

    removeItem(event) {
        // Remove from in-memory data
        delete this.#data[event.detail.id];

        // Remove from list wrapper (which handles IndexedDB storage asynchronously)
        this.listWrapper.removeItem(event.detail.id);

        this.update("remove-item", event.detail.id);
    }

    updateItem(event) {
        // Update in-memory data
        if (this.#data[event.detail.id]) {
            this.#data[event.detail.id].title = event.detail.title;
        }

        // Update in list wrapper (which handles IndexedDB storage asynchronously)
        const item = this.#data[event.detail.id];
        if (item) {
            this.listWrapper.updateItem(item);
        }

        this.update("update-item", event.detail.id);
    }

    toggleItems(event) {
        this.listWrapper.toggleItems(event.detail.completed);
    }

    clearCompletedItems() {
        // Clear from list wrapper (which handles IndexedDB asynchronously)
        this.listWrapper.clearCompleted();
        
        // Update in-memory data - remove completed items
        Object.keys(this.#data).forEach(id => {
            if (this.#data[id].completed) {
                delete this.#data[id];
            }
        });
        
        this.update("clear-completed");
    }

    moveToPage(event) {
        this.listWrapper.moveToPage(event.detail.page);
    }

    update(type = "", id = "") {
        const dataValues = Object.values(this.#data);
        const totalItems = dataValues.length;
        const activeItems = dataValues.filter((entry) => !entry.completed).length;
        const completedItems = totalItems - activeItems;

        this.listWrapper.setAttribute("total-items", totalItems);
        this.listWrapper.updateElements(type, id);

        this.topbar.setAttribute("total-items", totalItems);
        this.topbar.setAttribute("active-items", activeItems);
        this.topbar.setAttribute("completed-items", completedItems);

        this.bottombar.setAttribute("total-items", totalItems);
        this.bottombar.setAttribute("active-items", activeItems);
    }

    addListeners() {
        this.topbar.addEventListener("toggle-all", this.toggleItems);
        this.topbar.addEventListener("add-item", this.addItem);

        this.listWrapper.wrapperNode.addEventListener("toggle-item", this.toggleItem);
        this.listWrapper.wrapperNode.addEventListener("remove-item", this.removeItem);
        this.listWrapper.wrapperNode.addEventListener("update-item", this.updateItem);

        this.bottombar.addEventListener("clear-completed-items", this.clearCompletedItems);
        this.bottombar.addEventListener("move-to-page", this.moveToPage);
    }

    removeListeners() {
        this.topbar.removeEventListener("toggle-all", this.toggleItems);
        this.topbar.removeEventListener("add-item", this.addItem);

        this.listWrapper.wrapperNode.removeEventListener("toggle-item", this.toggleItem);
        this.listWrapper.wrapperNode.removeEventListener("remove-item", this.removeItem);
        this.listWrapper.wrapperNode.removeEventListener("update-item", this.updateItem);

        this.bottombar.removeEventListener("clear-completed-items", this.clearCompletedItems);
    }

    routeChange(route) {
        const routeName = route.split("/")[1] || "all";
        
        // Update filter in list wrapper for IndexedDB queries
        this.listWrapper.setFilter(routeName);
        
        // Update UI components
        this.listWrapper.updateRoute(routeName);
        this.bottombar.updateRoute(routeName);
        this.topbar.updateRoute(routeName);
    }

    connectedCallback() {
        this.update("connected");
        this.addListeners();
        this.router.initRouter(this.routeChange);
        this.#isReady = true;
    }

    disconnectedCallback() {
        this.removeListeners();
        this.#isReady = false;
    }
}

customElements.define("todo-app", TodoApp);

export default TodoApp;
