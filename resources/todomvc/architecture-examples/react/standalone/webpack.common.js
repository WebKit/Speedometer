const HtmlWebpackPlugin = require("html-webpack-plugin");

const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent");

module.exports = {
    entry: {
        app: "./standalone/src/index.js",
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: React",
            template: "shared/public/index.html",
            templateParameters: {
                body: getHtmlContent("shared/public/partial.html"),
                htmlClasses: "",
            },
        }),
    ],
    resolve: {
        extensions: [".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
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
