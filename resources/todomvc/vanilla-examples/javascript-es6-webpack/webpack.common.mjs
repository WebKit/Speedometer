import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";

const currentDir = import.meta.dirname;

export default {
    entry: {
        app: path.resolve(currentDir, "src", "app.js"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "TodoMVC: JavaScript Es6 Webpack",
            template: path.resolve(currentDir, "src", "index.html"),
        }),
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(currentDir, "dist"),
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
