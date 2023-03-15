// eslint-disable-next-line no-unused-vars
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";

import TodoModel from "./model";
import TodoHeader from "./header";
import TodoMain from "./main.js";
import TodoFooter from "./footer";
import { FILTERS } from "./utils";

const getRoute = () => {
    let route = String(location.hash || "")
        .split("/")
        .pop();

    // prettier-ignore
    if (!FILTERS[route])
        route = "all";

    return route;
};

export default function App() {
    const [, setUdpatedAt] = useState(Date.now());
    const [route, setRoute] = useState("all");

    function update() {
        setUdpatedAt(Date.now());
    }

    const model = TodoModel(update);

    useEffect(() => {
        function handleHashChange() {
            setRoute(getRoute());
            update();
        }

        addEventListener("hashchange", handleHashChange);
        handleHashChange();
    }, []);

    function handleKeyDown(e) {
        if (e.key === "Enter" || e.key === "ENTER") {
            const value = e.target.value.trim();

            if (value) {
                model.addItem(value);
                e.target.value = "";
            }
        }
    }

    function toggleAll(e) {
        model.toggleAll(e.target.checked);
    }

    return (
        <div>
            <TodoHeader onKeyDown={handleKeyDown} />
            {model.getTodos().length > 0 ? (
                <div>
                    <TodoMain todos={model.getTodos()} route={route} onChange={toggleAll} onToggle={model.toggleItem} onRemove={model.removeItem} onSave={model.updateItem} />
                    <TodoFooter todos={model.getTodos()} route={route} onClearCompleted={model.clearCompleted} />
                </div>
            ) : null}
        </div>
    );
}
