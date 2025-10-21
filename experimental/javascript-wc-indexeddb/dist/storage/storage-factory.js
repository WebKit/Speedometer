import IndexedDBManager from "./indexedDB-manager.js";
import DexieDBManager from "./dexieDB-manager.js";

/**
 * Parse the storage type from URL hash
 * Supports formats like: #indexeddb, #dexie, #indexeddb/active, #dexie/completed
 * @returns {string} Either 'dexie' or 'indexeddb'
 */
export function getStorageType() {
    const hash = window.location.hash.split("?")[0];

    // Remove leading # and split by /
    const parts = hash.replace(/^#/, "").split("/");
    // First part is the storage type (or filter if no storage specified)
    const firstPart = parts[1];

    // Check if first part is a storage type
    if (firstPart === "dexie")
        return "dexie";

    if (firstPart === "indexeddb")
        return "indexeddb";

    // Default to vanilla IndexedDB if not specified
    return "indexeddb";
}

/**
 * Factory function that returns the appropriate storage manager based on URL hash
 * @returns {IndexedDBManager|DexieDBManager} The storage manager instance
 */
export function createStorageManager() {
    const storageType = getStorageType();

    if (storageType === "dexie") {
        console.log("Using Dexie.js storage manager");
        return new DexieDBManager();
    }

    // Default to vanilla IndexedDB
    console.log("Using vanilla IndexedDB storage manager");
    return new IndexedDBManager();
}
