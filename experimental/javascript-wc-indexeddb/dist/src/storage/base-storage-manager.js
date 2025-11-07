/**
 * Base class for storage managers that provides common functionality
 * for tracking pending operations and dispatching events.
 */
class BaseStorageManager {
    constructor() {
        this.dbName = "todoDB";
        this.storeName = "todos";
        this.db = null;
        this.pendingAdditions = 0;
        this.pendingToggles = 0;
        this.pendingDeletions = 0;
    }

    /**
     * Initialize the database. This method should be implemented by subclasses.
     * @returns {Promise} Promise that resolves when the database is initialized
     */
    async initDB() {
        throw new Error("initDB method must be implemented by subclass");
    }

    /**
     * Check if the database connection is established
     * @throws {Error} If database connection is not established
     */
    _ensureDbConnection() {
        if (!this.db)
            throw new Error("Database connection is not established");
    }

    /**
     * Handle completion of add operations
     * @protected
     */
    _handleAddComplete() {
        if (--this.pendingAdditions === 0)
            window.dispatchEvent(new CustomEvent("db-add-completed", {}));
    }

    /**
     * Handle completion of toggle operations
     * @protected
     */
    _handleToggleComplete() {
        if (--this.pendingToggles === 0)
            window.dispatchEvent(new CustomEvent("db-toggle-completed", {}));
    }

    /**
     * Handle completion of remove operations
     * @protected
     */
    _handleRemoveComplete() {
        if (--this.pendingDeletions === 0)
            window.dispatchEvent(new CustomEvent("db-remove-completed", {}));
    }

    /**
     * Dispatch the db-ready event when initialization is complete
     * @protected
     */
    _dispatchReadyEvent() {
        window.dispatchEvent(new CustomEvent("db-ready", {}));
    }

    /**
     * Increment the pending additions counter
     * @protected
     */
    _incrementPendingAdditions() {
        this.pendingAdditions++;
    }

    /**
     * Increment the pending toggles counter
     * @protected
     */
    _incrementPendingToggles() {
        this.pendingToggles++;
    }

    /**
     * Increment the pending deletions counter
     * @protected
     */
    _incrementPendingDeletions() {
        this.pendingDeletions++;
    }

    // Abstract methods that must be implemented by subclasses

    /**
     * Add a todo item to the database
     * @param {Object} todo - The todo item to add
     */
    addTodo(todo) {
        throw new Error("addTodo method must be implemented by subclass");
    }

    /**
     * Get todos from the database
     * @param {number} upperItemNumber - Upper bound for item numbers (exclusive)
     * @param {number} count - Maximum number of items to retrieve
     * @returns {Promise<Array>} Promise that resolves to an array of todo items
     */
    async getTodos(upperItemNumber, count) {
        throw new Error("getTodos method must be implemented by subclass");
    }

    /**
     * Toggle the completed status of a todo item
     * @param {number} itemNumber - The item number to toggle
     * @param {boolean} completed - The new completed status
     */
    toggleTodo(itemNumber, completed) {
        throw new Error("toggleTodo method must be implemented by subclass");
    }

    /**
     * Remove a todo item from the database
     * @param {number} itemNumber - The item number to remove
     */
    removeTodo(itemNumber) {
        throw new Error("removeTodo method must be implemented by subclass");
    }
}

export default BaseStorageManager;
