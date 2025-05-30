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
                behavior: "instant",
            });
        }
    }

    _getMessagesTemplate() {
        return this.messages.map(
            (message) => html`
                <li class="${message.user ? "justify-end" : "justify-start"} flex items-start">
                    ${message.user
        ? html` <div class="flex items-center space-x-2">
                              <div class="text-pretty rounded-md bg-teal-600 px-3 py-2 text-xs text-white lg:text-base">
                                  ${message.user} ${message.imageUrl ? html`<img src="${message.imageUrl}" alt="${message.imageAlt}" class="mt-2 h-32 w-full rounded-md" />` : ""}
                              </div>
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="8" r="4" />
                                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                              </svg>
                          </div>`
        : html`
                              <div class="flex items-center space-x-2">
                                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 flex-shrink-0 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                      <rect x="6" y="4" width="12" height="12" rx="2" />
                                      <circle cx="9" cy="10" r="1" />
                                      <circle cx="15" cy="10" r="1" />
                                      <path d="M8 16h8" />
                                  </svg>
                                  <div class="text-pretty rounded-md bg-gray-200 px-3 py-2 text-xs text-gray-900 lg:text-base">
                                      ${message.bot} ${message.imageUrl ? html`<img src="${message.imageUrl}" alt="${message.imageAlt}" class="mt-2 h-32 w-full rounded-md" />` : ""}
                                  </div>
                              </div>
                          `}
                </li>
            `
        );
    }

    render() {
        return html`
            <ul ${ref(this.scrollContainerRef)} class="flex max-h-[345px] flex-1 flex-col space-y-4 overflow-y-auto p-2">
                ${this._getMessagesTemplate()}
            </ul>
        `;
    }
}

customElements.define("chat-messages", ChatMessages);
