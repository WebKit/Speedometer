# Speedometer 3.0: TodoMVC: React-Redux

## Description

This application uses React in combination with Redux to implement a todo application.

- [React](https://reactjs.org/) is a JavaScript library for creating user interfaces.
- [Redux](https://redux.js.org/) centralizes your application's state.
- [React-Redux](https://react-redux.js.org/) is designed to work with React's component model. 

## Implementation details

This implementation uses Redux to manage state and data flow of the application.
The Redux pattern is similar to a mvc patter, with the main difference that Redux is unidirectional.
Redux uses actions to dispatch a change, which is captured by reducers that update a central store. 
Once the state in the store changes, a rerender is triggered to update the ui view of the application. 

Redux:\
M: Redux store\
V: React ui components\
c: React connected components + Redux reducers

MVC:\
M: model maintains the data and behavior of an application\
V: view displays the model in the ui\
C: controller serves as an interface between view & model components

The storage solution uses an in-memory data object that implements a simple array to hold the todos.

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
2. npm run dev
browser:
1. http://localhost:7001/
```
