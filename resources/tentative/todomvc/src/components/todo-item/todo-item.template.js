const template = document.createElement("template");
const globals = "src/styles/global.css";
const styles = "src/styles/todo-item.css";

template.id = "todo-item-template";
template.innerHTML = `
    <link rel="stylesheet" href="${globals}" />
    <link rel="stylesheet" href="${styles}" />
    <li class="todo-item">
        <div class="display-todo">
            <label class="toggle-todo-label visually-hidden">Toggle Todo</label>
            <input class="toggle-todo-input" type="checkbox" />
            <span class="todo-item-text" tabindex="0">Placeholder Text</span>
            <button class="remove-todo-button" title="Remove Todo"></button>
        </div>
        <div class="edit-todo-display">
            <label class="edit-todo-label visually-hidden">Edit todo</label>
            <input class="edit-todo-input" />
        </div>
    </li>
`;

export default template;
