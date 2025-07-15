import { html } from "lit";
import { LightDOMLitElement } from "./base";

class RecipeCard extends LightDOMLitElement {
    static properties = {
        recipe: { type: Object },
        isExpanded: { type: Boolean },
        isCompactMode: { type: Boolean },
        index: { type: Number },
    };

    constructor() {
        super();
        this.recipe = {
            text: "Recipe Card",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            time: "5 mins",
            calories: "200 cals",
            servingSize: "2 servs",
            tags: ["DeliciousRecipes", "HomeCooking"],
            ingredients: ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
            steps: ["Step 1", "Step 2", "Step 3"],
        };
        this.isExpanded = false;
        this.isCompactMode = false;
        this.index = 0;
    }

    _getPillColor(tag) {
        const colorThemes = {
            orange: {
                tags: ["italian", "pizza", "pancakes", "breakfast"],
                classes: "bg-orange-100 text-orange-800 border-orange-200",
            },
            red: {
                tags: ["mexican", "tacos", "beef"],
                classes: "bg-red-100 text-red-800 border-red-200",
            },
            yellow: {
                tags: ["thai", "cookies", "curry"],
                classes: "bg-yellow-100 text-yellow-800 border-yellow-200",
            },
            green: {
                tags: ["salad", "vegetarian", "stir fry"],
                classes: "bg-green-100 text-green-800 border-green-200",
            },
            amber: {
                tags: ["soup", "bread", "comfort"],
                classes: "bg-amber-100 text-amber-800 border-amber-200",
            },
            blue: {
                tags: ["greek", "pasta"],
                classes: "bg-blue-100 text-blue-800 border-blue-200",
            },
            pink: {
                tags: ["dessert"],
                classes: "bg-pink-100 text-pink-800 border-pink-200",
            },
            rose: {
                tags: ["cake"],
                classes: "bg-rose-100 text-rose-800 border-rose-200",
            },
            purple: {
                tags: ["spanish"],
                classes: "bg-purple-100 text-purple-800 border-purple-200",
            },
            cyan: {
                tags: ["seafood"],
                classes: "bg-cyan-100 text-cyan-800 border-cyan-200",
            },
            emerald: {
                tags: ["healthy"],
                classes: "bg-emerald-100 text-emerald-800 border-emerald-200",
            },
            gray: {
                tags: ["side"],
                classes: "bg-gray-100 text-gray-800 border-gray-200",
            },
        };

        const lowerTag = tag.toLowerCase();

        for (const theme of Object.values(colorThemes)) {
            if (theme.tags.includes(lowerTag))
                return theme.classes;
        }

        return "bg-slate-100 text-slate-800 border-slate-200";
    }

    _toggleExpand() {
        this.isExpanded = !this.isExpanded;
        this.dispatchEvent(
            new CustomEvent("toggle-expand", {
                bubbles: true,
                composed: true,
                detail: {
                    index: this.index,
                    isExpanded: this.isExpanded,
                },
            })
        );
    }

    _getStepsTemplate() {
        return this.recipe.steps.map(
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
                        ${this.recipe.ingredients.map((ingredient) => html`<li>${ingredient}</li>`)}
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

    _compactCard() {
        return html`
            <div class="relative overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md">
                <div class="flex items-center space-x-3 p-3">
                    <img src="${this.recipe.image}" alt="${this.recipe.text}" class="h-16 w-16 flex-shrink-0 rounded-lg object-cover" />
                    <div class="min-w-0 flex-1">
                        <h3 class="truncate text-sm font-medium text-gray-900">${this.recipe.text}</h3>
                        <div class="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                            <span>${this.recipe.time}</span>
                            <span>•</span>
                            <span>${this.recipe.calories}</span>
                            <span>•</span>
                            <span>${this.recipe.servingSize}</span>
                        </div>
                        <p class="mt-1 truncate text-xs text-gray-600">${this.recipe.description}</p>
                        <!-- Tags in compact mode -->
                        <div class="mt-2 flex flex-wrap gap-1">${this.recipe.tags.map((tag) => html`<span class="${this._getPillColor(tag)} inline-block rounded-full border px-2 py-0.5 text-xs font-medium">${tag}</span> `)}</div>
                    </div>
                    <button class="show-more-btn flex-shrink-0 text-sm text-blue-500 hover:text-blue-700" @click="${this._toggleExpand}">${this.isExpanded ? "Less" : "More"}</button>
                </div>
                ${this.isExpanded ? this._getExpandedTemplate() : ""}
            </div>
        `;
    }

    _gridCard() {
        return html`
            <div class="grid-rows-subgrid row-span-6 grid rounded-lg bg-gradient-to-br from-blue-50 to-green-50 text-left shadow-md">
                <img src="${this.recipe.image}" alt="${this.recipe.text}" class="row-start-1 h-24 w-full rounded-t-lg object-cover" />
                <h3 class="row-start-2 px-1 text-sm">${this.recipe.text}</h3>
                <div class="max-w-40 row-start-3 flex justify-between px-2 pb-2 pt-0.5 text-xs text-gray-400">
                    <p>${this.recipe.time}</p>
                    |
                    <p>${this.recipe.calories}</p>
                    |
                    <p>${this.recipe.servingSize}</p>
                </div>
                <p class="text-pretty row-start-4 truncate px-2 py-1 text-xs text-gray-600">${this.recipe.description}</p>
                <div class="absolute -top-4 left-0 right-0 flex justify-center space-x-2 p-2">
                    ${this.recipe.tags.map((tag) => html`<span class="${this._getPillColor(tag)} inline-flex items-center rounded-full border p-1 text-xs font-medium">${tag}</span> `)}
                </div>
                ${this.isExpanded ? this._getExpandedTemplate() : ""}
                <button @click="${this._toggleExpand}" class="show-more-btn w-28 justify-self-end border-none bg-transparent p-1 text-sm text-blue-400 hover:text-blue-900">${this.isExpanded ? "Show Less" : "Show More..."}</button>
            </div>
        `;
    }

    render() {
        return this.isCompactMode ? this._compactCard() : this._gridCard();
    }
}

customElements.define("recipe-card", RecipeCard);
