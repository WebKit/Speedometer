/* jshint eqeqeq:false */
(function (window) {
    "use strict";

    var MemoryStorage = {
        _data: {},
        _name: "",
        init: function (name, data = {}) {
            this._name = name;
            if (!this.getData())
                this.setData(data);
        },
        getData: function () {
            const data = this._data[this._name];
            if (!data)
                return null;

            return JSON.parse(data);
        },
        setData: function (value) {
            this._data[this._name] = JSON.stringify(value);
        },
    };

    var LocalStorage = {
        _name: "",
        init: function (name, data = {}) {
            this._name = name;
            if (!this.getData())
                this.setData(data);
        },
        getData: function () {
            const data = window.localStorage.getItem(this._name);
            if (!data)
                return null;

            return JSON.parse(data);
        },
        setData: function (value) {
            window.localStorage.setItem(this._name, JSON.stringify(value));
        },
    };

    var ID = 1;

    /**
     * Creates a new client side storage object and will create an empty
     * collection if no collection already exists.
     *
     * @param {string} name The name of our DB we want to use
     * @param {function} callback Our fake DB uses callbacks because in
     * real life you probably would be making AJAX calls
     */
    function Store(name, callback, type = "disk") {
        callback = callback || function () {};

        this._dbName = name;
        this.storage = type === "memory" ? MemoryStorage : LocalStorage;

        this.storage.init(name, []);

        callback.call(this, this.storage.getData());
    }

    /**
     * Finds items based on a query given as a JS object
     *
     * @param {object} query The query to match against (i.e. {foo: 'bar'})
     * @param {function} callback     The callback to fire when the query has
     * completed running
     *
     * @example
     * db.find({foo: 'bar', hello: 'world'}, function (data) {
     *     // data will return any items that have foo: bar and
     *     // hello: world in their properties
     * });
     */
    Store.prototype.find = function (query, callback) {
        if (!callback)
            return;

        var todos = this.storage.getData();

        callback.call(
            this,
            todos.filter(function (todo) {
                for (var q in query) {
                    if (query[q] !== todo[q])
                        return false;
                }

                return true;
            })
        );
    };

    /**
     * Will retrieve all data from the collection
     *
     * @param {function} callback The callback to fire upon retrieving data
     */
    Store.prototype.findAll = function (callback) {
        callback = callback || function () {};
        callback.call(this, this.storage.getData());
    };

    /**
     * Will save the given data to the DB. If no item exists it will create a new
     * item, otherwise it'll simply update an existing item's properties
     *
     * @param {object} updateData The data to save back into the DB
     * @param {function} callback The callback to fire after saving
     * @param {number} id An optional param to enter an ID of an item to update
     */
    Store.prototype.save = function (updateData, callback, id) {
        var todos = this.storage.getData();

        callback = callback || function () {};

        // If an ID was actually given, find the item and update each property
        if (id) {
            for (var i = 0; i < todos.length; i++) {
                if (todos[i].id === id) {
                    for (var key in updateData)
                        todos[i][key] = updateData[key];

                    break;
                }
            }

            this.storage.setData(todos);
            callback.call(this, todos);
        } else {
            // Generate an ID
            updateData.id = ID++;

            todos.push(updateData);
            this.storage.setData(todos);
            callback.call(this, [updateData]);
        }
    };

    /**
     * Will remove an item from the Store based on its ID
     *
     * @param {number} id The ID of the item you want to remove
     * @param {function} callback The callback to fire after saving
     */
    Store.prototype.remove = function (id, callback) {
        var todos = this.storage.getData();

        for (var i = 0; i < todos.length; i++) {
            if (todos[i].id === id) {
                todos.splice(i, 1);
                break;
            }
        }

        this.storage.setData(todos);
        callback.call(this, todos);
    };

    /**
     * Will drop all storage and start fresh
     *
     * @param {function} callback The callback to fire after dropping the data
     */
    Store.prototype.drop = function (callback) {
        var data = [];
        this.storage.setData(data);
        callback.call(this, data);
    };

    // Export to window
    window.app = window.app || {};
    window.app.Store = Store;
})(window);
