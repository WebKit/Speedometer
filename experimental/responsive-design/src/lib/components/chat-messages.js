import { html } from "lit";
import { ref, createRef } from "lit/directives/ref.js";
import { LightDOMLitElement } from "./base";

class ChatMessages extends LightDOMLitElement {
    static properties = {
        messages: { type: Array },
    };

    constructor() {
        super();
        this.messages = [];
        this.scrollContainerRef = createRef();
    }

    updated(changedProperties) {
        if (changedProperties.has("messages"))
            this._scrollToLastMessage();
    }

    _scrollToLastMessage() {
        const container = this.scrollContainerRef.value;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: "smooth",
            });
        }
    }

    _getMessagesTemplate() {
        return this.messages.map(
            (message) => html`
                <li class="${message.user ? "justify-end" : "justify-start"} flex">
                    <div class="${message.user ? "bg-teal-100 text-teal-900 md:max-w-36" : "bg-gray-200 text-gray-900 md:max-w-48"} text-pretty rounded-md px-3 py-2 text-xs">
                        ${message.user || message.bot} ${message.imageUrl ? html` <img src="${message.imageUrl}" alt="${message.imageAlt}" class="mt-2 h-32 w-full rounded-md" /> ` : ""}
                    </div>
                </li>
            `
        );
    }

    render() {
        return html`
            <ul ${ref(this.scrollContainerRef)} class="flex max-h-[345px] flex-1 flex-col space-y-2 overflow-y-auto p-2">
                ${this._getMessagesTemplate()}
            </ul>
        `;
    }
}

customElements.define("chat-messages", ChatMessages);
