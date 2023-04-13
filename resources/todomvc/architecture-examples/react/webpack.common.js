const path = require("path");

module.exports = {
    entry: {
        app: "./src/index.js",
        "css/app": "./src/index-css.js",
        "big-0/app": "./src/index-big-0.js",
        "big-10/app": "./src/index-big-10.js",
        "big-30/app": "./src/index-big-30.js",
        "big-0-css/app": "./src/index-big-0-css.js",
        "big-10-css/app": "./src/index-big-10-css.js",
        "big-30-css/app": "./src/index-big-30-css.js",
    },
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
