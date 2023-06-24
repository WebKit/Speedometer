const template = document.createElement("template");
const globals = "src/styles/global.css";
const styles = "src/styles/todo-item.css";

template.id = "todo-item-template";
template.innerHTML = `
    <link rel="stylesheet" href="${globals}" />
    <link rel="stylesheet" href="${styles}" />
    <li class="todo-item">
        <div class="display-todo">
            <label for="toggle-todo" class="toggle-todo-label visually-hidden">Toggle Todo</label>
            <input id="toggle-todo" class="toggle-todo-input" type="checkbox" />
            <span class="todo-item-text truncate-singleline" tabindex="0">Placeholder Text</span>
            <button class="remove-todo-button" title="Remove Todo"></button>
        </div>
        <div class="edit-todo-container">
            <label for="edit-todo" class="edit-todo-label visually-hidden">Edit todo</label>
            <input id="edit-todo" class="edit-todo-input" />
        </div>
    </li>
`;

export default template;
