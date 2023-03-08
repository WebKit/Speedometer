import React from "react";
import { render } from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";

import { App } from "./todo/App";
import "todomvc-app-css/index.css";

render(
    <HashRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/active" element={<App />} />
            <Route path="/completed" element={<App />} />
        </Routes>
    </HashRouter>,
    document.getElementById("root")
);
