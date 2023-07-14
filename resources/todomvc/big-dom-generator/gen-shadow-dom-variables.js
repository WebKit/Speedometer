import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, NUMBER_VARIABLE_VARIATIONS, CSS_PROPERTIES, PROBABILITY_OF_DEFINED_VARIABLE } from "./params.js";
import { LCG } from "random-seedable";

const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);
const cssProperties = CSS_PROPERTIES;

export const genShadowDomVariables = () => {
    const shadowRootRules = [];
    const usedRulePairs = new Set();

    for (let i = 0; i < NUMBER_VARIABLE_VARIATIONS; i++) {
        random.shuffle(cssProperties);
        cssProperties.slice(0, 4).forEach((prop) => {
            usedRulePairs.add({ prop, index: i });
        });
        const rules = [];
        rules.push(
            "li {\n"
                + `\t${cssProperties
                    .slice(0, 2)
                    .map((prop) => `${prop}: var(--complex-${prop}-${i}, var(--complex-${prop}-default));`)
                    .join("\n\t")}}`
        );
        rules.push(
            "li > div {\n"
                + `\t${cssProperties
                    .slice(2, 4)
                    .map((prop) => `${prop}: var(--complex-${prop}-${i}, var(--complex-${prop}-default));`)
                    .join("\n\t")}}`
        );
        shadowRootRules.push(rules.join("\n\n"));
    }

    const constructableStylesheetsScript
        = "const additionalStyleSheets = [];\n\n"
        + `${shadowRootRules.map((rule, index) => `additionalStyleSheets[${index}] = new CSSStyleSheet();\nadditionalStyleSheets[${index}].replaceSync(\`${rule}\`);`).join("\n\n")};\n\n`
        + "window.extraCssToAdopt = additionalStyleSheets;";

    const cssVariables = cssProperties.map((prop) => `--complex-${prop}-default: rgba(140, 140, 140, 0.5);`);

    for (const { prop, index } of usedRulePairs) {
        if (random.coin(PROBABILITY_OF_DEFINED_VARIABLE))
            cssVariables.push(`--complex-${prop}-${index}: rgba(140, 140, 140, ${index / 1000});`);
    }

    const variablesDefinition = ":root {\n" + `\t${cssVariables.join("\n\t")}\n}`;

    return { variables: variablesDefinition, styleSheets: constructableStylesheetsScript };
};
