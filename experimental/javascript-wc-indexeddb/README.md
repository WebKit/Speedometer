# Speedometer 3.0: TodoMVC: Web Components IndexedDB

## Description

A todoMVC application implemented with native web components and indexedDB as the backing storage.
It utilizes custom elements and html templates to build reusable components.

In contrast to other workloads, this application uses an updated set of css rules and an optimized dom structure to ensure the application follows best practices in regards to accessibility.

### Benchmark steps

In contrast to other versions of the todoMVC workload, this one only shows 10 todo items at a time.

#### Add 100 items.

All the items are added to the DOM and to the database, it uses CSS to show only 10 of the items on screen.

The measured time stops when the last item has been added to the DOM, it doesn't measure the time spent to complete the database update.

#### Complete 100 items.

The benchmark runs a loop of 10 iterations. On each iteration 10 items are marked completed (in the DOM and in the database), and the "Next page" button is clicked. When moving to the next page the items in the "current page" are deleted from the DOM.

The measured time stops when the last item has been marked as completed, it doesn't measure the time spent to complete the database update.

#### Delete 100 items.

The benchmarks runs a loop of 10 iterations. On each iteration the 10 items in the current page are deleted (from the DOM and the database), and the "Previous page" button is clicked.

When moving to the previous page the previous 10 items are loaded from the database, this is included in the measured time.

## Storage Options

This application supports two different IndexedDB implementations that can be selected via URL search parameters:

-   **Vanilla IndexedDB** (default): Uses the native IndexedDB API
    -   Access via: `http://localhost:7005/?storageType=vanilla` or `http://localhost:7005/`
-   **Dexie.js**: Uses the Dexie.js wrapper library for IndexedDB
    -   Access via: `http://localhost:7005/?storageType=dexie`

Simply use the URL parameters to switch between implementations. The database will be reset when switching between storage types.

Navigation within the app uses simple hash-based routes like `#/active`, `#/completed`, or `#/` for all todos.

## Built steps

A simple build script copies all necessary files to a `dist` folder.
It does not rely on compilers or transpilers and serves raw html, css and js files to the user.

```
npm run build
```

## Requirements

The only requirement is an installation of Node, to be able to install dependencies and run scripts to serve a local server.

```
* Node (min version: 18.13.0)
* NPM (min version: 8.19.3)
```

## Local preview

```
terminal:
1. npm install
2. npm run dev

browser:
1. http://localhost:7005/
```
