const { defineConfig } = require("@vue/cli-service");
const webpack = require("webpack");
module.exports = defineConfig({
    transpileDependencies: true,
    publicPath: "",
    configureWebpack: {
        plugins: [new webpack.EvalSourceMapDevToolPlugin({})],
    },
    terser: {
        minify: "terser",
        terserOptions: {
            compress: true,
        },
    },
});
