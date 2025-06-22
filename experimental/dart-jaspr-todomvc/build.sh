#!/bin/bash

JS_OUT=dist/out-dart2js-O4
WASM_OUT=dist/out-dart2wasm-O2

set -x
set -e

echo "Current Dart SDK version"
dart --version

echo "Fetching dependencies"
dart pub get

# NOTE: For profiling add the following argument to get symbols
#   --extra-js-compiler-option=--no-minify
echo "Building dart2js version in -O4"
rm -rf build $JS_OUT
dart run jaspr_cli:jaspr build -O4 --extra-js-compiler-option=--disable-program-split
mkdir -p $JS_OUT
cp build/jaspr/{index.html,base.css,index.css,favicon.ico,main.dart.js} $JS_OUT

# NOTE: For profiling add the following argument to get symbols
#   --extra-wasm-compiler-option=--no-strip-wasm
echo "Building dart2js version in -O4"
rm -rf build $WASM_OUT
dart run jaspr_cli:jaspr build -O2 --experimental-wasm 
mkdir -p $WASM_OUT
cp build/jaspr/{index.html,base.css,index.css,favicon.ico,main.dart.js,main.mjs,main.wasm} $WASM_OUT
