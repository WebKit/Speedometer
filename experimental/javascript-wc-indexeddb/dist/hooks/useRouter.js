/**
 * Listens for hash change of the url and calls onChange if available.
 *
 * @param {Function} callback
 * @returns Methods to interact with useRouter.
 */
export const useRouter = (callback) => {
    let onChange = callback;
    let current = "";

    /**
     * Change event handler.
     */
    const handleChange = () => {
        current = document.location.hash.split("?")[0];
        /* istanbul ignore else */
        if (onChange)
            onChange(getRoute());
    };

    /**
     * Initializes router and adds listeners.
     *
     * @param {Function} callback
     */
    const initRouter = (callback) => {
        onChange = callback;
        window.addEventListener("hashchange", handleChange);
        window.addEventListener("load", handleChange);
    };

    /**
     * Removes listeners
     */
    const disableRouter = () => {
        window.removeEventListener("hashchange", handleChange);
        window.removeEventListener("load", handleChange);
    };

    /**
     * Get the filter route from the hash (active, completed, or all)
     * Handles both formats: #/active and #indexeddb/active
     */
    const getRoute = () => {
        const parts = current.replace(/^#/, "").split("/");

        // If the first part and is a storage type, return 'all'
        const filterPart = parts[2];
        // Otherwise return the part (or empty for 'all')
        return filterPart || "all";
    };

    return { initRouter, getRoute, disableRouter };
};
