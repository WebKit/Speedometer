import { useReducer, useCallback } from "react";
import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

import { todoReducer } from "./reducer";

import "./app.css";

export function App() {
    const [todos, dispatch] = useReducer(todoReducer, []);

    const addItem = useCallback((title) => dispatch({ type: "ADD_ITEM", payload: { title } }), [dispatch]);
    const toggleItem = useCallback((id) => dispatch({ type: "TOGGLE_ITEM", payload: { id } }), [dispatch]);
    const removeItem = useCallback((id) => dispatch({ type: "REMOVE_ITEM", payload: { id } }), [dispatch]);
    const updateItem = useCallback((id, title) => dispatch({ type: "UPDATE_ITEM", payload: { id, title } }), [dispatch]);
    const toggleAll = useCallback((completed) => dispatch({ type: "TOGGLE_ALL", payload: { completed } }), [dispatch]);
    const removeCompleted = useCallback(() => dispatch({ type: "REMOVE_COMPLETED_ITEMS" }), [dispatch]);

    return (
        <>
            <Header onSubmit={addItem} />
            <Main todos={todos} onToggle={toggleItem} onDelete={removeItem} onUpdate={updateItem} onToggleAll={toggleAll} />
            <Footer todos={todos} onClear={removeCompleted} />
        </>
    );
}
