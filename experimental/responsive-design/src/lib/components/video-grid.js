import { html } from "lit";
import { LightDOMLitElement } from "./base";
import { videos } from "../../data/videos.js";
import "./video-card.js";
import "./section-heading.js";

class VideoGrid extends LightDOMLitElement {
    static properties = {
        videos: { type: Array },
    };

    constructor() {
        super();
        this.videos = videos;
    }

    _getVideoCardsTemplate() {
        return this.videos.map((video) => {
            return html`<video-card text="${video.text}" description="${video.description}"></video-card>`;
        });
    }

    render() {
        return html`
            <div class="flex flex-col p-2">
                <section-heading title="Videos" subtitle="Watch and learn from our collection of cooking videos."></section-heading>
                <div class="content-auto grid grid-cols-1 gap-6 p-4 lg:grid-cols-2 xl:gap-7">${this._getVideoCardsTemplate()}</div>
            </div>
        `;
    }
}

customElements.define("video-grid", VideoGrid);
