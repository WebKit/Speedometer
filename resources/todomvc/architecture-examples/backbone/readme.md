# Speedometer 3.0: TodoMVC: Backbone

## Description

This application uses Backbone to implement a todo application.

Backbone.js gives structure to web applications by providing models with key-value binding and custom events, collections with a rich API of enumerable functions, views with declarative event handling, and connects it all to your existing API over a RESTful JSON interface. 

[backbonejs.org](https://backbonejs.org/)

## Implementation details

This implementation uses an explicit MVC pattern in combination with a module pattern to create the todo application. The storage solution uses an in-memory data object that implements a simple array to hold the todos.

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
1. http://localhost:7001/
```
