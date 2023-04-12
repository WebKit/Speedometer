/* eslint-disable no-case-declarations */
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint prefer-template: 0 */
/* global jQuery, Handlebars, Router */
jQuery(function ($) {
    "use strict";

    Handlebars.registerHelper("eq", function (a, b, options) {
        return a === b ? options.fn(this) : options.inverse(this);
    });

    var App = {
        getStats: function () {
            const stats = { all: this.todos.length, active: 0, completed: 0 };
            this.todos.forEach(function (todo) {
                // eslint-disable-next-line no-unused-expressions
                todo.completed ? stats.completed++ : stats.active++;
            });
            return stats;
        },
        getCurrentTodos: function () {
            if (this.filter === "all")
                return this.todos;

            const currentTodos = this.todos.filter((todo) => this.filter === "active" ? !todo.completed : todo.completed);
            return currentTodos;
        },
        handleTodoInput: function (e) {
            if (e.key !== "Enter")
                return;

            const $input = $(e.target);
            const text = $input.val().trim();
            this.update("addTodo", { title: text });

            $input.val("");
        },
        handleToggleAll: function (e) {
            var isChecked = $(e.target).prop("checked");
            this.update("toggleAll", { completed: isChecked });
        },
        handleClearButton: function () {
            this.update("removeCompleted");
        },
        handleTodoToggle: function (e) {
            const id = $(e.target).closest("li").data("id");
            this.update("toggleTodo", { id });
        },
        handleTodoButton: function (e) {
            const id = $(e.target).closest("li").data("id");
            this.update("removeTodo", { id });
        },
        handleTodoEditStart: function (e) {
            const $input = $(e.target).closest("li").addClass("editing").find(".edit");
            const title = $(e.target).text();
            $input.trigger("focus").val("").val(title);
        },
        handleTodoEditStop: function (e) {
            switch (e.key) {
                case "Enter":
                    $(e.target).trigger("blur");
                    break;
                case "Escape":
                    $(e.target).data("abort", true).trigger("blur");
                    break;
            }
        },
        handleTodoUpdate: function (e) {
            const $input = $(e.target);
            const text = $input.val().trim();

            if (text === "") {
                this.handleTodoButton(e);
                return;
            }

            if ($input.data("abort")) {
                $input.data("abort", false);
                $input.val("").closest("li").removeClass("editing");
                return;
            }

            const id = $(e.target).closest("li").data("id");
            this.update("updateTodo", { id, title: text });
        },
        update: function (action, payload = {}) {
            let todo = undefined;

            switch (action) {
                case "addTodo":
                    todo = {
                        id: uuid(),
                        title: payload.title,
                        completed: false,
                    };
                    this.todos.push(todo);
                    this.render("addItem", todo);
                    break;
                case "toggleAll":
                    this.todos.forEach(function (todo) {
                        todo.completed = payload.completed;
                    });
                    this.render("updateList");
                    break;
                case "removeCompleted":
                    this.todos = this.todos.filter((todo) => !todo.completed);
                    this.render("updateList");
                    break;
                case "toggleTodo":
                    todo = this.todos.find((todo) => todo.id === payload.id);
                    if (todo !== undefined) {
                        todo.completed = !todo.completed;
                        this.render("toggleItem", todo);
                    }
                    break;
                case "removeTodo":
                    this.todos = this.todos.filter((todo) => todo.id !== payload.id);
                    this.render("removeItem", payload);
                    break;
                case "updateTodo":
                    todo = this.todos.find((todo) => todo.id === payload.id);
                    if (todo !== undefined) {
                        todo.title = payload.title;
                        this.render("updateItem", todo);
                    }
                    break;
            }
        },
        render: function (action, payload = {}) {
            $("#main").toggle(this.todos.length > 0);
            $("#footer").toggle(this.todos.length > 0);

            const stats = this.getStats();
            const currentTodos = this.getCurrentTodos();

            switch (action) {
                case "addItem":
                    if (this.filter !== "completed")
                        this.renderNewItem("#todo-list", payload);
                    break;
                case "toggleItem":
                case "updateItem":
                    this.renderUpdatedItem(payload);
                    break;
                case "removeItem":
                    $(`[data-id="${payload.id}"]`).remove();
                    break;
                case "updateList":
                    this.renderList("#todo-list", currentTodos);
                    break;
            }

            if (this.todos.length > 0) {
                this.renderFooter("#footer", stats);
                $("#toggle-all").prop("checked", currentTodos.length > 0 && stats.active === 0);
                $("#toggle-all").prop("disabled", currentTodos.length === 0);
            }

            $("#new-todo").trigger("focus");
        },
        renderNewItem: function (id, todo) {
            $(id).append(this.todoTemplate(todo));
        },
        renderUpdatedItem: function (todo) {
            $(`[data-id="${todo.id}"]`).replaceWith(this.todoTemplate(todo));
        },
        renderList: function (id, currentTodos) {
            $(id).html(this.todoTemplate(currentTodos));
        },
        renderFooter: function (id, stats) {
            const template = this.footerTemplate({
                activeTodoCount: stats.active,
                activeTodoWord: pluralize(stats.active, "item"),
                completedTodos: stats.completed,
                filter: this.filter,
            });

            $(id).html(template);
        },
        bindEvents: function () {
            $("#new-todo").on("keyup", this.handleTodoInput.bind(this));
            $("#toggle-all").on("change", this.handleToggleAll.bind(this));
            $("#footer").on("click", ".clear-completed", this.handleClearButton.bind(this));
            $("#todo-list")
                .on("change", ".toggle", this.handleTodoToggle.bind(this))
                .on("click", ".destroy", this.handleTodoButton.bind(this))
                .on("dblclick", "label", this.handleTodoEditStart.bind(this))
                .on("keyup", ".edit", this.handleTodoEditStop.bind(this))
                .on("focusout", ".edit", this.handleTodoUpdate.bind(this));
        },
        init: function () {
            this.todos = [];
            this.todoTemplate = Handlebars.compile($("#todo-template").html());
            this.footerTemplate = Handlebars.compile($("#footer-template").html());
            this.bindEvents();

            router((route) => {
                this.filter = route;
                this.render("updateList");
            }).init();

            var dummyNodeToNotifyAppIsReady = document.createElement("div");
            dummyNodeToNotifyAppIsReady.id = "appIsReady";
            document.body.appendChild(dummyNodeToNotifyAppIsReady);
        },
    };

    window.app = App;
    window.app.init();
});
