import { html } from "lit";
import { LightDOMLitElement } from "./base";

class SectionHeading extends LightDOMLitElement {
    static properties = {
        title: { type: String },
        subtitle: { type: String },
    };

    render() {
        return html`
            <h2 class="text-left leading-9 tracking-tight has-[+p]:mb-1">${this.title}</h2>
            ${this.subtitle ? html`<p class="pl-1 text-sm text-gray-600">${this.subtitle}</p>` : ""}
        `;
    }
}

customElements.define("section-heading", SectionHeading);
