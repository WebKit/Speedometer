export const Header = ({todos}) => {
    const handleSubmit = (e) => {
        console.log(e.target.elements["new-todo-input"].value.trim());
        e.preventDefault();
    }

    return (
        <header className="header" data-testid="header">
            <h1>todos</h1>
            <form onSubmit={handleSubmit}>
                <input
                    className="new-todo"
                    id="new-todo-input"
                    type="text"
                    data-testid="text-input"
                    autoFocus
                />
            </form>
        </header>
    )
}
