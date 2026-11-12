import IndexedDBManager from "./indexedDB-manager.js";
import DexieDBManager from "./dexieDB-manager.js";
import { getStorageType } from "./storage-type.js";

/**
 * Factory function that returns the appropriate storage manager based on URL search parameters
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
