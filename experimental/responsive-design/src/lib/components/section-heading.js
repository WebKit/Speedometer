import { html } from "lit";
import { when } from "lit/directives/when.js";
import { LightDOMLitElement } from "./base";

class SectionHeading extends LightDOMLitElement {
    static properties = {
        title: { type: String },
        subtitle: { type: String },
    };

    render() {
        return html`
            <h2 class="has-[+p]:mb-1 text-left leading-9 tracking-tight">${this.title}</h2>
            ${when(this.subtitle, () => html`<p class="pl-1 text-sm text-gray-600">${this.subtitle}</p>`)}
        `;
    }
}

customElements.define("section-heading", SectionHeading);
