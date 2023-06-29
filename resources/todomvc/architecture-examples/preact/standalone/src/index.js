import { h, render } from "preact";
import App from "../../shared/src/app/app";
import "todomvc-app-css/index.css";
import "../../shared/src/styles.css";

render(<App />, document.querySelector(".todoapp"));
