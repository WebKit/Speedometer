import React from "react";
import PropTypes from "prop-types";

import { useSanitizer } from "../hooks/use-sanitizer";
import { useValidators } from "../hooks/use-validators";

export const Input = ({ onSubmit, placeholder, label, defaultValue, onBlur }) => {
    const { sanitize } = useSanitizer();
    const { hasValidMin } = useValidators();

    const handleSubmit = (e) => {
        // trim whitespaces
        const value = e.target.elements["todo-input"].value.trim();
        e.preventDefault();

        // enforce 2 chars min
        if (!hasValidMin(value, 2)) {
            return;
        }

        // sanitize input and submit
        onSubmit(sanitize(value));

        e.target.reset();
    };

    const handleBlur = (e) => {
        if (onBlur) {
            onBlur();
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input className="new-todo" id="todo-input" type="text" data-testid="text-input" autoFocus placeholder={placeholder} defaultValue={defaultValue} onBlur={handleBlur} />
            <label className="visually-hidden" htmlFor="todo-input">
                {label}
            </label>
        </form>
    );
};

Input.propTypes = {
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
    label: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onBlur: PropTypes.func,
};
