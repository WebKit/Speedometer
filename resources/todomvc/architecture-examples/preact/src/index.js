import { render } from "preact";
import Router from 'preact-router';
import { createHashHistory  } from 'history';

import { App } from "./todo/app";

import "todomvc-app-css/index.css";

render((
    <Router history={createHashHistory()}>
        <App path="/" />
    </Router>
), document.getElementById("root"));
