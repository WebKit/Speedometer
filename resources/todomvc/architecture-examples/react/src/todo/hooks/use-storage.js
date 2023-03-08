const cache = {};
const defaultNameSpace = "default";

export const useStorage = (namespace = defaultNameSpace) => {
    if (!cache[namespace]) {
        cache[namespace] = {};
    }

    const setValue = (key, value) => {
        cache[namespace][key] = value;
        return value;
    };

    const deleteValue = (key) => {
        const value = cache[namespace][key];

        if (value === undefined) {
            return undefined;
        }

        delete cache[namespace][key];

        return value;
    };

    const getValue = (key) => {
        const value = cache[namespace][key];
        return value;
    };

    const getAllValues = () => {
        const values = Object.values(cache[namespace]);
        return values;
    };

    const removeAllValues = () => {
        Object.keys(cache[namespace]).forEach((key) => delete cache[namespace][key]);
    };

    const toString = () => {
        return { ...cache[namespace] };
    };

    const destroy = () => {
        delete cache[namespace];
    };

    return {
        setValue,
        deleteValue,
        getValue,
        getAllValues,
        removeAllValues,
        toString,
        destroy,
    };
};
