import { h, createElement, render } from "preact";
import App from "../../shared/src/app/app";
import "todomvc-app-css/index.css";
import "../../shared/src/styles.css";
import "big-dom-generator/dist/app.css";
import "big-dom-generator/generated.css";

render(<App />, document.querySelector(".todoapp"));
