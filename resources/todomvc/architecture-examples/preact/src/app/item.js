import cx from "classnames";
// eslint-disable-next-line no-unused-vars
import { h, Component } from "preact";
export default class TodoItem extends Component {
    handleSubmit = (e) => {
        const { onSave, onRemove, todo } = this.props,
            val = e.target.value.trim();
        if (val) {
            onSave(todo, val);
            this.setState({ editing: false });
        } else {
            onRemove(todo);
        }
    };

    handleDoubleClick = () => {
        this.setState({ editing: true });
    };

    handleToggle = (e) => {
        const { onToggle, todo } = this.props;
        onToggle(todo);
        e.preventDefault();
    };

    handleKeyDown = (e) => {
        if (e.key === "Escape" || e.key === "ESCAPE"){
            const { todo } = this.props;
            this.setState({ editing: false });
            this.props.onCancel(todo);
        } else if (e.key === "Enter" || e.key === "ENTER") {
            this.handleSubmit(e);
        }
    };

    handleDestroy = () => {
        this.props.onRemove(this.props.todo);
    };

    render({ todo: { title, completed } }, { editing }) {
        return (
            <li class={cx({ completed, editing })}>
                <div class="view">
                    <input class="toggle" type="checkbox" checked={completed} onChange={this.handleToggle} />
                    <label onDblClick={this.handleDoubleClick}>{title}</label>
                    <button class="destroy" onClick={this.handleDestroy} />
                </div>
                {editing && <input class="edit" onBlur={this.handleSubmit} onKeyDown={this.handleKeyDown} autoFocus defaultValue={title} />}
            </li>
        );
    }
}
