import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, NUMBER_VARIABLE_VARIATIONS, CSS_PROPERTIES } from "./params.js";
import { LCG } from "random-seedable";

const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);

export const genShadowDomVariables = () => {
    const cssVariables = CSS_PROPERTIES.map((prop) => `--complex-${prop}-default: rgba(140, 140, 140, 0.5);`);
    for (let i = 0; i < NUMBER_VARIABLE_VARIATIONS; i++) {
        const rules = CSS_PROPERTIES.map((prop) => {
            if (random.coin(0.8))
                return `--complex-${prop}-${i}: rgba(140, 140, 140, ${i / 1000});`;
            return null;
        }).filter((rule) => !!rule);
        cssVariables.push(...rules);
    }

    const variablesDefinition = ":root {\n" + `\t${cssVariables.join("\n\t")}\n}`;

    const shadowRootRules = [];
    for (let i = 0; i < NUMBER_VARIABLE_VARIATIONS; i++) {
        const rules = "li {\n" + `\t${CSS_PROPERTIES.map((prop) => `${prop}: var(--complex-${prop}-${i}, var(--complex-${prop}-default));`).join("\n\t")}}`;
        shadowRootRules.push(rules);
    }

    const constructableStylesheetsScript
        = "const additionalStyleSheets = [];\n\n"
        + `${shadowRootRules.map((rule, index) => `additionalStyleSheets[${index}] = new CSSStyleSheet();\nadditionalStyleSheets[${index}].replaceSync(\`${rule}\`);`).join("\n\n")};\n\n`
        + "export default additionalStyleSheets;";

    return { variables: variablesDefinition, styleSheets: constructableStylesheetsScript };
};
