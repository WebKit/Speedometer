import { html } from "lit";
import { LightDOMLitElement } from "./base";

class ArticleCard extends LightDOMLitElement {
    static properties = {
        title: { type: String },
        description: { type: String },
        author: { type: String },
        date: { type: String },
        image: { type: String },
        tags: { type: Array },
    };

    constructor() {
        super();
        this.title = "Vegan Desserts That Will Satisfy Your Sweet Tooth";
        this.description = "Indulge in these delicious vegan desserts that are sure to satisfy your sweet cravings. Perfect for any occasion.";
        this.author = "Sarah Lee";
        this.date = "2023-06-25";
        this.image = "./public/images/placeholder-image-150.svg";
        this.tags = ["vegan", "desserts", "sweet"];
    }

    render() {
        const tags = this.tags.map((tag) => html`<span class="inline-flex items-center rounded-md bg-orange-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-orange-500/10">${tag}</span>`);
        return html`
            <div class="flex transform flex-row rounded-lg bg-gradient-to-br from-blue-50 to-green-50 shadow-md hover:scale-105 hover:shadow-lg">
                <div class="flex w-2/3 flex-col justify-between p-4">
                    <div>
                        <h3>${this.title}</h3>
                        <p class="mt-2 text-sm text-gray-600">${this.description}</p>
                    </div>
                    <div class="mt-4 flex flex-wrap gap-2">${tags}</div>
                    <div class="mt-4 text-xs text-gray-500">
                        <p>By ${this.author} on ${this.date}</p>
                    </div>
                </div>
                <img src="${this.image}" alt="${this.title}" class="ml-4 w-1/3 object-cover" />
            </div>
        `;
    }
}

customElements.define("article-card", ArticleCard);
