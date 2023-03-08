import React from "react";
import PropTypes from "prop-types";

import { useSanitizer } from "../hooks/use-sanitizer";
import { useValidators } from "../hooks/use-validators";

export const Input = ({ onSubmit, placeholder, label, defaultValue, onBlur }) => {
    const { sanitize } = useSanitizer();
    const { hasValidMin } = useValidators();

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur();
        }
    };

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            const value = e.target.value.trim();
            if (!hasValidMin(value, 2)) {
                return;
            }
            onSubmit(sanitize(value));
            e.target.value = "";
        }
    };

    return (
        <div className="input-container">
            <input className="new-todo" id="todo-input" type="text" data-testid="text-input" autoFocus placeholder={placeholder} defaultValue={defaultValue} onBlur={handleBlur} onKeyDown={handleKeyDown} />
            <label className="visually-hidden" htmlFor="todo-input">
                {label}
            </label>
        </div>
    );
};

Input.propTypes = {
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
    label: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
};
