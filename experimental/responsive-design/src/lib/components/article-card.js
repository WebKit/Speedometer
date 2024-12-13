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
            <div class="col-span-2 grid grid-cols-subgrid gap-4 rounded-lg bg-gradient-to-br from-blue-50 to-green-50 shadow-md hover:shadow-lg">
                <div class="flex flex-col justify-around p-4 xl:p-6">
                    <div>
                        <h3 class="lg:text-lg">${this.title}</h3>
                        <p class="mt-6 text-sm text-gray-600 lg:text-base">${this.description}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                        <div class="text-sm text-gray-500">
                            <p>By <b>${this.author}</b> on ${this.date}</p>
                        </div>
                        <div class="flex flex-wrap gap-2">${tags}</div>
                    </div>
                </div>
                <div class="flex">
                    <img src="${this.image}" alt="${this.title}" class="w-full object-cover" />
                </div>
            </div>
        `;
    }
}

customElements.define("article-card", ArticleCard);
