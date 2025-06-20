This is a todo list app with the following characteristics:

- This is a multi page list.
- The maximum number of elements shown in each page is configurable.
- The system will only cache a congifurable number of pages in cache, any other information will be stores in an indexedDB database.
- When the user adds an todo element, it will be added to the indexedDB database, it will also be added to the cache if there is space.
- When the user deleted a todo element, the item will be deleted from the cache and, if available in the indexedDB db, the next item will be added to the cache.
- When adding, deleting, or updating an element, the change must be reflected in the DOM synchronously. but the indexedDB db can be updated asyncrhonously.