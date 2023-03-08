const uuid = () => crypto.randomUUID();

const create = (task) => ({
    id: uuid(),
    task,
    completed: false,
});

const update = (item, { task, completed }) => ({
    ...item,
    task: task === undefined ? item.task : task,
    completed: completed === undefined ? item.completed : completed,
});

export const useApi = (storage, initialTodos = []) => {
    initialTodos.forEach((todo) => storage.setValue(todo.id, todo));

    const addItem = (task) => {
        const todo = create(task);
        storage.setValue(todo.id, todo);
        return todo;
    };

    const updateItem = (id, task) => {
        let todo = storage.getValue(id);
        if (!todo) {
            return undefined;
        }

        todo = update(todo, { task });
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

    return { addItem, updateItem, removeItem, toggleItem, removeAllItems, removeCompletedItems, getTodos };
};
