const Controller = (function ($) {
    function Controller(model, view) {
        function addItem(title) {
            model.addItem(title);
            render();
        }

        function toggleItem(id) {
            model.toggleItem(id);
            render();
        }

        function removeItem(id) {
            model.removeItem(id);
            render();
        }

        function toggleItems(checked) {
            model.getItems().forEach(function (item) {
                if (item.completed !== checked) {
                    model.toggleItem(item.id);
                }
            });
            render();
        }

        function removeCompletedItems() {
            model.removeCompletedItems();
            render();
        }

        function updateItem(id, title) {
            model.updateItem(id, title);
            render();
        }

        function render() {
            view.render(model.getItems());
        }

        return {
            setView: function (hash) {
                view.setView(hash);
                render();
            },
            init: function () {
                view.bindCallback("newTodo", addItem);
                view.bindCallback("toggleAll", toggleItems);
                view.bindCallback("toggleTodo", toggleItem);
                view.bindCallback("removeTodo", removeItem);
                view.bindCallback("removeCompleted", removeCompletedItems);
                view.bindCallback("updateTodo", updateItem);
                view.init();
            },
        };
    }
    return Controller;
})(jQuery);
