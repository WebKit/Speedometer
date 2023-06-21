import template from "./todo-item.template.js";
import { useDoubleClick } from "../../hooks/useDoubleClick.js";
import { useKeyListener } from "../../hooks/useKeyListener.js";

class TodoItem extends HTMLElement {
    static get observedAttributes() {
        return ["id", "title", "completed"];
    }

    constructor() {
        super();

        // props
        this.id = "";
        this.title = "Todo Item";
        this.completed = "false";
        // elements
        this.item = undefined;
        this.toggleLabel = undefined;
        this.toggleInput = undefined;
        this.todoText = undefined;
        this.todoButton = undefined;
        this.editLabel = undefined;
        this.editInput = undefined;
        // state
        this.connected = false;
        // listeners
        this.keysListeners = [];

        this.updateItem = this.updateItem.bind(this);
        this.toggleItem = this.toggleItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.startEdit = this.startEdit.bind(this);
        this.stopEdit = this.stopEdit.bind(this);
        this.cancelEdit = this.cancelEdit.bind(this);

        this.shadow = this.attachShadow({ mode: "open" });
    }

    update(...args) {
        [...args].forEach((argument) => {
            switch (argument) {
                case "id":
                    if (this.id !== undefined) {
                        this.item.id = `todo-item-${this.id}`;
                        this.toggleLabel.setAttribute(
                            "for",
                            `toggle-todo-${this.id}`
                        );
                        this.toggleInput.id = `toggle-todo-${this.id}`;
                        this.todoText.id = `update-todo-${this.id}`;
                        this.todoButton.id = `remove-todo-${this.id}`;
                        this.editLabel.setAttribute(
                            "for",
                            `edit-todo-${this.id}`
                        );
                        this.editInput.id = `edit-todo-${this.id}`;
                    }
                    break;
                case "title":
                    if (this.title !== undefined) {
                        this.todoText.textContent = this.title;
                        this.editInput.value = this.title;
                    }
                    break;
                case "completed":
                    this.toggleInput.checked = this.getAttribute("completed") === "true" ? true : false;
                    break;
            }
        });
    }

    startEdit() {
        this.item.classList.add("editing");
        this.editInput.value = this.title;
        this.editInput.focus();
    }

    stopEdit() {
        this.item.classList.remove("editing");
    }

    cancelEdit() {
        this.editInput.blur();
    }

    toggleItem() {
        // update item first, before dispatch
        this.setAttribute("completed", this.toggleInput.checked);

        this.dispatchEvent(
            new CustomEvent("toggle-item", {
                detail: { id: this.id, completed: this.toggleInput.checked },
                bubbles: true,
            })
        );
    }

    removeItem() {
        // dispatch first, before updating item
        this.dispatchEvent(
            new CustomEvent("remove-item", {
                detail: { id: this.id },
                bubbles: true,
            })
        );
        this.remove();
    }

    updateItem(e) {
        if (e.target.value !== this.title) {
            if (e.target.value.length === 0) {
                this.removeItem();
            } else {
                this.setAttribute("title", e.target.value);
                this.dispatchEvent(
                    new CustomEvent("update-item", {
                        detail: { id: this.id, title: e.target.value },
                        bubbles: true,
                    })
                );
            }
        }

        this.cancelEdit();
    }

    addListeners() {
        this.toggleInput.addEventListener("change", this.toggleItem);
        this.todoText.addEventListener(
            "click",
            useDoubleClick(this.startEdit, 500)
        );
        this.editInput.addEventListener("blur", this.stopEdit);
        this.todoButton.addEventListener("click", this.removeItem);

        this.keysListeners.forEach((listener) => listener.connect());
    }

    removeListeners() {
        this.toggleInput.removeEventListener("change", this.toggleItem);
        this.todoText.removeEventListener("click", this.startEdit);
        this.editInput.removeEventListener("blur", this.stopEdit);
        this.todoButton.removeEventListener("click", this.removeItem);

        this.keysListeners.forEach((listener) => listener.disconnect());
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;

        if (this.connected)
            this.update(property);

    }

    connectedCallback() {
        this.connected = true;
        const node = document.importNode(template.content, true);

        this.item = node.querySelector(".todo-item");
        this.toggleLabel = node.querySelector(".toggle-todo-label");
        this.toggleInput = node.querySelector(".toggle-todo-input");
        this.todoText = node.querySelector(".todo-item-text");
        this.todoButton = node.querySelector(".remove-todo-button");
        this.editLabel = node.querySelector(".edit-todo-label");
        this.editInput = node.querySelector(".edit-todo-input");

        this.keysListeners.push(
            useKeyListener({
                target: this.editInput,
                event: "keyup",
                callbacks: {
                    ["Enter"]: this.updateItem,
                    ["Escape"]: this.cancelEdit,
                },
            }),
            useKeyListener({
                target: this.todoText,
                event: "keyup",
                callbacks: {
                    [" "]: this.startEdit, // this feels weird
                },
            })
        );

        this.update("id", "title", "completed");
        this.addListeners();

        this.shadow.append(node);
    }

    disconnectedCallback() {
        this.connected = false;
        this.removeListeners();

        this.item = undefined;
        this.toggleLabel = undefined;
        this.toggleInput = undefined;
        this.todoText = undefined;
        this.todoButton = undefined;
        this.editLabel = undefined;
        this.editInput = undefined;
    }
}

customElements.define("todo-item", TodoItem);

export default TodoItem;
