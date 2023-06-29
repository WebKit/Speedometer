const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");
const { getHtmlContent } = require("big-dom-generator/utils/getHtmlContent.js");
const htmlToInjectForComplex = getHtmlContent("shared/partial.html");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new CopyPlugin({
            patterns: [{ from: "node_modules/big-dom-generator/dist/logo.png", to: "." }],
        }),
        new HtmlWebpackPlugin({
            title: "TodoMVC: JavaScript Es6 Webpack Complex DOM",
            template: "/shared/index.html",
            templateParameters: {
                body: getHtmlContent("node_modules/big-dom-generator/dist/index.html", true).replace('<div class="todo-area">', `<div class="todo-area"><div class="todoholder">${htmlToInjectForComplex}</div>`),
                htmlClasses: "spectrum spectrum--medium spectrum--light",
            },
        }),
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css",
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    optimization: {
        minimize: true,
        minimizer: [new CssMinimizerPlugin(), new TerserPlugin()],
    },
});
