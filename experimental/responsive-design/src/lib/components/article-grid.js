import { html } from "lit";
import { LightDOMLitElement } from "./base";
import { articles } from "../../data/articles.js";
import "./article-card.js";
import "./section-heading.js";

class ArticleGrid extends LightDOMLitElement {
    static properties = {
        articles: { type: Array },
    };
    constructor() {
        super();
        this.articles = articles;
    }

    _getArticlesTemplate() {
        return this.articles.map((article) => {
            return html`<article-card title="${article.title}" description="${article.description}" author="${article.author}" image="${article.image}" .tags="${article.tags}"></article-card>`;
        });
    }

    render() {
        return html`
            <div class="flex flex-col p-2">
                <section-heading title="Articles" subtitle="Read insightful articles about food, cooking tips, and more."></section-heading>
                <div class="content-auto grid grid-cols-1 gap-6 p-4 lg:grid-cols-1">${this._getArticlesTemplate()}</div>
            </div>
        `;
    }
}

customElements.define("article-grid", ArticleGrid);
