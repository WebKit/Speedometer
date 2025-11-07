import BaseStorageManager from "./base-storage-manager.js";

class IndexedDBManager extends BaseStorageManager {
    constructor() {
        super();
        this.dbVersion = 1;
        this.initDB().then(() => {
            this._dispatchReadyEvent();
        });
    }

    initDB() {
        return new Promise((resolve, reject) => {
            // Delete the existing database first for clean state
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);

            deleteRequest.onerror = (event) => {
                reject(event.target.error);
            };

            deleteRequest.onsuccess = () => {
                this.openDatabase(resolve, reject);
            };

            deleteRequest.onblocked = () => {
                reject(new Error("Database deletion blocked - please close other tabs using this database"));
            };
        });
    }

    openDatabase(resolve, reject) {
        const request = indexedDB.open(this.dbName, this.dbVersion);

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object store (since we're always creating a fresh DB now)
            const store = db.createObjectStore(this.storeName, { keyPath: "itemNumber" });
            store.createIndex("id", "id", { unique: true });
            store.createIndex("title", "title", { unique: false });
            store.createIndex("completed", "completed", { unique: false });
            store.createIndex("priority", "priority", { unique: false });
        };
    }

    addTodo(todo) {
        this._ensureDbConnection();

        // Add todo item to IndexedDB
        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        store.add(todo);
        this._incrementPendingAdditions();

        transaction.oncomplete = () => {
            // When running in Speedometer, the event will be dispatched only once
            // because all the additions are done in a tight loop.
            this._handleAddComplete();
        };

        transaction.onerror = (event) => {
            throw event.target.error;
        };

        transaction.commit();
    }

    async getTodos(upperItemNumber, count) {
        this._ensureDbConnection();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);

            // Use IDBKeyRange to get items with itemNumber less than upperItemNumber
            const range = IDBKeyRange.upperBound(upperItemNumber, true); // true = exclusive bound

            // Open a cursor to iterate through records in descending order
            const request = store.openCursor(range, "prev");

            const items = [];
            let itemsProcessed = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;

                // Check if we have a valid cursor and haven't reached our count limit
                if (cursor && itemsProcessed < count) {
                    items.push(cursor.value);
                    itemsProcessed++;
                    cursor.continue(); // Move to next item
                } else {
                    // We're done - sort items by itemNumber in descending order
                    // for proper display order (newest to oldest)
                    items.sort((a, b) => a.itemNumber - b.itemNumber);
                    resolve(items);
                }
            };

            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    toggleTodo(itemNumber, completed) {
        this._ensureDbConnection();

        // Access the todo item directly by its itemNumber (keyPath)
        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        // Get the todo item directly using its primary key (itemNumber)
        const getRequest = store.get(itemNumber);

        this._incrementPendingToggles();

        getRequest.onsuccess = (event) => {
            const todoItem = getRequest.result;

            if (!todoItem)
                throw new Error(`Todo item with itemNumber '${itemNumber}' not found`);

            // Update the completed status
            todoItem.completed = completed;
            // Save the updated item back to the database
            const updateRequest = store.put(todoItem);

            updateRequest.onerror = (event) => {
                throw event.target.error;
            };

            transaction.commit();
        };

        getRequest.onerror = (event) => {
            throw event.target.error;
        };

        transaction.oncomplete = () => {
            this._handleToggleComplete();
        };

        // Handle transaction errors
        transaction.onerror = (event) => {
            throw event.target.error;
        };
    }

    removeTodo(itemNumber) {
        this._ensureDbConnection();

        // Access the todo item directly by its itemNumber (keyPath)
        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        // Delete the todo item directly using its primary key (itemNumber)
        store.delete(itemNumber);
        this._incrementPendingDeletions();

        transaction.oncomplete = () => {
            this._handleRemoveComplete();
        };

        transaction.onerror = (event) => {
            throw event.target.error;
        };

        transaction.commit();
    }
}

export default IndexedDBManager;
