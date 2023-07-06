const { defineConfig } = require("@vue/cli-service");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { getHtmlContent } = require("../shared/utils/getHtmlContent");

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: "",
    outputDir: "complex/dist",
    chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
            args[0].title = "TodoMVC: Vue Complex DOM";
            args[0].template = "shared/public/index.html";
            args[0].templateParameters = {
                body: getHtmlContent("node_modules/big-dom-generator/dist/index.html"),
                htmlClasses: "spectrum spectrum--medium spectrum--light",
            };
            return args;
        });
        config.plugin("copy").use(CopyWebpackPlugin, [
            {
                patterns: [
                    {
                        from: "node_modules/big-dom-generator/dist/logo.png",
                        to: ".",
                    },
                ],
            },
        ]);
        config.entry("app").clear().add("./complex/src/main.js");
    },
    terser: {
        minify: "terser",
        terserOptions: {
            compress: true,
        },
    },
});
