"use strict";

const EmberApp = require("ember-cli/lib/broccoli/ember-app");

module.exports = function (defaults) {
    let app = new EmberApp(defaults, {
        // disabling for Speedometer
        SRI: {
            enabled: false,
        },
    });

    app.import("node_modules/todomvc-common/base.css");
    app.import("node_modules/todomvc-app-css/index.css");

    return app.toTree();
};
