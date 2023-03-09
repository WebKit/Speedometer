import { useReducer } from "react";
import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

import { todoReducer } from "./reducer";

import "./app.css";

export function App() {
    const [todos, dispatch] = useReducer(todoReducer, []);

    return (
        <>
            <Header dispatch={dispatch} />
            <Main todos={todos} dispatch={dispatch} />
            <Footer todos={todos} dispatch={dispatch} />
        </>
    );
}
