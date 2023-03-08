import { useState } from "react";

const uuid = () => crypto.randomUUID();

export const useModel = () => {
    const [todos, setTodos] = useState([]);

    const addItem = (title) => {
        const todo = {
            id: uuid(),
            title,
            completed: false,
        };

        setTodos([todo, ...todos]);
        return todo;
    };

    const updateItem = (id, title) => {
        setTodos(todos.map((todo) => (todo.id === id ? { ...todo, title } : todo)));
    };

    const removeItem = (id) => {
        setTodos(todos.filter((todo) => todo.id !== id));
    };

    const toggleItem = (id) => {
        setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
    };

    const removeAllItems = () => {
        setTodos([]);
    };

    const toggleAll = (value) => {
        setTodos(todos.map((todo) => (todo.completed !== value ? { ...todo, completed: value } : todo)));
    };

    const removeCompletedItems = () => {
        setTodos(todos.filter((todo) => !todo.completed));
    };

    return {
        todos,
        addItem,
        updateItem,
        removeItem,
        toggleItem,
        removeAllItems,
        toggleAll,
        removeCompletedItems,
    };
};
