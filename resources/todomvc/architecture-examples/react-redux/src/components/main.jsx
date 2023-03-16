import { Component } from "react";
import PropTypes from "prop-types";
import Item from "./item";
import Footer from "./footer";
export default class Main extends Component {
    static propTypes = {
        todos: PropTypes.array.isRequired,
        actions: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
        visibleTodos: PropTypes.array.isRequired,
        completedCount: PropTypes.number.isRequired,
        activeCount: PropTypes.number.isRequired,
    };

    render() {
        const { todos, actions, location, visibleTodos, completedCount, activeCount } = this.props;

        // prettier-ignore
        if (todos.length === 0)
            return null;

        return (
            <section className="main" data-testid="main">
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" data-testid="toggle-all" checked={completedCount === todos.length} onChange={actions.toggleAll} />
                    <label className="toggle-all-label" htmlFor="toggle-all">
                        Toggle All Input
                    </label>
                </div>
                <ul className="todo-list" data-testid="todo-list">
                    {visibleTodos.map((todo) => (
                        <Item key={todo.id} todo={todo} {...actions} />
                    ))}
                </ul>
                <Footer completedCount={completedCount} activeCount={activeCount} filter={location.pathname} onClearCompleted={actions.clearCompleted} />;
            </section>
        );
    }
}
