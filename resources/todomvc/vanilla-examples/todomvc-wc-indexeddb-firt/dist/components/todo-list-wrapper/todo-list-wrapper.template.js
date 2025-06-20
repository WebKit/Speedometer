const template = document.createElement("template");

template.id = "todo-list-wrapper-template";
template.innerHTML = `
    <div class="todo-list-wrapper">
        <ul is="todo-list"></ul>
    </div>
`;

export default template;
