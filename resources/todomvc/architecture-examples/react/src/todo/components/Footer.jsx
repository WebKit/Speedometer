export const Footer = ({todos}) => {
    const activeTodos = todos.filter((todo) => !todo.completed);

    const handleClick = () => {
        console.log("click");
    }

    return (
        <footer className="footer" data-testid="footer">
            <span className="todo-count">
                {`${activeTodos.length} ${activeTodos.length === 1 ? "item" : "items"} left!`}
            </span>
            <ul className="filters" data-testid="footer-navigation">
                <li>
                    <a href="#/">All</a>
                </li>
                <li>
                    <a href="#/active">Active</a>
                </li>
                <li>
                    <a href="#/completed">Completed</a>
                </li>
            </ul>
            <button 
                className="clear-completed"
                disabled={activeTodos.length === todos.length}
                onClick={handleClick}
            >
                Clear completed
            </button>
        </footer>
    )
}
