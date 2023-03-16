import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Main from "../components/main";
import * as TodoActions from "../actions";
import { withRouter } from "react-router-dom";
import { getCompletedTodos, getVisibleTodos } from "../selectors/filters";

const mapStateToProps = (state, ownProps) => {
    const { todos } = state;
    const { location } = ownProps;

    const visibleTodos = getVisibleTodos(todos, location.pathname);
    const completedCount = getCompletedTodos(todos).length;
    const activeCount = todos.length - completedCount;

    return { todos, completedCount, activeCount, visibleTodos };
};

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(TodoActions, dispatch),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Main));
