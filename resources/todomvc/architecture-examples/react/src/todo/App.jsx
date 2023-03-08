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

    // Triggering re-render by setting a state change
    // eslint-disable-next-line no-unused-vars
    const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());

    const handleAddItem = (title) => {
        addItem(title);
        setLastUpdateTime(Date.now());
    };

    const handleToggleItem = (id) => {
        toggleItem(id);
        setLastUpdateTime(Date.now());
    };

    const handleUpdateItem = (id, title) => {
        updateItem(id, title);
        setLastUpdateTime(Date.now());
    };

    const handleDeleteItem = (id) => {
        removeItem(id);
        setLastUpdateTime(Date.now());
    };

    const handleRemoveCompletedItems = () => {
        removeCompletedItems();
        setLastUpdateTime(Date.now());
    };

    const handleToggleAll = (completed) => {
        toggleAll(completed);
        setLastUpdateTime(Date.now());
    };

    return (
        <>
            <Header onSubmit={handleAddItem} />
            <Main todos={getTodos()} onToggle={handleToggleItem} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} onToggleAll={handleToggleAll} />
            <Footer todos={getTodos()} onClear={handleRemoveCompletedItems} />
        </>
    );
};
