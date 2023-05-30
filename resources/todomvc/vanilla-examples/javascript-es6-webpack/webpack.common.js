const path = require("path");

module.exports = (env) => {
    return { entry: {
        app: env.embedded ? "./src/embedded.js" : "./src/app.js",
    },
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, env.embedded ? "embedded-dist" : "dist"),
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
};
