import { useApi } from "./use-api.js";
import { useStorage } from "./use-storage.js";
import { mixedTodos } from "../../test/data.js";

describe("useApi", () => {
    let storage;

    beforeEach(() => {
        jest.resetAllMocks();
        storage = useStorage();
    });

    afterEach(() => {
        storage.destroy();
    });

    it("should initialize with empty todos", () => {
        const { getTodos } = useApi(storage);
        expect(getTodos().length).toEqual(0);
    });

    it("should initialize with mixed todos", () => {
        const { getTodos } = useApi(storage, [...mixedTodos]);
        expect(getTodos().length).toEqual(3);
    });

    it("should add an item", () => {
        const { getTodos, addItem } = useApi(storage);
        addItem("Clean Car");
        expect(getTodos().length).toEqual(1);
    });

    it("should update an item", () => {
        const { addItem, updateItem } = useApi(storage);
        let item = addItem("Clean Car");
        expect(item).toMatchObject({ title: "Clean Car" });
        item = updateItem(item.id, "Clean Bus");
        expect(item).toMatchObject({ title: "Clean Bus" });
    });

    it("should return undefined if todo not found", () => {
        const { updateItem } = useApi(storage);
        const item = updateItem("0", "Clean Bus");
        expect(item).toBeUndefined();
    });

    it("should remove an item", () => {
        const { addItem, removeItem } = useApi(storage);
        let item = addItem("Clean Car");
        expect(item).toMatchObject({ title: "Clean Car" });
        item = removeItem(item.id);
        expect(item).toMatchObject({ title: "Clean Car" });
    });

    it("should toggle an item", () => {
        const { addItem, toggleItem } = useApi(storage);
        let item = addItem("Clean Car");
        expect(item).toMatchObject({ completed: false });
        item = toggleItem(item.id);
        expect(item).toMatchObject({ completed: true });
    });

    it("should return undefined if todo not found", () => {
        const { toggleItem } = useApi(storage);
        const item = toggleItem("0");
        expect(item).toBeUndefined();
    });

    it("should remove all items", () => {
        const { addItem, removeAllItems, getTodos } = useApi(storage);
        addItem("Clean Car");
        addItem("Wash Dishes");
        expect(getTodos().length).toEqual(2);
        removeAllItems();
        expect(getTodos().length).toEqual(0);
    });

    it("should remove completed items", () => {
        const { addItem, toggleItem, removeCompletedItems, getTodos } = useApi(storage);
        addItem("Clean Car");
        addItem("Wash Dishes");
        addItem("Make Bed");
        toggleItem(getTodos()[1].id);
        expect(getTodos().length).toBe(3);
        removeCompletedItems();
        expect(getTodos().length).toBe(2);
    });
});
