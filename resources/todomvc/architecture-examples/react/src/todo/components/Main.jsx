import React, { useState } from "react";
import { Item } from "./Item";
import PropTypes from "prop-types";

export const Main = ({ todos, onToggle, onDelete, onUpdate }) => {
    const visibleTodos = [...todos]; // temp for now
    const [isChecked, setIsChecked] = useState(visibleTodos.length > 0 && visibleTodos.every((todo) => todo.completed));

    const handleChange = (e) => {
        console.log("handleChange", e.target.checked);
    };

    const handleClick = () => {
        console.log("handleClick()");
        setIsChecked(!isChecked);
    };

    return (
        <main className="main" data-testid="main">
            {visibleTodos.length > 0 ? (
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" data-testid="toggle-all" checked={isChecked} onChange={handleChange} />
                    <label htmlFor="toggle-all" onClick={handleClick} />
                </div>
            ) : null}
            <ul className="todo-list" data-testid="todo-list">
                {todos.map((todo) => (
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
};
