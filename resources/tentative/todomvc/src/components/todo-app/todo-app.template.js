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
        <todo-topbar></todo-topbar>
        <main class="main">
            <todo-list><todo-list>
        </main>
        <todo-bottombar></todo-bottombar>
    </section>
`;

export default template;
