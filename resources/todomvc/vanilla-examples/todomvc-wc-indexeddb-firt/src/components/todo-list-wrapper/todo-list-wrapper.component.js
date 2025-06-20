import template from "./todo-list-wrapper.template.js";
import TodoList from "../todo-list/todo-list.component.js";
import { indexedDBService } from "../../utils/indexeddb-service.js";

import globalStyles from "./../../../node_modules/todomvc-css/dist/global.constructable.js";
import listStyles from "./../../../node_modules/todomvc-css/dist/todo-list.constructable.js";

class TodoListWrapper extends HTMLElement {
    static get observedAttributes() {
        return ["total-items"];
    }

    #elements = [];
    #cacheSize = 2;
    #caches = {"backward": [], "forward": []};
    #cacheIndex = {"backward": -1, "forward": -1};
    #itemCount = 0;
    #route = undefined;
    #activeListIndex = 0;
    #lastListIndex = 0;
    #pageSize = 10; // Items per page
    #currentFilter = 'all';

    constructor() {
        super();

        this.shadow = this.attachShadow({ mode: "open" });
        this.htmlDirection = document.dir || "ltr";
        this.setAttribute("dir", this.htmlDirection);
        this.shadow.adoptedStyleSheets = [globalStyles, listStyles];

        const node = document.importNode(template.content, true);
        this.wrapperNode = node.querySelector(".todo-list-wrapper");
        this.shadow.append(node);

        if (window.extraTodoListCssToAdopt) {
            let extraAdoptedStyleSheet = new CSSStyleSheet();
            extraAdoptedStyleSheet.replaceSync(window.extraTodoListCssToAdopt);
            this.shadow.adoptedStyleSheets.push(extraAdoptedStyleSheet);
        }

        this.initializeDB();
    }

    async initializeDB() {
        try {
            await indexedDBService.initialize();
            console.log("IndexedDB initialized successfully");
        } catch (error) {
            console.error("Failed to initialize IndexedDB:", error);
        }
    }

    addList(entry, cache_kind) {
        if (this.#caches[cache_kind].length == this.#cacheSize) {
            return false;
        }
        
        this.#lastListIndex++;
        const list = new TodoList();
        list.addItem(entry);
        this.#caches[cache_kind].push(list);
        this.#cacheIndex[cache_kind]++;
        return true;
    }

    addItem(entry) {
        this.#itemCount++;
        const onScreenList = this.wrapperNode.children[0];
        
        // Try to add to current on-screen list first
        if (onScreenList && onScreenList.addItem(entry)) {
            // Successfully added to current page - store in IndexedDB asynchronously
            this.#storeInIndexedDB(entry);
            return;
        }
        
        // Current page is full - requirement: if there are more todos than UI capacity,
        // ensure UI shows a full list by moving overflow to cache/IndexedDB
        if (onScreenList && onScreenList.isFull()) {
            // Current page is at capacity, move new item to forward cache or IndexedDB
            this.#handleOverflowItem(entry);
            return;
        }
        
        // Current page is full, try forward cache
        if (this.#caches["forward"].length === 0) {
            this.addList(entry, "forward");
            this.#storeInIndexedDB(entry);
            return;
        }
        
        const forwardCacheIndex = this.#cacheIndex["forward"];
        if (this.#caches["forward"][forwardCacheIndex].addItem(entry)) {
            this.#storeInIndexedDB(entry);
            return;
        }
        
        // Try to create a new cache list
        if (this.addList(entry, "forward")) {
            this.#storeInIndexedDB(entry);
            return;
        }
        
        // Cache is full, store directly in IndexedDB
        this.#handleOverflowItem(entry);
    }

    /**
     * Handle items that overflow beyond UI and cache capacity
     * @private
     */
    #handleOverflowItem(entry) {
        if (this.#itemCount % this.#pageSize === 1) {
            console.log(this.#caches["forward"]);
            this.#lastListIndex++;
            console.log('Item stored in IndexedDB, page:', this.#lastListIndex);
        }
        this.#storeInIndexedDB(entry);
    }

    /**
     * Store item in IndexedDB asynchronously (doesn't block UI)
     * @private
     */
    async #storeInIndexedDB(entry) {
        try {
            await indexedDBService.addTodo(entry);
            console.log('Todo stored in IndexedDB:', entry.id);
        } catch (error) {
            console.error('Failed to store todo in IndexedDB:', error);
        }
    }

    addItems(items) {
        items.forEach((entry) => this.addItem(entry));
    }

