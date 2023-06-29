const { defineConfig } = require("@vue/cli-service");
const { getHtmlContent } = require("../shared/utils/getHtmlContent");

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: "",
    outputDir: "standalone/dist",
    chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
            args[0].title = "TodoMVC: Vue";
            args[0].template = "shared/public/index.html";
            args[0].templateParameters = {
                body: getHtmlContent("standalone/public/partial.html"),
                htmlClasses: "",
            };
            return args;
        });
        config.entry("app").clear().add("./standalone/src/main.js");
    },
    terser: {
        minify: "terser",
        terserOptions: {
            compress: true,
        },
    },
});
