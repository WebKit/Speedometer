import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";
const currentDir = import.meta.dirname;

export default {
    entry: {
        app: path.resolve(currentDir, "src", "index.js"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: React",
            template: path.resolve(currentDir, "public", "index.html"),
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(currentDir, "dist"),
        clean: true,
    },
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
