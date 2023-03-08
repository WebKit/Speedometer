import { Header } from "./components/Header";
import { Main } from "./components/Main";
import { Footer } from "./components/Footer";

import { useModel } from "./hooks/use-model";

import "./app.css";

export function App() {
    const { todos, addItem, updateItem, removeItem, toggleItem, toggleAll, removeCompletedItems } = useModel();

    return (
        <>
            <Header onSubmit={addItem} />
            <Main todos={todos} onToggle={toggleItem} onDelete={removeItem} onUpdate={updateItem} onToggleAll={toggleAll} />
            <Footer todos={todos} onClear={removeCompletedItems} />
        </>
    );
}
