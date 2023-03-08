import React, { useState } from "react";

import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

import { useStorage } from "./hooks/use-storage.js";
import { useApi } from "./hooks/use-api.js";

import "./app.css";

export const App = () => {
    const storage = useStorage("react-todos");
    const { getTodos, addItem, updateItem, removeItem, toggleItem, toggleAll, removeCompletedItems } = useApi(storage);

    const [currentTodos, setCurrentTodos] = useState(getTodos());

    const handleAddItem = (title) => {
        addItem(title);
        setCurrentTodos(getTodos());
    };

    const handleToggleItem = (id) => {
        toggleItem(id);
        setCurrentTodos(getTodos());
    };

    const handleUpdateItem = (id, title) => {
        updateItem(id, title);
        setCurrentTodos(getTodos());
    };

    const handleDeleteItem = (id) => {
        removeItem(id);
        setCurrentTodos(getTodos());
    };

    const handleRemoveCompletedItems = () => {
        removeCompletedItems();
        setCurrentTodos(getTodos());
    };

    const handleToggleAll = (completed) => {
        toggleAll(completed);
        setCurrentTodos(getTodos());
    };

    return (
        <>
            <Header onSubmit={handleAddItem} />
            <Main todos={currentTodos} onToggle={handleToggleItem} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} onToggleAll={handleToggleAll} />
            <Footer todos={currentTodos} onClear={handleRemoveCompletedItems} />
        </>
    );
};
