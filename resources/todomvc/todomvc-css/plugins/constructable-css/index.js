import fs from "fs-extra";
import path from "path";

async function create(src, dest) {
    const contents = await fs.readFile(src, "utf-8");
    const output = `const sheet = new CSSStyleSheet();\nsheet.replaceSync(${JSON.stringify(contents)});\nexport default sheet;\n`;
    const { name } = path.parse(src);
    const fileName = `${name}.constructable.js`;
    const outputPath = path.join(dest, fileName);
    await fs.writeFile(outputPath, output);
}

function constructableCSS({ src, dest = "dist/", hook = "generateBundle" } = {}) {
    if (!src)
        throw new Error("src option missing");

    return {
        name: "constructable-css",
        [hook]: async () => {
            const { globby } = await import("globby");
            const matchedPaths = await globby(src, {
                expandDirectories: false,
            });

            await Promise.all(matchedPaths.map((src) => create(src, dest)));
        },
    };
}

export { constructableCSS };
