/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
const Template = (function ($) {
    Handlebars.registerHelper("eq", function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    function Template() {
        const todoTemplate = Handlebars.compile($("#todo-template").html());
        const footerTemplate = Handlebars.compile($("#footer-template").html());

        return {
            renderList: function (id, currentTodos) {
                $(id).html(todoTemplate(currentTodos));
            },
            renderItem: function (id, todo) {
                $(id).append(todoTemplate(todo));
            },
            updateItem: function (todo) {
                $(`[data-id="${todo.id}"]`).replaceWith(todoTemplate(todo));
            },
            renderFooter: function (id, stats, route) {
                const template = footerTemplate({
                    activeTodoCount: stats.active,
                    activeTodoWord: pluralize(stats.active, "item"),
                    completedTodos: stats.completed,
                    filter: route,
                });

                $(id).html(template);
            },
        };
    }
    return Template;
})(jQuery);
