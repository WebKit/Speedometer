import { html } from "lit";
import { LightDOMLitElement } from "./base";
import "./recipe-grid.js";
import "./recipe-carousel.js";
import "./section-heading.js";

class MainContent extends LightDOMLitElement {
    render() {
        return html`<div class="grid h-full grow content-center gap-1 p-4">
            <section-heading title="Featured Recipes"></section-heading>
            <recipe-carousel></recipe-carousel>
            <section-heading title="Delicious Recipes" subtitle="Explore a variety of recipes to satisfy your culinary cravings."></section-heading>
            <recipe-grid></recipe-grid>
        </div>`;
    }
}
customElements.define("main-content", MainContent);
