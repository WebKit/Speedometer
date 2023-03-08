import React from "react";
import PropTypes from "prop-types";

import { Input } from "./Input";

export const Header = ({ onSubmit }) => {
    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <Input onSubmit={onSubmit} label="New Todo Input" placeholder="What needs to be done?" />
        </header>
    );
};

Header.propTypes = {
    onSubmit: PropTypes.func.isRequired,
};
