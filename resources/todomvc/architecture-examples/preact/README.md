# Speedometer 3.0: TodoMVC: Preact

## Description

This application uses Preact 10.11.3 to implement a todo application.

-   [Preact](https://preactjs.com/) Fast 3kB alternative to React with the same modern API.

## Implementation details

The App component functions as the controller to proxy requests between the model (useModel) and the views (Header, Main, Footer). The useModel hook uses an array data structure in combination with React.useState to manage application state.

## Built steps

To build the static files, this application utilizes webpack. It minifies and optimizes output files and copies all necessary files to a `dist` folder.

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
2. npm run start
```
