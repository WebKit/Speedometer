// Compiles a dart2wasm-generated main module from `source` which can then
// instantiatable via the `instantiate` method.
//
// `source` needs to be a `Response` object (or promise thereof) e.g. created
// via the `fetch()` JS API.
export async function compileStreaming(source) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(
      await WebAssembly.compileStreaming(source, builtins), builtins);
}

// Compiles a dart2wasm-generated wasm modules from `bytes` which is then
// instantiatable via the `instantiate` method.
export async function compile(bytes) {
  const builtins = {builtins: ['js-string']};
  return new CompiledApp(await WebAssembly.compile(bytes, builtins), builtins);
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export async function instantiate(modulePromise, importObjectPromise) {
  var moduleOrCompiledApp = await modulePromise;
  if (!(moduleOrCompiledApp instanceof CompiledApp)) {
    moduleOrCompiledApp = new CompiledApp(moduleOrCompiledApp);
  }
  const instantiatedApp = await moduleOrCompiledApp.instantiate(await importObjectPromise);
  return instantiatedApp.instantiatedModule;
}

// DEPRECATED: Please use `compile` or `compileStreaming` to get a compiled app,
// use `instantiate` method to get an instantiated app and then call
// `invokeMain` to invoke the main function.
export const invoke = (moduleInstance, ...args) => {
  moduleInstance.exports.$invokeMain(args);
}

class CompiledApp {
  constructor(module, builtins) {
    this.module = module;
    this.builtins = builtins;
  }

  // The second argument is an options object containing:
  // `loadDeferredWasm` is a JS function that takes a module name matching a
  //   wasm file produced by the dart2wasm compiler and returns the bytes to
  //   load the module. These bytes can be in either a format supported by
  //   `WebAssembly.compile` or `WebAssembly.compileStreaming`.
  async instantiate(additionalImports, {loadDeferredWasm, loadDynamicModule} = {}) {
    let dartInstance;

    // Prints to the console
    function printToConsole(value) {
      if (typeof dartPrint == "function") {
        dartPrint(value);
        return;
      }
      if (typeof console == "object" && typeof console.log != "undefined") {
        console.log(value);
        return;
      }
      if (typeof print == "function") {
        print(value);
        return;
      }

      throw "Unable to print message: " + js;
    }

    // Converts a Dart List to a JS array. Any Dart objects will be converted, but
    // this will be cheap for JSValues.
    function arrayFromDartList(constructor, list) {
      const exports = dartInstance.exports;
      const read = exports.$listRead;
      const length = exports.$listLength(list);
      const array = new constructor(length);
      for (let i = 0; i < length; i++) {
        array[i] = read(list, i);
      }
      return array;
    }

    // A special symbol attached to functions that wrap Dart functions.
    const jsWrappedDartFunctionSymbol = Symbol("JSWrappedDartFunction");

    function finalizeWrapper(dartFunction, wrapped) {
      wrapped.dartFunction = dartFunction;
      wrapped[jsWrappedDartFunctionSymbol] = true;
      return wrapped;
    }

    // Imports
    const dart2wasm = {
            _42: (o, c) => o instanceof c,
      _81: () => {
        let stackString = new Error().stack.toString();
        let frames = stackString.split('\n');
        let drop = 2;
        if (frames[0] === 'Error') {
            drop += 1;
        }
        return frames.slice(drop).join('\n');
      },
      _109: s => JSON.stringify(s),
      _111: s => printToConsole(s),
      _114: Function.prototype.call.bind(String.prototype.toLowerCase),
      _120: Function.prototype.call.bind(String.prototype.indexOf),
      _122: (string, token) => string.split(token),
      _123: Object.is,
      _124: (a, i) => a.push(i),
      _134: a => a.length,
      _136: (a, i) => a[i],
      _140: (o, start, length) => new Uint8Array(o.buffer, o.byteOffset + start, length),
      _141: (o, start, length) => new Int8Array(o.buffer, o.byteOffset + start, length),
      _142: (o, start, length) => new Uint8ClampedArray(o.buffer, o.byteOffset + start, length),
      _143: (o, start, length) => new Uint16Array(o.buffer, o.byteOffset + start, length),
      _144: (o, start, length) => new Int16Array(o.buffer, o.byteOffset + start, length),
      _145: (o, start, length) => new Uint32Array(o.buffer, o.byteOffset + start, length),
      _146: (o, start, length) => new Int32Array(o.buffer, o.byteOffset + start, length),
      _149: (o, start, length) => new Float32Array(o.buffer, o.byteOffset + start, length),
      _150: (o, start, length) => new Float64Array(o.buffer, o.byteOffset + start, length),
      _153: (o) => new DataView(o.buffer, o.byteOffset, o.byteLength),
      _157: Function.prototype.call.bind(Object.getOwnPropertyDescriptor(DataView.prototype, 'byteLength').get),
      _158: (b, o) => new DataView(b, o),
      _160: Function.prototype.call.bind(DataView.prototype.getUint8),
      _162: Function.prototype.call.bind(DataView.prototype.getInt8),
      _164: Function.prototype.call.bind(DataView.prototype.getUint16),
      _166: Function.prototype.call.bind(DataView.prototype.getInt16),
      _168: Function.prototype.call.bind(DataView.prototype.getUint32),
      _170: Function.prototype.call.bind(DataView.prototype.getInt32),
      _176: Function.prototype.call.bind(DataView.prototype.getFloat32),
      _178: Function.prototype.call.bind(DataView.prototype.getFloat64),
      _205: (c) =>
      queueMicrotask(() => dartInstance.exports.$invokeCallback(c)),
      _213: (x0,x1) => x0.createElement(x1),
      _216: f => finalizeWrapper(f, function(x0) { return dartInstance.exports._216(f,arguments.length,x0) }),
      _218: (x0,x1,x2,x3) => x0.addEventListener(x1,x2,x3),
      _219: (x0,x1,x2,x3) => x0.removeEventListener(x1,x2,x3),
      _227: (x0,x1) => x0.item(x1),
      _228: (x0,x1,x2) => x0.createElementNS(x1,x2),
      _229: (x0,x1) => x0.item(x1),
      _230: (x0,x1,x2) => x0.replaceChild(x1,x2),
      _231: (x0,x1) => x0.append(x1),
      _232: (x0,x1) => x0.item(x1),
      _233: (x0,x1) => x0.removeAttribute(x1),
      _234: x0 => new Text(x0),
      _235: (x0,x1) => x0.replaceWith(x1),
      _236: (x0,x1) => x0.item(x1),
      _237: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _238: (x0,x1,x2) => x0.insertBefore(x1,x2),
      _239: (x0,x1) => x0.removeChild(x1),
      _240: (x0,x1) => x0.removeChild(x1),
      _241: (x0,x1) => x0.hasAttribute(x1),
      _242: (x0,x1) => x0.removeAttribute(x1),
      _243: (x0,x1) => x0.getAttribute(x1),
      _244: (x0,x1,x2) => x0.setAttribute(x1,x2),
      _246: (x0,x1) => x0.querySelector(x1),
      _263: (x0,x1) => x0.item(x1),
      _287: o => o === undefined,
      _306: o => typeof o === 'function' && o[jsWrappedDartFunctionSymbol] === true,
      _310: (l, r) => l === r,
      _311: o => o,
      _312: o => o,
      _313: o => o,
      _314: b => !!b,
      _315: o => o.length,
      _318: (o, i) => o[i],
      _319: f => f.dartFunction,
      _320: l => arrayFromDartList(Int8Array, l),
      _321: l => arrayFromDartList(Uint8Array, l),
      _322: l => arrayFromDartList(Uint8ClampedArray, l),
      _323: l => arrayFromDartList(Int16Array, l),
      _324: l => arrayFromDartList(Uint16Array, l),
      _325: l => arrayFromDartList(Int32Array, l),
      _326: l => arrayFromDartList(Uint32Array, l),
      _327: l => arrayFromDartList(Float32Array, l),
      _328: l => arrayFromDartList(Float64Array, l),
      _330: (data, length) => {
        const getValue = dartInstance.exports.$byteDataGetUint8;
        const view = new DataView(new ArrayBuffer(length));
        for (let i = 0; i < length; i++) {
          view.setUint8(i, getValue(data, i));
        }
        return view;
      },
      _331: l => arrayFromDartList(Array, l),
      _335: () => globalThis,
      _338: (o, p) => o[p],
      _342: o => String(o),
      _344: o => {
        if (o === undefined) return 1;
        var type = typeof o;
        if (type === 'boolean') return 2;
        if (type === 'number') return 3;
        if (type === 'string') return 4;
        if (o instanceof Array) return 5;
        if (ArrayBuffer.isView(o)) {
          if (o instanceof Int8Array) return 6;
          if (o instanceof Uint8Array) return 7;
          if (o instanceof Uint8ClampedArray) return 8;
          if (o instanceof Int16Array) return 9;
          if (o instanceof Uint16Array) return 10;
          if (o instanceof Int32Array) return 11;
          if (o instanceof Uint32Array) return 12;
          if (o instanceof Float32Array) return 13;
          if (o instanceof Float64Array) return 14;
          if (o instanceof DataView) return 15;
        }
        if (o instanceof ArrayBuffer) return 16;
        return 17;
      },
      _370: (o, p) => o[p],
      _373: x0 => x0.random(),
      _374: x0 => x0.random(),
      _378: () => globalThis.Math,
      _380: Function.prototype.call.bind(Number.prototype.toString),
      _381: Function.prototype.call.bind(BigInt.prototype.toString),
      _382: Function.prototype.call.bind(Number.prototype.toString),
      _1464: x0 => x0.checked,
      _1471: x0 => x0.files,
      _1514: x0 => x0.type,
      _1518: x0 => x0.value,
      _1519: (x0,x1) => x0.value = x1,
      _1520: x0 => x0.valueAsDate,
      _1522: x0 => x0.valueAsNumber,
      _1607: x0 => x0.selectedOptions,
      _1630: x0 => x0.value,
      _1669: x0 => x0.value,
      _4919: x0 => x0.target,
      _4971: x0 => x0.length,
      _4974: x0 => x0.length,
      _5026: x0 => x0.parentNode,
      _5028: x0 => x0.childNodes,
      _5031: x0 => x0.previousSibling,
      _5032: x0 => x0.nextSibling,
      _5035: x0 => x0.textContent,
      _5036: (x0,x1) => x0.textContent = x1,
      _5040: () => globalThis.document,
      _5478: x0 => x0.namespaceURI,
      _5481: x0 => x0.tagName,
      _5489: x0 => x0.attributes,
      _5618: x0 => x0.length,
      _5622: x0 => x0.name,

    };

    const baseImports = {
      dart2wasm: dart2wasm,
      Math: Math,
      Date: Date,
      Object: Object,
      Array: Array,
      Reflect: Reflect,
            s: [
        "Too few arguments passed. Expected 1 or more, got ",
"Infinity or NaN toInt",
" instead.",
"null",
"",
" (",
")",
": ",
"Instance of '",
"'",
"Object?",
"Object",
"dynamic",
"void",
"Invalid top type kind",
"minified:Class",
"<",
", ",
">",
"?",
"Attempt to execute code removed by Dart AOT compiler (TFA)",
"T",
"Invalid argument",
"(s)",
"0.0",
"-0.0",
"1.0",
"-1.0",
"NaN",
"-Infinity",
"Infinity",
"e",
".0",
"RangeError (details omitted due to --minify)",
"Unsupported operation: ",
"true",
"false",
"Null check operator used on a null value",
"Division resulted in non-finite value",
"IntegerDivisionByZeroException",
"Type '",
"' is not a subtype of type '",
" in type cast",
"Null",
"Never",
"X",
" extends ",
"(",
"[",
"]",
"{",
"}",
" => ",
"Closure: ",
"...",
"Runtime type check failed (details omitted due to --minify)",
"Type argument substitution not supported for ",
"Type parameter should have been substituted already.",
" ",
"FutureOr",
"required ",
"Concurrent modification during iteration: ",
".",
"Unhandled dartifyRaw type case: ",
"{...}",
"Function?",
"Function",
"buffer",
"Too few arguments passed. Expected 2 or more, got ",
"Expected integer value, but was not integer.",
"Too few arguments passed. Expected 0 or more, got ",
"Cannot add to a fixed-length list",
"Could not call main",
"JavaScriptError",
"body",
"Future already completed",
"onError",
"Error handler must accept one Object or one Object and a StackTrace as arguments, and return a value of the returned future's type",
"Cannot complete a future with itself",
"The error handler of Future.then must return a value of the returned future's type",
"The error handler of Future.catchError must return a value of the future's type",
"_stackTrace=",
"Cannot add to an unmodifiable list",
"NoSuchMethodError: method not found: '",
"'\n",
"Receiver: ",
"\n",
"Arguments: [",
"Symbol(\"",
"\")",
":",
"s",
"@",
",",
"=",
"IndexError (details omitted due to --minify)",
"IntegerDivisionByZeroException._stackTrace",
"_stackTrace",
"Bad state: ",
"active",
"_ElementLifecycle.",
"Field 'beforeStart' has already been initialized.",
"LateInitializationError: ",
"(...)",
"attachTarget",
"Field '",
"' has not been initialized.",
"attachBetween",
"initial",
"beforeStart",
"inactive",
"div",
"Error on building component: ",
"Error: ",
"Text",
"svg",
"http://www.w3.org/2000/svg",
"math",
"http://www.w3.org/1998/Math/MathML",
"Element",
"id",
"class",
"style",
"value",
"HTMLInputElement",
"call",
"MapEntry(",
"; ",
"http://www.w3.org/1999/xhtml",
"elem",
"Local '",
"attributesToRemove",
"info",
"Double-click to edit a todo",
"Created by the Dart team",
"Part of ",
"http://todomvc.com",
"TodoMVC",
"footer",
"a",
"href",
"p",
"all",
"isActive",
"todo",
"DisplayState.",
"root",
"todoapp",
"header",
"data-testid",
"todos",
"input-container",
"main",
"display",
"none;",
"block;",
"toggle-all-container",
"toggle-all",
"checkbox",
"checked",
"toggle-all-label",
"for",
"Mark all as complete",
"todo-list",
"completed",
"data-id",
"view",
"toggle",
"-",
"destroy",
"todo-count",
" item",
" left",
"filters",
"All",
"Active",
"Completed",
"selected",
"click",
"clear-completed",
"Clear completed",
"section",
"midFrameCallback",
"postFrameCallbacks",
"idle",
"Error on rebuilding component: ",
"defunct",
"SchedulerPhase.",
"span",
"strong",
"ul",
"li",
"button",
"autofocus",
"disabled",
"input",
"change",
"color",
"date",
"datetime-local",
"dateTimeLocal",
"email",
"file",
"hidden",
"image",
"month",
"number",
"password",
"radio",
"range",
"reset",
"search",
"submit",
"tel",
"text",
"time",
"url",
"week",
"HTMLTextAreaElement",
"HTMLSelectElement",
"HTMLOptionElement",
"<'",
"'>",
"label",
"type",
"InputType.",
"isActive: ",
"todo: ",
"new-todo",
"placeholder",
"What needs to be done?",
"h1"
      ],

    };

    const jsStringPolyfill = {
      "charCodeAt": (s, i) => s.charCodeAt(i),
      "compare": (s1, s2) => {
        if (s1 < s2) return -1;
        if (s1 > s2) return 1;
        return 0;
      },
      "concat": (s1, s2) => s1 + s2,
      "equals": (s1, s2) => s1 === s2,
      "fromCharCode": (i) => String.fromCharCode(i),
      "length": (s) => s.length,
      "substring": (s, a, b) => s.substring(a, b),
      "fromCharCodeArray": (a, start, end) => {
        if (end <= start) return '';

        const read = dartInstance.exports.$wasmI16ArrayGet;
        let result = '';
        let index = start;
        const chunkLength = Math.min(end - index, 500);
        let array = new Array(chunkLength);
        while (index < end) {
          const newChunkLength = Math.min(end - index, 500);
          for (let i = 0; i < newChunkLength; i++) {
            array[i] = read(a, index++);
          }
          if (newChunkLength < chunkLength) {
            array = array.slice(0, newChunkLength);
          }
          result += String.fromCharCode(...array);
        }
        return result;
      },
      "intoCharCodeArray": (s, a, start) => {
        if (s == '') return 0;

        const write = dartInstance.exports.$wasmI16ArraySet;
        for (var i = 0; i < s.length; ++i) {
          write(a, start++, s.charCodeAt(i));
        }
        return s.length;
      },
    };


    const loadModuleFromBytes = async (bytes) => {
        const module = await WebAssembly.compile(bytes, this.builtins);
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
    }

    const loadModule = async (loader, loaderArgument) => {
        const source = await Promise.resolve(loader(loaderArgument));
        const module = await ((source instanceof Response)
            ? WebAssembly.compileStreaming(source, this.builtins)
            : WebAssembly.compile(source, this.builtins));
        return await WebAssembly.instantiate(module, {
          ...baseImports,
          ...additionalImports,
          "wasm:js-string": jsStringPolyfill,
          "module0": dartInstance.exports,
        });
    }

    const deferredLibraryHelper = {
      "loadModule": async (moduleName) => {
        if (!loadDeferredWasm) {
          throw "No implementation of loadDeferredWasm provided.";
        }
        return await loadModule(loadDeferredWasm, moduleName);
      },
      "loadDynamicModuleFromUri": async (uri) => {
        if (!loadDynamicModule) {
          throw "No implementation of loadDynamicModule provided.";
        }
        const loadedModule = await loadModule(loadDynamicModule, uri);
        return loadedModule.exports.$invokeEntryPoint;
      },
      "loadDynamicModuleFromBytes": async (bytes) => {
        const loadedModule = await loadModuleFromBytes(loadDynamicModule, uri);
        return loadedModule.exports.$invokeEntryPoint;
      },
    };

    dartInstance = await WebAssembly.instantiate(this.module, {
      ...baseImports,
      ...additionalImports,
      "deferredLibraryHelper": deferredLibraryHelper,
      "wasm:js-string": jsStringPolyfill,
    });

    return new InstantiatedApp(this, dartInstance);
  }
}

class InstantiatedApp {
  constructor(compiledApp, instantiatedModule) {
    this.compiledApp = compiledApp;
    this.instantiatedModule = instantiatedModule;
  }

  // Call the main function with the given arguments.
  invokeMain(...args) {
    this.instantiatedModule.exports.$invokeMain(args);
  }
}
