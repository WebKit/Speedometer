import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h, Component } from "preact";
export default class TodoItem extends Component {
    handleSubmit = () => {
        let { onSave, onRemove, todo } = this.props,
            val = this.state.editText.trim();
        if (val) {
            onSave(todo, val);
            this.setState({ editText: val });
        } else {
            onRemove(todo);
        }
    };

    handleEdit = () => {
        let { onEdit, todo } = this.props;
        onEdit(todo);
        this.setState({ editText: todo.title });
    };

    handleToggle = (e) => {
        let { onToggle, todo } = this.props;
        onToggle(todo);
        e.preventDefault();
    };

    handleKeyDown = (e) => {
        if (e.key === "Escape" || e.key === "ESCAPE"){
            const { todo } = this.props;
            this.setState({ editText: todo.title });
            this.props.onCancel(todo);
        } else if (e.key === "Enter" || e.key === "ENTER") {
            this.handleSubmit();
        }
    };

    handleInput = (e) => {
        this.setState({ editText: e.target.value });
    };

    handleDestroy = () => {
        this.props.onRemove(this.props.todo);
    };

    render({ todo: { title, completed }, editing }, { editText }) {
        return (
            <li class={cx({ completed, editing })}>
                <div class="view">
                    <input class="toggle" type="checkbox" checked={completed} onChange={this.handleToggle} />
                    <label onDblClick={this.handleEdit}>{title}</label>
                    <button class="destroy" onClick={this.handleDestroy} />
                </div>
                {editing && <input class="edit" value={editText} onBlur={this.handleSubmit} onInput={this.handleInput} onKeyDown={this.handleKeyDown} autoFocus />}
            </li>
        );
    }
}
