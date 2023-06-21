const template = document.createElement("template");
const globals = "src/styles/global.css";
const styles = "src/styles/todo-list.css";

template.id = "todo-list-template";
template.innerHTML = `
    <link rel="stylesheet" href="${globals}" />
    <link rel="stylesheet" href="${styles}" />
    <ul class="todo-list" style="display:none"></ul>
`;

export default template;
