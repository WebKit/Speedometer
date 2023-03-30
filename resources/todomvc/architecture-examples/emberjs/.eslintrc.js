"use strict";

module.exports = {
    plugins: ["ember"],
    extends: ["eslint:recommended", "plugin:ember/recommended"],
    parser: "@babel/eslint-parser",
    rules: {
        "no-undef": 0,
    },
};
