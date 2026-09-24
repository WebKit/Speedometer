import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
    base: "./",
    plugins: [
        {
            name: "rename-html-css-js-output",
            closeBundle() {
                const distDir = resolve(__dirname, "dist");
                const htmlPath = resolve(distDir, "index.template.html");
                const targetHtmlPath = resolve(distDir, "index.html");
                if (fs.existsSync(htmlPath)) {
                    let htmlContent = fs.readFileSync(htmlPath, "utf-8");
                    htmlContent = htmlContent.replace(/index\.template\.css/g, "index.css");
                    htmlContent = htmlContent.replace(/index\.template\.js/g, "index.js");
                    fs.writeFileSync(targetHtmlPath, htmlContent, "utf-8");
                    fs.unlinkSync(htmlPath);
                }
                const assetsDir = resolve(distDir, "assets");
                if (fs.existsSync(assetsDir)) {
                    const files = fs.readdirSync(assetsDir);
                    for (const file of files) {
                        if (file.startsWith("index.template.")) {
                            const oldPath = resolve(assetsDir, file);
                            const newFileName = file.replace("index.template.", "index.");
                            const newPath = resolve(assetsDir, newFileName);
                            fs.renameSync(oldPath, newPath);
                            if (newFileName.endsWith(".js") || newFileName.endsWith(".css")) {
                                let content = fs.readFileSync(newPath, "utf-8");
                                content = content.replace(/index\.template\.(js|css)\.map/g, "index.$1.map");
                                fs.writeFileSync(newPath, content, "utf-8");
                            } else if (newFileName.endsWith(".map")) {
                                let content = fs.readFileSync(newPath, "utf-8");
                                content = content.replace(/index\.template\.(js|css)/g, "index.$1");
                                fs.writeFileSync(newPath, content, "utf-8");
                            }
                        }
                    }
                }
            },
        },
    ],
    build: {
        outDir: "dist",
        assetsDir: "assets",
        sourcemap: true,
        rollupOptions: {
            input: resolve(__dirname, "index.template.html"),
            output: {
                entryFileNames: "assets/[name].js",
                chunkFileNames: "assets/[name].js",
                assetFileNames: "assets/[name].[ext]",
            },
        },
    },
});
