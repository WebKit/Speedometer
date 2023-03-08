import React, { useState } from "react";
import PropTypes from "prop-types";

import { Input } from "./Input";

export const Item = ({ todo, onToggle, onDelete, onUpdate }) => {
    const [isWritable, setIsWritable] = useState(false);
    const { title, completed, id } = todo;

    const handleChange = (e) => {
        onToggle(id);
    };

    const handleDoubleClick = () => {
        setIsWritable(true);
    };

    const handleClick = () => {
        onDelete(id);
    };

    const handleBlur = () => {
        setIsWritable(false);
    };

    const handleUpdate = (text) => {
        if (text.length === 0) {
            onDelete(id);
        } else {
            onUpdate(id, text);
        }

        setIsWritable(false);
    };

    const renderView = () => {
        if (isWritable) {
            return <Input onSubmit={handleUpdate} label="Edit Todo Input" defaultValue={title} onBlur={handleBlur} />;
        } else {
            return (
                <>
                    <input className="toggle" type="checkbox" data-testid="todo-item-toggle" checked={completed} onChange={handleChange} />
                    <label data-testid="todo-item-label" onDoubleClick={handleDoubleClick}>
                        {title}
                    </label>
                    <button className="destroy" data-testid="todo-item-button" onClick={handleClick} />
                </>
            );
        }
    };

    return (
        <li data-testid="todo-item">
            <div className="view">{renderView()}</div>
        </li>
    );
};

Item.propTypes = {
    todo: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        completed: PropTypes.bool.isRequired,
    }),
    onToggle: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
};
