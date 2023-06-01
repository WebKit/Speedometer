import { LCG } from "random-seedable";
import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, MAX_SELECTOR_LENGTH_TO_GENERATE } from "./params.js";

const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);

// The generator assumes the page has the following structure,
// and it needs to be updated if the structure changes.
// TODO: make it less hard-coded.
/*
<body>
    <div class="main-ui">
        <div class="show-more"/>
        <div class=top-bar"/>
        <div class="ribbon"/>
        <div class="tree-area"/>
        <div class="todo-area"/>
        <div class="todoholder">
            <section class="todoapp"/>
                <header class="header"/>
                    <main class="main">
                        <div class="toggle-all-container">
                        <ul class="todo-list">
                            <li class="li-0 targeted">
                                <div class="view-0 targeted">
                            <li class="li-1 targeted">
                                <div class="view-0 targeted">
                            ...
                        </ul>
                    </main>
            </section>
        </div>
    </div>
</body>
*/

const getClassname = (depth, index) => {
    switch (depth) {
        case 7:
            return `.view-${index}`;
        case 6:
            return `.li-${index}`;
        case 5:
            // prettier-ignore
            if (!index)
                return ".toggle-all-container";
            return ".todo-list";
        case 4:
            // prettier-ignore
            if (!index)
                return ".header";
            return ".main";
        case 3:
            return ".todoapp";
        case 2:
            return ".todoholder";
        case 1:
            switch (index) {
                case 0:
                    return ".show-more";
                case 1:
                    return ".ribbon";
                case 2:
                    return ".top-bar";
                case 3:
                    return ".tree-area";
                case 4:
                    return ".todo-area";
                default:
                    throw new Error(`Invalid index: ${index}`);
            }
        case 0:
            return ".main-ui";
        default:
            throw new Error(`Invalid depth: ${depth}`);
    }
};

const getType = (depth, index) => {
    switch (depth) {
        case 7:
            return "div";
        case 6:
            return "li";
        case 5:
            // prettier-ignore
            if (!index)
                return "div";
            return "ul";
        case 4:
            // prettier-ignore
            if (!index)
                return "header";
            return "main";
        case 3:
            return "section";
        case 2:
        case 1:
            return "div";
        case 0:
            return ".main-ui";
        default:
            throw new Error(`Invalid depth: ${depth}`);
    }
};

const getNextDepth = (combinator, depth) => {
    switch (combinator) {
        case " ":
            return random.randRange(0, depth);
        case " > ":
            return depth - 1;
        case " + ":
        case " ~ ":
            return depth;
        default:
            throw new Error(`Invalid combinator: ${combinator}`);
    }
};

const getNextIndex = (combinator, newDepth, index) => {
    // prettier-ignore
    if (combinator === " + ")
        return index - 1;
    // prettier-ignore
    if (combinator === " ~ ")
        return random.randRange(0, index);
    switch (newDepth) {
        case 6:
            return index;
        case 5:
        case 4:
            return 1;
        case 1:
            return 4;
        default:
            return 0;
    }
};

// Returns a random combinator chosen so that the generated selector is valid.
const chooseCombinator = (depth, index) => {
    const selectors = [" ", " > "];
    if (index > 0 && depth !== 7) {
        selectors.push(" + ");
        selectors.push(" ~ ");
    }
    return random.choice(selectors);
};

const randomWeighted = (options, probs) => {
    const randNum = random.float();
    let accumProb = 0;
    for (let i = 0; i < probs.length; i++) {
        accumProb += probs[i];
        // prettier-ignore
        if (randNum <= accumProb)
            return options[i];
    }
    return options[options.length - 1];
};

const buildMatchingSelector = (depth, index, oldCombinator, selLen, maxLen) => {
    // prettier-ignore
    if (selLen >= maxLen)
        return "";

    const getSelector = randomWeighted([getClassname, getType, () => "*"], [0.6, 0.3, 0.1]);
    const selector = getSelector(depth, index);
    const combinator = chooseCombinator(depth, index);

    // prettier-ignore
    if (!depth)
        return `${selector}${oldCombinator}`;

    const nextDepth = getNextDepth(combinator, depth);
    const nextIndex = getNextIndex(combinator, nextDepth, index);
    return buildMatchingSelector(nextDepth, nextIndex, combinator, selLen + 1, maxLen) + selector + oldCombinator;
};

// Returns a non-matching selector for the element.
// We kept the selector from matching by adding the `.just-span` class to the left-most selector or
// by adding a classname from one of its children.
// TODO: Is there a better way to ensure the selector is non-matching?
const buildNonMatchingSelector = (depth, index, oldCombinator, selLen, badSelector) => {
    // If we are in the top node, we are done.
    // prettier-ignore
    if (!depth)
        return `.just-span${ oldCombinator}`;

    // If we've reached the target length, pick a random classname from its children.
    const getSelector = randomWeighted([getClassname, getType, () => "*"], [0.6, 0.3, 0.1]);
    const selector = getSelector(depth, index);
    if (selLen === badSelector) {
        const wrongDepth = random.randRange(Math.min(depth + 1, 7), 8);
        const wrongSelector = getClassname(wrongDepth, 0);
        return selector + wrongSelector + oldCombinator;
    }

    // Otherwise, recurse.
    const combinator = chooseCombinator(depth, index);
    const nextDepth = getNextDepth(combinator, depth);
    const nextIndex = getNextIndex(combinator, nextDepth, index);
    return buildNonMatchingSelector(nextDepth, nextIndex, combinator, selLen + 1, badSelector) + selector + oldCombinator;
};

const cssProperties = ["accent-color", "border-bottom-color", "border-color", "border-left-color", "border-right-color", "border-top-color", "column-rule-color", "outline-color", "text-decoration-color"];

// Returns a random 200 matching selectors and 200 non-matching selectors targeted at the todoMVC items.
export const genCss = () => {
    const matchingSelectors = [];
    const nonMatchingSelectors = [];
    for (let index = 0; index < 100; index++) {
        // Add `.targeted` to the matching selectors to match only the todoMVC items.
        matchingSelectors.push(`${buildMatchingSelector(6, index, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE)) }.targeted`);
        matchingSelectors.push(`${buildMatchingSelector(7, index, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE)) }.targeted`);
        nonMatchingSelectors.push(buildNonMatchingSelector(6, index, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE)));
        nonMatchingSelectors.push(buildNonMatchingSelector(7, index, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE)));
    }
    // Create random color styles. Same color, different opacity.
    // TODO: Choose a better color for the todoMVC theme.
    const matchingCssRules = [];
    matchingSelectors.forEach((selector, i) => {
        random.shuffle(cssProperties, true);
        matchingCssRules.push(`${selector} { 
            ${cssProperties[0]}: rgba(140,140,140,${i / 1000}); 
            ${cssProperties[1]}: rgba(140,140,140,${i / 1000});
        }`);
    });
    const nonMatchingCssRules = [];
    nonMatchingSelectors.forEach((selector, i) => {
        random.shuffle(cssProperties, true);
        nonMatchingCssRules.push(`${selector} { 
            ${cssProperties[0]}: rgba(140,140,140,${i / 1000}); 
            ${cssProperties[1]}: rgba(140,140,140,${i / 1000});
        }`);
    });
    return { matchingCss: matchingCssRules.join("\n"), nonMatchingCss: nonMatchingCssRules.join("\n") };
};
