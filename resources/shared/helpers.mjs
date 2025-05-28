/**
 * Recursively queries the DOM for an element, traversing through shadow DOMs.
 *
 * @param {Element|ShadowRoot} lookupStartNode The node or shadow root to start the lookup from.
 * @param {string[]} path An array of CSS selectors representing the path to the target element.
 * @returns {Element|null} The target element if found, otherwise null.
 */
export function recursivelyQuerySelector(lookupStartNode, path) {
    lookupStartNode = lookupStartNode.shadowRoot ?? lookupStartNode;
    const target = path.reduce((root, selector) => {
        const node = root.querySelector(selector);
        return node.shadowRoot ?? node;
    }, lookupStartNode);

    return target;
}

/**
 * Retrieves a single DOM element, optionally traversing through shadow DOMs to a specified path before the final selection.
 *
 * @param {string} selector The CSS selector for the desired element.
 * @param {string[]} [path=[]] An optional array of CSS selectors to reach the desired shadowRoot or parent element.
 * @param {Element|ShadowRoot} [lookupStartNode=document] The starting node for the lookup.
 * @returns {Element|null} The found element, or null if not found.
 */
export function getElement(selector, path = [], lookupStartNode = document) {
    const element = recursivelyQuerySelector(lookupStartNode, path).querySelector(selector);
    return element;
}

/**
 * Retrieves all DOM elements matching a selector, optionally traversing through shadow DOMs to a specified path before the final selection.
 *
 * @param {string} selector The CSS selector for the desired elements.
 * @param {string[]} [path=[]] An optional array of CSS selectors to reach the desired shadowRoot or parent element.
 * @param {Element|ShadowRoot} [lookupStartNode=document] The starting node for the lookup.
 * @returns {Element[]} An array of found elements.
 */
export function getAllElements(selector, path = [], lookupStartNode = document) {
    const elements = Array.from(recursivelyQuerySelector(lookupStartNode, path).querySelectorAll(selector));
    return elements;
}

/**
 * Forces a reflow/layout of the document by requesting a DOM property that triggers it.
 * This can be useful for ensuring that styles and positions are up-to-date before
 * performing measurements or animations. It also returns an element from the center of the viewport.
 *
 * @returns {Element|null} An element at the center of the viewport, or null if no element is there.
 */
export function forceLayout() {
    const rect = document.body.getBoundingClientRect();
    const e = document.elementFromPoint((rect.width / 2) | 0, (rect.height / 2) | 0);
    return e;
}
