import { html } from "lit";
import { LightDOMLitElement } from "./base";

class RecipeCard extends LightDOMLitElement {
    static properties = {
        text: { type: String },
        description: { type: String },
        time: { type: String },
        calories: { type: String },
        servingSize: { type: String },
        image: { type: String },
        tags: { type: Array },
        ingredients: { type: Array },
        steps: { type: Array },
        isExpanded: { type: Boolean },
    };

    constructor() {
        super();
        this.text = "Recipe Card";
        this.description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        this.time = "5 mins";
        this.calories = "200 cals";
        this.servingSize = "2 servs";
        this.tags = ["DeliciousRecipes", "HomeCooking", "FoodLovers"];
        this.ingredients = ["Ingredient 1", "Ingredient 2", "Ingredient 3"];
        this.steps = ["Step 1", "Step 2", "Step 3"];
        this.isExpanded = false;
    }

    _toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.dispatchEvent(
            new Event("toggle-expand", {
                bubbles: true,
                composed: true,
            })
        );
    }

    _getStepsTemplate() {
        return this.steps.map(
            (step, index) => html`
                <li class="flex items-center space-x-2 text-xs">
                    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-orange-200 font-bold text-orange-800">${index + 1}</span>
                    <span>${step}</span>
                </li>
            `
        );
    }

    _getExpandedTemplate() {
        return html`
            <div class="flex justify-between p-2">
                <div>
                    <h4 class="text-xs font-semibold text-gray-700">Ingredients:</h4>
                    <ul class="list-inside list-disc space-y-1 pl-4 text-xs text-gray-600">
                        ${this.ingredients.map((ingredient) => html`<li>${ingredient}</li>`)}
                    </ul>
                </div>
                <div class="text-xs">
                    <h4 class="font-semibold text-gray-700">Steps:</h4>
                    <ol class="list-inside list-decimal space-y-1 pl-4 text-gray-600">
                        ${this._getStepsTemplate()}
                    </ol>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="row-span-6 grid grid-rows-subgrid rounded-lg bg-gradient-to-br from-blue-50 to-green-50 text-left shadow-md">
                <img src="${this.image}" alt="${this.text}" class="row-start-1 h-24 w-full rounded-t-lg object-cover" />
                <h3 class="row-start-2 px-1 text-sm">${this.text}</h3>
                <div class="row-start-3 flex max-w-40 justify-between px-2 pb-2 pt-0.5 text-xs text-gray-400">
                    <p>${this.time}</p>
                    |
                    <p>${this.calories}</p>
                    |
                    <p>${this.servingSize}</p>
                </div>
                <p class="row-start-4 truncate text-pretty px-2 py-1 text-xs text-gray-600">${this.description}</p>
                <div class="absolute -top-4 left-0 right-0 flex justify-center space-x-2 p-2">
                    ${this.tags.map((tag) => html`<span class="inline-flex items-center rounded-md bg-orange-100 px-1 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-orange-500/10">${tag}</span> `)}
                </div>
                ${this.isExpanded ? this._getExpandedTemplate() : ""}
                <button @click="${this._toggleExpand}" class="show-more-btn w-28 justify-self-end border-none bg-transparent p-1 text-sm text-blue-400 hover:text-blue-900">${this.isExpanded ? "Show Less" : "Show More..."}</button>
            </div>
        `;
    }
}

customElements.define("recipe-card", RecipeCard);
