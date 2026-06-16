import { html } from "lit";
import { LightDOMLitElement } from "./base";

class RibbonButton extends LightDOMLitElement {
    static properties = {
        text: { type: String },
        variant: { type: String },
        iconPosition: { type: String },
    };

    constructor() {
        super();
        this.text = "Button";
        this.variant = "secondary";
        this.iconPosition = "0px 0px";
    }

    render() {
        const colorClass = this.variant === "primary" ? "bg-orange-400 hover:bg-orange-500" : "bg-teal-600 hover:bg-teal-800";
        return html`
            <button class="${colorClass} mx-1 inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold text-white shadow-md ring-1 ring-inset ring-gray-300">
                <!-- Heroicons are MIT licensed. See https://github.com/tailwindlabs/heroicons/blob/master/LICENSE -->
                <span class="h-6 w-6" style="background: url(./public/images/icons-outline.webp); background-position: ${this.iconPosition};"></span>
                <span class="text-white">${this.text}</span>
            </button>
        `;
    }
}

customElements.define("ribbon-button", RibbonButton);
