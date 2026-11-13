/**
 * Import-free on purpose: importing storage-factory.js from workload-test.mjs
 * would close a cycle through the storage managers.
 * @returns {"vanilla"|"dexie"} The storage type
 */
export function getStorageType() {
    const params = new URLSearchParams(window.location.search);
    const storageType = params.get("storageType");
    if (storageType && storageType !== "vanilla" && storageType !== "dexie")
        throw new Error(`Invalid storage type specified in URL parameter: ${storageType}`);

    return storageType || "vanilla";
}
