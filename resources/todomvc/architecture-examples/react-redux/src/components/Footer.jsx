import { Component } from "react";
import classnames from "classnames";
import PropTypes from "prop-types";
import { SHOW_ALL, SHOW_COMPLETED, SHOW_ACTIVE } from "../constants/todo-filters";

const FILTER_TITLES = {
    [SHOW_ALL]: "All",
    [SHOW_ACTIVE]: "Active",
    [SHOW_COMPLETED]: "Completed",
};

export default class Footer extends Component {
    static propTypes = {
        completedCount: PropTypes.number.isRequired,
        activeCount: PropTypes.number.isRequired,
        filter: PropTypes.string.isRequired,
        onClearCompleted: PropTypes.func.isRequired,
        onShow: PropTypes.func.isRequired,
    };

    renderFilterLink(filter) {
        const title = FILTER_TITLES[filter];
        const { filter: selectedFilter, onShow } = this.props;

        return (
            <a className={classnames({ selected: filter === selectedFilter })} style={{ cursor: "pointer" }} onClick={() => onShow(filter)}>
                {title}
            </a>
        );
    }

    render() {
        const { completedCount, onClearCompleted, activeCount } = this.props;
        return (
            <footer className="footer" data-testid="footer">
                <span className="todo-count">{`${activeCount} ${activeCount === 1 ? "item" : "items"} left!`}</span>
                <ul className="filters" data-testid="footer-navigation">
                    {[SHOW_ALL, SHOW_ACTIVE, SHOW_COMPLETED].map((filter) => (
                        <li key={filter}>{this.renderFilterLink(filter)}</li>
                    ))}
                </ul>
                {completedCount > 0 ? (
                    <button className="clear-completed" onClick={onClearCompleted}>
                        Clear completed
                    </button>
                ) : null}
            </footer>
        );
    }
}
