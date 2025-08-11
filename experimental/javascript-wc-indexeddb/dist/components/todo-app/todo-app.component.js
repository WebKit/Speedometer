import template from "./todo-app.template.js";
import { useRouter } from "../../hooks/useRouter.js";

import globalStyles from "../../styles/global.constructable.js";
import appStyles from "../../styles/app.constructable.js";
import mainStyles from "../../styles/main.constructable.js";
class TodoApp extends HTMLElement {
    #isReady = false;
    #numberOfItems = 0;
    #numberOfCompletedItems = 0;
    constructor() {
        super();

        const node = document.importNode(template.content, true);
        this.topbar = node.querySelector("todo-topbar");
        this.list = node.querySelector("todo-list");
        this.bottombar = node.querySelector("todo-bottombar");

        this.shadow = this.attachShadow({ mode: "open" });
        this.htmlDirection = document.dir || "ltr";
        this.setAttribute("dir", this.htmlDirection);
        this.shadow.adoptedStyleSheets = [globalStyles, appStyles, mainStyles];
        this.shadow.append(node);

        this.addItem = this.addItem.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.updateItem = this.updateItem.bind(this);
        this.toggleItems = this.toggleItems.bind(this);
        this.clearCompletedItems = this.clearCompletedItems.bind(this);
        this.routeChange = this.routeChange.bind(this);
        this.moveToNextPage = this.moveToNextPage.bind(this);
        this.moveToPreviousPage = this.moveToPreviousPage.bind(this);

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
        this.list.addItem(item, this.#numberOfItems++);
        this.update("add-item", item.id);
    }

    toggleItem(event) {
        if (event.detail.completed) {
            this.#numberOfCompletedItems++;
        } else {
            this.#numberOfCompletedItems--;
        }
        this.list.toggleItem(event.detail.itemNumber, event.detail.completed);
        this.update("toggle-item", event.detail.id);
    }

    removeItem(event) {
        if (event.detail.completed) {
            this.#numberOfCompletedItems--;
        }
        this.#numberOfItems--;
        this.update("remove-item", event.detail.id);
        this.list.removeItem(event.detail.itemNumber);
    }

    updateItem(event) {
        this.update("update-item", event.detail.id);
    }

    toggleItems(event) {
        this.list.toggleItems(event.detail.completed);
    }

    clearCompletedItems() {
        this.list.removeCompletedItems();
    }

    moveToNextPage() {
        this.list.moveToNextPage();
    }

    moveToPreviousPage() {
        // Skeleton implementation of previous page navigation
        this.list.moveToPreviousPage().then(() => {
            console.log("Moving to previous page");
            this.bottombar.reenablePreviousPageButton();
            window.dispatchEvent(new CustomEvent("previous-page-loaded", {}));
        });
    }

    update() {
        const totalItems = this.#numberOfItems;
        const completedItems = this.#numberOfCompletedItems;
        const activeItems = totalItems - completedItems;

        this.list.setAttribute("total-items", totalItems);

        this.topbar.setAttribute("total-items", totalItems);
        this.topbar.setAttribute("active-items", activeItems);
        this.topbar.setAttribute("completed-items", completedItems);

        this.bottombar.setAttribute("total-items", totalItems);
        this.bottombar.setAttribute("active-items", activeItems);
    }

    addListeners() {
        this.topbar.addEventListener("toggle-all", this.toggleItems);
        this.topbar.addEventListener("add-item", this.addItem);

        this.list.listNode.addEventListener("toggle-item", this.toggleItem);
        this.list.listNode.addEventListener("remove-item", this.removeItem);
        this.list.listNode.addEventListener("update-item", this.updateItem);

        this.bottombar.addEventListener("clear-completed-items", this.clearCompletedItems);
        this.bottombar.addEventListener("next-page", this.moveToNextPage);
        this.bottombar.addEventListener("previous-page", this.moveToPreviousPage);
    }

    removeListeners() {
        this.topbar.removeEventListener("toggle-all", this.toggleItems);
        this.topbar.removeEventListener("add-item", this.addItem);

        this.list.listNode.removeEventListener("toggle-item", this.toggleItem);
        this.list.listNode.removeEventListener("remove-item", this.removeItem);
        this.list.listNode.removeEventListener("update-item", this.updateItem);

        this.bottombar.removeEventListener("clear-completed-items", this.clearCompletedItems);
        this.bottombar.removeEventListener("next-page", this.moveToNextPage);
        this.bottombar.removeEventListener("previous-page", this.moveToPreviousPage);
    }

    routeChange(route) {
        const routeName = route.split("/")[1] || "all";
        this.list.updateRoute(routeName);
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