    maybeGetFromCache(index) {
        const cacheKind = index > this.#activeListIndex ? "forward" : "backward";
        const diff = Math.abs(index - this.#activeListIndex);
        if (diff > this.#cacheSize)
            return null;
        if (this.#cacheIndex[cacheKind] + 1 < diff)
            return null;
        return this.#caches[cacheKind][diff - 1];
    }

    updateCacheRanges(prevActiveIndex, activeIndex) {
        const cacheKind = prevActiveIndex < activeIndex ? "forward" : "backward";
        const otherCacheKind = prevActiveIndex < activeIndex ? "backward" : "forward";

        const diff = Math.abs(activeIndex - prevActiveIndex);
        this.#caches[cacheKind] = this.#caches[cacheKind].splice(diff);
        this.#caches[otherCacheKind] = this.#caches[otherCacheKind].splice(0, diff);
    }

    #moveToPage(index) {
        console.log("moveToPage", index);
        const cacheEntry = this.maybeGetFromCache(index);
        const prevActiveIndex = this.#activeListIndex;
        if (cacheEntry) {
            console.log("cache hit", index, prevActiveIndex, cacheEntry);
            this.wrapperNode.children[0].remove();
            this.wrapperNode.append(cacheEntry);
            this.#activeListIndex = index;
            this.updateStyles();
            this.updateCacheRanges(prevActiveIndex, index);
            return;
        }
        this.updateCacheRanges(prevActiveIndex, index);
    }

    moveToPage(targetPage) {
        console.log("moveToPage", targetPage);
        console.log(this.#activeListIndex, this.#lastListIndex);
        if (targetPage === "first") {
            this.#moveToPage(0);
        } else if (targetPage === "last") {
            this.#moveToPage(this.#lastListIndex);
        } else if (targetPage === "next") {
            if (this.#activeListIndex <= this.#lastListIndex)
                this.#moveToPage(this.#activeListIndex + 1);
        } else if (targetPage === "previous") {
            if (this.#activeListIndex > 0)
                this.#moveToPage(this.#activeListIndex - 1);
        }
    }

    removeCompletedItems() {
        this.#elements = this.#elements.filter((element) => {
            if (element.itemcompleted === "true")
                element.removeItem();

            return element.itemcompleted === "false";
        });
    }

    toggleItems(completed) {
        this.#elements.forEach((element) => {
            if (completed && element.itemcompleted === "false")
                element.toggleInput.click();
            else if (!completed && element.itemcompleted === "true")
                element.toggleInput.click();
        });
    }

    updateStyles() {
        this.wrapperNode.children[0].updateStyles();
    }

    updateView(element) {
        switch (this.#route) {
            case "completed":
                element.style.display = element.itemcompleted === "true" ? "block" : "none";
                break;
            case "active":
                element.style.display = element.itemcompleted === "true" ? "none" : "block";
                break;
            default:
                element.style.display = "block";
        }
    }

    updateElements(type = "", id = "") {
        this.wrapperNode.children[0].updateElements(type, id);
    }

    updateRoute(route) {
        this.#route = route;
        this.updateElements("route-change");
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue)
            return;
        this[property] = newValue;
        if (this.isConnected)
            this.updateStyles();
    }

    connectedCallback() {
        this.updateStyles();
    }

    /**
     * Remove an item from cache and IndexedDB
     */
    async removeItem(itemId) {
        // Remove from current on-screen list
        const onScreenList = this.wrapperNode.children[0];
        if (onScreenList) {
            onScreenList.removeItem(itemId);
        }
        
        // Remove from caches
        this.#removeFromCaches(itemId);
        
        // Remove from IndexedDB asynchronously
        try {
            await indexedDBService.removeTodo(itemId);
            console.log('Todo removed from IndexedDB:', itemId);
        } catch (error) {
            console.error('Failed to remove todo from IndexedDB:', error);
        }
        
        this.#itemCount--;
    }

    /**
     * Update an item in cache and IndexedDB
     */
    async updateItem(item) {
        // Update in current on-screen list
        const onScreenList = this.wrapperNode.children[0];
        if (onScreenList) {
            onScreenList.updateItem(item);
        }
        
        // Update in caches
        this.#updateInCaches(item);
        
        // Update in IndexedDB asynchronously
        try {
            await indexedDBService.updateTodo(item);
            console.log('Todo updated in IndexedDB:', item.id);
        } catch (error) {
            console.error('Failed to update todo in IndexedDB:', error);
        }
    }

