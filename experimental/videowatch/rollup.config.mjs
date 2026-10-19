import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nodeModulesDir = path.join(__dirname, "node_modules");

function localNodeResolve() {
    return {
        name: "local-node-resolve",
        resolveId(source, importer) {
            if (source.startsWith(".") || source.startsWith("/"))
                return null;

            const directPath = path.join(nodeModulesDir, source);
            if (fs.existsSync(directPath) && fs.statSync(directPath).isFile())
                return fs.realpathSync(directPath);

            if (fs.existsSync(`${directPath}.js`))
                return fs.realpathSync(`${directPath}.js`);

            const pkgJsonPath = path.join(directPath, "package.json");
            if (fs.existsSync(pkgJsonPath)) {
                const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
                const entry = pkg.module || pkg.main || "index.js";
                return fs.realpathSync(path.join(directPath, entry));
            }
            return null;
        },
    };
}

export default {
    input: "src/index.js",
    output: {
        file: "dist/bundle.js",
        format: "es",
    },
    plugins: [localNodeResolve()],
};
