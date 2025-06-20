/**
 * IndexedDB service for TodoMVC application
 * Handles persistent storage operations for todos with pagination support
 */

export class IndexedDBService {
    #db = null;
    #dbName = 'todos';
    #dbVersion = 1;
    #storeName = 'todos';

    constructor() {
        this.initialized = false;
    }

    /**
     * Initialize the IndexedDB database
     * @returns {Promise<void>}
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            if (this.initialized) {
                resolve();
                return;
            }

            const request = window.indexedDB.open(this.#dbName, this.#dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open IndexedDB'));
            };

            request.onsuccess = (event) => {
                this.#db = event.target.result;
                this.initialized = true;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(this.#storeName)) {
                    const objectStore = db.createObjectStore(this.#storeName, { keyPath: 'id' });
                    objectStore.createIndex('completed', 'completed', { unique: false });
                    objectStore.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };
        });
    }

    /**
     * Add a new todo item to IndexedDB
     * @param {Object} todo - Todo item to add
     * @returns {Promise<Object>} Added todo item
     */
    async addTodo(todo) {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.#storeName);
            
            const request = objectStore.add({
                ...todo,
                createdAt: todo.createdAt || Date.now()
            });

            request.onsuccess = () => {
                resolve(todo);
            };

            request.onerror = () => {
                reject(new Error('Failed to add todo to IndexedDB'));
            };
        });
    }

    /**
     * Update an existing todo item in IndexedDB
     * @param {Object} todo - Todo item to update
     * @returns {Promise<Object>} Updated todo item
     */
    async updateTodo(todo) {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.#storeName);
            
            const request = objectStore.put(todo);

            request.onsuccess = () => {
                resolve(todo);
            };

            request.onerror = () => {
                reject(new Error('Failed to update todo in IndexedDB'));
            };
        });
    }

    /**
     * Remove a todo item from IndexedDB
     * @param {string} id - ID of todo to remove
     * @returns {Promise<void>}
     */
    async removeTodo(id) {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.#storeName);
            
            const request = objectStore.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(new Error('Failed to remove todo from IndexedDB'));
            };
        });
    }

    /**
     * Get todos for a specific page
     * @param {number} page - Page number (0-based)
     * @param {number} pageSize - Number of items per page
     * @param {string} filter - Filter type ('all', 'active', 'completed')
     * @returns {Promise<Array>} Array of todo items for the page
     */
    async getTodosForPage(page = 0, pageSize = 10, filter = 'all') {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readonly');
            const objectStore = transaction.objectStore(this.#storeName);
            const index = objectStore.index('createdAt');
            
            const request = index.openCursor();
            const todos = [];
            let count = 0;
            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    const todo = cursor.value;
                    
                    // Apply filter
                    const shouldInclude = filter === 'all' || 
                        (filter === 'active' && !todo.completed) ||
                        (filter === 'completed' && todo.completed);
                    
                    if (shouldInclude) {
                        if (count >= startIndex && count < endIndex) {
                            todos.push(todo);
                        }
                        count++;
                    }
                    
                    cursor.continue();
                } else {
                    resolve(todos);
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to get todos from IndexedDB'));
            };
        });
    }

    /**
     * Get total count of todos matching filter
     * @param {string} filter - Filter type ('all', 'active', 'completed')
     * @returns {Promise<number>} Total count
     */
    async getTodoCount(filter = 'all') {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readonly');
            const objectStore = transaction.objectStore(this.#storeName);
            
            let request;
            if (filter === 'all') {
                request = objectStore.count();
            } else {
                const index = objectStore.index('completed');
                request = index.count(filter === 'completed');
            }

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to count todos in IndexedDB'));
            };
        });
    }

    /**
     * Clear all completed todos
     * @returns {Promise<number>} Number of todos cleared
     */
    async clearCompleted() {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readwrite');
            const objectStore = transaction.objectStore(this.#storeName);
            const index = objectStore.index('completed');
            
            const request = index.openCursor(true); // Only completed todos
            let deletedCount = 0;

            request.onsuccess = (event) => {
                const cursor = event.target.result;
                
                if (cursor) {
                    const deleteRequest = cursor.delete();
                    deleteRequest.onsuccess = () => {
                        deletedCount++;
                    };
                    cursor.continue();
                } else {
                    resolve(deletedCount);
                }
            };

            request.onerror = () => {
                reject(new Error('Failed to clear completed todos'));
            };
        });
    }

    /**
     * Get all todos (for development/debugging purposes)
     * @returns {Promise<Array>} All todos
     */
    async getAllTodos() {
        await this.#ensureInitialized();
        
        return new Promise((resolve, reject) => {
            const transaction = this.#db.transaction([this.#storeName], 'readonly');
            const objectStore = transaction.objectStore(this.#storeName);
            
            const request = objectStore.getAll();

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(new Error('Failed to get all todos from IndexedDB'));
            };
        });
    }

    /**
     * Ensure the database is initialized
     * @private
     */
    async #ensureInitialized() {
        if (!this.initialized) {
            await this.initialize();
        }
    }

    /**
     * Close the database connection
     */
    close() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
            this.initialized = false;
        }
    }
}

// Export a singleton instance
export const indexedDBService = new IndexedDBService();