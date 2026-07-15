import { LitElement, adoptStyles, html } from "lit";
import "./app-ribbon.js";
import "./chat-window.js";
import "./information-window.js";
import "./main-content.js";
import "./video-grid.js";
import "./article-grid.js";
import "./newsletter-signup.js";
import "./chef-tips.js";
import mainStyles from "../main.constructable.js";

export class CookingApp extends LitElement {
    connectedCallback() {
        super.connectedCallback();
        adoptStyles(this.shadowRoot, [mainStyles]);
    }

    firstUpdated() {
        const chatWindow = this.shadowRoot.querySelector("chat-window");
        const infoWindow = this.shadowRoot.querySelector("information-window");
        if (chatWindow && infoWindow)
            infoWindow.chatWindow = chatWindow;
    }

    render() {
        return html`
            <div class="grid h-full grid-cols-1 gap-1 bg-white md:grid-cols-3">
                <div class="flex flex-col sm:col-span-2">
                    <h1 class="leading-7 tracking-tight">Cook Book</h1>
                    <app-ribbon></app-ribbon>
                    <main-content></main-content>
                </div>
                <div class="flex w-full flex-col md:col-start-3 md:row-start-1 md:row-end-6 md:grid-cols-1">
                    <div class="flex md:block">
                        <chat-window class="w-full md:basis-full"></chat-window>
                        <div class="hidden grow-0 basis-[content] text-center md:block">
                            <information-window></information-window>
                        </div>
                    </div>
                </div>
                <video-grid class="sm:col-span-2"></video-grid>
                <article-grid class="sm:col-span-2"></article-grid>
                <chef-tips class="sm:col-span-2"></chef-tips>
                <newsletter-signup class="flex justify-center p-4 sm:col-span-2"></newsletter-signup>
            </div>
        `;
    }
}

customElements.define("cooking-app", CookingApp);
