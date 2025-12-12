import BaseStorageManager from "./base-storage-manager.js";

class IndexedDBManager extends BaseStorageManager {
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
        const request = indexedDB.open(this.dbName, 1);

        request.onerror = (event) => {
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            this.db = event.target.result;
            resolve(this.db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            const store = db.createObjectStore(this.storeName, { keyPath: "itemNumber" });
            store.createIndex("id", "id", { unique: true });
            store.createIndex("title", "title", { unique: false });
            store.createIndex("completed", "completed", { unique: false });
            store.createIndex("priority", "priority", { unique: false });
        };
    }

    addTodo(todo) {
        this._ensureDbConnection();

        const transaction = this.db.transaction(this.storeName, "readwrite");

        transaction.oncomplete = () => {
            // When running in Speedometer, the event will be dispatched only once
            // because all the additions are done in a tight loop.
            this._handleAddComplete();
        };

        transaction.onerror = (event) => {
            console.error("Transaction error:", event.target.error);
            throw event.target.error;
        };

        const store = transaction.objectStore(this.storeName);
        store.add(todo);
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

        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        const getRequest = store.get(itemNumber);

        getRequest.onsuccess = (event) => {
            const todoItem = getRequest.result;

            if (!todoItem)
                throw new Error(`Todo item with itemNumber '${itemNumber}' not found`);

            todoItem.completed = completed;
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

        transaction.oncomplete = () => {
            this._handleRemoveComplete();
        };

        transaction.onerror = (event) => {
            throw event.target.error;
        };

        // Delete the todo item directly using its primary key (itemNumber)
        store.delete(itemNumber);
        transaction.commit();
    }
}

export default IndexedDBManager;
