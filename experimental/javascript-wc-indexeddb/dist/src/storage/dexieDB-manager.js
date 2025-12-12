import Dexie from "../../libs/dexie.mjs";
import BaseStorageManager from "./base-storage-manager.js";

class DexieDBManager extends BaseStorageManager {
    constructor() {
        super();
    }

    async initDB() {
        // Delete the existing database first for clean state
        await Dexie.delete(this.dbName);

        this.db = new Dexie(this.dbName);

        this.db.version(1).stores({
            todos: "itemNumber, id, title, completed, priority",
        });

        await this.db.open();

        return this.db;
    }

    addTodo(todo) {
        this._ensureDbConnection();

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

        this.db.todos
            .get(itemNumber)
            .then((todoItem) => {
                if (!todoItem)
                    throw new Error(`Todo item with itemNumber '${itemNumber}' not found`);

                todoItem.completed = completed;
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
