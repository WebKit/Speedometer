import { useState } from "react";

const uuid = () => crypto.randomUUID();

export const useModel = () => {
    const [todos, setTodos] = useState({});

    const addItem = (title) => {
        const todo = {
            id: uuid(),
            title,
            completed: false,
        };

        setTodos({ ...todos, [todo.id]: todo });
        return todo;
    };

    const updateItem = (id, title) => {
        let todo = todos[id];
        if (!todo) {
            return undefined;
        }

        setTodos({ ...todos, [todo.id]: { ...todo, title } });
        return todo;
    };

    const removeItem = (id) => {
        const { [id]: todo, ...rest } = todos;
        setTodos({ ...rest });
        return todo;
    };

    const toggleItem = (id) => {
        let todo = todos[id];
        if (!todo) {
            return undefined;
        }

        setTodos({ ...todos, [todo.id]: { ...todo, completed: !todo.completed } });
        return todo;
    };

    const removeAllItems = () => {
        setTodos({});
    };

    const toggleAll = (value) => {
        const updatedTodos = {};
        Object.values(todos).forEach((todo) => {
            updatedTodos[todo.id] = { ...todo, completed: value };
        });

        setTodos({ ...todos });
    };


    const removeCompletedItems = () => {
        const updatedTodos = {};
        Object.values(todos).forEach((todo) => {
            if (!todo.completed) {
                updatedTodos[todo.id] = todo;
            }
        });

        setTodos({ ...todos });
    };

    return {
        todos,
        addItem,
        updateItem,
        removeItem,
        toggleItem,
        removeAllItems,
        toggleAll,
        removeCompletedItems
    };
};
