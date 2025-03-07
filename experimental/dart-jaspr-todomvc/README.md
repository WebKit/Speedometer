# todomvc

A Jaspr implementation of todomvc, written in Dart and compilable to either JavaScript or WebAssembly.

## Setup

Install [dart](https://dart.dev/get-dart).

## Running the project

Run your project using `dart run jaspr_cli:jaspr serve`.

The development server will be available on `http://localhost:8080`.

## Building the project

Build your project using either:

-   Generate JavaScript via: `jaspr build -O4 --extra-js-compiler-option=--no-minify`
-   Generate WebAssembly via: `jaspr build -O4 --experimental-wasm --extra-wasm-compiler-option=--no-strip-wasm`

The output will be located inside the `build/jaspr/` directory.
