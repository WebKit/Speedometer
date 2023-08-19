const additionalStyleSheet = new CSSStyleSheet();
const PRIORITY_LEVELS = 5;

let priorityColorVariables = [];
for (let i = 0; i < PRIORITY_LEVELS; i++) {
    priorityColorVariables.push(`
        :host([data-priority="${i}"]) > li {
            --priority-background-color: var(--complex-todo-red-pri-${i});
            --priority-background-color-completed: var(--complex-todo-green-pri-${i});
        }`);
}
priorityColorVariables = priorityColorVariables.join("\n");

additionalStyleSheet.replaceSync(`
    ${priorityColorVariables}
    .todo-item {
        background-color: var(--priority-background-color, var(--complex-background-color-default));
        border-bottom-color: var(--complex-todo-red-border, var(--complex-border-bottom-color-default));
    }
    :host([completed="true"]) > .todo-item {
        background-color: var(--priority-background-color-completed, var(--complex-background-color-default));
        border-bottom-color: var(--complex-todo-green-border, var(--complex-border-bottom-color-default));
    }
    .todo-item > div label {
        color: var(--complex-todo-red-label, --complex-label-color-default);
    }
    :host([completed="true"]) > .todo-item label  {
        color: var(--complex-todo-green-label, --complex-label-color-default);
    }
    .todo-item  > div > :focus,
    .todo-item  > div > .toggle:focus + label {
        box-shadow: var(--complex-box-shadow-red) !important;
    }
    :host([completed="true"]) > .todo-item > div > :focus,
    :host([completed="true"]) > .todo-item > div > .toggle:focus + label {
        box-shadow: var(--complex-box-shadow-green) !important;
    }
`);

window.extraCssToAdopt = additionalStyleSheet;