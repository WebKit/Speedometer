// eslint-disable-next-line no-unused-vars
import { h, render } from "preact";
import App from "./app/app";
import "todomvc-app-css/index.css";
import "./styles.css";

render(<App />, document.querySelector(".todoapp"));
