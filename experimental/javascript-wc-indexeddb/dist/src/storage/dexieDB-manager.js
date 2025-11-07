import Dexie from "../../libs/dexie.mjs";
import BaseStorageManager from "./base-storage-manager.js";

class DexieDBManager extends BaseStorageManager {
    constructor() {
        super();
        this.initDB().then(() => {
            this._dispatchReadyEvent();
        });
    }

    async initDB() {
        // Delete the existing database first for clean state
        await Dexie.delete(this.dbName);

        // Create new Dexie database
        this.db = new Dexie(this.dbName);

        // Define schema
        this.db.version(1).stores({
            todos: "itemNumber, id, title, completed, priority",
        });

        // Open the database
        await this.db.open();

        return this.db;
    }

    addTodo(todo) {
        this._ensureDbConnection();

        this._incrementPendingAdditions();
        // Add todo item to Dexie
        this.db.todos
            .add(todo)
            .then(() => {
                // When running in Speedometer, the event will be dispatched only once
                // because all the additions are done in a tight loop.
                this._handleAddComplete();
            })
            .catch((error) => {
                throw error;
            });
    }

    async getTodos(upperItemNumber, count) {
        this._ensureDbConnection();

        // Get items with itemNumber less than upperItemNumber
        // Use reverse to get highest first, then limit, then reverse result back to ascending
        const items = await this.db.todos.where("itemNumber").below(upperItemNumber).reverse().limit(count).toArray();

        // Reverse to get ascending order (lowest itemNumber first) to match IndexedDB implementation
        return items.reverse();
    }

    toggleTodo(itemNumber, completed) {
        this._ensureDbConnection();

        this._incrementPendingToggles();

        // Get the todo item and update it
        this.db.todos
            .get(itemNumber)
            .then((todoItem) => {
                if (!todoItem)
                    throw new Error(`Todo item with itemNumber '${itemNumber}' not found`);

                // Update the completed status
                todoItem.completed = completed;

                // Save the updated item back to the database
                return this.db.todos.put(todoItem);
            })
            .then(() => {
                this._handleToggleComplete();
            })
            .catch((error) => {
                throw error;
            });
    }

    removeTodo(itemNumber) {
        this._ensureDbConnection();

        this._incrementPendingDeletions();
        // Delete the todo item
        this.db.todos
            .delete(itemNumber)
            .then(() => {
                this._handleRemoveComplete();
            })
            .catch((error) => {
                throw error;
            });
    }
}

export default DexieDBManager;
