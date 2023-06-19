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

const getHtmlMarkup = (angular) => {
    return angular ? ANGULAR_TODO_MVC_HTML_MARKUP : TODO_MVC_HTML_MARKUP;
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

const getElementAtDepth = (element, currentDepth, depth) => {
    let currentElement = element;
    while (currentDepth > depth) {
        currentElement = currentElement.parentElement;
        currentDepth--;
    }
    return currentElement;
};

const getRandomElement = (combinator, element, currentDepth, depth) => {
    switch (combinator) {
        case Combinator.CHILD:
            return element.parentElement;
        case Combinator.ADJACENT_SIBLING:
            return element.previousElementSibling;
        case Combinator.GENERAL_SIBLING:
            return getRandomSiblingElementBefore(element);
        case Combinator.DESCENDANT:
            return getElementAtDepth(element, currentDepth, depth);
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
    if ((!isMatching && !depth) || selectorLength >= maxSelectorLength || !element)
        return isMatching ? "" : `.view-${random.randRange(0, NUM_TODOS_TO_INSERT_IN_HTML)}${oldCombinator}`;

    const getSelector = randomWeighted([getClassname, getElementType, () => "*"], [0.6, 0.3, 0.1]);
    const selector = getSelector(element);

    if (isMatching && !depth)
        return `${selector}${oldCombinator}`;

    const combinator = chooseCombinator(element);
    const nextDepth = getNextDepth(combinator, depth);
    const nextElement = getRandomElement(combinator, element, depth, nextDepth);

    return buildSelectors(nextElement, nextDepth, combinator, selectorLength + 1, maxSelectorLength, isMatching) + selector + oldCombinator;
};

const ANGULAR_VIEW_DEPTH = 8;
const ANGULAR_LI_DEPTH = 7;
const NON_ANGULAR_VIEW_DEPTH = 6;
const NON_ANGULAR_LI_DEPTH = 5;

const getInitialDepth = (element, isAngular) => {
    if (isAngular)
        return element.tagName === "DIV" ? ANGULAR_VIEW_DEPTH : ANGULAR_LI_DEPTH;

    return element.tagName === "DIV" ? NON_ANGULAR_VIEW_DEPTH : NON_ANGULAR_LI_DEPTH;
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
 * @param {string} isAngular whether to generate angular or react markup
 * @returns {string} The css rules for the matching and non-matching selectors.
 */
export const genCss = (isAngular = false) => {
    const matchingSelectors = [];
    const nonMatchingSelectors = [];
    const htmlMarkup = getHtmlMarkup(isAngular);
    const dom = new JSDOM(htmlMarkup);
    const { document } = dom.window;

    addTodoItems(document, NUM_TODOS_TO_INSERT_IN_HTML, isAngular);
    const elements = document.querySelectorAll(".main li");

    // Generate matching and non-matching selectors for each element.
    elements.forEach((element) => {
        // Add `TARGETED_CLASS` to the matching selectors to match only the todoMVC items.
        matchingSelectors.push(`${buildSelectors(element, getInitialDepth(element, isAngular), "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), true)}${TARGETED_CLASS}`);
        matchingSelectors.push(`${buildSelectors(element.firstChild, getInitialDepth(element.firstChild, isAngular), "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), true)}${TARGETED_CLASS}`);
        // Add `TARGETED_CLASS` to the nonMatchingSelectors to make sure they don't accidentally match other elements on the page.
        nonMatchingSelectors.push(`${buildSelectors(element, getInitialDepth(element, isAngular), "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), false)}${TARGETED_CLASS}`);
        nonMatchingSelectors.push(`${buildSelectors(element.firstChild, getInitialDepth(element.firstChild, isAngular), "", 0, random.randRange(3, MAX_SELECTOR_LENGTH_TO_GENERATE), false)}${TARGETED_CLASS}`);
    });

    const allCssRules = generateCssRules(matchingSelectors.concat(nonMatchingSelectors));
    random.shuffle(allCssRules, true);
    return allCssRules.join("\n");
};
