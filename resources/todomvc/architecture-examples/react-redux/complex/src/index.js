import { render } from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { HashRouter, Route } from "react-router-dom";
import App from "../../shared/src/app";
import reducer from "../../shared/src/reducers";
import "todomvc-app-css/index.css";
import "big-dom-generator/dist/app.css";
import "big-dom-generator/generated.css";

const store = createStore(reducer);

render(
    <Provider store={store}>
        <HashRouter>
            <Route path="*" component={App} />
        </HashRouter>
    </Provider>,
    document.getElementById("root")
);
