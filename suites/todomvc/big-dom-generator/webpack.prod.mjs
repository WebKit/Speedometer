import { merge } from "webpack-merge";
import common from "./webpack.common.mjs";

import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyPlugin from "copy-webpack-plugin";
import webpack from "webpack";

import postcssImport from "postcss-import";
import postcssVarfallback from "postcss-varfallback";
import postcssDropunusedvars from "postcss-dropunusedvars";
import cssnano from "cssnano";

export default merge(common, {
    mode: "production",
    plugins: [
        new MiniCssExtractPlugin({
            filename: "big-dom.css",
            chunkFilename: "[id].css",
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: "./src/assets/logo.png",
                    to: "logo.png",
                },
            ],
        }),
        new webpack.IgnorePlugin({ resourceRegExp: /canvas/ }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            postcssOptions: {
                                plugins: [postcssImport, postcssVarfallback, postcssDropunusedvars, cssnano],
                            },
                        },
                    },
                ],
            },
        ],
    },
    target: "node",
});
