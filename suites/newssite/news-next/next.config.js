/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "export",
    distDir: "dist",
    assetPrefix: "./",
    images: {
        unoptimized: true,
    },
    transpilePackages: ["speedometer-utils", "news-site-css"],
    generateBuildId: async () => "speedometer-build-id",
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            config.output.filename = "static/chunks/[name].js";
            config.output.chunkFilename = "static/chunks/[name].js";
            config.plugins.forEach((plugin) => {
                if (plugin.constructor.name.includes("CssExtractPlugin")) {
                    plugin.options.filename = "static/css/[name].css";
                    plugin.options.chunkFilename = "static/css/[name].css";
                }
            });
        }
        return config;
    },
};

module.exports = nextConfig;
