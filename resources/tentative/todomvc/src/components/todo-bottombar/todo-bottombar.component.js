import template from "./todo-bottombar.template.js";

class TodoBottombar extends HTMLElement {
    static get observedAttributes() {
        return ["total-items", "active-items"];
    }

    constructor() {
        super();

        // elements
        this.element = undefined;
        this.clearCompletedButton = undefined;
        this.todoStatus = undefined;
        this.filterLinks = undefined;
        // state
        this.connected = false;

        this.clearCompletedItems = this.clearCompletedItems.bind(this);

        this.shadow = this.attachShadow({ mode: "open" });
    }

    updateDisplay() {
        if (this["total-items"] !== "0")
            this.element.style.display = "block";
        else
            this.element.style.display = "none";

        this.todoStatus.textContent = `${this["active-items"]} ${
            this["active-items"] === "1" ? "item" : "items"
        } left!`;
    }

    updateRoute(route) {
        this.filterLinks.forEach(link => {
            if (link.dataset.route === route)
                link.classList.add("selected");
            else
                link.classList.remove("selected");

        });
    }

    clearCompletedItems() {
        this.dispatchEvent(new CustomEvent("clear-completed-items"));
    }

    addListeners() {
        this.clearCompletedButton.addEventListener(
            "click",
            this.clearCompletedItems
        );
    }

    removeListeners() {
        this.clearCompletedButton.removeEventListener(
            "click",
            this.clearCompletedItems
        );
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;

        if (this.connected)
            this.updateDisplay();

    }

    connectedCallback() {
        this.connected = true;
        const node = document.importNode(template.content, true);
        this.element = node.querySelector(".bottombar");
        this.clearCompletedButton = node.querySelector(
            ".clear-completed-button"
        );
        this.todoStatus = node.querySelector(".todo-status");
        this.filterLinks = node.querySelectorAll(".filter-link");

        this.updateDisplay();
        this.addListeners();
        this.shadow.append(node);
    }

    disconnectedCallback() {
        this.connected = false;
        this.removeListeners();
    }
}

customElements.define("todo-bottombar", TodoBottombar);

export default TodoBottombar;
