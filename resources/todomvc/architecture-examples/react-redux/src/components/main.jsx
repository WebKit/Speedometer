import { Component } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import Item from "./item";
import Footer from "./footer";
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/todo-filters";

const TODO_FILTERS = {
    [SHOW_ALL]: () => true,
    [SHOW_ACTIVE]: (todo) => !todo.completed,
    [SHOW_COMPLETED]: (todo) => todo.completed,
};

export class Main extends Component {
    static propTypes = {
        todos: PropTypes.array.isRequired,
        actions: PropTypes.object.isRequired,
        location: PropTypes.object.isRequired,
    };

    render() {
        const { todos, actions, location } = this.props;

        const filteredTodos = todos.filter(TODO_FILTERS[location.pathname]);
        const completedCount = todos.reduce((count, todo) => (todo.completed ? count + 1 : count), 0);
        const activeCount = todos.length - completedCount;

        if (todos.length === 0) {
            return null;
        }

        return (
            <section className="main" data-testid="main">
                <div className="toggle-all-container">
                    <input className="toggle-all" type="checkbox" data-testid="toggle-all" checked={completedCount === todos.length} onChange={actions.toggleAll} />
                    <label className="toggle-all-label" htmlFor="toggle-all">
                        Toggle All Input
                    </label>
                </div>
                <ul className="todo-list" data-testid="todo-list">
                    {filteredTodos.map((todo) => (
                        <Item key={todo.id} todo={todo} {...actions} />
                    ))}
                </ul>
                <Footer
                    completedCount={completedCount}
                    activeCount={activeCount}
                    filter={location.pathname}
                    onClearCompleted={actions.clearCompleted}
                />;
            </section>
        );
    }
}

export default withRouter(Main);
