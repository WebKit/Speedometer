import React from "react";
import PropTypes from "prop-types";

import { useSanitizer } from "../hooks/use-sanitizer";
import { useValidators } from "../hooks/use-validators";

export const Header = ({ onSubmit }) => {
    const { sanitize } = useSanitizer();
    const { hasValidMin } = useValidators();

    const handleSubmit = (e) => {
        // trim whitespaces
        const value = e.target.elements["new-todo-input"].value.trim();
        e.preventDefault();

        // enforce 2 chars min
        if (!hasValidMin(value, 2)) {
            return;
        }

        // sanitize input and submit
        onSubmit(sanitize(value));

        e.target.reset();
    };

    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <form onSubmit={handleSubmit}>
                <input className="new-todo" id="new-todo-input" type="text" data-testid="text-input" autoFocus />
                <label className="visually-hidden" htmlFor="new-todo-input">
                    New Todo Input
                </label>
            </form>
        </header>
    );
};

Header.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};
