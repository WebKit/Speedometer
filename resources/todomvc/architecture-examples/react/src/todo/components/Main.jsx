export const Main = () => {
    return (
        <main className="main" data-testid="main">
            <div className="toggle-all-container">
                <input className="toggle-all"
                type="checkbox"
                data-testid="toggle-all"
                />
                <label htmlFor="toggle-all" />
            </div>
            <ul className="todo-list" data-testid="todo-list">
                <li data-testid="todo-item">
                    <div className="view">
                    <input className="toggle"
                        type="checkbox"
                        data-testid="todo-item-toggle"
                    />
                    <label 
                        data-testid="todo-item-label"
                    >
                        Finish App
                    </label>
                    <button className="destroy"
                            data-testid="todo-item-button"
                    />
                    </div>
                </li>
            </ul>
        </main>
    )
}
