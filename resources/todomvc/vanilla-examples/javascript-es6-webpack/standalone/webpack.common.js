const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

module.exports = {
    entry: {
        app: "./standalone/src/app.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: JavaScript Es6 Webpack",
            template: "/shared/index.html",
            templateParameters: {
                body: getHtmlContent("shared/partial.html"),
                htmlClasses: "",
            },
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
        ],
    },
};
