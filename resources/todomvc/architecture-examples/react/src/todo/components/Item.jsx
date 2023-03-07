export const Item = ({todo}) => {
    const { id, title, completed } = todo;
    
    const handleChange = (e) => {
        console.log(e.target.checked);
    }

    const handleDoubleClick = () => {
        console.log("double-click");
    }

    const handleClick = () => {
        console.log("click");
    }

    return (
        <li data-testid="todo-item">
            <div className="view">
                <input
                    className="toggle"
                    type="checkbox"
                    data-testid="todo-item-toggle"
                    checked={completed}
                    onChange={handleChange}
                />
                <label
                    data-testid="todo-item-label"
                    onDoubleClick={handleDoubleClick}
                >
                    {title}
                </label>
                <button
                    className="destroy"
                    data-testid="todo-item-button"
                    onClick={handleClick}
                />
            </div>
        </li>
    );
};
