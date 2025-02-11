import { html } from "lit";
import { LightDOMLitElement } from "./base";
import "./section-heading.js";

class NewsletterSignup extends LightDOMLitElement {
    render() {
        return html`
            <div class="mt-8 rounded-lg bg-gray-100 p-4 shadow-md">
                <section-heading title="Stay Updated" subtitle="Sign up for our newsletter to receive the latest recipes and updates."></section-heading>
                <form class="mt-4">
                    <label for="email" class="sr-only">Enter your email</label>
                    <input id="email" type="email" placeholder="Enter your email" class="w-full rounded-md border border-gray-300 p-2" />
                    <button type="submit" class="mt-2 w-full rounded-md bg-orange-500 p-2 text-white hover:bg-orange-600">Subscribe</button>
                </form>
            </div>
        `;
    }
}

customElements.define("newsletter-signup", NewsletterSignup);
