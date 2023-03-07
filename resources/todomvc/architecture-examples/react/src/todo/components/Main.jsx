import { useState } from "react";
import { Item } from "./Item";

export const Main = ({ todos }) => {
    const visibleTodos = [...todos]; // temp for now
    const [isChecked, setIsChecked ] = useState(
        visibleTodos.length > 0 && visibleTodos.every((todo) => todo.completed)
    );

    const handleChange = (e) => {
        console.log("handleChange", e.target.checked);
    }

    const handleClick = () => {
        console.log("handleClick()");
        setIsChecked(!isChecked);
    }

    return (
        <main className="main" data-testid="main">
            <div className="toggle-all-container">
                <input
                    className="toggle-all"
                    type="checkbox"
                    data-testid="toggle-all"
                    checked={isChecked}
                    onChange={handleChange}
                />
                <label
                    htmlFor="toggle-all"
                    onClick={handleClick}
                />
            </div>
            <ul className="todo-list" data-testid="todo-list">
                {todos.map((todo) => (
                    <Item todo={todo} key={todo.id} />
                ))}
            </ul>
        </main>
    );
};
