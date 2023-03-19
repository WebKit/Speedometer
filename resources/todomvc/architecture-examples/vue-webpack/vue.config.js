const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "",
  terser: {
    minify: 'uglifyJs',
    // minify: "terser",
    terserOptions: {
        compress: {
            drop_console: true,
        },
    },
  },
})
