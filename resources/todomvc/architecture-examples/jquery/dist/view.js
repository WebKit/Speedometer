/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
const View = (function ($) {
    function View(template) {
        const callbacks = {};
        let route = "";

        function getStats(todos) {
            const stats = { all: todos.length, active: 0, completed: 0 };
            todos.forEach(function (todo) {
                // eslint-disable-next-line no-unused-expressions
                todo.completed ? stats.completed++ : stats.active++;
            });
            return stats;
        }

        function getCurrentTodos(todos, route) {
            if (route === "all")
                return todos;

            const currentTodos = todos.filter(function (todo) {
                return route === "active" ? !todo.completed : todo.completed;
            });

            return currentTodos;
        }

        function handleTodoInput(e) {
            if (e.key !== "Enter")
                return;

            const $input = $(e.target);
            const text = $input.val().trim();
            callbacks["newTodo"](text);

            $input.val("");
        }

        function handleToggleAll(e) {
            const checked = $(e.target).prop("checked");
            callbacks["toggleAll"](checked);
        }

        function handleTodoToggle(e) {
            const id = $(this).closest("li").data("id");
            callbacks["toggleTodo"](id);
        }

        function handleTodoButton(e) {
            const id = $(this).closest("li").data("id");
            callbacks["removeTodo"](id);
        }

        function handleClearButton(e) {
            callbacks["removeCompleted"]();
        }

        function handleTodoEditStart(e) {
            const $input = $(e.target).closest("li").addClass("editing").find(".edit");
            const title = $(e.target).text();
            $input.trigger("focus").val("").val(title);
        }

        function handleTodoEditStop(e) {
            switch (e.key) {
                case "Enter":
                    $(e.target).trigger("blur");
                    break;
                case "Escape":
                    $(e.target).data("abort", true).trigger("blur");
                    break;
            }
        }

        function handleTodoUpdate(e) {
            const $input = $(e.target);
            const text = $input.val().trim();

            if (text === "") {
                handleTodoButton(e);
                return;
            }

            if ($input.data("abort")) {
                $input.data("abort", false);
                $input.val("").closest("li").removeClass("editing");
                return;
            }

            const id = $(this).closest("li").data("id");
            callbacks["updateTodo"](id, text);
        }

        return {
            bindCallback: function (id, callback) {
                callbacks[id] = callback;
            },
            setRoute: function (hash) {
                route = hash ? hash.split("/")[1] : "all";
            },
            init: function () {
                $("#new-todo").on("keyup", handleTodoInput);
                $("#toggle-all").on("change", handleToggleAll);
                $("#footer").on("click", ".clear-completed", handleClearButton);
                $("#todo-list").on("change", ".toggle", handleTodoToggle).on("click", ".destroy", handleTodoButton).on("dblclick", "label", handleTodoEditStart).on("keyup", ".edit", handleTodoEditStop).on("focusout", ".edit", handleTodoUpdate);
            },
            update: function ({ action, payload, todos }) {
                const stats = getStats(todos);
                const currentTodos = getCurrentTodos(todos, route);

                $("#main").toggle(stats.all > 0);
                $("#footer").toggle(stats.all > 0);

                switch (action) {
                    case "addItem":
                        if (route !== "completed")
                            template.renderItem("#todo-list", payload);
                        break;
                    case "toggleItem":
                    case "updateItem":
                        template.updateItem(payload);
                        break;
                    case "removeItem":
                        $(`[data-id="${payload.id}"]`).remove();
                        break;
                    case "updateList":
                        template.renderList("#todo-list", currentTodos);
                        break;
                }

                template.renderFooter("#footer", stats, route);
                $("#toggle-all").prop("checked", currentTodos.length > 0 && stats.active === 0);
                $("#toggle-all").prop("disabled", currentTodos.length === 0);
            },
        };
    }
    return View;
})(jQuery);
