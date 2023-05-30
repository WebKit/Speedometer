import { h, createElement, render } from "preact";
import App from "./app/app";
import "../../../big-dom-generator/dist/app.css";
import "todomvc-app-css/index.css";
import "./styles.css";
import "../../../big-dom-generator/public/layout.css";
import "../../../big-dom-generator/matchingCss.css";
import "../../../big-dom-generator/nonMatchingCss.css";

render(
    <div className="todoholder">
        <section className="todoapp">
            <App />
        </section>
        <footer className="info">
            <p>Click on input field to write your todo.</p>
            <p>At least two characters are needed to be a valid entry.</p>
            <p>Press 'enter' to add the todo.</p>
            <p>Double-click to edit a todo</p>
        </footer>
    </div>,
    document.querySelector(".todo-area")
);
