import { html } from "lit";
import { LightDOMLitElement } from "./base";
import { recipes } from "../../data/recipes.js";
import "./recipe-card.js";

class RecipeGrid extends LightDOMLitElement {
    static properties = {
        _expandedCardIndices: { type: Array },
        recipes: { type: Array },
        isCompactLayout: { type: Boolean },
    };

    constructor() {
        super();
        this._expandedCardIndices = [];
        this.recipes = recipes;
        this.isCompactLayout = false;

        this._compactQuery = window.matchMedia("(max-width: 640px)");
        this._boundHandleLayoutChange = this._handleLayoutChange.bind(this);
    }

    connectedCallback() {
        super.connectedCallback();
        if (this._compactQuery && this._boundHandleLayoutChange) {
            this._compactQuery.addEventListener("change", this._boundHandleLayoutChange);
            this.isCompactLayout = this._compactQuery.matches;
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._compactQuery && this._boundHandleLayoutChange)
            this._compactQuery.removeEventListener("change", this._boundHandleLayoutChange);
    }

    async _handleLayoutChange(event) {
        this.isCompactLayout = event.matches;

        await this.updateComplete;

        window.dispatchEvent(new CustomEvent("resize-work-complete"));
    }

    _handleToggleExpand(event) {
        const { index, isExpanded } = event.detail;
        if (isExpanded)
            this._expandedCardIndices = [...this._expandedCardIndices, index];
        else
            this._expandedCardIndices = this._expandedCardIndices.filter((i) => i !== index);
    }

    _getRecipeCardsTemplate() {
        return this.recipes.map((recipe, index) => {
            const isExpanded = this._expandedCardIndices.includes(index);
            const gridClasses = this.isCompactLayout
                ? "relative rounded-lg bg-white text-left shadow-md hover:shadow-lg"
                : `${isExpanded ? "col-span-2 lg:col-span-2" : ""} grid-rows-subgrid relative row-span-6 mt-1 grid gap-0 rounded-lg bg-white text-left shadow-md hover:shadow-lg`;
            return html` <recipe-card class="${gridClasses}" .recipe="${recipe}" .isExpanded="${isExpanded}" .isCompactMode="${this.isCompactLayout}" .index="${index}" @toggle-expand="${this._handleToggleExpand}"></recipe-card> `;
        });
    }

    render() {
        const containerClass = this.isCompactLayout ? "grid grid-cols-1 gap-3 py-2 pl-2 pr-4" : "grid grid-cols-2 gap-5 py-2 pl-2 pr-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xl:gap-6";
        return html` <div class="${containerClass}" @toggle-expand="${this._handleToggleExpand}">${this._getRecipeCardsTemplate()}</div> `;
    }
}

customElements.define("recipe-grid", RecipeGrid);
