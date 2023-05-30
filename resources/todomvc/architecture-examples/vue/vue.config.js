const { defineConfig } = require("@vue/cli-service");
const isEmbedded = process.env.VUE_APP_EMBEDDED === "true";
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: "",
    outputDir: isEmbedded ? "embedded-dist" : "dist",
      chainWebpack: (config) => {
        config.plugin("html").tap((args) => {
          args[0].template = isEmbedded ? "public/embedded/index.html" : "public/index.html";
          return args;
        });
        config.plugin("copy").use(CopyWebpackPlugin, [
            {
              patterns: [
                {
                  from: "../../big-dom-generator/dist/logo.png",
                  to: ".",
                },
              ],
            },
          ]);
          config.when(isEmbedded, (config) => {
            config.entry("app").clear().add("./src/embedded.js");
          });
      },
    terser: {
        minify: "terser",
        terserOptions: {
            compress: true,
        },
    }
});
