import View from "./view";
import Controller from "./controller";
import Model from "./model";
import Store from "./store";
import Template from "./template";

import "../../../big-dom-generator/dist/app.css";
import "todomvc-app-css/index.css";
import "./app.css";
import "../../../big-dom-generator/public/layout.css";
import "../../../big-dom-generator/matchingCss.css";
import "../../../big-dom-generator/nonMatchingCss.css";

let todo;
const onHashChange = () => {
    todo.controller.setView(document.location.hash);
};

const onLoad = () => {
    todo = new Todo("javascript-es6-webpack");
    onHashChange();
};

function Todo(name) {
    this.storage = new Store(name);
    this.model = new Model(this.storage);
    this.template = new Template();
    this.view = new View(this.template);
    this.controller = new Controller(this.model, this.view);
}

/* HOT MODULE SPECIFIC */
if (module.hot) {
    module.hot.accept(function (err) {});
    if (document.readyState === "complete")
        onLoad();
}

window.addEventListener("load", onLoad);
window.addEventListener("hashchange", onHashChange);
