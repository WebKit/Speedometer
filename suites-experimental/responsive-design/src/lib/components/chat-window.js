import { LitElement, adoptStyles, html, nothing } from "lit";
import { messages as initialMessages } from "../../data/messages.js";
import "./chat-messages.js";
import "./chat-input.js";

import chatWindowStyles from "../chat-window.constructable.js";

class ChatWindow extends LitElement {
    static properties = {
        _isExpanded: { type: Boolean },
        _isLoaded: { type: Boolean },
        _currentChat: { type: String },
        messages: { type: Array },
        _showOptions: { type: Boolean },
    };

    constructor() {
        super();
        this._isExpanded = true;
        this._isLoaded = false;
        this._currentChat = "";
        this.messages = [];
        this._showOptions = true;
    }

    connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [chatWindowStyles]);
    }

    _toggleExpand() {
        this._isExpanded = !this._isExpanded;
        this._showOptions = this._isExpanded;
    }

    _resumePreviousChat() {
        this._isLoaded = true;
        this._showOptions = false;
        this.messages = initialMessages;
    }

    _startNewChat() {
        this._isLoaded = true;
        this.messages = [];
        this._showOptions = false;
    }

    _handleSendChat() {
        if (this._currentChat.trim()) {
            this.messages = [...this.messages, { user: this._currentChat }, { bot: "Here's the image for you!", imageUrl: "./public/images/tomato-soup.webp", imageAlt: "Tomato Soup" }];
            this._currentChat = "";
        }
    }

    _handleInputChange(e) {
        this._currentChat = e.target.value;
    }

    _getOptionsTemplate() {
        return html`
            <div class="flex flex-1 flex-col items-center justify-center gap-4 self-center p-4">
                <button id="resume-previous-chat-btn" @click="${this._resumePreviousChat}" class="w-full rounded-md bg-teal-600/50 px-4 py-2 text-white hover:bg-teal-600 focus:outline-none">Resume Previous Chat</button>
                <button @click="${this._startNewChat}" class="w-full rounded-md bg-orange-500/50 px-4 py-2 text-white hover:bg-orange-500 focus:outline-none">Start a New Conversation</button>
            </div>
        `;
    }

    _getChatTemplate() {
        return html`
            <div class="flex flex-1 flex-col">
                <chat-messages class="flex-1 overflow-y-auto" .messages="${this.messages}"></chat-messages>
                <chat-input .value="${this._currentChat}" @input="${this._handleInputChange}" @send-chat="${this._handleSendChat}"></chat-input>
            </div>
        `;
    }

    _getContentTemplate() {
        if (!this._isExpanded)
            return nothing;
        return this._showOptions ? this._getOptionsTemplate() : this._getChatTemplate();
    }

    render() {
        return html`
            <div id="chat-window" class="${this._isExpanded ? "h-[440px]" : "h-12"} bottom-2 right-2 m-auto flex flex-col rounded-lg border-2 border-solid bg-gray-50 shadow-lg sm:sticky sm:w-full md:fixed md:w-1/3">
                <div class="${this._isExpanded ? "rounded-t-lg" : "rounded-lg"} flex items-center justify-between bg-teal-600/75 px-4 py-2 text-white shadow-md">
                    <p class="text-lg font-semibold">Chef AI</p>
                    <button id="expand-chat-btn" @click="${this._toggleExpand}" class="rounded-full bg-white px-2 py-1 text-sm text-teal-600/75 hover:bg-teal-100 focus:outline-none">${this._isExpanded ? "Collapse" : "Expand"}</button>
                </div>
                ${this._getContentTemplate()}
            </div>
        `;
    }
}

customElements.define("chat-window", ChatWindow);
