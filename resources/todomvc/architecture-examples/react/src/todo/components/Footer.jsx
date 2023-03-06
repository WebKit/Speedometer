export const Footer = () => {
    return (
        <footer className="footer" data-testid="footer">
            <span className="todo-count">
                0 items left
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
            >
                Clear completed
            </button>
        </footer>
    )
}
