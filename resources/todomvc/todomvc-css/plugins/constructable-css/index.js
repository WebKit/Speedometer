import { createFilter } from "@rollup/pluginutils";

function createStylesheet(code) {
    const str = code.split("export default \"")[1].split("\";")[0];
    return {
        code: `const sheet = new CSSStyleSheet();sheet.replaceSync(${JSON.stringify(str)});export default sheet;`,
        map: { mappings: "" }
    };
}

function constructableCSS({ include, exclude } = {}) {
    if (!include)
        throw new Error("include option missing");

    const filter = createFilter(include, exclude);

    return {
        name: "rollup-plugin-constructable-css",
        transform(code, id) {
            if (filter(id))
                console.log(code);

            return filter(id) ? createStylesheet(code) : null;
        }
    };

}

export {
    constructableCSS
};
