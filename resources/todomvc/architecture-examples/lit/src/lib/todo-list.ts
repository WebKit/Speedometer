import { LitElement, html, css, nothing } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { property } from "lit/decorators/property.js";
import { repeat } from "lit/directives/repeat.js";

import { todoStyles } from "./todo.css.js";
import { Todos } from "./todos.js";

import "./todo-item.js";
import { ToggleAllTodoEvent } from "./events.js";
import { updateOnEvent } from "./utils.js";

@customElement("todo-list")
export class TodoList extends LitElement {
    static override styles = [
        todoStyles,
        css`
            :host {
                display: block;
            }
            .todo-list {
                margin: 0;
                padding: 0;
                list-style: none;
            }
            .toggle-all {
                text-align: center;
                border: none; /* Mobile Safari */
                opacity: 0;
                position: absolute;
            }

            .toggle-all + label {
                width: 60px;
                height: 34px;
                font-size: 0;
                position: absolute;
                top: -52px;
                left: -13px;
                -webkit-transform: rotate(90deg);
                transform: rotate(90deg);
            }

            .toggle-all + label:before {
                content: "❯";
                font-size: 22px;
                color: #e6e6e6;
                padding: 10px 27px 10px 27px;
            }

            .toggle-all:checked + label:before {
                color: #737373;
            }
        `,
    ];

    @updateOnEvent("change")
    @property({ attribute: false })
    todoList?: Todos;

    override render() {
        return html`
            ${(this.todoList?.all.length ?? 0) > 0
                ? html`
                      <input @change=${this.#onToggleAllChange} id="toggle-all" type="checkbox" class="toggle-all" .checked=${this.todoList?.allCompleted ?? false} />
                      <label for="toggle-all"> Mark all as complete </label>
                  `
                : nothing}
            <ul class="todo-list">
                ${repeat(
                    this.todoList?.filtered() ?? [],
                    (todo) => todo.id,
                    (todo) => html`<todo-item .todo=${todo}></todo-item>`
                )}
            </ul>
        `;
    }

    #onToggleAllChange() {
        this.dispatchEvent(new ToggleAllTodoEvent());
    }

    getToggles(): HTMLInputElement[] {
        const toggles = [];
        for (const item of this.renderRoot.querySelectorAll("todo-item")) {
            toggles.push(item.toggle);
        }
        return toggles;
    }

    getDestroyButtons(): HTMLButtonElement[] {
        const buttons = [];
        for (const item of this.renderRoot.querySelectorAll("todo-item")) {
            buttons.push(item.destroyButton);
        }
        return buttons;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "todo-list": TodoList;
    }
}
