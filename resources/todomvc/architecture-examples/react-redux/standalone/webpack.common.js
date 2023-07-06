const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

module.exports = {
    entry: {
        app: "./standalone/src/index.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: React-Redux",
            template: "shared/public/index.html",
            templateParameters: {
                body: getHtmlContent("shared/public/partial.html"),
                htmlClasses: "",
            },
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        clean: true,
    },
    resolve: {
        extensions: [".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /nodeModules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: "defaults" }],
                            ["@babel/preset-react", { runtime: "automatic" }],
                        ],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: "asset/resource",
            },
        ],
    },
};
