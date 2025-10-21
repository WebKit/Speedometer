# Speedometer 3.0: TodoMVC: Web Components

## Description

A todoMVC application implemented with native web components.
It utilizes custom elements and html templates to build reusable components.

In contrast to other workloads, this application uses an updated set of css rules and an optimized dom structure to ensure the application follows best practices in regards to accessibility.

## Storage Options

This application supports two different IndexedDB implementations that can be selected via URL hash:

-   **Vanilla IndexedDB** (default): Uses the native IndexedDB API
    -   Access via: `http://localhost:7005/#indexeddb` or `http://localhost:7005/`
-   **Dexie.js**: Uses the Dexie.js wrapper library for IndexedDB
    -   Access via: `http://localhost:7005/#dexie`

Simply click on the storage API links in the header to switch between implementations. The database will be reset when switching between storage types.

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
