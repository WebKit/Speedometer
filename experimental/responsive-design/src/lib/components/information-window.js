import { LitElement, html, adoptStyles } from "lit";
import { restaurants } from "../../data/restaurants.js";
import "./restaurant-card.js";

import chatWindowStyles from "../chat-window.constructable.js";
class InformationWindow extends LitElement {
    static properties = {
        restaurants: { type: Array },
        _isChatExpanded: { type: Boolean },
        _currentIndex: { type: Number },
        chatWindow: { type: Object },
    };

    constructor() {
        super();
        this.restaurants = restaurants;
        this._isChatExpanded = true;
        this._currentIndex = 0;
    }

    connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [chatWindowStyles]);
    }

    firstUpdated() {
        if (this.chatWindow)
            this.setupResizeObserver();
    }

    setupResizeObserver() {
        if (this.resizeObserver)
            this.resizeObserver.disconnect();

        const chatWindowInner = this.chatWindow.shadowRoot.querySelector("#chat-window");
        if (chatWindowInner) {
            this.resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    const height = entry.contentRect.height;
                    this._isChatExpanded = height > 350;
                    this._currentIndex = 0;
                    this.updateCarousel();
                    this.requestUpdate();
                }
            });

            this.resizeObserver.observe(chatWindowInner);
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.resizeObserver && this.chatWindow)
            this.resizeObserver.unobserve(this.chatWindow);
    }

    handleChatResize(event) {
        this._isChatExpanded = event.detail.isExpanded;
        this._currentIndex = 0;
        this.updateCarousel();
        this.requestUpdate();
    }

    previousCard() {
        if (this._currentIndex > 0) {
            this._currentIndex--;
            this.updateCarousel();
        }
    }

    nextCard() {
        if (this._currentIndex < this.restaurants.length - 1) {
            this._currentIndex++;
            this.updateCarousel();
        }
    }

    updateCarousel() {
        const cardRow = this.shadowRoot.querySelector(".card-row");
        if (cardRow)
            cardRow.style.transform = `translateX(-${this._currentIndex * 100}%)`;

        this.requestUpdate();
    }

    _getExpandedTemplate() {
        return html`
            <div class="relative w-full overflow-hidden">
                <button
                    class="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full border-0 bg-black bg-opacity-50 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    @click="${this.previousCard}"
                    ?disabled="${this._currentIndex === 0}"
                >
                    &lt;
                </button>
                <div class="card-row flex w-full">
                    ${this.restaurants.map((restaurant) => html` <restaurant-card title="${restaurant.title}" distance="${restaurant.distance}" rating="${restaurant.rating}" class="box-border w-full flex-none p-2"></restaurant-card> `)}
                </div>
                <button
                    class="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full border-0 bg-black bg-opacity-50 p-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                    @click="${this.nextCard}"
                    ?disabled="${this._currentIndex === this.restaurants.length - 1}"
                >
                    &gt;
                </button>
            </div>
        `;
    }

    _getGridTemplate() {
        return html` <div class="grid grid-cols-2 gap-4">${this.restaurants.map((restaurant) => html` <restaurant-card title="${restaurant.title}" distance="${restaurant.distance}" rating="${restaurant.rating}"></restaurant-card> `)}</div> `;
    }

    render() {
        return html`
            <div class="p-1">
                <h4 class="my-1 mb-1 text-base font-semibold text-gray-700">Restaurants Near You</h4>
                ${this._isChatExpanded ? this._getExpandedTemplate() : this._getGridTemplate()}
            </div>
        `;
    }
}

customElements.define("information-window", InformationWindow);
