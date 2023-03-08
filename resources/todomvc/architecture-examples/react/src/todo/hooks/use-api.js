const uuid = () => crypto.randomUUID();

const create = (title) => ({
    id: uuid(),
    title,
    completed: false,
});

const update = (item, { title, completed }) => ({
    ...item,
    title: title === undefined ? item.title : title,
    completed: completed === undefined ? item.completed : completed,
});

export const useApi = (storage, initialTodos = []) => {
    initialTodos.forEach((todo) => storage.setValue(todo.id, todo));

    const addItem = (title) => {
        const todo = create(title);
        storage.setValue(todo.id, todo);
        return todo;
    };

    const updateItem = (id, title) => {
        let todo = storage.getValue(id);
        if (!todo) {
            return undefined;
        }

        todo = update(todo, { title });
        storage.setValue(todo.id, todo);
        return todo;
    };

    const removeItem = (id) => {
        const todo = storage.deleteValue(id);
        return todo;
    };

    const toggleItem = (id) => {
        let todo = storage.getValue(id);
        if (!todo) {
            return undefined;
        }

        todo = update(todo, { completed: !todo.completed });
        storage.setValue(todo.id, todo);
        return todo;
    };

    const removeAllItems = () => {
        storage.removeAllValues();
    };

    const toggleAll = (value) => {
        getTodos().forEach((todo) => {
            todo = update(todo, { completed: value });
            storage.setValue(todo.id, todo);
        });
    };

    const removeCompletedItems = () => {
        getTodos().forEach((todo) => {
            if (todo.completed) {
                storage.deleteValue(todo.id);
            }
        });
    };

    const getTodos = () => {
        return [...storage.getAllValues()];
    };

    return { addItem, updateItem, removeItem, toggleItem, removeAllItems, toggleAll, removeCompletedItems, getTodos };
};
