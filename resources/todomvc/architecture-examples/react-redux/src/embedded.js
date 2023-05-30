import { render } from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { HashRouter, Route } from "react-router-dom";
import App from "./app";
import reducer from "./reducers";
import "../../../big-dom-generator/dist/app.css";
import "todomvc-app-css/index.css";
import "../../../big-dom-generator/public/layout.css";
import "../../../big-dom-generator/matchingCss.css";
import "../../../big-dom-generator/nonMatchingCss.css";

const store = createStore(reducer);

render(
    <div className="todoholder">
        <section className="todoapp">
            <Provider store={store}>
                <HashRouter>
                    <Route path="*" component={App} />
                </HashRouter>
            </Provider>
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
