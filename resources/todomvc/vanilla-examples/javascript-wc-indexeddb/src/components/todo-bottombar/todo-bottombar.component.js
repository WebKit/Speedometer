import template from "./todo-bottombar.template.js";

import globalStyles from "../../../node_modules/todomvc-css/dist/global.constructable.js";
import bottombarStyles from "../../../node_modules/todomvc-css/dist/bottombar.constructable.js";

const additionalStyles = new CSSStyleSheet();
additionalStyles.replaceSync(`

    .clear-completed-button, .clear-completed-button:active,
    .todo-status,
    .filter-list
     {
        position: unset;
        transform: unset;
    }

    .bottombar {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        align-items: center;
        justify-items: center;
    }

    .bottombar > * {
        grid-column: span 1;
    }

    .filter-list {
        grid-column: span 3;
    }

    .bottombar.display-none {
        display: none;
    }
`);


class TodoBottombar extends HTMLElement {
    static get observedAttributes() {
        return ["total-items", "active-items"];
    }

    constructor() {
        super();

        const node = document.importNode(template.content, true);
        this.element = node.querySelector(".bottombar");
        this.clearCompletedButton = node.querySelector(".clear-completed-button");
        this.todoStatus = node.querySelector(".todo-status");
        this.filterLinks = node.querySelectorAll(".filter-link");

        this.shadow = this.attachShadow({ mode: "open" });
        this.htmlDirection = document.dir || "ltr";
        this.setAttribute("dir", this.htmlDirection);
        this.shadow.adoptedStyleSheets = [globalStyles, bottombarStyles, additionalStyles];
        this.shadow.append(node);

        this.clearCompletedItems = this.clearCompletedItems.bind(this);
        this.MoveToNextPage = this.MoveToNextPage.bind(this);
        this.MoveToPreviousPage = this.MoveToPreviousPage.bind(this);
    }

    updateDisplay() {
        if (parseInt(this["total-items"]) !== 0)
            this.element.classList.remove("display-none");
        else
            this.element.classList.add("display-none");

        this.todoStatus.textContent = `${this["active-items"]} ${this["active-items"] === "1" ? "item" : "items"} left!`;
    }

    updateRoute(route) {
        this.filterLinks.forEach((link) => {
            if (link.dataset.route === route)
                link.classList.add("selected");
            else
                link.classList.remove("selected");
        });
    }

    clearCompletedItems() {
        this.dispatchEvent(new CustomEvent("clear-completed-items"));
    }
    
    MoveToNextPage() {
        console.log("Moving to next page");
        this.dispatchEvent(new CustomEvent("next-page"));
    }

    MoveToPreviousPage() {
        this.dispatchEvent(new CustomEvent("previous-page"));
    }

    addListeners() {
        this.clearCompletedButton.addEventListener("click", this.clearCompletedItems);
        this.element.querySelector(".next-page-button").addEventListener("click", this.MoveToNextPage);
        this.element.querySelector(".previous-page-button").addEventListener("click", this.MoveToPreviousPage);
    }

    removeListeners() {
        this.clearCompletedButton.removeEventListener("click", this.clearCompletedItems);
        this.getElementById("next-page-button").removeEventListener("click", this.MoveToNextPage);
        this.getElementById("previous-page-button").removeEventListener("click", this.MoveToPreviousPage);
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;

        if (this.isConnected)
            this.updateDisplay();
    }

    connectedCallback() {
        this.updateDisplay();
        this.addListeners();
    }

    disconnectedCallback() {
        this.removeListeners();
    }
}

customElements.define("todo-bottombar", TodoBottombar);

export default TodoBottombar;
