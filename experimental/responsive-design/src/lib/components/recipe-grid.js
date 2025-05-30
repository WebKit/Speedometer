import { html } from "lit";
import { LightDOMLitElement } from "./base";
import { recipes } from "../../data/recipes.js";
import "./recipe-card.js";

class RecipeGrid extends LightDOMLitElement {
    static properties = {
        _expandedCardIndices: { type: Array },
        recipes: { type: Array },
    };

    constructor() {
        super();
        this._expandedCardIndices = [];
        this.recipes = recipes;
    }

    _handleToggleExpand(event) {
        const target = event.target;
        const cardIndex = parseInt(target.dataset.index);
        if (target.isExpanded)
            this._expandedCardIndices = [...this._expandedCardIndices, cardIndex];
        else
            this._expandedCardIndices = this._expandedCardIndices.filter((index) => index !== cardIndex);
    }

    _getRecipeCardsTemplate() {
        return this.recipes.map(
            (recipe, index) => html`
                <recipe-card
                    class="${this._expandedCardIndices.includes(index) ? "col-span-2 lg:col-span-2" : ""} grid-rows-subgrid relative row-span-6 mt-1 grid gap-0 rounded-lg bg-white text-left shadow-md hover:shadow-lg"
                    .recipe="${recipe}"
                    data-index="${index}"
                ></recipe-card>
            `
        );
    }

    render() {
        return html` <div class="grid grid-cols-2 gap-5 py-2 pl-2 pr-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6" @toggle-expand="${this._handleToggleExpand}">${this._getRecipeCardsTemplate()}</div> `;
    }
}

customElements.define("recipe-grid", RecipeGrid);
