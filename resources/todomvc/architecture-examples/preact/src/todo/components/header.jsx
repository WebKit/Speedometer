import { Input } from "./input";

export function Header({ dispatch }) {
    const addItem = (title) => dispatch({ type: "ADD_ITEM", payload: { title } });

    return (
        <header class="header" data-testid="header">
            <h1>todos</h1>
            <Input onSubmit={addItem} label="New Todo Input" placeholder="What needs to be done?" />
        </header>
    );
}
