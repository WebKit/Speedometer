import { html } from "lit";
import { LightDOMLitElement } from "./base";

class ChatInput extends LightDOMLitElement {
    static properties = {
        value: { type: String },
        placeholder: { type: String },
    };

    constructor() {
        super();
        this.value = "";
        this.placeholder = "Type your message...";
    }

    _handleKeyDown(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent("send-chat"));
        }
    }

    _sendMessage() {
        if (this.value.trim())
            this.dispatchEvent(new CustomEvent("send-chat", { bubbles: true, composed: true }));
    }

    render() {
        return html`
            <div class="min-h-12 flex items-center border-t border-gray-200 p-1">
                <label for="chat-input" class="sr-only">Chat Input</label>
                <textarea
                    id="chat-input"
                    name="chat-input"
                    class="block w-full resize-none rounded-md border border-gray-300 px-3 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="${this.placeholder}"
                    .value="${this.value}"
                    rows="1"
                    @keydown="${this._handleKeyDown}"
                >
                </textarea>
                <button @click="${this._sendMessage}" class="ml-2 rounded-md bg-teal-500 px-3 py-1 text-white hover:bg-teal-600 focus:outline-none">Send</button>
            </div>
        `;
    }
}

customElements.define("chat-input", ChatInput);
