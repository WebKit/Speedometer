// https://nuxt.com/docs/api/configuration/nuxt-config
import path from "path";
import { defineNuxtConfig } from "nuxt/config";

export default defineNuxtConfig({
    ssr: false,
    css: ["news-site-css/dist/variables.css", "news-site-css/dist/global.css", "news-site-css/dist/a11y.css", "news-site-css/dist/icons.css", "news-site-css/dist/text.css"],
    components: ["~/components", "~/components/assets", "~/components/atoms", "~/components/molecules"],
    nitro: {
        output: {
            publicDir: path.join(__dirname, "dist"),
        },
    },
    app: {
        baseURL: development ? "" : "/resources/tentative/newssite/news-nuxt/dist",
    },
});
