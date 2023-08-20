const additionalStyleSheet = new CSSStyleSheet();
const PRIORITY_LEVELS = 5;

let priorityRules = [];
for (let i = 0; i < PRIORITY_LEVELS; i++) {
    priorityRules.push(`
        :host([data-priority="${i}"]) > li {
            --priority-background-color: var(--complex-todo-red-pri-${i});
            --priority-background-color-completed: var(--complex-todo-green-pri-${i});
        }`);
}
priorityRules = priorityRules.join("\n");

additionalStyleSheet.replaceSync(`
    ${priorityRules}
    .todo {
        background-color: var(--priority-background-color, var(--complex-background-color-default));
        border-bottom-color: var(--complex-todo-red-border, var(--complex-border-bottom-color-default));
    }
    .todo.completed {
        background-color: var(--priority-background-color-completed, var(--complex-background-color-default));
        border-bottom-color: var(--complex-todo-green-border, var(--complex-border-bottom-color-default));
    }
    .todo > div label {
        color: var(--complex-todo-red-label, --complex-label-color-default);
    }
    .todo.completed label {
        color: var(--complex-todo-green-label, --complex-label-color-default);
    }
    .todo > div > :focus,
    .todo > div > .toggle:focus + label {
        box-shadow: var(--complex-box-shadow-red) !important;
    }
    .todo.completed > div > :focus,
    .todo.completed > div > .toggle:focus + label {
        box-shadow: var(--complex-box-shadow-green) !important;
    }
`);

window.extraCssToAdopt = additionalStyleSheet;
