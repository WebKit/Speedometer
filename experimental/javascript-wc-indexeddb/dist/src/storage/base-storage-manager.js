import { numberOfItemsToAdd, promisesEventsNames } from "../workload-test.mjs";

// Base class for storage managers that provides common functionality
// for tracking pending operations and dispatching events.
class BaseStorageManager {
    constructor() {
        this.dbName = "todoDB";
        this.storeName = "todos";
        this.db = null;
        this.finishedAddtions = 0;
        this.finishedToggles = 0;
        this.finishedDeletions = 0;
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
        if (++this.finishedAddtions === numberOfItemsToAdd)
            window.dispatchEvent(new CustomEvent(promisesEventsNames.add, {}));
    }

    _handleToggleComplete() {
        if (++this.finishedToggles === numberOfItemsToAdd)
            window.dispatchEvent(new CustomEvent(promisesEventsNames.toggle, {}));
    }

    _handleRemoveComplete() {
        if (++this.finishedDeletions === numberOfItemsToAdd) {
            this.db.close();
            window.dispatchEvent(new CustomEvent(promisesEventsNames.delete, {}));
        }
    }

    _dispatchReadyEvent() {
        window.dispatchEvent(new CustomEvent("db-ready", {}));
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