    /**
     * Load a specific page from IndexedDB
     * @private
     */
    async #loadPageFromIndexedDB(pageIndex) {
        try {
            const todos = await indexedDBService.getTodosForPage(
                pageIndex, 
                this.#pageSize, 
                this.#currentFilter
            );
            
            // Create a new list for this page
            const list = new TodoList();
            todos.forEach(todo => list.addItem(todo));
            
            return list;
        } catch (error) {
            console.error('Failed to load page from IndexedDB:', error);
            return null;
        }
    }

    /**
     * Remove item from all caches
     * @private
     */
    #removeFromCaches(itemId) {
        ['forward', 'backward'].forEach(cacheKind => {
            this.#caches[cacheKind].forEach(list => {
                if (list.removeItem) {
                    list.removeItem(itemId);
                }
            });
        });
    }

    /**
     * Update item in all caches
     * @private
     */
    #updateInCaches(item) {
        ['forward', 'backward'].forEach(cacheKind => {
            this.#caches[cacheKind].forEach(list => {
                if (list.updateItem) {
                    list.updateItem(item);
                }
            });
        });
    }

    /**
     * Clear all completed items
     */
    async clearCompleted() {
        try {
            const deletedCount = await indexedDBService.clearCompleted();
            console.log(`Cleared ${deletedCount} completed todos from IndexedDB`);
            
            // Also clear from caches and current view
            this.removeCompletedItems();
            
            return deletedCount;
        } catch (error) {
            console.error('Failed to clear completed todos:', error);
            return 0;
        }
    }

    /**
     * Set the current filter and refresh view if needed
     */
    setFilter(filter) {
        if (this.#currentFilter !== filter) {
            this.#currentFilter = filter;
            // Optionally reload current page with new filter
            this.#reloadCurrentPage();
        }
    }

    /**
     * Reload the current page with the current filter
     * @private
     */
    async #reloadCurrentPage() {
        try {
            const newList = await this.#loadPageFromIndexedDB(this.#activeListIndex);
            if (newList) {
                // Replace current on-screen list
                const oldList = this.wrapperNode.children[0];
                if (oldList) {
                    oldList.remove();
                }
                this.wrapperNode.append(newList);
                this.updateStyles();
            }
        } catch (error) {
            console.error('Failed to reload current page:', error);
        }
    }

    /**
     * Ensure the current page displays a full list when items are available
     * This implements the requirement: "If there are more todos than those allowed in the UI, 
     * then the UI should be showing a full list"
     */
    async ensureFullListDisplay() {
        const onScreenList = this.wrapperNode.children[0];
        if (!onScreenList) return;

        const availableSlots = onScreenList.getAvailableSlots();
        if (availableSlots === 0) return; // Already full

        // Check if we have items in cache or IndexedDB to fill the current page
        const totalStoredItems = await this.#getTotalItemCount();
        const currentPageItems = onScreenList.getCurrentCount();
        
        if (totalStoredItems > currentPageItems) {
            // We have more items than currently displayed, fill the current page
            await this.#fillCurrentPageToCapacity(availableSlots);
        }
    }

    /**
     * Get total count of items across all storage (cache + IndexedDB)
     * @private
     */
    async #getTotalItemCount() {
        try {
            return await indexedDBService.getTodoCount(this.#currentFilter);
        } catch (error) {
            console.error('Failed to get total item count:', error);
            return this.#itemCount; // Fallback to in-memory count
        }
    }

    /**
     * Fill the current page to capacity by loading items from cache or IndexedDB
     * @private
     */
    async #fillCurrentPageToCapacity(slotsNeeded) {
        const onScreenList = this.wrapperNode.children[0];
        if (!onScreenList || slotsNeeded <= 0) return;

        try {
            // First, try to get items from forward cache
            let itemsAdded = this.#fillFromCache(slotsNeeded);
            slotsNeeded -= itemsAdded;

            // If still need more items, load from IndexedDB
            if (slotsNeeded > 0) {
                await this.#fillFromIndexedDB(slotsNeeded);
            }
        } catch (error) {
            console.error('Failed to fill current page to capacity:', error);
        }
    }

    /**
     * Fill slots from cache
     * @private
     */
    #fillFromCache(slotsNeeded) {
        const onScreenList = this.wrapperNode.children[0];
        let itemsAdded = 0;

        // Try to move items from forward cache to current page
        if (this.#caches["forward"].length > 0) {
            const forwardCache = this.#caches["forward"][0];
            if (forwardCache && forwardCache.getCurrentCount() > 0) {
                // This is a simplified approach - in a full implementation,
                // you'd want to move individual items from cache to current page
                // For now, we'll rely on IndexedDB loading
            }
        }

        return itemsAdded;
    }

    /**
     * Fill remaining slots from IndexedDB
     * @private
     */
    async #fillFromIndexedDB(slotsNeeded) {
        const onScreenList = this.wrapperNode.children[0];
        const currentCount = onScreenList.getCurrentCount();
        
        // Load additional items to fill the page
        const additionalItems = await indexedDBService.getTodosForPage(
            0, // Start from beginning to get the most recent items
            currentCount + slotsNeeded,
            this.#currentFilter
        );

        // Add the new items that aren't already on the page
        const newItems = additionalItems.slice(currentCount);
        newItems.forEach(item => {
            if (onScreenList.getAvailableSlots() > 0) {
                onScreenList.addItem(item);
            }
        });
    }

    // ...existing code...
}

customElements.define("todo-list-wrapper", TodoListWrapper);

export default TodoListWrapper;
