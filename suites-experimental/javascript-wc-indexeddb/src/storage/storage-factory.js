import IndexedDBManager from "./indexedDB-manager.js";
import DexieDBManager from "./dexieDB-manager.js";

/**
 * Factory function that returns the appropriate storage manager based on URL search parameters
 * @returns {IndexedDBManager|DexieDBManager} The storage manager instance
 */
export function createStorageManager() {
    const params = new URLSearchParams(window.location.search);
    let storageType = params.get("storageType");
    if (storageType && storageType !== "vanilla" && storageType !== "dexie")
        throw new Error(`Invalid storage type specified in URL parameter: ${storageType}`);

    storageType = storageType || "vanilla";

    if (storageType === "dexie") {
        console.log("Using Dexie.js storage manager");
        return new DexieDBManager();
    }

    // Default to vanilla IndexedDB
    console.log("Using vanilla IndexedDB storage manager");
    return new IndexedDBManager();
}
