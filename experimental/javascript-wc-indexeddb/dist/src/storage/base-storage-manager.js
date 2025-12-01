class BaseStorageManager {
    constructor() {
        this.dbName = "todoDB";
        this.storeName = "todos";
        this.db = null;
        this.pendingAdditions = 0;
        this.pendingToggles = 0;
        this.pendingDeletions = 0;
    }

    async initDB() {
        throw new Error("initDB method must be implemented by subclass");
    }

    _ensureDbConnection() {
        if (!this.db)
            throw new Error("Database connection is not established");
    }

    _handleAddComplete() {
        if (--this.pendingAdditions === 0)
            window.dispatchEvent(new CustomEvent("db-add-completed", {}));
    }

    _handleToggleComplete() {
        if (--this.pendingToggles === 0)
            window.dispatchEvent(new CustomEvent("db-toggle-completed", {}));
    }

    _handleRemoveComplete() {
        if (--this.pendingDeletions === 0)
            window.dispatchEvent(new CustomEvent("db-remove-completed", {}));
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
