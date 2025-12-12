// Base class for storage managers that provides common functionality
// for tracking pending operations and dispatching events.
class BaseStorageManager {
    constructor() {
        this.dbName = "todoDB";
        this.storeName = "todos";
        this.db = null;
        this.pendingAdditions = 0;
        this.pendingToggles = 0;
        this.pendingDeletions = 0;
        this.initDB().then(() => {
            this._dispatchReadyEvent();
        });
    }

    _ensureDbConnection() {
        if (!this.db)
            throw new Error("Database connection is not established");
    }

    // When runner in Speedometer, additions, completions and removals are
    // triggered synchonously in a tight loop, increasing the pending counters.
    // The completion events are dispatched only when all pending operations
    // of that type are complete.

    _handleAddComplete() {
        if (--this.pendingAdditions === 0)
            window.dispatchEvent(new CustomEvent("db-add-completed", {}));
    }

    _handleToggleComplete() {
        if (--this.pendingToggles === 0)
            window.dispatchEvent(new CustomEvent("db-toggle-completed", {}));
    }

    _handleRemoveComplete() {
        if (--this.pendingDeletions === 0) {
            this.db.close();
            window.dispatchEvent(new CustomEvent("db-remove-completed", {}));
        }
    }

    _dispatchReadyEvent() {
        window.dispatchEvent(new CustomEvent("db-ready", {}));
    }

    _incrementPendingAdditions() {
        this.pendingAdditions++;
    }

    _incrementPendingToggles() {
        this.pendingToggles++;
    }

    _incrementPendingDeletions() {
        this.pendingDeletions++;
    }

    // Abstract methods that must be implemented by subclasses

    async initDB() {
        throw new Error("initDB method must be implemented by subclass");
    }

    addTodo(todo) {
        throw new Error("addTodo method must be implemented by subclass");
    }

    async getTodos(upperItemNumber, count) {
        throw new Error("getTodos method must be implemented by subclass");
    }

    toggleTodo(itemNumber, completed) {
        throw new Error("toggleTodo method must be implemented by subclass");
    }

    removeTodo(itemNumber) {
        throw new Error("removeTodo method must be implemented by subclass");
    }
}

export default BaseStorageManager;
