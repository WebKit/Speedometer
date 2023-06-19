const template = document.createElement("template");
const globals = "src/styles/global.css";
const styles = "src/styles/app.css";
const mainStyles = "src/styles/main.css";

template.id = "todo-app-template";
template.innerHTML = `
    <link rel="stylesheet" href="${globals}" />
    <link rel="stylesheet" href="${styles}" />
    <link rel="stylesheet" href="${mainStyles}" />
    <section class="app">
        <slot name="topbar"></slot>
        <section class="main">
            <slot name="list"></slot>
        </section>
        <slot name="bottombar"></slot>
    </section>
`;

export default template;
