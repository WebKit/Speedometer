import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Header from "../components/header";
import Main from "../components/main";
import * as TodoActions from "../actions";

import "./app.css";

function App({ todos, actions }) {
    return (
        <>
            <Header addTodo={actions.addTodo} />
            <Main todos={todos} actions={actions} />
        </>
    );
}

App.propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
    todos: state.todos,
});

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators(TodoActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
