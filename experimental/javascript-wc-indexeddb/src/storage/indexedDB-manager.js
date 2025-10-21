class IndexedDBManager {
    constructor() {
        this.dbName = "todoDB";
        this.dbVersion = 1;
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

    initDB() {
        return new Promise((resolve, reject) => {
            // Delete the existing database first for clean state
            const deleteRequest = indexedDB.deleteDatabase(this.dbName);

            deleteRequest.onerror = (event) => {
                // Continue despite error in deletion
                this.openDatabase(resolve, reject);
            };

            deleteRequest.onsuccess = () => {
                this.openDatabase(resolve, reject);
            };

            deleteRequest.onblocked = () => {
                // Try opening anyway
                this.openDatabase(resolve, reject);
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
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

        // Add todo item to IndexedDB
        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        const request = store.add(todo);
        this.pendingAdditions++;

        request.onsuccess = () => {
            // When running in Speedometer, the event will be dispatched only once
            // because all the additions are done in a tight loop.
            if (--this.pendingAdditions === 0)
                window.dispatchEvent(new CustomEvent("indexeddb-add-completed", {}));
        };

        request.onerror = (event) => {
            throw event.target.error;
        };
    }

    async getTodos(upperItemNumber, count) {
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

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

            request.onerror = (event) => {
                reject(event.target.error);
            };

            // Also handle transaction errors
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    async toggleTodo(itemNumber, completed) {
        // Ensure the database connection is established
        if (!this.db) {
            await this.initDB();
            return this.toggleTodo(itemNumber, completed);
        }

        return new Promise((resolve, reject) => {
            // Access the todo item directly by its itemNumber (keyPath)
            const transaction = this.db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);

            // Get the todo item directly using its primary key (itemNumber)
            const getRequest = store.get(itemNumber);

            getRequest.onsuccess = (event) => {
                const todoItem = getRequest.result;

                if (!todoItem) {
                    reject(new Error(`Todo item with itemNumber '${itemNumber}' not found`));
                    return;
                }

                // Update the completed status
                todoItem.completed = completed;
                this.pendingToggles++;

                // Save the updated item back to the database
                const updateRequest = store.put(todoItem);

                updateRequest.onsuccess = () => {
                    if (--this.pendingToggles === 0)
                        window.dispatchEvent(new CustomEvent("indexeddb-toggle-completed", {}));

                    resolve(todoItem);
                };

                updateRequest.onerror = (event) => {
                    reject(event.target.error);
                };
            };

            getRequest.onerror = (event) => {
                reject(event.target.error);
            };

            // Handle potential errors in finding the item
            transaction.onerror = (event) => {
                reject(event.target.error);
            };

            // Handle transaction errors
            transaction.onerror = (event) => {
                reject(event.target.error);
            };
        });
    }

    removeTodo(itemNumber) {
        // Ensure the database connection is established
        if (!this.db)
            throw new Error("Database connection is not established");

        // Access the todo item directly by its itemNumber (keyPath)
        const transaction = this.db.transaction(this.storeName, "readwrite");
        const store = transaction.objectStore(this.storeName);

        // Delete the todo item directly using its primary key (itemNumber)
        const deleteRequest = store.delete(itemNumber);
        this.pendingDeletions++;

        deleteRequest.onsuccess = () => {
            if (--this.pendingDeletions === 0)
                window.dispatchEvent(new CustomEvent("indexeddb-remove-completed", {}));
        };

        deleteRequest.onerror = (event) => {
            throw event.target.error;
        };

        // Handle transaction errors
        transaction.onerror = (event) => {
            throw event.target.error;
        };
    }
}

export default IndexedDBManager;
