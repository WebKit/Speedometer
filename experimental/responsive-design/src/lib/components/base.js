import { LitElement } from "lit";

export class LightDOMLitElement extends LitElement {
    createRenderRoot() {
        return this; // Render into the light DOM instead of shadow DOM
    }
}
