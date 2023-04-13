import React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";

import { App } from "./todo/app";
import "todomvc-app-css/index.css";

render(
    <section className="todoapp" id="root">
        <HashRouter>
            <Routes>
                <Route path="*" element={<App />} />
            </Routes>
        </HashRouter>
    </section>,
    document.getElementById("gen-0-0")
);
