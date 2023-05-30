const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

const TerserPlugin = require("terser-webpack-plugin");

const CopyPlugin = require("copy-webpack-plugin");

module.exports = (env) => {
    return merge(common(env), {
        mode: "production",
        devtool: "source-map",
        plugins: [
            new CopyPlugin({
                patterns: [
                    { from: "../../big-dom-generator/dist/logo.png", to: "." },
                ],
            }),
            new HtmlWebpackPlugin({
                title: env.embedded ? "Production Embedded" : "Production",
                template: env.embedded ? "../../big-dom-generator/dist/index.html" : "public/index.html",
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
};
