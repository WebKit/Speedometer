/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
const Model = (function ($) {
    function Model(store) {
        function create(title) {
            const todo = {
                id: uuid(),
                title: title,
                completed: false,
            };
            return todo;
        }

        function update(item, props) {
            return Object.assign({}, item, props);
        }

        return {
            addItem: function (title) {
                const todo = create(title);
                store.setValue(todo.id, todo);
                return todo;
            },
            updateItem: function (id, title) {
                let todo = store.getValue(id);
                if (!todo)
                    return undefined;

                todo = update(todo, { title });
                store.setValue(todo.id, todo);
                return todo;
            },
            removeItem: function (id) {
                const todo = store.deleteValue(id);
                return todo;
            },
            toggleItem: function (id) {
                let todo = store.getValue(id);
                if (!todo)
                    return undefined;

                todo = update(todo, { completed: !todo.completed });
                store.setValue(todo.id, todo);
                return todo;
            },
            removeAllItems: function () {
                store.removeAllValues();
            },
            getItems: function () {
                return store.getAllValues().slice();
            },
        };
    }
    return Model;
})(jQuery);
