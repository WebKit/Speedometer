import { Input } from "./Input";

export function Header({ onSubmit }) {
    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <Input onSubmit={onSubmit} label="New Todo Input" placeholder="What needs to be done?" />
        </header>
    );
}
