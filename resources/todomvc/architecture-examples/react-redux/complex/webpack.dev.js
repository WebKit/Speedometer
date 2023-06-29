const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");
const htmlToInjectForComplex = getHtmlContent("shared/public/partial.html");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: React-Redux Complex DOM Development",
            template: "shared/public/index.html",
            templateParameters: {
                body: getHtmlContent("node_modules/big-dom-generator/dist/index.html", true).replace('<div class="todo-area">', `<div class="todo-area"><div class="todoholder">${htmlToInjectForComplex}</div>`),
                htmlClasses: "spectrum spectrum--medium spectrum--light",
            },
        }),
    ],
    devServer: {
        static: "./complex/dist",
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
});
