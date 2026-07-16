const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
    transpileDependencies: true,
    filenameHashing: false,
    publicPath: "",
    terser: {
        minify: "terser",
        terserOptions: {
            compress: true,
        },
    },
});
