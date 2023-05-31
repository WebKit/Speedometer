// https://nuxt.com/docs/api/configuration/nuxt-config
const path = require("path");

// used for github pages
// const development = process.env.NODE_ENV === "development";

// eslint-disable-next-line no-undef
export default defineNuxtConfig({
    ssr: false,
    css: [
        "news-site-css/dist/variables.css",
        "news-site-css/dist/global.css",
        "news-site-css/dist/a11y.css",
        "news-site-css/dist/icons.css",
        "news-site-css/dist/text.css",
    ],
    components: [
        "~/components",
        "~/components/assets",
        "~/components/atoms",
        "~/components/molecules"
    ],
    nitro: {
        output: {
            // used for github pages
            // publicDir: path.join(__dirname, "docs")
            publicDir: path.join(__dirname, "dist")
        }
    },
    app: {
        // used for github pages
        // baseURL: development ? "" : "/news-site-nuxt-static",
    }
});
