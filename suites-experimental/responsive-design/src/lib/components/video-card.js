import { html } from "lit";
import { LightDOMLitElement } from "./base";

class VideoCard extends LightDOMLitElement {
    static properties = {
        text: { type: String },
        description: { type: String },
    };

    constructor() {
        super();
        this.text = "Modern Video Title";
        this.description = "A brief description of the video content goes here.";
    }

    render() {
        return html`
            <div class="rounded-lg bg-white shadow-md">
                <video controls class="w-full rounded-t-lg object-cover">
                    <source type="video/mp4" />
                    <p>Your browser doesn't support HTML video.</p>
                </video>
                <div class="p-4">
                    <h3 class="text-base font-medium text-gray-900">${this.text}</h3>
                    <p class="mt-2 text-sm text-gray-600">${this.description}</p>
                </div>
            </div>
        `;
    }
}

customElements.define("video-card", VideoCard);
