const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const TerserPlugin = require("terser-webpack-plugin");

module.exports = merge(common, {
    mode: "production",
    devtool: "source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "Production",
            template: "public/index.html",
            filename: "index.html",
            chunks: ["app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig0",
            template: "public/index-big-buttons.html",
            filename: "big-0/index.html",
            chunks: ["big-0/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig10",
            template: "public/index-big-buttons.html",
            filename: "big-10/index.html",
            chunks: ["big-10/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig30",
            template: "public/index-big-buttons.html",
            filename: "big-30/index.html",
            chunks: ["big-30/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig0CSS",
            template: "public/index-big-buttons.html",
            filename: "big-0-css/index.html",
            chunks: ["big-0-css/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig10CSS",
            template: "public/index-big-buttons.html",
            filename: "big-10-css/index.html",
            chunks: ["big-10-css/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBig30CSS",
            template: "public/index-big-buttons.html",
            filename: "big-30-css/index.html",
            chunks: ["big-30-css/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionBigEmpty",
            template: "public/index-empty.html",
            filename: "big-0/index-empty.html",
            chunks: ["big-0/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionMail",
            template: "public/index-mail.html",
            filename: "big-0/index-mail.html",
            chunks: ["big-0/app"],
        }),
        new HtmlWebpackPlugin({
            title: "ProductionCSS",
            template: "public/index.html",
            filename: "css/index.html",
            chunks: ["css/app"],
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
