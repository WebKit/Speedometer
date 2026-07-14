import { html } from "lit";
import { LightDOMLitElement } from "./base";

class RestaurantCard extends LightDOMLitElement {
    static properties = {
        title: { type: String },
        distance: { type: String },
        rating: { type: String },
    };

    constructor() {
        super();
        this.title = "Urban Eats";
        this.distance = "0.8";
        this.rating = "4.2";
    }

    render() {
        return html`
            <div class="flex h-full flex-col justify-center rounded-lg bg-gradient-to-br from-white to-orange-100 p-[0.2rem] shadow-md">
                <div class="mb-1 text-xs font-bold">${this.title}</div>
                <div class="mb-[0.25rem] text-[0.675rem] text-gray-600">${this.distance} miles</div>
                <div class="text-[0.675rem] text-gray-400">${this.rating} stars</div>
            </div>
        `;
    }
}

customElements.define("restaurant-card", RestaurantCard);
