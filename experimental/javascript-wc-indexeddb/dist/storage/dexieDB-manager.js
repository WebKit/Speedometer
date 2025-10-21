import Dexie from "../libs/dexie.mjs";

class DexieDBManager {
    constructor() {
        this.dbName = "todoDB";
        this.storeName = "todos";
        this.db = null;
        this.pendingAdditions = 0;
        this.pendingToggles = 0;
        this.pendingDeletions = 0;
        this.initDB().then(() => {
            const newDiv = document.createElement("div");
            newDiv.classList.add("indexeddb-ready");
            newDiv.style.display = "none";
            document.body.append(newDiv);
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
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

        this.pendingAdditions++;
        // Add todo item to Dexie
        this.db.todos
            .add(todo)
            .then(() => {
                // When running in Speedometer, the event will be dispatched only once
                // because all the additions are done in a tight loop.
                if (--this.pendingAdditions === 0)
                    window.dispatchEvent(new CustomEvent("indexeddb-add-completed", {}));
            })
            .catch((error) => {
                throw error;
            });
    }

    async getTodos(upperItemNumber, count) {
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

        // Get items with itemNumber less than upperItemNumber
        // Use reverse to get highest first, then limit, then reverse result back to ascending
        const items = await this.db.todos.where("itemNumber").below(upperItemNumber).reverse().limit(count).toArray();

        // Reverse to get ascending order (lowest itemNumber first) to match IndexedDB implementation
        return items.reverse();
    }

    async toggleTodo(itemNumber, completed) {
        // Ensure the database connection is established
        if (!this.db) {
            await this.initDB();
            return this.toggleTodo(itemNumber, completed);
        }

        // Get the todo item
        const todoItem = await this.db.todos.get(itemNumber);

        if (!todoItem)
            throw new Error(`Todo item with itemNumber '${itemNumber}' not found`);

        // Update the completed status
        todoItem.completed = completed;

        // Save the updated item back to the database
        await this.db.todos.put(todoItem);
        this.pendingToggles++;

        if (--this.pendingToggles === 0)
            window.dispatchEvent(new CustomEvent("indexeddb-toggle-completed", {}));

        return todoItem;
    }

    removeTodo(itemNumber) {
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

        this.pendingDeletions++;
        // Delete the todo item
        this.db.todos
            .delete(itemNumber)
            .then(() => {
                if (--this.pendingDeletions === 0)
                    window.dispatchEvent(new CustomEvent("indexeddb-remove-completed", {}));
            })
            .catch((error) => {
                throw error;
            });
    }
}

export default DexieDBManager;
