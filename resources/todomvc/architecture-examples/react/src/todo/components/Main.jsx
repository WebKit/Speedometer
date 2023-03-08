import React, { useRef } from "react";
import PropTypes from "prop-types";
import { useLocation } from "react-router-dom";

import { Item } from "./Item";

export const Main = ({ todos, onToggle, onDelete, onUpdate, onToggleAll }) => {
    const toggleRef = useRef(null);
    const location = useLocation();
    const route = location.pathname;

    const visibleTodos = todos.filter((todo) => {
        if (route === "/active") {
            return !todo.completed;
        }
        if (route === "/completed") {
            return todo.completed;
        }

        return todo;
    });

    const handleChange = (e) => {
        onToggleAll(e.target.checked);
    };

    const handleClick = () => {
        toggleRef.current.click();
    };

    return (
        <main className="main" data-testid="main">
            {visibleTodos.length > 0 ? (
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" data-testid="toggle-all" checked={visibleTodos.length > 0 && visibleTodos.every((todo) => todo.completed)} onChange={handleChange} ref={toggleRef} />
                    <label htmlFor="toggle-all" onClick={handleClick} />
                </div>
            ) : null}
            <ul className="todo-list" data-testid="todo-list">
                {visibleTodos.map((todo) => (
                    <Item todo={todo} key={todo.id} onToggle={onToggle} onDelete={onDelete} onUpdate={onUpdate} />
                ))}
            </ul>
        </main>
    );
};

Main.propTypes = {
    todos: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            title: PropTypes.string.isRequired,
            completed: PropTypes.bool.isRequired,
        })
    ),
    onToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onToggleAll: PropTypes.func.isRequired,
};
