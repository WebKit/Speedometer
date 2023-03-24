/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
const Controller = (function ($) {
    function Controller(model, view) {
        function addItem(title) {
            const todo = model.addItem(title);
            view.update({ action: "addItem", payload: todo, todos: model.getItems() });
        }

        function toggleItem(id) {
            const todo = model.toggleItem(id);
            view.update({ action: "toggleItem", payload: todo, todos: model.getItems() });
        }

        function removeItem(id) {
            const todo = model.removeItem(id);
            view.update({ action: "removeItem", payload: todo, todos: model.getItems() });
        }

        function updateItem(id, title) {
            const todo = model.updateItem(id, title);
            view.update({ action: "updateItem", payload: todo, todos: model.getItems() });
        }

        function toggleItems(checked) {
            model.getItems().forEach(function (item) {
                if (item.completed !== checked)
                    toggleItem(item.id);
            });
        }

        function removeCompletedItems() {
            model.getItems().forEach(function (item) {
                if (item.completed === checked)
                    removeItem(item.id);
            });
        }

        return {
            setView: function (hash) {
                view.setRoute(hash);
                view.update({ action: "updateList", todos: model.getItems() });
            },
            init: function () {
                view.bindCallback("newTodo", addItem);
                view.bindCallback("toggleTodo", toggleItem);
                view.bindCallback("removeTodo", removeItem);
                view.bindCallback("updateTodo", updateItem);
                view.bindCallback("toggleAll", toggleItems);
                view.bindCallback("removeCompleted", removeCompletedItems);
                view.init();
            },
        };
    }
    return Controller;
})(jQuery);
