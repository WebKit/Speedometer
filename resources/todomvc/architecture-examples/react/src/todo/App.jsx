import React from "react";

import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

import { useModel } from "./hooks/use-model";

import "./app.css";

export const App = () => {
    const { todos, addItem, updateItem, removeItem, toggleItem, toggleAll, removeCompletedItems } = useModel();

    const handleAddItem = (title) => {
        addItem(title);
    };

    const handleToggleItem = (id) => {
        toggleItem(id);
    };

    const handleUpdateItem = (id, title) => {
        updateItem(id, title);
    };

    const handleDeleteItem = (id) => {
        removeItem(id);
    };

    const handleRemoveCompletedItems = () => {
        removeCompletedItems();
    };

    const handleToggleAll = (completed) => {
        toggleAll(completed);
    };

    return (
        <>
            <Header onSubmit={handleAddItem} />
            <Main todos={todos} onToggle={handleToggleItem} onDelete={handleDeleteItem} onUpdate={handleUpdateItem} onToggleAll={handleToggleAll} />
            <Footer todos={todos} onClear={handleRemoveCompletedItems} />
        </>
    );
};
