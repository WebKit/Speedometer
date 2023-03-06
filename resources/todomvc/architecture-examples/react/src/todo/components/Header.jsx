export const Header = () => {
    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <input
                className="new-todo"
                type="text"
                data-testid="text-input"
                autoFocus
            />
        </header>
    )
}
