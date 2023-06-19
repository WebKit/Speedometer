import template from "./todo-topbar.template.js";
import { useKeyListener } from "../../hooks/useKeyListener.js";

let urlAlphabet
    = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

function nanoid(size = 21) {
    let id = "";
    let i = size;
    while (i--)
        id += urlAlphabet[(Math.random() * 64) | 0];

    return id;
}

class TodoTopbar extends HTMLElement {
    static get observedAttributes() {
        return ["total-items", "active-items", "completed-items"];
    }

    constructor() {
        super();

        // elements
        this.todoInput = undefined;
        this.toggleInput = undefined;
        // state
        this.connected = false;
        this._route = undefined;
        // listeners
        this.keysListeners = [];

        this.shadow = this.attachShadow({ mode: "open" });
    }

    toggleAll = (e) => {
        this.dispatchEvent(
            new CustomEvent("toggle-all", {
                detail: { completed: e.target.checked },
            })
        );
    };

    addItem = (e) => {
        this.dispatchEvent(
            new CustomEvent("add-item", {
                detail: {
                    id: nanoid(),
                    title: e.target.value,
                    completed: false,
                },
            })
        );

        e.target.value = "";
    };

    updateDisplay = () => {
        if (this["total-items"] === "0") {
            this.toggleContainer.style.display = "none";
            return;
        }

        this.toggleContainer.style.display = "block";

        switch (this._route) {
            case "active":
                this.toggleInput.checked = false;
                this.toggleInput.disabled = this["active-items"] === "0";
                break;
            case "completed":
                this.toggleInput.checked = this["completed-items"] !== "0";
                this.toggleInput.disabled = this["completed-items"] === "0";
                break;
            default:
                this.toggleInput.checked
                    = this["total-items"] === this["completed-items"];
                this.toggleInput.disabled = false;
        }
    };

    updateRoute = (route) => {
        this._route = route;
        this.updateDisplay();
    };

    addListeners = () => {
        this.toggleInput.addEventListener("change", this.toggleAll);
        this.keysListeners.forEach((listener) => listener.connect());
    };

    removeListeners = () => {
        this.toggleInput.removeEventListener("change", this.toggleAll);
        this.keysListeners.forEach((listener) => listener.disconnect());
    };

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

        this.todoInput = node.querySelector("#new-todo");
        this.toggleInput = node.querySelector("#toggle-all");
        this.toggleContainer = node.querySelector(".toggle-all-display");

        this.keysListeners.push(
            useKeyListener({
                target: this.todoInput,
                event: "keyup",
                callbacks: {
                    ["Enter"]: this.addItem,
                },
            })
        );

        this.updateDisplay();
        this.addListeners();
        this.shadow.append(node);

        this.todoInput.focus();
    }

    disconnectedCallback() {
        this.connected = false;
        this.removeListeners();
    }
}

customElements.define("todo-topbar", TodoTopbar);

export default TodoTopbar;
