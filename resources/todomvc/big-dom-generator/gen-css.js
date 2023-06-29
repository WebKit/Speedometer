import { DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR, MAX_SELECTOR_LENGTH_TO_GENERATE, NUM_TODOS_TO_INSERT_IN_HTML, TARGETED_CLASS } from "./params.js";
import { LCG } from "random-seedable";
import { JSDOM } from "jsdom";
import { ANGULAR_TODO_MVC_HTML_MARKUP, TODO_MVC_HTML_MARKUP } from "./html-markup.js";

const random = new LCG(DEFAULT_SEED_FOR_RANDOM_NUMBER_GENERATOR);

const Combinator = {
    DESCENDANT: " ",
    CHILD: " > ",
    ADJACENT_SIBLING: " + ",
    GENERAL_SIBLING: " ~ ",
};

const getHtmlMarkup = (markup) => {
    switch (markup) {
        case "angular":
            return ANGULAR_TODO_MVC_HTML_MARKUP;
        default:
            return TODO_MVC_HTML_MARKUP;
    }
};

/**
 * List item structure for Angular:
 * <app-todo-item>
 *     <li class="targeted li-101">
 *         <div class="targeted view-101"/>
 *     </li>
 * </app-todo-item>
 */
const addTodoItems = (document, NUM_TODOS_TO_INSERT_IN_HTML, angular) => {
    const todoList = document.querySelector(".todo-list");

    for (let i = 0; i < NUM_TODOS_TO_INSERT_IN_HTML; i++) {
        const li = document.createElement("li");
        li.className = `li-${i}`;

        const div = document.createElement("div");
        div.className = `view-${i}`;

        li.appendChild(div);

        if (angular) {
            const appTodoItem = document.createElement("app-todo-item");

            appTodoItem.appendChild(li);
            todoList.appendChild(appTodoItem);
        } else {
            todoList.appendChild(li);
        }
    }
};

const getClassname = (element) => {
    return element.classList.length > 0 ? `.${element.classList[0]}` : element.nodeName.toLowerCase();
};

const getElementType = (element) => {
    return element.nodeName.toLowerCase();
};

const getElementAtDepth = (element, currentDepth, targetDepth) => {
    let currentElement = element;
    while (currentDepth > targetDepth) {
        currentElement = currentElement.parentElement;
        currentDepth--;
    }
    return currentElement;
};

const getRandomElement = (combinator, element, currentDepth, targetDepth) => {
    switch (combinator) {
        case Combinator.CHILD:
            return element.parentElement;
        case Combinator.ADJACENT_SIBLING:
            return element.previousElementSibling;
        case Combinator.GENERAL_SIBLING:
            return getRandomSiblingElementBefore(element);
        case Combinator.DESCENDANT:
            return getElementAtDepth(element, currentDepth, targetDepth);
        default:
            throw new Error(`Invalid combinator: ${combinator}`);
    }
};

const getRandomSiblingElementBefore = (element) => {
    const parent = element.parentElement;
    const children = Array.from(parent.children);
    const currentIndex = children.indexOf(element);
    const validChildren = children.slice(0, currentIndex);
    return random.choice(validChildren);
};

const getNextDepth = (combinator, depth) => {
    switch (combinator) {
        case Combinator.DESCENDANT:
            return random.randRange(0, depth);
        case Combinator.CHILD:
            return depth - 1;
        case Combinator.ADJACENT_SIBLING:
        case Combinator.GENERAL_SIBLING:
            return depth;
        default:
            throw new Error(`Invalid combinator: ${combinator}`);
    }
};

// Returns a random combinator chosen so that the generated selector is valid.
const chooseCombinator = (element) => {
    const combinators = [Combinator.DESCENDANT, Combinator.CHILD];
    if (element.previousElementSibling)
        combinators.push(Combinator.ADJACENT_SIBLING, Combinator.GENERAL_SIBLING);

    return random.choice(combinators);
};

// Returns a random option from the given options array, weighted by the corresponding probabilities in the probs array.
const randomWeighted = (options, probabilities) => {
    const randomNumber = random.float();
    let accumulatedProbability = 0;
    for (let i = 0; i < probabilities.length; i++) {
        accumulatedProbability += probabilities[i];
        // prettier-ignore
        if (randomNumber <= accumulatedProbability)
            return options[i];
    }
    return options[options.length - 1];
};

const buildSelectors = (element, depth, oldCombinator, selectorLength, maxSelectorLength, isMatching) => {
    // if nonMatching we add a view-<random-index> class selector that is guaranteed to not have targeted children in the todoMVC
    if (depth < 0 || selectorLength >= maxSelectorLength)
        return isMatching ? "" : `.view-${random.randRange(0, NUM_TODOS_TO_INSERT_IN_HTML)}${oldCombinator}`;

    const getSelector = randomWeighted([getClassname, getElementType, () => "*"], [0.6, 0.3, 0.1]);
    const selector = getSelector(element);

    const combinator = chooseCombinator(element);
    const nextDepth = getNextDepth(combinator, depth);
    const nextElement = getRandomElement(combinator, element, depth, nextDepth);

    return buildSelectors(nextElement, nextDepth, combinator, selectorLength + 1, maxSelectorLength, isMatching) + selector + oldCombinator;
};

const getInitialDepth = (element) => {
    let depth = 0;
    while (element && getClassname(element) !== ".main-ui") {
        depth++;
        element = element.parentElement;
    }
    return depth;
};

// Take selectors create random color styles. Same color, different opacity.
const generateCssRules = (selectors) => {
    return selectors.map((selector, i) => {
        random.shuffle(cssProperties, true);
        return `${selector} {
                    ${cssProperties[0]}: rgba(140,140,140,${i / 1000});
                    ${cssProperties[1]}: rgba(140,140,140,${i / 1000});
                }`;
    });
};

const cssProperties = ["accent-color", "border-bottom-color", "border-color", "border-left-color", "border-right-color", "border-top-color", "column-rule-color", "outline-color", "text-decoration-color"];

/**
 * Returns a random 200 matching selectors and 200 non-matching selectors targeted at the todoMVC items.
 * @param {string} markup The markup to generate the selectors for.
 * @returns {string} The css rules for the matching and non-matching selectors.
 */
export const genCss = (markup) => {
    const matchingSelectors = [];
    const nonMatchingSelectors = [];
    const htmlMarkup = getHtmlMarkup(markup);
    const dom = new JSDOM(htmlMarkup);
    const { document } = dom.window;

    addTodoItems(document, NUM_TODOS_TO_INSERT_IN_HTML, markup);
    const elements = document.querySelectorAll(".main li");

    // Generate matching and non-matching selectors for each element.
    elements.forEach((element) => {
        // Add `TARGETED_CLASS` to the matching selectors to match only the todoMVC items.
        const elementDepth = getInitialDepth(element);
        matchingSelectors.push(`${buildSelectors(element, elementDepth, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), true)}${TARGETED_CLASS}`);
        matchingSelectors.push(`${buildSelectors(element.firstChild, elementDepth + 1, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), true)}${TARGETED_CLASS}`);
        // Add `TARGETED_CLASS` to the nonMatchingSelectors to make sure they don't accidentally match other elements on the page.
        nonMatchingSelectors.push(`${buildSelectors(element, elementDepth, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), false)}${TARGETED_CLASS}`);
        nonMatchingSelectors.push(`${buildSelectors(element.firstChild, elementDepth + 1, "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), false)}${TARGETED_CLASS}`);
    });

    const allCssRules = generateCssRules(matchingSelectors.concat(nonMatchingSelectors));
    random.shuffle(allCssRules, true);
    return allCssRules.join("\n");
};
