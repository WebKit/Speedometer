import { html } from "lit";
import { LightDOMLitElement } from "./base";
import { chefTips } from "../../data/tips.js";
import "./section-heading.js";

class ChefTips extends LightDOMLitElement {
    static properties = {
        chefTips: {},
    };

    constructor() {
        super();
        this.chefTips = chefTips;
    }

    _getChefTipsTemplate() {
        return this.chefTips.map((tip) => {
            return html`
                <blockquote class="rounded-lg bg-gray-100 p-4 shadow-md">
                    <p class="italic text-gray-700">"${tip.quote}"</p>
                    <footer class="mt-2 text-right text-sm text-gray-500">- ${tip.author}</footer>
                </blockquote>
            `;
        });
    }

    render() {
        return html`
            <div class="p-4">
                <section-heading title="Chef's Tips"></section-heading>
                <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">${this._getChefTipsTemplate()}</div>
            </div>
        `;
    }
}

customElements.define("chef-tips", ChefTips);
