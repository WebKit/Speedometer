import { useStorage } from "./use-storage.js";

describe("useStorage", () => {
    const { setValue, deleteValue, getValue, getAllValues, removeAllValues, toString, destroy } = useStorage();

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("should set a value", () => {
        setValue("one", 1);
        expect(getValue("one")).toEqual(1);
    });

    it("should delete a value", () => {
        setValue("one", 1);
        expect(getValue("one")).toEqual(1);
        expect(deleteValue("one")).toEqual(1);
    });

    it("should return undefined for non existing keys", () => {
        expect(getValue("one")).toBeUndefined();
        expect(deleteValue("one")).toBeUndefined();
    });

    it("should return all values", () => {
        setValue("one", 1);
        setValue("two", 2);
        expect(getAllValues()).toEqual([1, 2]);
    });

    it("should return toSting", () => {
        setValue("one", 1);
        setValue("two", 2);
        expect(toString()).toEqual({ one: 1, two: 2 });
    });

    it("should remove all values", () => {
        setValue("one", 1);
        setValue("two", 2);
        expect(toString()).toEqual({ one: 1, two: 2 });
        removeAllValues();
        expect(toString()).toEqual({});
    });

    it("should delete namespace key", () => {
        setValue("one", 1);
        setValue("two", 2);
        expect(toString()).toEqual({ one: 1, two: 2 });
        destroy();
        expect(toString()).toEqual({});
    });
});
