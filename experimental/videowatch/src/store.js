/**
 * @fileoverview Redux state store (`createStore` + `combineReducers`),
 * `ElementPool` custom element freelist, and `DeferredDetachStamper`
 * DOM subtree stamper.
 */
import { createStore, combineReducers } from "redux";

let cachedComponentSheet = null;
export function adoptComponentStyles(shadowRoot) {
    if (!shadowRoot)
        return;

    if (!cachedComponentSheet) {
        cachedComponentSheet = new window.CSSStyleSheet();
        const docSheet = document.styleSheets[0];
        if (docSheet) {
            let cssText = "";
            for (let i = 0; i < docSheet.cssRules.length; i++)
                cssText += `${docSheet.cssRules[i].cssText}\n`;

            cachedComponentSheet.replaceSync(cssText);
        }
    }
    shadowRoot.adoptedStyleSheets = [cachedComponentSheet];
}

export const ActionTypes = {
    APPLY_ENTITY_BATCH: "yt/entity/APPLY_ENTITY_BATCH",
    RECORD_WATCH_RESPONSE: "yt/navigation/RECORD_WATCH_RESPONSE",
    PATCH_CHIP_CONTINUATION: "yt/shelf/PATCH_CHIP_CONTINUATION",
};

function entitiesReducer(state = { byKey: {}, version: 0 }, action) {
    if (action.type !== ActionTypes.APPLY_ENTITY_BATCH)
        return state;

    const nextByKey = Object.assign({}, state.byKey);
    const mutations = action.mutations || [];
    for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        nextByKey[m.entityKey] = {
            payload: Object.assign({}, m.payload),
            version: state.version + 1,
            updatedAtStep: action.navStep,
        };
    }
    const keys = Object.keys(nextByKey);
    if (keys.length > 64) {
        const dropCount = keys.length - 64;
        for (let i = 0; i < dropCount; i++)
            delete nextByKey[keys[i]];
    }
    return {
        byKey: nextByKey,
        version: state.version + 1,
    };
}

function watchHistoryReducer(state = { entries: [], currentVideoId: null, navigationCount: 0 }, action) {
    switch (action.type) {
        case ActionTypes.RECORD_WATCH_RESPONSE: {
            const entry = {
                videoId: action.videoId,
                navStep: action.navStep,
                playerResponse: action.playerResponse,
                watchNextResponse: action.watchNextResponse,
                chipCache: {},
            };
            const maxEntries = action.maxEntries || 2;
            const nextEntries = state.entries.concat(entry);
            while (nextEntries.length > maxEntries) {
                const evicted = nextEntries.shift();
                evicted.playerResponse = null;
                evicted.watchNextResponse = null;
                evicted.chipCache = null;
            }
            return {
                entries: nextEntries,
                currentVideoId: action.videoId,
                navigationCount: state.navigationCount + 1,
            };
        }
        case ActionTypes.PATCH_CHIP_CONTINUATION: {
            if (state.entries.length === 0)
                return state;

            const nextEntries = state.entries.slice();
            const current = Object.assign({}, nextEntries[nextEntries.length - 1]);
            current.chipCache = Object.assign({}, current.chipCache, {
                [action.chipIndex]: action.continuationResponse,
            });
            nextEntries[nextEntries.length - 1] = current;
            return {
                entries: nextEntries,
                currentVideoId: state.currentVideoId,
                navigationCount: state.navigationCount,
            };
        }
        default:
            return state;
    }
}

export const appStore = createStore(
    combineReducers({
        entities: entitiesReducer,
        watchHistory: watchHistoryReducer,
    })
);

/**
 * Pools custom elements by tag name across watch navigations.
 */
export class ElementPool {
    constructor(maxPerTag = 64) {
        this.maxPerTag = maxPerTag;
        this.freelists = new Map();
        this.stats = {
            created: 0,
            reused: 0,
            pooled: 0,
        };
    }

    acquire(tagName) {
        const tag = tagName.toLowerCase();
        const list = this.freelists.get(tag);
        if (list && list.length > 0) {
            this.stats.reused++;
            return list.pop();
        }
        this.stats.created++;
        return document.createElement(tag);
    }

    release(el) {
        if (!el || !el.tagName)
            return false;

        const tag = el.tagName.toLowerCase();
        if (el.parentNode)
            el.parentNode.removeChild(el);

        if (typeof el.resetPooledElement === "function")
            el.resetPooledElement();

        let list = this.freelists.get(tag);
        if (!list) {
            list = [];
            this.freelists.set(tag, list);
        }
        if (list.length < this.maxPerTag) {
            list.push(el);
            this.stats.pooled++;
            return true;
        }
        return false;
    }
}

export const sharedElementPool = new ElementPool(64);

/**
 * Stamps DOM subtrees into a container while returning previous child
 * elements to the shared element pool.
 */
export class DeferredDetachStamper {
    constructor(elementPool) {
        this.elementPool = elementPool;
    }

    stampSubtree(container, models, buildElementFn) {
        if (container.children.length > 0) {
            while (container.firstElementChild)
                this.elementPool.release(container.firstElementChild);
        }

        const insertFragment = document.createDocumentFragment();
        for (let i = 0; i < models.length; i++) {
            const el = buildElementFn(models[i], i);
            insertFragment.appendChild(el);
        }
        container.appendChild(insertFragment);
    }
}
