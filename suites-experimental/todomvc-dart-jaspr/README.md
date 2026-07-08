# TodoMVC: Dart Jaspr

## Description

This is a TodoMVC app written in Dart using the Jaspr DOM framework. It can be
compiled to either JavaScript or WebAssembly (with GC extension).

## Setup

Install [dart](https://dart.dev/get-dart) and fetch dependencies using `dart pub get`.

## Running the project

Run your project using `dart run jaspr_cli:jaspr serve`.

The development server will be available on `http://localhost:8080`.

## Building the project

Build your project using either:

-   Generate JavaScript via: `dart run jaspr_cli:jaspr build -O4 --extra-js-compiler-option=--no-minify`
-   Generate WebAssembly via: `dart run jaspr_cli:jaspr build -O2 --experimental-wasm --extra-wasm-compiler-option=--no-strip-wasm`

The output will be located inside the `build/jaspr/` directory.

## Updating the checked-in build artifacts

To update the checked-in artifacts in the `dist/` directory, run

```
./build.sh 2>&1 | tee build.log
```
