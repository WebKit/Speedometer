# Speedometer 3.0: TodoMVC with React 18 / Material UI / React Router

## Description

This application uses React 18.0.0 to implement a todo application.

-   [React](https://react.dev/) is a JavaScript library for creating user interfaces.
-   [Material UI](https://mui.com/) is a UI React-based library that makes it easier to implement a consistent style in an application.
-   [React Router](https://reactrouter.com/) is a Router for React, that is a library that handles URL changes.

## Implementation details

React:\
 Model: /logic/todo-model.js
View: /components/\*
controller: The React Router configuration in /components/App.tsx

    MVC:\
      Model: maintains the data and behavior of an application\
      View: displays the model in the ui\
      Controller: serves as an interface between view & model components

## Built steps

      To build the static files, this application utilizes vite. It minifies and optimizes output files and copies all necessary files to a `dist` folder.

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
  3. Then open http://localhost:5173 in your browser.
```
