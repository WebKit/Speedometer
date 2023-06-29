const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

module.exports = merge(common, {
    mode: "development",
    devtool: "inline-source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: React-Redux Development",
            template: "shared/public/index.html",
            templateParameters: {
                body: getHtmlContent("standalone/public/partial.html"),
                htmlClasses: "",
            },
        }),
    ],
    devServer: {
        static: "./standalone/dist",
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
