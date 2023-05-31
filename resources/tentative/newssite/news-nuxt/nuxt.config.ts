// https://nuxt.com/docs/api/configuration/nuxt-config
const path = require('path');
const development = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
    ssr: false,
    /* router: {
        options: {
          hashMode: true
        }
    }, */
    css: [
        /* '~/assets/styles/global.css', */
        'news-site-css/dist/variables.css',
        'news-site-css/dist/global.css',
        'news-site-css/dist/a11y.css',
        'news-site-css/dist/icons.css',
        'news-site-css/dist/text.css',
    ],
    components: [
        '~/components',
        '~/components/assets',
        '~/components/atoms',
        '~/components/molecules'
    ],
    nitro: {
        output: {
            publicDir: path.join(__dirname, 'docs')
        }
    },
    app: {
        baseURL: development ? "" : '/news-site-nuxt-static',
    }
})
