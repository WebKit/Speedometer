

(function() {
/*!
 * @overview  Ember - JavaScript Application Framework
 * @copyright Copyright 2011-2021 Tilde Inc. and contributors
 *            Portions Copyright 2006-2011 Strobe Inc.
 *            Portions Copyright 2008-2011 Apple Inc. All rights reserved.
 * @license   Licensed under MIT license
 *            See https://raw.github.com/emberjs/ember.js/master/LICENSE
 * @version   3.28.11
 */
/* eslint-disable no-var */
/* globals global globalThis self */
var define, require;
(function () {
  var globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : null;
  if (globalObj === null) {
    throw new Error('unable to locate global object');
  }
  if (typeof globalObj.define === 'function' && typeof globalObj.require === 'function') {
    define = globalObj.define;
    require = globalObj.require;
    return;
  }
  var registry = Object.create(null);
  var seen = Object.create(null);
  function missingModule(name, referrerName) {
    if (referrerName) {
      throw new Error('Could not find module ' + name + ' required by: ' + referrerName);
    } else {
      throw new Error('Could not find module ' + name);
    }
  }
  function internalRequire(_name, referrerName) {
    var name = _name;
    var mod = registry[name];
    if (!mod) {
      name = name + '/index';
      mod = registry[name];
    }
    var exports = seen[name];
    if (exports !== undefined) {
      return exports;
    }
    exports = seen[name] = {};
    if (!mod) {
      missingModule(_name, referrerName);
    }
    var deps = mod.deps;
    var callback = mod.callback;
    var reified = new Array(deps.length);
    for (var i = 0; i < deps.length; i++) {
      if (deps[i] === 'exports') {
        reified[i] = exports;
      } else if (deps[i] === 'require') {
        reified[i] = require;
      } else {
        reified[i] = require(deps[i], name);
      }
    }
    callback.apply(this, reified);
    return exports;
  }
  require = function (name) {
    return internalRequire(name, null);
  };

  // eslint-disable-next-line no-unused-vars
  define = function (name, deps, callback) {
    registry[name] = {
      deps: deps,
      callback: callback
    };
  };

  // setup `require` module
  require['default'] = require;
  require.has = function registryHas(moduleName) {
    return Boolean(registry[moduleName]) || Boolean(registry[moduleName + '/index']);
  };
  require._eak_seen = require.entries = registry;
})();
define("@ember/debug/index", ["exports", "@ember/-internals/browser-environment", "@ember/error", "@ember/debug/lib/deprecate", "@ember/debug/lib/testing", "@ember/debug/lib/warn", "@ember/-internals/utils", "@ember/debug/lib/capture-render-tree"], function (_exports, _browserEnvironment, _error, _deprecate2, _testing, _warn2, _utils, _captureRenderTree) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.assert = _exports._warnIfUsingStrippedFeatureFlags = void 0;
  Object.defineProperty(_exports, "captureRenderTree", {
    enumerable: true,
    get: function () {
      return _captureRenderTree.default;
    }
  });
  _exports.info = _exports.getDebugFunction = _exports.deprecateFunc = _exports.deprecate = _exports.debugSeal = _exports.debugFreeze = _exports.debug = void 0;
  Object.defineProperty(_exports, "inspect", {
    enumerable: true,
    get: function () {
      return _utils.inspect;
    }
  });
  Object.defineProperty(_exports, "isTesting", {
    enumerable: true,
    get: function () {
      return _testing.isTesting;
    }
  });
  Object.defineProperty(_exports, "registerDeprecationHandler", {
    enumerable: true,
    get: function () {
      return _deprecate2.registerHandler;
    }
  });
  Object.defineProperty(_exports, "registerWarnHandler", {
    enumerable: true,
    get: function () {
      return _warn2.registerHandler;
    }
  });
  _exports.setDebugFunction = _exports.runInDebug = void 0;
  Object.defineProperty(_exports, "setTesting", {
    enumerable: true,
    get: function () {
      return _testing.setTesting;
    }
  });
  _exports.warn = void 0;
  // These are the default production build versions:

  var noop = () => {};
  var assert = noop;
  _exports.assert = assert;
  var info = noop;
  _exports.info = info;
  var warn = noop;
  _exports.warn = warn;
  var debug = noop;
  _exports.debug = debug;
  var deprecate = noop;
  _exports.deprecate = deprecate;
  var debugSeal = noop;
  _exports.debugSeal = debugSeal;
  var debugFreeze = noop;
  _exports.debugFreeze = debugFreeze;
  var runInDebug = noop;
  _exports.runInDebug = runInDebug;
  var setDebugFunction = noop;
  _exports.setDebugFunction = setDebugFunction;
  var getDebugFunction = noop;
  _exports.getDebugFunction = getDebugFunction;
  var deprecateFunc = function () {
    return arguments[arguments.length - 1];
  };
  _exports.deprecateFunc = deprecateFunc;
  if (true /* DEBUG */) {
    _exports.setDebugFunction = setDebugFunction = function (type, callback) {
      switch (type) {
        case 'assert':
          return _exports.assert = assert = callback;
        case 'info':
          return _exports.info = info = callback;
        case 'warn':
          return _exports.warn = warn = callback;
        case 'debug':
          return _exports.debug = debug = callback;
        case 'deprecate':
          return _exports.deprecate = deprecate = callback;
        case 'debugSeal':
          return _exports.debugSeal = debugSeal = callback;
        case 'debugFreeze':
          return _exports.debugFreeze = debugFreeze = callback;
        case 'runInDebug':
          return _exports.runInDebug = runInDebug = callback;
        case 'deprecateFunc':
          return _exports.deprecateFunc = deprecateFunc = callback;
      }
    };
    _exports.getDebugFunction = getDebugFunction = function (type) {
      switch (type) {
        case 'assert':
          return assert;
        case 'info':
          return info;
        case 'warn':
          return warn;
        case 'debug':
          return debug;
        case 'deprecate':
          return deprecate;
        case 'debugSeal':
          return debugSeal;
        case 'debugFreeze':
          return debugFreeze;
        case 'runInDebug':
          return runInDebug;
        case 'deprecateFunc':
          return deprecateFunc;
      }
    };
  }
  /**
  @module @ember/debug
  */

  if (true /* DEBUG */) {
    /**
      Verify that a certain expectation is met, or throw a exception otherwise.
         This is useful for communicating assumptions in the code to other human
      readers as well as catching bugs that accidentally violates these
      expectations.
         Assertions are removed from production builds, so they can be freely added
      for documentation and debugging purposes without worries of incuring any
      performance penalty. However, because of that, they should not be used for
      checks that could reasonably fail during normal usage. Furthermore, care
      should be taken to avoid accidentally relying on side-effects produced from
      evaluating the condition itself, since the code will not run in production.
         ```javascript
      import { assert } from '@ember/debug';
         // Test for truthiness
      assert('Must pass a string', typeof str === 'string');
         // Fail unconditionally
      assert('This code path should never be run');
      ```
         @method assert
      @static
      @for @ember/debug
      @param {String} description Describes the expectation. This will become the
        text of the Error thrown if the assertion fails.
      @param {any} condition Must be truthy for the assertion to pass. If
        falsy, an exception will be thrown.
      @public
      @since 1.0.0
    */
    setDebugFunction('assert', function assert(desc, test) {
      if (!test) {
        throw new _error.default(`Assertion Failed: ${desc}`);
      }
    });
    /**
      Display a debug notice.
         Calls to this function are not invoked in production builds.
         ```javascript
      import { debug } from '@ember/debug';
         debug('I\'m a debug notice!');
      ```
         @method debug
      @for @ember/debug
      @static
      @param {String} message A debug message to display.
      @public
    */

    setDebugFunction('debug', function debug(message) {
      /* eslint-disable no-console */
      if (console.debug) {
        console.debug(`DEBUG: ${message}`);
      } else {
        console.log(`DEBUG: ${message}`);
      }
      /* eslint-ensable no-console */
    });
    /**
      Display an info notice.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         @method info
      @private
    */

    setDebugFunction('info', function info() {
      console.info(...arguments);
      /* eslint-disable-line no-console */
    });
    /**
     @module @ember/debug
     @public
    */

    /**
      Alias an old, deprecated method with its new counterpart.
         Display a deprecation warning with the provided message and a stack trace
      (Chrome and Firefox only) when the assigned method is called.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         ```javascript
      import { deprecateFunc } from '@ember/debug';
         Ember.oldMethod = deprecateFunc('Please use the new, updated method', options, Ember.newMethod);
      ```
         @method deprecateFunc
      @static
      @for @ember/debug
      @param {String} message A description of the deprecation.
      @param {Object} [options] The options object for `deprecate`.
      @param {Function} func The new function called to replace its deprecated counterpart.
      @return {Function} A new function that wraps the original function with a deprecation warning
      @private
    */

    setDebugFunction('deprecateFunc', function deprecateFunc() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (args.length === 3) {
        var [message, options, func] = args;
        return function () {
          deprecate(message, false, options);
          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }
          return func.apply(this, args);
        };
      } else {
        var [_message, _func] = args;
        return function () {
          deprecate(_message);
          return _func.apply(this, arguments);
        };
      }
    });
    /**
     @module @ember/debug
     @public
    */

    /**
      Run a function meant for debugging.
         Calls to this function are removed from production builds, so they can be
      freely added for documentation and debugging purposes without worries of
      incuring any performance penalty.
         ```javascript
      import Component from '@ember/component';
      import { runInDebug } from '@ember/debug';
         runInDebug(() => {
        Component.reopen({
          didInsertElement() {
            console.log("I'm happy");
          }
        });
      });
      ```
         @method runInDebug
      @for @ember/debug
      @static
      @param {Function} func The function to be executed.
      @since 1.5.0
      @public
    */

    setDebugFunction('runInDebug', function runInDebug(func) {
      func();
    });
    setDebugFunction('debugSeal', function debugSeal(obj) {
      Object.seal(obj);
    });
    setDebugFunction('debugFreeze', function debugFreeze(obj) {
      // re-freezing an already frozen object introduces a significant
      // performance penalty on Chrome (tested through 59).
      //
      // See: https://bugs.chromium.org/p/v8/issues/detail?id=6450
      if (!Object.isFrozen(obj)) {
        Object.freeze(obj);
      }
    });
    setDebugFunction('deprecate', _deprecate2.default);
    setDebugFunction('warn', _warn2.default);
  }
  var _warnIfUsingStrippedFeatureFlags;
  _exports._warnIfUsingStrippedFeatureFlags = _warnIfUsingStrippedFeatureFlags;
  if (true /* DEBUG */ && !(0, _testing.isTesting)()) {
    if (typeof window !== 'undefined' && (_browserEnvironment.isFirefox || _browserEnvironment.isChrome) && window.addEventListener) {
      window.addEventListener('load', () => {
        if (document.documentElement && document.documentElement.dataset && !document.documentElement.dataset.emberExtension) {
          var downloadURL;
          if (_browserEnvironment.isChrome) {
            downloadURL = 'https://chrome.google.com/webstore/detail/ember-inspector/bmdblncegkenkacieihfhpjfppoconhi';
          } else if (_browserEnvironment.isFirefox) {
            downloadURL = 'https://addons.mozilla.org/en-US/firefox/addon/ember-inspector/';
          }
          debug(`For more advanced debugging, install the Ember Inspector from ${downloadURL}`);
        }
      }, false);
    }
  }
});
define("@ember/debug/lib/capture-render-tree", ["exports", "@glimmer/util"], function (_exports, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = captureRenderTree;
  /**
    @module @ember/debug
  */

  /**
    Ember Inspector calls this function to capture the current render tree.
  
    In production mode, this requires turning on `ENV._DEBUG_RENDER_TREE`
    before loading Ember.
  
    @private
    @static
    @method captureRenderTree
    @for @ember/debug
    @param app {ApplicationInstance} An `ApplicationInstance`.
    @since 3.14.0
  */

  function captureRenderTree(app) {
    var renderer = (0, _util.expect)(app.lookup('renderer:-dom'), `BUG: owner is missing renderer`);
    return renderer.debugRenderTree.capture();
  }
});
define("@ember/debug/lib/deprecate", ["exports", "@ember/-internals/environment", "@ember/debug/index", "@ember/debug/lib/handlers"], function (_exports, _environment, _index, _handlers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerHandler = _exports.missingOptionsUntilDeprecation = _exports.missingOptionsSinceDeprecation = _exports.missingOptionsIdDeprecation = _exports.missingOptionsForDeprecation = _exports.missingOptionsDeprecation = _exports.default = _exports.SINCE_MISSING_DEPRECATIONS = _exports.FOR_MISSING_DEPRECATIONS = void 0;
  /**
   @module @ember/debug
   @public
  */

  /**
    Allows for runtime registration of handler functions that override the default deprecation behavior.
    Deprecations are invoked by calls to [@ember/debug/deprecate](/ember/release/classes/@ember%2Fdebug/methods/deprecate?anchor=deprecate).
    The following example demonstrates its usage by registering a handler that throws an error if the
    message contains the word "should", otherwise defers to the default handler.
  
    ```javascript
    import { registerDeprecationHandler } from '@ember/debug';
  
    registerDeprecationHandler((message, options, next) => {
      if (message.indexOf('should') !== -1) {
        throw new Error(`Deprecation message with should: ${message}`);
      } else {
        // defer to whatever handler was registered before this one
        next(message, options);
      }
    });
    ```
  
    The handler function takes the following arguments:
  
    <ul>
      <li> <code>message</code> - The message received from the deprecation call.</li>
      <li> <code>options</code> - An object passed in with the deprecation call containing additional information including:</li>
        <ul>
          <li> <code>id</code> - An id of the deprecation in the form of <code>package-name.specific-deprecation</code>.</li>
          <li> <code>until</code> - The Ember version number the feature and deprecation will be removed in.</li>
        </ul>
      <li> <code>next</code> - A function that calls into the previously registered handler.</li>
    </ul>
  
    @public
    @static
    @method registerDeprecationHandler
    @for @ember/debug
    @param handler {Function} A function to handle deprecation calls.
    @since 2.1.0
  */

  var registerHandler = () => {};
  _exports.registerHandler = registerHandler;
  var missingOptionsDeprecation;
  _exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation;
  _exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  var missingOptionsUntilDeprecation;
  _exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation;
  var missingOptionsForDeprecation = () => '';
  _exports.missingOptionsForDeprecation = missingOptionsForDeprecation;
  var missingOptionsSinceDeprecation = () => '';
  _exports.missingOptionsSinceDeprecation = missingOptionsSinceDeprecation;
  var deprecate = () => {};
  var FOR_MISSING_DEPRECATIONS = new Set();
  _exports.FOR_MISSING_DEPRECATIONS = FOR_MISSING_DEPRECATIONS;
  var SINCE_MISSING_DEPRECATIONS = new Set();
  _exports.SINCE_MISSING_DEPRECATIONS = SINCE_MISSING_DEPRECATIONS;
  if (true /* DEBUG */) {
    _exports.registerHandler = registerHandler = function registerHandler(handler) {
      (0, _handlers.registerHandler)('deprecate', handler);
    };
    var formatMessage = function formatMessage(_message, options) {
      var message = _message;
      if (options && options.id) {
        message = message + ` [deprecation id: ${options.id}]`;
      }
      if (options && options.url) {
        message += ` See ${options.url} for more details.`;
      }
      return message;
    };
    registerHandler(function logDeprecationToConsole(message, options) {
      var updatedMessage = formatMessage(message, options);
      console.warn(`DEPRECATION: ${updatedMessage}`); // eslint-disable-line no-console
    });

    var captureErrorForStack;
    if (new Error().stack) {
      captureErrorForStack = () => new Error();
    } else {
      captureErrorForStack = () => {
        try {
          __fail__.fail();
        } catch (e) {
          return e;
        }
      };
    }
    registerHandler(function logDeprecationStackTrace(message, options, next) {
      if (_environment.ENV.LOG_STACKTRACE_ON_DEPRECATION) {
        var stackStr = '';
        var error = captureErrorForStack();
        var stack;
        if (error.stack) {
          if (error['arguments']) {
            // Chrome
            stack = error.stack.replace(/^\s+at\s+/gm, '').replace(/^([^(]+?)([\n$])/gm, '{anonymous}($1)$2').replace(/^Object.<anonymous>\s*\(([^)]+)\)/gm, '{anonymous}($1)').split('\n');
            stack.shift();
          } else {
            // Firefox
            stack = error.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^\(/gm, '{anonymous}(').split('\n');
          }
          stackStr = `\n    ${stack.slice(2).join('\n    ')}`;
        }
        var updatedMessage = formatMessage(message, options);
        console.warn(`DEPRECATION: ${updatedMessage}${stackStr}`); // eslint-disable-line no-console
      } else {
        next(message, options);
      }
    });
    registerHandler(function raiseOnDeprecation(message, options, next) {
      if (_environment.ENV.RAISE_ON_DEPRECATION) {
        var updatedMessage = formatMessage(message);
        throw new Error(updatedMessage);
      } else {
        next(message, options);
      }
    });
    _exports.missingOptionsDeprecation = missingOptionsDeprecation = 'When calling `deprecate` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include `id` and `until` properties.';
    _exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation = 'When calling `deprecate` you must provide `id` in options.';
    _exports.missingOptionsUntilDeprecation = missingOptionsUntilDeprecation = 'When calling `deprecate` you must provide `until` in options.';
    _exports.missingOptionsForDeprecation = missingOptionsForDeprecation = id => {
      return `When calling \`deprecate\` you must provide \`for\` in options. Missing options.for in "${id}" deprecation`;
    };
    _exports.missingOptionsSinceDeprecation = missingOptionsSinceDeprecation = id => {
      return `When calling \`deprecate\` you must provide \`since\` in options. Missing options.since in "${id}" deprecation`;
    };
    /**
     @module @ember/debug
     @public
     */

    /**
      Display a deprecation warning with the provided message and a stack trace
      (Chrome and Firefox only).
         * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
         @method deprecate
      @for @ember/debug
      @param {String} message A description of the deprecation.
      @param {Boolean} test A boolean. If falsy, the deprecation will be displayed.
      @param {Object} options
      @param {String} options.id A unique id for this deprecation. The id can be
        used by Ember debugging tools to change the behavior (raise, log or silence)
        for that specific deprecation. The id should be namespaced by dots, e.g.
        "view.helper.select".
      @param {string} options.until The version of Ember when this deprecation
        warning will be removed.
      @param {String} options.for A namespace for the deprecation, usually the package name
      @param {Object} options.since Describes when the deprecation became available and enabled.
      @param {String} [options.url] An optional url to the transition guide on the
            emberjs.com website.
      @static
      @public
      @since 1.0.0
    */

    deprecate = function deprecate(message, test, options) {
      (0, _index.assert)(missingOptionsDeprecation, Boolean(options && (options.id || options.until)));
      (0, _index.assert)(missingOptionsIdDeprecation, Boolean(options.id));
      (0, _index.assert)(missingOptionsUntilDeprecation, Boolean(options.until));
      if (!options.for && !FOR_MISSING_DEPRECATIONS.has(options.id)) {
        FOR_MISSING_DEPRECATIONS.add(options.id);
        deprecate(missingOptionsForDeprecation(options.id), Boolean(options.for), {
          id: 'ember-source.deprecation-without-for',
          until: '4.0.0',
          for: 'ember-source',
          since: {
            enabled: '3.24.0'
          }
        });
      }
      if (!options.since && !SINCE_MISSING_DEPRECATIONS.has(options.id)) {
        SINCE_MISSING_DEPRECATIONS.add(options.id);
        deprecate(missingOptionsSinceDeprecation(options.id), Boolean(options.since), {
          id: 'ember-source.deprecation-without-since',
          until: '4.0.0',
          for: 'ember-source',
          since: {
            enabled: '3.24.0'
          }
        });
      }
      (0, _handlers.invoke)('deprecate', message, test, options);
    };
  }
  var _default = deprecate;
  _exports.default = _default;
});
define("@ember/debug/lib/handlers", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerHandler = _exports.invoke = _exports.HANDLERS = void 0;
  var HANDLERS = {};
  _exports.HANDLERS = HANDLERS;
  var registerHandler = () => {};
  _exports.registerHandler = registerHandler;
  var invoke = () => {};
  _exports.invoke = invoke;
  if (true /* DEBUG */) {
    _exports.registerHandler = registerHandler = function registerHandler(type, callback) {
      var nextHandler = HANDLERS[type] || (() => {});
      HANDLERS[type] = (message, options) => {
        callback(message, options, nextHandler);
      };
    };
    _exports.invoke = invoke = function invoke(type, message, test, options) {
      if (test) {
        return;
      }
      var handlerForType = HANDLERS[type];
      if (handlerForType) {
        handlerForType(message, options);
      }
    };
  }
});
define("@ember/debug/lib/testing", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isTesting = isTesting;
  _exports.setTesting = setTesting;
  var testing = false;
  function isTesting() {
    return testing;
  }
  function setTesting(value) {
    testing = Boolean(value);
  }
});
define("@ember/debug/lib/warn", ["exports", "@ember/debug/index", "@ember/debug/lib/handlers"], function (_exports, _index, _handlers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerHandler = _exports.missingOptionsIdDeprecation = _exports.missingOptionsDeprecation = _exports.default = void 0;
  var registerHandler = () => {};
  _exports.registerHandler = registerHandler;
  var warn = () => {};
  var missingOptionsDeprecation;
  _exports.missingOptionsDeprecation = missingOptionsDeprecation;
  var missingOptionsIdDeprecation;
  /**
  @module @ember/debug
  */
  _exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation;
  if (true /* DEBUG */) {
    /**
      Allows for runtime registration of handler functions that override the default warning behavior.
      Warnings are invoked by calls made to [@ember/debug/warn](/ember/release/classes/@ember%2Fdebug/methods/warn?anchor=warn).
      The following example demonstrates its usage by registering a handler that does nothing overriding Ember's
      default warning behavior.
         ```javascript
      import { registerWarnHandler } from '@ember/debug';
         // next is not called, so no warnings get the default behavior
      registerWarnHandler(() => {});
      ```
         The handler function takes the following arguments:
         <ul>
        <li> <code>message</code> - The message received from the warn call. </li>
        <li> <code>options</code> - An object passed in with the warn call containing additional information including:</li>
          <ul>
            <li> <code>id</code> - An id of the warning in the form of <code>package-name.specific-warning</code>.</li>
          </ul>
        <li> <code>next</code> - A function that calls into the previously registered handler.</li>
      </ul>
         @public
      @static
      @method registerWarnHandler
      @for @ember/debug
      @param handler {Function} A function to handle warnings.
      @since 2.1.0
    */
    _exports.registerHandler = registerHandler = function registerHandler(handler) {
      (0, _handlers.registerHandler)('warn', handler);
    };
    registerHandler(function logWarning(message) {
      /* eslint-disable no-console */
      console.warn(`WARNING: ${message}`);
      /* eslint-enable no-console */
    });

    _exports.missingOptionsDeprecation = missingOptionsDeprecation = 'When calling `warn` you ' + 'must provide an `options` hash as the third parameter.  ' + '`options` should include an `id` property.';
    _exports.missingOptionsIdDeprecation = missingOptionsIdDeprecation = 'When calling `warn` you must provide `id` in options.';
    /**
      Display a warning with the provided message.
         * In a production build, this method is defined as an empty function (NOP).
      Uses of this method in Ember itself are stripped from the ember.prod.js build.
         ```javascript
      import { warn } from '@ember/debug';
      import tomsterCount from './tomster-counter'; // a module in my project
         // Log a warning if we have more than 3 tomsters
      warn('Too many tomsters!', tomsterCount <= 3, {
        id: 'ember-debug.too-many-tomsters'
      });
      ```
         @method warn
      @for @ember/debug
      @static
      @param {String} message A warning to display.
      @param {Boolean} test An optional boolean. If falsy, the warning
        will be displayed.
      @param {Object} options An object that can be used to pass a unique
        `id` for this warning.  The `id` can be used by Ember debugging tools
        to change the behavior (raise, log, or silence) for that specific warning.
        The `id` should be namespaced by dots, e.g. "ember-debug.feature-flag-with-features-stripped"
      @public
      @since 1.0.0
    */

    warn = function warn(message, test, options) {
      if (arguments.length === 2 && typeof test === 'object') {
        options = test;
        test = false;
      }
      (0, _index.assert)(missingOptionsDeprecation, Boolean(options));
      (0, _index.assert)(missingOptionsIdDeprecation, Boolean(options && options.id));
      (0, _handlers.invoke)('warn', message, test, options);
    };
  }
  var _default = warn;
  _exports.default = _default;
});
define("ember-testing/index", ["exports", "ember-testing/lib/test", "ember-testing/lib/adapters/adapter", "ember-testing/lib/setup_for_testing", "ember-testing/lib/adapters/qunit", "ember-testing/lib/support", "ember-testing/lib/ext/application", "ember-testing/lib/ext/rsvp", "ember-testing/lib/helpers", "ember-testing/lib/initializers"], function (_exports, _test, _adapter, _setup_for_testing, _qunit, _support, _application, _rsvp, _helpers, _initializers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "Adapter", {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(_exports, "QUnitAdapter", {
    enumerable: true,
    get: function () {
      return _qunit.default;
    }
  });
  Object.defineProperty(_exports, "Test", {
    enumerable: true,
    get: function () {
      return _test.default;
    }
  });
  Object.defineProperty(_exports, "setupForTesting", {
    enumerable: true,
    get: function () {
      return _setup_for_testing.default;
    }
  });
});
define("ember-testing/lib/adapters/adapter", ["exports", "@ember/-internals/runtime"], function (_exports, _runtime) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  function K() {
    return this;
  }
  /**
   @module @ember/test
  */

  /**
    The primary purpose of this class is to create hooks that can be implemented
    by an adapter for various test frameworks.
  
    @class TestAdapter
    @public
  */
  var _default = _runtime.Object.extend({
    /**
      This callback will be called whenever an async operation is about to start.
       Override this to call your framework's methods that handle async
      operations.
       @public
      @method asyncStart
    */
    asyncStart: K,
    /**
      This callback will be called whenever an async operation has completed.
       @public
      @method asyncEnd
    */
    asyncEnd: K,
    /**
      Override this method with your testing framework's false assertion.
      This function is called whenever an exception occurs causing the testing
      promise to fail.
       QUnit example:
       ```javascript
        exception: function(error) {
          ok(false, error);
        };
      ```
       @public
      @method exception
      @param {String} error The exception to be raised.
    */
    exception(error) {
      throw error;
    }
  });
  _exports.default = _default;
});
define("ember-testing/lib/adapters/qunit", ["exports", "@ember/-internals/utils", "ember-testing/lib/adapters/adapter"], function (_exports, _utils, _adapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* globals QUnit */
  /**
     @module ember
  */
  /**
    This class implements the methods defined by TestAdapter for the
    QUnit testing framework.
  
    @class QUnitAdapter
    @namespace Ember.Test
    @extends TestAdapter
    @public
  */
  var _default = _adapter.default.extend({
    init() {
      this.doneCallbacks = [];
    },
    asyncStart() {
      if (typeof QUnit.stop === 'function') {
        // very old QUnit version
        QUnit.stop();
      } else {
        this.doneCallbacks.push(QUnit.config.current ? QUnit.config.current.assert.async() : null);
      }
    },
    asyncEnd() {
      // checking for QUnit.stop here (even though we _need_ QUnit.start) because
      // QUnit.start() still exists in QUnit 2.x (it just throws an error when calling
      // inside a test context)
      if (typeof QUnit.stop === 'function') {
        QUnit.start();
      } else {
        var done = this.doneCallbacks.pop(); // This can be null if asyncStart() was called outside of a test

        if (done) {
          done();
        }
      }
    },
    exception(error) {
      QUnit.config.current.assert.ok(false, (0, _utils.inspect)(error));
    }
  });
  _exports.default = _default;
});
define("ember-testing/lib/events", ["exports", "@ember/runloop", "@ember/polyfills", "ember-testing/lib/helpers/-is-form-control"], function (_exports, _runloop, _polyfills, _isFormControl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.fireEvent = fireEvent;
  _exports.focus = focus;
  var DEFAULT_EVENT_OPTIONS = {
    canBubble: true,
    cancelable: true
  };
  var KEYBOARD_EVENT_TYPES = ['keydown', 'keypress', 'keyup'];
  var MOUSE_EVENT_TYPES = ['click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover'];
  function focus(el) {
    if (!el) {
      return;
    }
    if (el.isContentEditable || (0, _isFormControl.default)(el)) {
      var type = el.getAttribute('type');
      if (type !== 'checkbox' && type !== 'radio' && type !== 'hidden') {
        (0, _runloop.run)(null, function () {
          var browserIsNotFocused = document.hasFocus && !document.hasFocus(); // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event

          el.focus(); // Firefox does not trigger the `focusin` event if the window
          // does not have focus. If the document does not have focus then
          // fire `focusin` event as well.

          if (browserIsNotFocused) {
            // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
            fireEvent(el, 'focus', {
              bubbles: false
            });
            fireEvent(el, 'focusin');
          }
        });
      }
    }
  }
  function fireEvent(element, type, options) {
    if (options === void 0) {
      options = {};
    }
    if (!element) {
      return;
    }
    var event;
    if (KEYBOARD_EVENT_TYPES.indexOf(type) > -1) {
      event = buildKeyboardEvent(type, options);
    } else if (MOUSE_EVENT_TYPES.indexOf(type) > -1) {
      var rect = element.getBoundingClientRect();
      var x = rect.left + 1;
      var y = rect.top + 1;
      var simulatedCoordinates = {
        screenX: x + 5,
        screenY: y + 95,
        clientX: x,
        clientY: y
      };
      event = buildMouseEvent(type, (0, _polyfills.assign)(simulatedCoordinates, options));
    } else {
      event = buildBasicEvent(type, options);
    }
    element.dispatchEvent(event);
  }
  function buildBasicEvent(type, options) {
    if (options === void 0) {
      options = {};
    }
    var event = document.createEvent('Events'); // Event.bubbles is read only

    var bubbles = options.bubbles !== undefined ? options.bubbles : true;
    var cancelable = options.cancelable !== undefined ? options.cancelable : true;
    delete options.bubbles;
    delete options.cancelable;
    event.initEvent(type, bubbles, cancelable);
    (0, _polyfills.assign)(event, options);
    return event;
  }
  function buildMouseEvent(type, options) {
    if (options === void 0) {
      options = {};
    }
    var event;
    try {
      event = document.createEvent('MouseEvents');
      var eventOpts = (0, _polyfills.assign)({}, DEFAULT_EVENT_OPTIONS, options);
      event.initMouseEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
  function buildKeyboardEvent(type, options) {
    if (options === void 0) {
      options = {};
    }
    var event;
    try {
      event = document.createEvent('KeyEvents');
      var eventOpts = (0, _polyfills.assign)({}, DEFAULT_EVENT_OPTIONS, options);
      event.initKeyEvent(type, eventOpts.canBubble, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } catch (e) {
      event = buildBasicEvent(type, options);
    }
    return event;
  }
});
define("ember-testing/lib/ext/application", ["@ember/application", "ember-testing/lib/setup_for_testing", "ember-testing/lib/test/helpers", "ember-testing/lib/test/promise", "ember-testing/lib/test/run", "ember-testing/lib/test/on_inject_helpers", "ember-testing/lib/test/adapter"], function (_application, _setup_for_testing, _helpers, _promise, _run, _on_inject_helpers, _adapter) {
  "use strict";

  _application.default.reopen({
    /**
     This property contains the testing helpers for the current application. These
     are created once you call `injectTestHelpers` on your `Application`
     instance. The included helpers are also available on the `window` object by
     default, but can be used from this object on the individual application also.
       @property testHelpers
      @type {Object}
      @default {}
      @public
    */
    testHelpers: {},
    /**
     This property will contain the original methods that were registered
     on the `helperContainer` before `injectTestHelpers` is called.
      When `removeTestHelpers` is called, these methods are restored to the
     `helperContainer`.
       @property originalMethods
      @type {Object}
      @default {}
      @private
      @since 1.3.0
    */
    originalMethods: {},
    /**
    This property indicates whether or not this application is currently in
    testing mode. This is set when `setupForTesting` is called on the current
    application.
     @property testing
    @type {Boolean}
    @default false
    @since 1.3.0
    @public
    */
    testing: false,
    /**
      This hook defers the readiness of the application, so that you can start
      the app when your tests are ready to run. It also sets the router's
      location to 'none', so that the window's location will not be modified
      (preventing both accidental leaking of state between tests and interference
      with your testing framework). `setupForTesting` should only be called after
      setting a custom `router` class (for example `App.Router = Router.extend(`).
       Example:
       ```
      App.setupForTesting();
      ```
       @method setupForTesting
      @public
    */
    setupForTesting() {
      (0, _setup_for_testing.default)();
      this.testing = true;
      this.resolveRegistration('router:main').reopen({
        location: 'none'
      });
    },
    /**
      This will be used as the container to inject the test helpers into. By
      default the helpers are injected into `window`.
       @property helperContainer
      @type {Object} The object to be used for test helpers.
      @default window
      @since 1.2.0
      @private
    */
    helperContainer: null,
    /**
      This injects the test helpers into the `helperContainer` object. If an object is provided
      it will be used as the helperContainer. If `helperContainer` is not set it will default
      to `window`. If a function of the same name has already been defined it will be cached
      (so that it can be reset if the helper is removed with `unregisterHelper` or
      `removeTestHelpers`).
       Any callbacks registered with `onInjectHelpers` will be called once the
      helpers have been injected.
       Example:
      ```
      App.injectTestHelpers();
      ```
       @method injectTestHelpers
      @public
    */
    injectTestHelpers(helperContainer) {
      if (helperContainer) {
        this.helperContainer = helperContainer;
      } else {
        this.helperContainer = window;
      }
      this.reopen({
        willDestroy() {
          this._super(...arguments);
          this.removeTestHelpers();
        }
      });
      this.testHelpers = {};
      for (var name in _helpers.helpers) {
        this.originalMethods[name] = this.helperContainer[name];
        this.testHelpers[name] = this.helperContainer[name] = helper(this, name);
        protoWrap(_promise.default.prototype, name, helper(this, name), _helpers.helpers[name].meta.wait);
      }
      (0, _on_inject_helpers.invokeInjectHelpersCallbacks)(this);
    },
    /**
      This removes all helpers that have been registered, and resets and functions
      that were overridden by the helpers.
       Example:
       ```javascript
      App.removeTestHelpers();
      ```
       @public
      @method removeTestHelpers
    */
    removeTestHelpers() {
      if (!this.helperContainer) {
        return;
      }
      for (var name in _helpers.helpers) {
        this.helperContainer[name] = this.originalMethods[name];
        delete _promise.default.prototype[name];
        delete this.testHelpers[name];
        delete this.originalMethods[name];
      }
    }
  }); // This method is no longer needed
  // But still here for backwards compatibility
  // of helper chaining

  function protoWrap(proto, name, callback, isAsync) {
    proto[name] = function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      if (isAsync) {
        return callback.apply(this, args);
      } else {
        return this.then(function () {
          return callback.apply(this, args);
        });
      }
    };
  }
  function helper(app, name) {
    var fn = _helpers.helpers[name].method;
    var meta = _helpers.helpers[name].meta;
    if (!meta.wait) {
      return function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return fn.apply(app, [app, ...args]);
      };
    }
    return function () {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      var lastPromise = (0, _run.default)(() => (0, _promise.resolve)((0, _promise.getLastPromise)())); // wait for last helper's promise to resolve and then
      // execute. To be safe, we need to tell the adapter we're going
      // asynchronous here, because fn may not be invoked before we
      // return.

      (0, _adapter.asyncStart)();
      return lastPromise.then(() => fn.apply(app, [app, ...args])).finally(_adapter.asyncEnd);
    };
  }
});
define("ember-testing/lib/ext/rsvp", ["exports", "@ember/-internals/runtime", "@ember/runloop", "@ember/debug", "ember-testing/lib/test/adapter"], function (_exports, _runtime, _runloop, _debug, _adapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _runtime.RSVP.configure('async', function (callback, promise) {
    // if schedule will cause autorun, we need to inform adapter
    if ((0, _debug.isTesting)() && !_runloop._backburner.currentInstance) {
      (0, _adapter.asyncStart)();
      _runloop._backburner.schedule('actions', () => {
        (0, _adapter.asyncEnd)();
        callback(promise);
      });
    } else {
      _runloop._backburner.schedule('actions', () => callback(promise));
    }
  });
  var _default = _runtime.RSVP;
  _exports.default = _default;
});
define("ember-testing/lib/helpers", ["ember-testing/lib/test/helpers", "ember-testing/lib/helpers/and_then", "ember-testing/lib/helpers/click", "ember-testing/lib/helpers/current_path", "ember-testing/lib/helpers/current_route_name", "ember-testing/lib/helpers/current_url", "ember-testing/lib/helpers/fill_in", "ember-testing/lib/helpers/find", "ember-testing/lib/helpers/find_with_assert", "ember-testing/lib/helpers/key_event", "ember-testing/lib/helpers/pause_test", "ember-testing/lib/helpers/trigger_event", "ember-testing/lib/helpers/visit", "ember-testing/lib/helpers/wait"], function (_helpers, _and_then, _click, _current_path, _current_route_name, _current_url, _fill_in, _find, _find_with_assert, _key_event, _pause_test, _trigger_event, _visit, _wait) {
  "use strict";

  (0, _helpers.registerAsyncHelper)('visit', _visit.default);
  (0, _helpers.registerAsyncHelper)('click', _click.default);
  (0, _helpers.registerAsyncHelper)('keyEvent', _key_event.default);
  (0, _helpers.registerAsyncHelper)('fillIn', _fill_in.default);
  (0, _helpers.registerAsyncHelper)('wait', _wait.default);
  (0, _helpers.registerAsyncHelper)('andThen', _and_then.default);
  (0, _helpers.registerAsyncHelper)('pauseTest', _pause_test.pauseTest);
  (0, _helpers.registerAsyncHelper)('triggerEvent', _trigger_event.default);
  (0, _helpers.registerHelper)('find', _find.default);
  (0, _helpers.registerHelper)('findWithAssert', _find_with_assert.default);
  (0, _helpers.registerHelper)('currentRouteName', _current_route_name.default);
  (0, _helpers.registerHelper)('currentPath', _current_path.default);
  (0, _helpers.registerHelper)('currentURL', _current_url.default);
  (0, _helpers.registerHelper)('resumeTest', _pause_test.resumeTest);
});
define("ember-testing/lib/helpers/-is-form-control", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = isFormControl;
  var FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is a form control, `false` otherwise
  */

  function isFormControl(element) {
    var {
      tagName,
      type
    } = element;
    if (type === 'hidden') {
      return false;
    }
    return FORM_CONTROL_TAGS.indexOf(tagName) > -1;
  }
});
define("ember-testing/lib/helpers/and_then", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = andThen;
  function andThen(app, callback) {
    return app.testHelpers.wait(callback(app));
  }
});
define("ember-testing/lib/helpers/click", ["exports", "ember-testing/lib/events"], function (_exports, _events) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = click;
  /**
  @module ember
  */

  /**
    Clicks an element and triggers any actions triggered by the element's `click`
    event.
  
    Example:
  
    ```javascript
    click('.some-jQuery-selector').then(function() {
      // assert something
    });
    ```
  
    @method click
    @param {String} selector jQuery selector for finding element on the DOM
    @param {Object} context A DOM Element, Document, or jQuery to use as context
    @return {RSVP.Promise<undefined>}
    @public
  */

  function click(app, selector, context) {
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];
    (0, _events.fireEvent)(el, 'mousedown');
    (0, _events.focus)(el);
    (0, _events.fireEvent)(el, 'mouseup');
    (0, _events.fireEvent)(el, 'click');
    return app.testHelpers.wait();
  }
});
define("ember-testing/lib/helpers/current_path", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = currentPath;
  /**
  @module ember
  */

  /**
    Returns the current path.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentPath(), 'some.path.index', "correct path was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentPath
  @return {Object} The currently active path.
  @since 1.5.0
  @public
  */

  function currentPath(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return (0, _metal.get)(routingService, 'currentPath');
  }
});
define("ember-testing/lib/helpers/current_route_name", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = currentRouteName;
  /**
  @module ember
  */

  /**
    Returns the currently active route name.
  
  Example:
  
  ```javascript
  function validateRouteName() {
    equal(currentRouteName(), 'some.path', "correct route was transitioned into.");
  }
  visit('/some/path').then(validateRouteName)
  ```
  
  @method currentRouteName
  @return {Object} The name of the currently active route.
  @since 1.5.0
  @public
  */

  function currentRouteName(app) {
    var routingService = app.__container__.lookup('service:-routing');
    return (0, _metal.get)(routingService, 'currentRouteName');
  }
});
define("ember-testing/lib/helpers/current_url", ["exports", "@ember/-internals/metal"], function (_exports, _metal) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = currentURL;
  /**
  @module ember
  */

  /**
    Returns the current URL.
  
  Example:
  
  ```javascript
  function validateURL() {
    equal(currentURL(), '/some/path', "correct URL was transitioned into.");
  }
  
  click('#some-link-id').then(validateURL);
  ```
  
  @method currentURL
  @return {Object} The currently active URL.
  @since 1.5.0
  @public
  */

  function currentURL(app) {
    var router = app.__container__.lookup('router:main');
    return (0, _metal.get)(router, 'location').getURL();
  }
});
define("ember-testing/lib/helpers/fill_in", ["exports", "ember-testing/lib/events", "ember-testing/lib/helpers/-is-form-control"], function (_exports, _events, _isFormControl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = fillIn;
  /**
  @module ember
  */

  /**
    Fills in an input element with some text.
  
    Example:
  
    ```javascript
    fillIn('#email', 'you@example.com').then(function() {
      // assert something
    });
    ```
  
    @method fillIn
    @param {String} selector jQuery selector finding an input element on the DOM
    to fill text with
    @param {String} text text to place inside the input element
    @return {RSVP.Promise<undefined>}
    @public
  */

  function fillIn(app, selector, contextOrText, text) {
    var $el, el, context;
    if (text === undefined) {
      text = contextOrText;
    } else {
      context = contextOrText;
    }
    $el = app.testHelpers.findWithAssert(selector, context);
    el = $el[0];
    (0, _events.focus)(el);
    if ((0, _isFormControl.default)(el)) {
      el.value = text;
    } else {
      el.innerHTML = text;
    }
    (0, _events.fireEvent)(el, 'input');
    (0, _events.fireEvent)(el, 'change');
    return app.testHelpers.wait();
  }
});
define("ember-testing/lib/helpers/find", ["exports", "@ember/-internals/metal", "@ember/debug", "@ember/-internals/views"], function (_exports, _metal, _debug, _views) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = find;
  /**
  @module ember
  */

  /**
    Finds an element in the context of the app's container element. A simple alias
    for `app.$(selector)`.
  
    Example:
  
    ```javascript
    var $el = find('.my-selector');
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = find('.my-selector', '.parent-element-class');
    ```
  
    @method find
    @param {String} selector jQuery selector for element lookup
    @param {String} [context] (optional) jQuery selector that will limit the selector
                              argument to find only within the context's children
    @return {Object} DOM element representing the results of the query
    @public
  */

  function find(app, selector, context) {
    if (_views.jQueryDisabled) {
      (true && !(false) && (0, _debug.assert)('If jQuery is disabled, please import and use helpers from @ember/test-helpers [https://github.com/emberjs/ember-test-helpers]. Note: `find` is not an available helper.'));
    }
    var $el;
    context = context || (0, _metal.get)(app, 'rootElement');
    $el = app.$(selector, context);
    return $el;
  }
});
define("ember-testing/lib/helpers/find_with_assert", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = findWithAssert;
  /**
  @module ember
  */

  /**
    Like `find`, but throws an error if the element selector returns no results.
  
    Example:
  
    ```javascript
    var $el = findWithAssert('.doesnt-exist'); // throws error
    ```
  
    With the `context` param:
  
    ```javascript
    var $el = findWithAssert('.selector-id', '.parent-element-class'); // assert will pass
    ```
  
    @method findWithAssert
    @param {String} selector jQuery selector string for finding an element within
    the DOM
    @param {String} [context] (optional) jQuery selector that will limit the
    selector argument to find only within the context's children
    @return {Object} jQuery object representing the results of the query
    @throws {Error} throws error if object returned has a length of 0
    @public
  */
  function findWithAssert(app, selector, context) {
    var $el = app.testHelpers.find(selector, context);
    if ($el.length === 0) {
      throw new Error('Element ' + selector + ' not found.');
    }
    return $el;
  }
});
define("ember-testing/lib/helpers/key_event", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = keyEvent;
  /**
  @module ember
  */

  /**
    Simulates a key event, e.g. `keypress`, `keydown`, `keyup` with the desired keyCode
    Example:
    ```javascript
    keyEvent('.some-jQuery-selector', 'keypress', 13).then(function() {
     // assert something
    });
    ```
    @method keyEvent
    @param {String} selector jQuery selector for finding element on the DOM
    @param {String} type the type of key event, e.g. `keypress`, `keydown`, `keyup`
    @param {Number} keyCode the keyCode of the simulated key event
    @return {RSVP.Promise<undefined>}
    @since 1.5.0
    @public
  */
  function keyEvent(app, selector, contextOrType, typeOrKeyCode, keyCode) {
    var context, type;
    if (keyCode === undefined) {
      context = null;
      keyCode = typeOrKeyCode;
      type = contextOrType;
    } else {
      context = contextOrType;
      type = typeOrKeyCode;
    }
    return app.testHelpers.triggerEvent(selector, context, type, {
      keyCode,
      which: keyCode
    });
  }
});
define("ember-testing/lib/helpers/pause_test", ["exports", "@ember/-internals/runtime", "@ember/debug"], function (_exports, _runtime, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.pauseTest = pauseTest;
  _exports.resumeTest = resumeTest;
  /**
  @module ember
  */

  var resume;
  /**
   Resumes a test paused by `pauseTest`.
  
   @method resumeTest
   @return {void}
   @public
  */

  function resumeTest() {
    (true && !(resume) && (0, _debug.assert)('Testing has not been paused. There is nothing to resume.', resume));
    resume();
    resume = undefined;
  }
  /**
   Pauses the current test - this is useful for debugging while testing or for test-driving.
   It allows you to inspect the state of your application at any point.
   Example (The test will pause before clicking the button):
  
   ```javascript
   visit('/')
   return pauseTest();
   click('.btn');
   ```
  
   You may want to turn off the timeout before pausing.
  
   qunit (timeout available to use as of 2.4.0):
  
   ```
   visit('/');
   assert.timeout(0);
   return pauseTest();
   click('.btn');
   ```
  
   mocha (timeout happens automatically as of ember-mocha v0.14.0):
  
   ```
   visit('/');
   this.timeout(0);
   return pauseTest();
   click('.btn');
   ```
  
  
   @since 1.9.0
   @method pauseTest
   @return {Object} A promise that will never resolve
   @public
  */

  function pauseTest() {
    (0, _debug.info)('Testing paused. Use `resumeTest()` to continue.');
    return new _runtime.RSVP.Promise(resolve => {
      resume = resolve;
    }, 'TestAdapter paused promise');
  }
});
define("ember-testing/lib/helpers/trigger_event", ["exports", "ember-testing/lib/events"], function (_exports, _events) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = triggerEvent;
  /**
  @module ember
  */

  /**
    Triggers the given DOM event on the element identified by the provided selector.
    Example:
    ```javascript
    triggerEvent('#some-elem-id', 'blur');
    ```
    This is actually used internally by the `keyEvent` helper like so:
    ```javascript
    triggerEvent('#some-elem-id', 'keypress', { keyCode: 13 });
    ```
   @method triggerEvent
   @param {String} selector jQuery selector for finding element on the DOM
   @param {String} [context] jQuery selector that will limit the selector
                             argument to find only within the context's children
   @param {String} type The event type to be triggered.
   @param {Object} [options] The options to be passed to jQuery.Event.
   @return {RSVP.Promise<undefined>}
   @since 1.5.0
   @public
  */

  function triggerEvent(app, selector, contextOrType, typeOrOptions, possibleOptions) {
    var arity = arguments.length;
    var context, type, options;
    if (arity === 3) {
      // context and options are optional, so this is
      // app, selector, type
      context = null;
      type = contextOrType;
      options = {};
    } else if (arity === 4) {
      // context and options are optional, so this is
      if (typeof typeOrOptions === 'object') {
        // either
        // app, selector, type, options
        context = null;
        type = contextOrType;
        options = typeOrOptions;
      } else {
        // or
        // app, selector, context, type
        context = contextOrType;
        type = typeOrOptions;
        options = {};
      }
    } else {
      context = contextOrType;
      type = typeOrOptions;
      options = possibleOptions;
    }
    var $el = app.testHelpers.findWithAssert(selector, context);
    var el = $el[0];
    (0, _events.fireEvent)(el, type, options);
    return app.testHelpers.wait();
  }
});
define("ember-testing/lib/helpers/visit", ["exports", "@ember/runloop"], function (_exports, _runloop) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = visit;
  /**
    Loads a route, sets up any controllers, and renders any templates associated
    with the route as though a real user had triggered the route change while
    using your app.
  
    Example:
  
    ```javascript
    visit('posts/index').then(function() {
      // assert something
    });
    ```
  
    @method visit
    @param {String} url the name of the route
    @return {RSVP.Promise<undefined>}
    @public
  */

  function visit(app, url) {
    var router = app.__container__.lookup('router:main');
    var shouldHandleURL = false;
    app.boot().then(() => {
      router.location.setURL(url);
      if (shouldHandleURL) {
        (0, _runloop.run)(app.__deprecatedInstance__, 'handleURL', url);
      }
    });
    if (app._readinessDeferrals > 0) {
      router.initialURL = url;
      (0, _runloop.run)(app, 'advanceReadiness');
      delete router.initialURL;
    } else {
      shouldHandleURL = true;
    }
    return app.testHelpers.wait();
  }
});
define("ember-testing/lib/helpers/wait", ["exports", "ember-testing/lib/test/waiters", "@ember/-internals/runtime", "@ember/runloop", "ember-testing/lib/test/pending_requests"], function (_exports, _waiters, _runtime, _runloop, _pending_requests) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = wait;
  /**
  @module ember
  */

  /**
    Causes the run loop to process any pending events. This is used to ensure that
    any async operations from other helpers (or your assertions) have been processed.
  
    This is most often used as the return value for the helper functions (see 'click',
    'fillIn','visit',etc). However, there is a method to register a test helper which
    utilizes this method without the need to actually call `wait()` in your helpers.
  
    The `wait` helper is built into `registerAsyncHelper` by default. You will not need
    to `return app.testHelpers.wait();` - the wait behavior is provided for you.
  
    Example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
  
    registerAsyncHelper('loginUser', function(app, username, password) {
      visit('secured/path/here')
        .fillIn('#username', username)
        .fillIn('#password', password)
        .click('.submit');
    });
    ```
  
    @method wait
    @param {Object} value The value to be returned.
    @return {RSVP.Promise<any>} Promise that resolves to the passed value.
    @public
    @since 1.0.0
  */

  function wait(app, value) {
    return new _runtime.RSVP.Promise(function (resolve) {
      var router = app.__container__.lookup('router:main'); // Every 10ms, poll for the async thing to have finished

      var watcher = setInterval(() => {
        // 1. If the router is loading, keep polling
        var routerIsLoading = router._routerMicrolib && Boolean(router._routerMicrolib.activeTransition);
        if (routerIsLoading) {
          return;
        } // 2. If there are pending Ajax requests, keep polling

        if ((0, _pending_requests.pendingRequests)()) {
          return;
        } // 3. If there are scheduled timers or we are inside of a run loop, keep polling

        if ((0, _runloop._hasScheduledTimers)() || (0, _runloop._getCurrentRunLoop)()) {
          return;
        }
        if ((0, _waiters.checkWaiters)()) {
          return;
        } // Stop polling

        clearInterval(watcher); // Synchronously resolve the promise

        (0, _runloop.run)(null, resolve, value);
      }, 10);
    });
  }
});
define("ember-testing/lib/initializers", ["@ember/application"], function (_application) {
  "use strict";

  var name = 'deferReadiness in `testing` mode';
  (0, _application.onLoad)('Ember.Application', function (Application) {
    if (!Application.initializers[name]) {
      Application.initializer({
        name: name,
        initialize(application) {
          if (application.testing) {
            application.deferReadiness();
          }
        }
      });
    }
  });
});
define("ember-testing/lib/setup_for_testing", ["exports", "@ember/debug", "@ember/-internals/views", "ember-testing/lib/test/adapter", "ember-testing/lib/test/pending_requests", "ember-testing/lib/adapters/adapter", "ember-testing/lib/adapters/qunit"], function (_exports, _debug, _views, _adapter, _pending_requests, _adapter2, _qunit) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = setupForTesting;
  /* global self */

  /**
    Sets Ember up for testing. This is useful to perform
    basic setup steps in order to unit test.
  
    Use `App.setupForTesting` to perform integration tests (full
    application testing).
  
    @method setupForTesting
    @namespace Ember
    @since 1.5.0
    @private
  */

  function setupForTesting() {
    (0, _debug.setTesting)(true);
    var adapter = (0, _adapter.getAdapter)(); // if adapter is not manually set default to QUnit

    if (!adapter) {
      (0, _adapter.setAdapter)(typeof self.QUnit === 'undefined' ? _adapter2.default.create() : _qunit.default.create());
    }
    if (!_views.jQueryDisabled) {
      (0, _views.jQuery)(document).off('ajaxSend', _pending_requests.incrementPendingRequests);
      (0, _views.jQuery)(document).off('ajaxComplete', _pending_requests.decrementPendingRequests);
      (0, _pending_requests.clearPendingRequests)();
      (0, _views.jQuery)(document).on('ajaxSend', _pending_requests.incrementPendingRequests);
      (0, _views.jQuery)(document).on('ajaxComplete', _pending_requests.decrementPendingRequests);
    }
  }
});
define("ember-testing/lib/support", ["@ember/debug", "@ember/-internals/views", "@ember/-internals/browser-environment"], function (_debug, _views, _browserEnvironment) {
  "use strict";

  /**
    @module ember
  */

  var $ = _views.jQuery;
  /**
    This method creates a checkbox and triggers the click event to fire the
    passed in handler. It is used to correct for a bug in older versions
    of jQuery (e.g 1.8.3).
  
    @private
    @method testCheckboxClick
  */

  function testCheckboxClick(handler) {
    var input = document.createElement('input');
    $(input).attr('type', 'checkbox').css({
      position: 'absolute',
      left: '-1000px',
      top: '-1000px'
    }).appendTo('body').on('click', handler).trigger('click').remove();
  }
  if (_browserEnvironment.hasDOM && !_views.jQueryDisabled) {
    $(function () {
      /*
        Determine whether a checkbox checked using jQuery's "click" method will have
        the correct value for its checked property.
         If we determine that the current jQuery version exhibits this behavior,
        patch it to work correctly as in the commit for the actual fix:
        https://github.com/jquery/jquery/commit/1fb2f92.
      */
      testCheckboxClick(function () {
        if (!this.checked && !$.event.special.click) {
          $.event.special.click = {
            // For checkbox, fire native event so checked state will be right
            trigger() {
              if (this.nodeName === 'INPUT' && this.type === 'checkbox' && this.click) {
                this.click();
                return false;
              }
            }
          };
        }
      }); // Try again to verify that the patch took effect or blow up.

      testCheckboxClick(function () {
        (true && (0, _debug.warn)("clicked checkboxes should be checked! the jQuery patch didn't work", this.checked, {
          id: 'ember-testing.test-checkbox-click'
        }));
      });
    });
  }
});
define("ember-testing/lib/test", ["exports", "ember-testing/lib/test/helpers", "ember-testing/lib/test/on_inject_helpers", "ember-testing/lib/test/promise", "ember-testing/lib/test/waiters", "ember-testing/lib/test/adapter"], function (_exports, _helpers, _on_inject_helpers, _promise, _waiters, _adapter) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
    @module ember
  */

  /**
    This is a container for an assortment of testing related functionality:
  
    * Choose your default test adapter (for your framework of choice).
    * Register/Unregister additional test helpers.
    * Setup callbacks to be fired when the test helpers are injected into
      your application.
  
    @class Test
    @namespace Ember
    @public
  */

  var Test = {
    /**
      Hash containing all known test helpers.
       @property _helpers
      @private
      @since 1.7.0
    */
    _helpers: _helpers.helpers,
    registerHelper: _helpers.registerHelper,
    registerAsyncHelper: _helpers.registerAsyncHelper,
    unregisterHelper: _helpers.unregisterHelper,
    onInjectHelpers: _on_inject_helpers.onInjectHelpers,
    Promise: _promise.default,
    promise: _promise.promise,
    resolve: _promise.resolve,
    registerWaiter: _waiters.registerWaiter,
    unregisterWaiter: _waiters.unregisterWaiter,
    checkWaiters: _waiters.checkWaiters
  };
  /**
   Used to allow ember-testing to communicate with a specific testing
   framework.
  
   You can manually set it before calling `App.setupForTesting()`.
  
   Example:
  
   ```javascript
   Ember.Test.adapter = MyCustomAdapter.create()
   ```
  
   If you do not set it, ember-testing will default to `Ember.Test.QUnitAdapter`.
  
   @public
   @for Ember.Test
   @property adapter
   @type {Class} The adapter to be used.
   @default Ember.Test.QUnitAdapter
  */

  Object.defineProperty(Test, 'adapter', {
    get: _adapter.getAdapter,
    set: _adapter.setAdapter
  });
  var _default = Test;
  _exports.default = _default;
});
define("ember-testing/lib/test/adapter", ["exports", "@ember/-internals/error-handling"], function (_exports, _errorHandling) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.asyncEnd = asyncEnd;
  _exports.asyncStart = asyncStart;
  _exports.getAdapter = getAdapter;
  _exports.setAdapter = setAdapter;
  var adapter;
  function getAdapter() {
    return adapter;
  }
  function setAdapter(value) {
    adapter = value;
    if (value && typeof value.exception === 'function') {
      (0, _errorHandling.setDispatchOverride)(adapterDispatch);
    } else {
      (0, _errorHandling.setDispatchOverride)(null);
    }
  }
  function asyncStart() {
    if (adapter) {
      adapter.asyncStart();
    }
  }
  function asyncEnd() {
    if (adapter) {
      adapter.asyncEnd();
    }
  }
  function adapterDispatch(error) {
    adapter.exception(error);
    console.error(error.stack); // eslint-disable-line no-console
  }
});
define("ember-testing/lib/test/helpers", ["exports", "ember-testing/lib/test/promise"], function (_exports, _promise) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.helpers = void 0;
  _exports.registerAsyncHelper = registerAsyncHelper;
  _exports.registerHelper = registerHelper;
  _exports.unregisterHelper = unregisterHelper;
  var helpers = {};
  /**
   @module @ember/test
  */

  /**
    `registerHelper` is used to register a test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    import { registerHelper } from '@ember/test';
    import { run } from '@ember/runloop';
  
    registerHelper('boot', function(app) {
      run(app, app.advanceReadiness);
    });
    ```
  
    This helper can later be called without arguments because it will be
    called with `app` as the first parameter.
  
    ```javascript
    import Application from '@ember/application';
  
    App = Application.create();
    App.injectTestHelpers();
    boot();
    ```
  
    @public
    @for @ember/test
    @static
    @method registerHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @param options {Object}
  */
  _exports.helpers = helpers;
  function registerHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: {
        wait: false
      }
    };
  }
  /**
    `registerAsyncHelper` is used to register an async test helper that will be injected
    when `App.injectTestHelpers` is called.
  
    The helper method will always be called with the current Application as
    the first parameter.
  
    For example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
    import { run } from '@ember/runloop';
  
    registerAsyncHelper('boot', function(app) {
      run(app, app.advanceReadiness);
    });
    ```
  
    The advantage of an async helper is that it will not run
    until the last async helper has completed.  All async helpers
    after it will wait for it complete before running.
  
  
    For example:
  
    ```javascript
    import { registerAsyncHelper } from '@ember/test';
  
    registerAsyncHelper('deletePost', function(app, postId) {
      click('.delete-' + postId);
    });
  
    // ... in your test
    visit('/post/2');
    deletePost(2);
    visit('/post/3');
    deletePost(3);
    ```
  
    @public
    @for @ember/test
    @method registerAsyncHelper
    @param {String} name The name of the helper method to add.
    @param {Function} helperMethod
    @since 1.2.0
  */

  function registerAsyncHelper(name, helperMethod) {
    helpers[name] = {
      method: helperMethod,
      meta: {
        wait: true
      }
    };
  }
  /**
    Remove a previously added helper method.
  
    Example:
  
    ```javascript
    import { unregisterHelper } from '@ember/test';
  
    unregisterHelper('wait');
    ```
  
    @public
    @method unregisterHelper
    @static
    @for @ember/test
    @param {String} name The helper to remove.
  */

  function unregisterHelper(name) {
    delete helpers[name];
    delete _promise.default.prototype[name];
  }
});
define("ember-testing/lib/test/on_inject_helpers", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.callbacks = void 0;
  _exports.invokeInjectHelpersCallbacks = invokeInjectHelpersCallbacks;
  _exports.onInjectHelpers = onInjectHelpers;
  var callbacks = [];
  /**
    Used to register callbacks to be fired whenever `App.injectTestHelpers`
    is called.
  
    The callback will receive the current application as an argument.
  
    Example:
  
    ```javascript
    import $ from 'jquery';
  
    Ember.Test.onInjectHelpers(function() {
      $(document).ajaxSend(function() {
        Test.pendingRequests++;
      });
  
      $(document).ajaxComplete(function() {
        Test.pendingRequests--;
      });
    });
    ```
  
    @public
    @for Ember.Test
    @method onInjectHelpers
    @param {Function} callback The function to be called.
  */
  _exports.callbacks = callbacks;
  function onInjectHelpers(callback) {
    callbacks.push(callback);
  }
  function invokeInjectHelpersCallbacks(app) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](app);
    }
  }
});
define("ember-testing/lib/test/pending_requests", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.clearPendingRequests = clearPendingRequests;
  _exports.decrementPendingRequests = decrementPendingRequests;
  _exports.incrementPendingRequests = incrementPendingRequests;
  _exports.pendingRequests = pendingRequests;
  var requests = [];
  function pendingRequests() {
    return requests.length;
  }
  function clearPendingRequests() {
    requests.length = 0;
  }
  function incrementPendingRequests(_, xhr) {
    requests.push(xhr);
  }
  function decrementPendingRequests(_, xhr) {
    setTimeout(function () {
      for (var i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
          break;
        }
      }
    }, 0);
  }
});
define("ember-testing/lib/test/promise", ["exports", "@ember/-internals/runtime", "ember-testing/lib/test/run"], function (_exports, _runtime, _run) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _exports.getLastPromise = getLastPromise;
  _exports.promise = promise;
  _exports.resolve = resolve;
  var lastPromise;
  class TestPromise extends _runtime.RSVP.Promise {
    constructor() {
      super(...arguments);
      lastPromise = this;
    }
    then(_onFulfillment) {
      var onFulfillment = typeof _onFulfillment === 'function' ? result => isolate(_onFulfillment, result) : undefined;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return super.then(onFulfillment, ...args);
    }
  }
  /**
    This returns a thenable tailored for testing.  It catches failed
    `onSuccess` callbacks and invokes the `Ember.Test.adapter.exception`
    callback in the last chained then.
  
    This method should be returned by async helpers such as `wait`.
  
    @public
    @for Ember.Test
    @method promise
    @param {Function} resolver The function used to resolve the promise.
    @param {String} label An optional string for identifying the promise.
  */
  _exports.default = TestPromise;
  function promise(resolver, label) {
    var fullLabel = `Ember.Test.promise: ${label || '<Unknown Promise>'}`;
    return new TestPromise(resolver, fullLabel);
  }
  /**
    Replacement for `Ember.RSVP.resolve`
    The only difference is this uses
    an instance of `Ember.Test.Promise`
  
    @public
    @for Ember.Test
    @method resolve
    @param {Mixed} The value to resolve
    @since 1.2.0
  */

  function resolve(result, label) {
    return TestPromise.resolve(result, label);
  }
  function getLastPromise() {
    return lastPromise;
  } // This method isolates nested async methods
  // so that they don't conflict with other last promises.
  //
  // 1. Set `Ember.Test.lastPromise` to null
  // 2. Invoke method
  // 3. Return the last promise created during method

  function isolate(onFulfillment, result) {
    // Reset lastPromise for nested helpers
    lastPromise = null;
    var value = onFulfillment(result);
    var promise = lastPromise;
    lastPromise = null; // If the method returned a promise
    // return that promise. If not,
    // return the last async helper's promise

    if (value && value instanceof TestPromise || !promise) {
      return value;
    } else {
      return (0, _run.default)(() => resolve(promise).then(() => value));
    }
  }
});
define("ember-testing/lib/test/run", ["exports", "@ember/runloop"], function (_exports, _runloop) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = run;
  function run(fn) {
    if (!(0, _runloop._getCurrentRunLoop)()) {
      return (0, _runloop.run)(fn);
    } else {
      return fn();
    }
  }
});
define("ember-testing/lib/test/waiters", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.checkWaiters = checkWaiters;
  _exports.registerWaiter = registerWaiter;
  _exports.unregisterWaiter = unregisterWaiter;
  /**
   @module @ember/test
  */
  var contexts = [];
  var callbacks = [];
  /**
     This allows ember-testing to play nicely with other asynchronous
     events, such as an application that is waiting for a CSS3
     transition or an IndexDB transaction. The waiter runs periodically
     after each async helper (i.e. `click`, `andThen`, `visit`, etc) has executed,
     until the returning result is truthy. After the waiters finish, the next async helper
     is executed and the process repeats.
  
     For example:
  
     ```javascript
     import { registerWaiter } from '@ember/test';
  
     registerWaiter(function() {
       return myPendingTransactions() === 0;
     });
     ```
     The `context` argument allows you to optionally specify the `this`
     with which your callback will be invoked.
  
     For example:
  
     ```javascript
     import { registerWaiter } from '@ember/test';
  
     registerWaiter(MyDB, MyDB.hasPendingTransactions);
     ```
  
     @public
     @for @ember/test
     @static
     @method registerWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function registerWaiter(context, callback) {
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    if (indexOf(context, callback) > -1) {
      return;
    }
    contexts.push(context);
    callbacks.push(callback);
  }
  /**
     `unregisterWaiter` is used to unregister a callback that was
     registered with `registerWaiter`.
  
     @public
     @for @ember/test
     @static
     @method unregisterWaiter
     @param {Object} context (optional)
     @param {Function} callback
     @since 1.2.0
  */

  function unregisterWaiter(context, callback) {
    if (!callbacks.length) {
      return;
    }
    if (arguments.length === 1) {
      callback = context;
      context = null;
    }
    var i = indexOf(context, callback);
    if (i === -1) {
      return;
    }
    contexts.splice(i, 1);
    callbacks.splice(i, 1);
  }
  /**
    Iterates through each registered test waiter, and invokes
    its callback. If any waiter returns false, this method will return
    true indicating that the waiters have not settled yet.
  
    This is generally used internally from the acceptance/integration test
    infrastructure.
  
    @public
    @for @ember/test
    @static
    @method checkWaiters
  */

  function checkWaiters() {
    if (!callbacks.length) {
      return false;
    }
    for (var i = 0; i < callbacks.length; i++) {
      var context = contexts[i];
      var callback = callbacks[i];
      if (!callback.call(context)) {
        return true;
      }
    }
    return false;
  }
  function indexOf(context, callback) {
    for (var i = 0; i < callbacks.length; i++) {
      if (callbacks[i] === callback && contexts[i] === context) {
        return i;
      }
    }
    return -1;
  }
});
require('ember-testing');
}());

(function() {
  var key = '_embroider_macros_runtime_config';
  if (!window[key]) {
    window[key] = [];
  }
  window[key].push(function(m) {
    m.setGlobalConfig(
      '@embroider/macros',
      Object.assign({}, m.getGlobalConfig()['@embroider/macros'], { isTesting: true })
    );
  });
})();

define("@ember/test-helpers/-internal/build-registry", ["exports", "@ember/application/instance", "@ember/application", "@ember/object", "require", "ember"], function (_exports, _instance, _application, _object, _require, _ember) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _default;
  /**
   * Adds methods that are normally only on registry to the container. This is largely to support the legacy APIs
   * that are not using `owner` (but are still using `this.container`).
   *
   * @private
   * @param {Object} container  the container to modify
   */
  function exposeRegistryMethodsWithoutDeprecations(container) {
    let methods = ['register', 'unregister', 'resolve', 'normalize', 'typeInjection', 'injection', 'factoryInjection', 'factoryTypeInjection', 'has', 'options', 'optionsForType'];
    for (let i = 0, l = methods.length; i < l; i++) {
      let methodName = methods[i];
      if (methodName && methodName in container) {
        const knownMethod = methodName;
        container[knownMethod] = function () {
          return container._registry[knownMethod](...arguments);
        };
      }
    }
  }
  const RegistryProxyMixin = _ember.default._RegistryProxyMixin;
  const ContainerProxyMixin = _ember.default._ContainerProxyMixin;
  const Owner = _object.default.extend(RegistryProxyMixin, ContainerProxyMixin, {
    _emberTestHelpersMockOwner: true,
    /**
     * Unregister a factory and its instance.
     *
     * Overrides `RegistryProxy#unregister` in order to clear any cached instances
     * of the unregistered factory.
     *
     * @param {string} fullName Name of the factory to unregister.
     *
     * @see {@link https://github.com/emberjs/ember.js/pull/12680}
     * @see {@link https://github.com/emberjs/ember.js/blob/v4.5.0-alpha.5/packages/%40ember/engine/instance.ts#L152-L167}
     */
    unregister(fullName) {
      this['__container__'].reset(fullName);

      // We overwrote this method from RegistryProxyMixin.
      this['__registry__'].unregister(fullName);
    }
  });

  /**
   * @private
   * @param {Object} resolver the resolver to use with the registry
   * @returns {Object} owner, container, registry
   */
  function _default(resolver) {
    let fallbackRegistry, registry, container;
    let namespace = _object.default.create({
      Resolver: {
        create() {
          return resolver;
        }
      }
    });
    fallbackRegistry = _application.default.buildRegistry(namespace);
    // TODO: only do this on Ember < 3.13
    fallbackRegistry.register('component-lookup:main', _ember.default.ComponentLookup);
    registry = new _ember.default.Registry({
      fallback: fallbackRegistry
    });
    _instance.default.setupRegistry(registry);

    // these properties are set on the fallback registry by `buildRegistry`
    // and on the primary registry within the ApplicationInstance constructor
    // but we need to manually recreate them since ApplicationInstance's are not
    // exposed externally
    registry.normalizeFullName = fallbackRegistry.normalizeFullName;
    registry.makeToString = fallbackRegistry.makeToString;
    registry.describe = fallbackRegistry.describe;
    let owner = Owner.create({
      __registry__: registry,
      __container__: null
    });
    container = registry.container({
      owner: owner
    });
    owner.__container__ = container;
    exposeRegistryMethodsWithoutDeprecations(container);
    if ((0, _require.has)('ember-data/setup-container')) {
      // ember-data is a proper ember-cli addon since 2.3; if no 'import
      // 'ember-data'' is present somewhere in the tests, there is also no `DS`
      // available on the globalContext and hence ember-data wouldn't be setup
      // correctly for the tests; that's why we import and call setupContainer
      // here; also see https://github.com/emberjs/data/issues/4071 for context
      let setupContainer = (0, _require.default)("ember-data/setup-container")['default'];
      setupContainer(registry || container);
    }
    return {
      registry,
      container,
      owner
    };
  }
});
define("@ember/test-helpers/-internal/debug-info-helpers", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.debugInfoHelpers = void 0;
  _exports.default = registerDebugInfoHelper;
  const debugInfoHelpers = new Set();

  /**
   * Registers a custom debug info helper to augment the output for test isolation validation.
   *
   * @public
   * @param {DebugInfoHelper} debugHelper a custom debug info helper
   * @example
   *
   * import { registerDebugInfoHelper } from '@ember/test-helpers';
   *
   * registerDebugInfoHelper({
   *   name: 'Date override detection',
   *   log() {
   *     if (dateIsOverridden()) {
   *       console.log(this.name);
   *       console.log('The date object has been overridden');
   *     }
   *   }
   * })
   */
  _exports.debugInfoHelpers = debugInfoHelpers;
  function registerDebugInfoHelper(debugHelper) {
    debugInfoHelpers.add(debugHelper);
  }
});
define("@ember/test-helpers/-internal/debug-info", ["exports", "@ember/runloop", "@ember/test-helpers/-internal/debug-info-helpers", "@ember/test-waiters"], function (_exports, _runloop, _debugInfoHelpers, _testWaiters) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TestDebugInfo = void 0;
  _exports.backburnerDebugInfoAvailable = backburnerDebugInfoAvailable;
  _exports.getDebugInfo = getDebugInfo;
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  const PENDING_AJAX_REQUESTS = 'Pending AJAX requests';
  const PENDING_TEST_WAITERS = 'Pending test waiters';
  const SCHEDULED_ASYNC = 'Scheduled async';
  const SCHEDULED_AUTORUN = 'Scheduled autorun';
  /**
   * Determines if the `getDebugInfo` method is available in the
   * running verison of backburner.
   *
   * @returns {boolean} True if `getDebugInfo` is present in backburner, otherwise false.
   */
  function backburnerDebugInfoAvailable() {
    return typeof _runloop._backburner.getDebugInfo === 'function';
  }

  /**
   * Retrieves debug information from backburner's current deferred actions queue (runloop instance).
   * If the `getDebugInfo` method isn't available, it returns `null`.
   *
   * @public
   * @returns {MaybeDebugInfo | null} Backburner debugInfo or, if the getDebugInfo method is not present, null
   */
  function getDebugInfo() {
    return _runloop._backburner.DEBUG === true && backburnerDebugInfoAvailable() ? _runloop._backburner.getDebugInfo() : null;
  }

  /**
   * Encapsulates debug information for an individual test. Aggregates information
   * from:
   * - info provided by getSettledState
   *    - hasPendingTimers
   *    - hasRunLoop
   *    - hasPendingWaiters
   *    - hasPendingRequests
   * - info provided by backburner's getDebugInfo method (timers, schedules, and stack trace info)
   *
   */
  class TestDebugInfo {
    constructor(settledState) {
      let debugInfo = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : getDebugInfo();
      _defineProperty(this, "_summaryInfo", undefined);
      this._settledState = settledState;
      this._debugInfo = debugInfo;
    }
    get summary() {
      if (!this._summaryInfo) {
        this._summaryInfo = {
          ...this._settledState
        };
        if (this._debugInfo) {
          this._summaryInfo.autorunStackTrace = this._debugInfo.autorun && this._debugInfo.autorun.stack;
          this._summaryInfo.pendingTimersCount = this._debugInfo.timers.length;
          this._summaryInfo.hasPendingTimers = this._settledState.hasPendingTimers && this._summaryInfo.pendingTimersCount > 0;
          this._summaryInfo.pendingTimersStackTraces = this._debugInfo.timers.map(timer => timer.stack);
          this._summaryInfo.pendingScheduledQueueItemCount = this._debugInfo.instanceStack.filter(q => q).reduce((total, item) => {
            Object.keys(item).forEach(queueName => {
              // SAFETY: this cast is *not* safe, but the underlying type is
              // not currently able to be safer than this because it was
              // built as a bag-of-queues *and* a structured item originally.
              total += item[queueName].length;
            });
            return total;
          }, 0);
          this._summaryInfo.pendingScheduledQueueItemStackTraces = this._debugInfo.instanceStack.filter(q => q).reduce((stacks, deferredActionQueues) => {
            Object.keys(deferredActionQueues).forEach(queue => {
              // SAFETY: this cast is *not* safe, but the underlying type is
              // not currently able to be safer than this because it was
              // built as a bag-of-queues *and* a structured item originally.
              deferredActionQueues[queue].forEach(queueItem => queueItem.stack && stacks.push(queueItem.stack));
            });
            return stacks;
          }, []);
        }
        if (this._summaryInfo.hasPendingTestWaiters) {
          this._summaryInfo.pendingTestWaiterInfo = (0, _testWaiters.getPendingWaiterState)();
        }
      }
      return this._summaryInfo;
    }
    toConsole() {
      let _console = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : console;
      let summary = this.summary;
      if (summary.hasPendingRequests) {
        _console.log(PENDING_AJAX_REQUESTS);
      }
      if (summary.hasPendingLegacyWaiters) {
        _console.log(PENDING_TEST_WAITERS);
      }
      if (summary.hasPendingTestWaiters) {
        if (!summary.hasPendingLegacyWaiters) {
          _console.log(PENDING_TEST_WAITERS);
        }
        Object.keys(summary.pendingTestWaiterInfo.waiters).forEach(waiterName => {
          let waiterDebugInfo = summary.pendingTestWaiterInfo.waiters[waiterName];
          if (Array.isArray(waiterDebugInfo)) {
            _console.group(waiterName);
            waiterDebugInfo.forEach(debugInfo => {
              _console.log(`${debugInfo.label ? debugInfo.label : 'stack'}: ${debugInfo.stack}`);
            });
            _console.groupEnd();
          } else {
            _console.log(waiterName);
          }
        });
      }
      if (summary.hasPendingTimers || summary.pendingScheduledQueueItemCount > 0) {
        _console.group(SCHEDULED_ASYNC);
        summary.pendingTimersStackTraces.forEach(timerStack => {
          _console.log(timerStack);
        });
        summary.pendingScheduledQueueItemStackTraces.forEach(scheduleQueueItemStack => {
          _console.log(scheduleQueueItemStack);
        });
        _console.groupEnd();
      }
      if (summary.hasRunLoop && summary.pendingTimersCount === 0 && summary.pendingScheduledQueueItemCount === 0) {
        _console.log(SCHEDULED_AUTORUN);
        if (summary.autorunStackTrace) {
          _console.log(summary.autorunStackTrace);
        }
      }
      _debugInfoHelpers.debugInfoHelpers.forEach(helper => {
        helper.log();
      });
    }
    _formatCount(title, count) {
      return `${title}: ${count}`;
    }
  }
  _exports.TestDebugInfo = TestDebugInfo;
});
define("@ember/test-helpers/-internal/deprecations", ["exports", "@ember/debug", "@ember/test-helpers/-internal/is-promise"], function (_exports, _debug, _isPromise) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getDeprecationsDuringCallbackForContext = getDeprecationsDuringCallbackForContext;
  _exports.getDeprecationsForContext = getDeprecationsForContext;
  const DEPRECATIONS = new WeakMap();

  /**
   *
   * Provides the list of deprecation failures associated with a given base context;
   *
   * @private
   * @param {BaseContext} [context] the test context
   * @return {Array<DeprecationFailure>} the Deprecation Failures associated with the corresponding BaseContext;
   */
  function getDeprecationsForContext(context) {
    if (!context) {
      throw new TypeError(`[@ember/test-helpers] could not get deprecations for an invalid test context: '${context}'`);
    }
    let deprecations = DEPRECATIONS.get(context);
    if (!Array.isArray(deprecations)) {
      deprecations = [];
      DEPRECATIONS.set(context, deprecations);
    }
    return deprecations;
  }

  /**
   *
   * Provides the list of deprecation failures associated with a given base
   * context which occure while a callback is executed. This callback can be
   * synchonous, or it can be an async function.
   *
   * @private
   * @param {BaseContext} [context] the test context
   * @param {Function} [callback] The callback that when executed will have its DeprecationFailure recorded
   * @return {Array<DeprecationFailure>} The Deprecation Failures associated with the corresponding baseContext which occured while the CallbackFunction was executed
   */
  function getDeprecationsDuringCallbackForContext(context, callback) {
    if (!context) {
      throw new TypeError(`[@ember/test-helpers] could not get deprecations for an invalid test context: '${context}'`);
    }
    const deprecations = getDeprecationsForContext(context);
    const previousLength = deprecations.length;
    const result = callback();
    if ((0, _isPromise.default)(result)) {
      return Promise.resolve(result).then(() => {
        return deprecations.slice(previousLength); // only return deprecations created as a result of the callback
      });
    } else {
      return deprecations.slice(previousLength); // only return deprecations created as a result of the callback
    }
  }

  // This provides (when the environment supports) queryParam support for deprecations:
  // * squelch deprecations by name via: `/tests/index.html?disabledDeprecations=this-property-fallback,some-other-thing`
  // * enable a debuggger when a deprecation by a specific name is encountered via: `/tests/index.html?debugDeprecations=some-other-thing` when the
  if (typeof URLSearchParams !== 'undefined') {
    let queryParams = new URLSearchParams(document.location.search.substring(1));
    const disabledDeprecations = queryParams.get('disabledDeprecations');
    const debugDeprecations = queryParams.get('debugDeprecations');

    // When using `/tests/index.html?disabledDeprecations=this-property-fallback,some-other-thing`
    // those deprecations will be squelched
    if (disabledDeprecations) {
      (0, _debug.registerDeprecationHandler)((message, options, next) => {
        if (!options || !disabledDeprecations.includes(options.id)) {
          next.apply(null, [message, options]);
        }
      });
    }

    // When using `/tests/index.html?debugDeprecations=some-other-thing` when the
    // `some-other-thing` deprecation is triggered, this `debugger` will be hit`
    if (debugDeprecations) {
      (0, _debug.registerDeprecationHandler)((message, options, next) => {
        if (options && debugDeprecations.includes(options.id)) {
          debugger; // eslint-disable-line no-debugger
        }

        next.apply(null, [message, options]);
      });
    }
  }
});
define("@ember/test-helpers/-internal/get-component-manager", ["exports", "@embroider/macros/es-compat", "@embroider/macros/runtime", "ember"], function (_exports, _esCompat, _runtime, _ember) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let getComponentManager;
  if ((0, _runtime.macroCondition)(true)) {
    let _getComponentManager =
    //@ts-ignore
    (0, _esCompat.default)(require("@glimmer/manager")).getInternalComponentManager;
    getComponentManager = (definition, owner) => {
      return _getComponentManager(definition, true);
    };
  } else if ((0, _runtime.macroCondition)(true)) {
    let _getComponentManager = _ember.default.__loader.require('@glimmer/manager').getInternalComponentManager;
    getComponentManager = (definition, owner) => {
      return _getComponentManager(definition, true);
    };
  } else {
    let _getComponentManager = _ember.default.__loader.require('@glimmer/runtime').getComponentManager;
    getComponentManager = (definition, owner) => {
      return _getComponentManager(owner, definition);
    };
  }
  var _default = getComponentManager;
  _exports.default = _default;
});
define("@ember/test-helpers/-internal/helper-hooks", ["exports", "@ember/test-helpers/-utils"], function (_exports, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.registerHook = registerHook;
  _exports.runHooks = runHooks;
  const registeredHooks = new Map();

  /**
   * @private
   * @param {string} helperName The name of the test helper in which to run the hook.
   * @param {string} label A label to help identify the hook.
   * @returns {string} The compound key for the helper.
   */
  function getHelperKey(helperName, label) {
    return `${helperName}:${label}`;
  }

  /**
   * Registers a hook function to be run during the invocation of a test helper.
   *
   * @private
   * @param {string} helperName The name of the test helper in which to run the hook.
   * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
   *                       designating the start of the helper invocation and the end.
   * @param {Function} hook The hook function to run when the test helper is invoked.
   * @returns {HookUnregister} An object containing an unregister function that will unregister
   *                           the specific hook registered to the helper.
   */
  function registerHook(helperName, label, hook) {
    let helperKey = getHelperKey(helperName, label);
    let hooksForHelper = registeredHooks.get(helperKey);
    if (hooksForHelper === undefined) {
      hooksForHelper = new Set();
      registeredHooks.set(helperKey, hooksForHelper);
    }
    hooksForHelper.add(hook);
    return {
      unregister() {
        hooksForHelper.delete(hook);
      }
    };
  }

  /**
   * Runs all hooks registered for a specific test helper.
   *
   * @private
   * @param {string} helperName  The name of the test helper.
   * @param {string} label A label to help identify the hook. Built-in labels are `start` and `end`,
   *                       designating the start of the helper invocation and the end.
   * @param {any[]} args Any arguments originally passed to the test helper.
   * @returns {Promise<void>} A promise representing the serial invocation of the hooks.
   */
  function runHooks(helperName, label) {
    for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }
    let hooks = registeredHooks.get(getHelperKey(helperName, label)) || new Set();
    let promises = [];
    hooks.forEach(hook => {
      let hookResult = hook(...args);
      promises.push(hookResult);
    });
    return _utils.Promise.all(promises).then(() => {});
  }
});
define("@ember/test-helpers/-internal/is-component", ["exports", "@embroider/macros/runtime", "@ember/test-helpers/-internal/get-component-manager"], function (_exports, _runtime, _getComponentManager) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
   * We should ultimately get a new API from @glimmer/runtime that provides this functionality
   * (see https://github.com/emberjs/rfcs/pull/785 for more info).
   * @private
   * @param {Object} maybeComponent The thing you think might be a component
   * @param {Object} owner Owner, we need this for old versions of getComponentManager
   * @returns {boolean} True if it's a component, false if not
   */
  function isComponent(maybeComponent, owner) {
    if ((0, _runtime.macroCondition)(true)) {
      return !!(0, _getComponentManager.default)(maybeComponent, owner);
    } else {
      return !!(0, _getComponentManager.default)(maybeComponent, owner) || ['@ember/component', '@ember/component/template-only'].includes(maybeComponent.toString());
    }
  }
  var _default = isComponent;
  _exports.default = _default;
});
define("@ember/test-helpers/-internal/is-promise", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = _default;
  /**
   *
   * detect if a value appears to be a promise
   *
   * @private
   * @param {any} [maybePromise] the value being considered to be a promise
   * @return {boolean} true if the value appears to be a promise, or false otherwise
   */
  function _default(maybePromise) {
    return maybePromise !== null && (typeof maybePromise === 'object' || typeof maybePromise === 'function') && typeof maybePromise.then === 'function';
  }
});
define("@ember/test-helpers/-internal/promise-polyfill", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  // @ts-nocheck
  /* eslint-disable */
  /* globals globalThis global setImmediate */
  /*
  Using the same promise polyfill that is used in qunit@2.14.0 (see https://git.io/JtMxC).
  
  https://github.com/taylorhakes/promise-polyfill/tree/8.2.0
  
  Copyright 2014 Taylor Hakes
  Copyright 2014 Forbes Lindesay
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
  
  -------
  
  Patches from promise-polyfill@8.2.0 for use in QUnit:
  
  - 2021-01-09: Export as module only, don't change global scope as QUnit must not
    affect the host context (e.g. people may test their application intentionally
    with different or no polyfills and we must not affect that).
  
  - 2021-01-10: Avoid unconditional reference to setTimeout, which isn't supported
    on SpiderMonkey (mozjs 68). Done by re-arranging the code so that we return early
    (it has native support for Promise), instead of building an unused polyfill.
  
  - 2021-01-10: Add 'globalThis' to globalNS implementation to support SpiderMonkey.
  */
  var _default = function () {
    'use strict';

    /** @suppress {undefinedVars} */
    let globalNS = function () {
      // the only reliable means to get the global object is
      // `Function('return this')()`
      // However, this causes CSP violations in Chrome apps.
      if (typeof globalThis !== 'undefined') {
        return globalThis;
      }
      if (typeof self !== 'undefined') {
        return self;
      }
      if (typeof window !== 'undefined') {
        return window;
      }
      if (typeof global !== 'undefined') {
        return global;
      }
      throw new Error('unable to locate global object');
    }();

    // Expose the polyfill if Promise is undefined or set to a
    // non-function value. The latter can be due to a named HTMLElement
    // being exposed by browsers for legacy reasons.
    // https://github.com/taylorhakes/promise-polyfill/issues/114
    if (typeof globalNS['Promise'] === 'function') {
      return globalNS['Promise'];
    }

    /**
     * @this {Promise}
     */
    function finallyConstructor(callback) {
      let constructor = this.constructor;
      return this.then(function (value) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function () {
          return value;
        });
      }, function (reason) {
        // @ts-ignore
        return constructor.resolve(callback()).then(function () {
          // @ts-ignore
          return constructor.reject(reason);
        });
      });
    }
    function allSettled(arr) {
      let P = this;
      return new P(function (resolve, reject) {
        if (!(arr && typeof arr.length !== 'undefined')) {
          return reject(new TypeError(typeof arr + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));
        }
        let args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        let remaining = args.length;
        function res(i, val) {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            let then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, function (e) {
                args[i] = {
                  status: 'rejected',
                  reason: e
                };
                if (--remaining === 0) {
                  resolve(args);
                }
              });
              return;
            }
          }
          args[i] = {
            status: 'fulfilled',
            value: val
          };
          if (--remaining === 0) {
            resolve(args);
          }
        }
        for (let i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    }

    // Store setTimeout reference so promise-polyfill will be unaffected by
    // other code modifying setTimeout (like sinon.useFakeTimers())
    let setTimeoutFunc = setTimeout;
    function isArray(x) {
      return Boolean(x && typeof x.length !== 'undefined');
    }
    function noop() {}

    // Polyfill for Function.prototype.bind
    function bind(fn, thisArg) {
      return function () {
        fn.apply(thisArg, arguments);
      };
    }

    /**
     * @constructor
     * @param {Function} fn
     */
    function Promise(fn) {
      if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');
      if (typeof fn !== 'function') throw new TypeError('not a function');
      /** @type {!number} */
      this._state = 0;
      /** @type {!boolean} */
      this._handled = false;
      /** @type {Promise|undefined} */
      this._value = undefined;
      /** @type {!Array<!Function>} */
      this._deferreds = [];
      doResolve(fn, this);
    }
    function handle(self, deferred) {
      while (self._state === 3) {
        self = self._value;
      }
      if (self._state === 0) {
        self._deferreds.push(deferred);
        return;
      }
      self._handled = true;
      Promise._immediateFn(function () {
        let cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
        if (cb === null) {
          (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
          return;
        }
        let ret;
        try {
          ret = cb(self._value);
        } catch (e) {
          reject(deferred.promise, e);
          return;
        }
        resolve(deferred.promise, ret);
      });
    }
    function resolve(self, newValue) {
      try {
        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
        if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
          let then = newValue.then;
          if (newValue instanceof Promise) {
            self._state = 3;
            self._value = newValue;
            finale(self);
            return;
          } else if (typeof then === 'function') {
            doResolve(bind(then, newValue), self);
            return;
          }
        }
        self._state = 1;
        self._value = newValue;
        finale(self);
      } catch (e) {
        reject(self, e);
      }
    }
    function reject(self, newValue) {
      self._state = 2;
      self._value = newValue;
      finale(self);
    }
    function finale(self) {
      if (self._state === 2 && self._deferreds.length === 0) {
        Promise._immediateFn(function () {
          if (!self._handled) {
            Promise._unhandledRejectionFn(self._value);
          }
        });
      }
      for (let i = 0, len = self._deferreds.length; i < len; i++) {
        handle(self, self._deferreds[i]);
      }
      self._deferreds = null;
    }

    /**
     * @constructor
     */
    function Handler(onFulfilled, onRejected, promise) {
      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
      this.onRejected = typeof onRejected === 'function' ? onRejected : null;
      this.promise = promise;
    }

    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, self) {
      let done = false;
      try {
        fn(function (value) {
          if (done) return;
          done = true;
          resolve(self, value);
        }, function (reason) {
          if (done) return;
          done = true;
          reject(self, reason);
        });
      } catch (ex) {
        if (done) return;
        done = true;
        reject(self, ex);
      }
    }
    Promise.prototype['catch'] = function (onRejected) {
      return this.then(null, onRejected);
    };
    Promise.prototype.then = function (onFulfilled, onRejected) {
      // @ts-ignore
      let prom = new this.constructor(noop);
      handle(this, new Handler(onFulfilled, onRejected, prom));
      return prom;
    };
    Promise.prototype['finally'] = finallyConstructor;
    Promise.all = function (arr) {
      return new Promise(function (resolve, reject) {
        if (!isArray(arr)) {
          return reject(new TypeError('Promise.all accepts an array'));
        }
        let args = Array.prototype.slice.call(arr);
        if (args.length === 0) return resolve([]);
        let remaining = args.length;
        function res(i, val) {
          try {
            if (val && (typeof val === 'object' || typeof val === 'function')) {
              let then = val.then;
              if (typeof then === 'function') {
                then.call(val, function (val) {
                  res(i, val);
                }, reject);
                return;
              }
            }
            args[i] = val;
            if (--remaining === 0) {
              resolve(args);
            }
          } catch (ex) {
            reject(ex);
          }
        }
        for (let i = 0; i < args.length; i++) {
          res(i, args[i]);
        }
      });
    };
    Promise.allSettled = allSettled;
    Promise.resolve = function (value) {
      if (value && typeof value === 'object' && value.constructor === Promise) {
        return value;
      }
      return new Promise(function (resolve) {
        resolve(value);
      });
    };
    Promise.reject = function (value) {
      return new Promise(function (_resolve, reject) {
        reject(value);
      });
    };
    Promise.race = function (arr) {
      return new Promise(function (resolve, reject) {
        if (!isArray(arr)) {
          return reject(new TypeError('Promise.race accepts an array'));
        }
        for (let i = 0, len = arr.length; i < len; i++) {
          Promise.resolve(arr[i]).then(resolve, reject);
        }
      });
    };

    // Use polyfill for setImmediate for performance gains
    Promise._immediateFn =
    // @ts-ignore
    typeof setImmediate === 'function' && function (fn) {
      // @ts-ignore
      setImmediate(fn);
    } || function (fn) {
      setTimeoutFunc(fn, 0);
    };
    Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
      if (typeof console !== 'undefined' && console) {
        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
      }
    };

    return Promise;
  }();
  _exports.default = _default;
});
define("@ember/test-helpers/-internal/render-settled", ["exports", "@embroider/macros/es-compat", "@embroider/macros/runtime", "ember"], function (_exports, _esCompat, _runtime, _ember) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  let renderSettled;
  if ((0, _runtime.macroCondition)(false)) {
    //@ts-ignore
    renderSettled = (0, _esCompat.default)(require("@ember/renderer")).renderSettled;
  } else if ((0, _runtime.macroCondition)(true)) {
    //@ts-ignore
    renderSettled = (0, _esCompat.default)(require("@ember/-internals/glimmer")).renderSettled;
  } else if ((0, _runtime.macroCondition)(true)) {
    renderSettled = _ember.default.__loader.require('@ember/-internals/glimmer').renderSettled;
  } else {
    renderSettled = _ember.default.__loader.require('ember-glimmer').renderSettled;
  }
  var _default = renderSettled;
  _exports.default = _default;
});
define("@ember/test-helpers/-internal/warnings", ["exports", "@ember/debug", "@ember/test-helpers/-internal/is-promise"], function (_exports, _debug, _isPromise) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getWarningsDuringCallbackForContext = getWarningsDuringCallbackForContext;
  _exports.getWarningsForContext = getWarningsForContext;
  // the WARNINGS data structure which is used to weakly associated warnings with
  // the test context their occured within
  const WARNINGS = new WeakMap();

  /**
   *
   * Provides the list of warnings associated with a given base context;
   *
   * @private
   * @param {BaseContext} [context] the test context
   * @return {Array<Warning>} the warnings associated with the corresponding BaseContext;
   */
  function getWarningsForContext(context) {
    if (!context) {
      throw new TypeError(`[@ember/test-helpers] could not get warnings for an invalid test context: '${context}'`);
    }
    let warnings = WARNINGS.get(context);
    if (!Array.isArray(warnings)) {
      warnings = [];
      WARNINGS.set(context, warnings);
    }
    return warnings;
  }

  /**
   *
   * Provides the list of warnings associated with a given test context which
   * occured only while a the provided callback is executed. This callback can be
   * synchonous, or it can be an async function.
   *
   * @private
   * @param {BaseContext} [context] the test context
   * @param {Function} [callback] The callback that when executed will have its warnings recorded
   * @return {Array<Warning>} The warnings associated with the corresponding baseContext which occured while the CallbackFunction was executed
   */
  function getWarningsDuringCallbackForContext(context, callback) {
    if (!context) {
      throw new TypeError(`[@ember/test-helpers] could not get warnings for an invalid test context: '${context}'`);
    }
    const warnings = getWarningsForContext(context);
    const previousLength = warnings.length;
    const result = callback();
    if ((0, _isPromise.default)(result)) {
      return Promise.resolve(result).then(() => {
        return warnings.slice(previousLength); // only return warnings created as a result of the callback
      });
    } else {
      return warnings.slice(previousLength); // only return warnings created as a result of the callback
    }
  }

  // This provides (when the environment supports) queryParam support for warnings:
  // * squelch warnings by name via: `/tests/index.html?disabledWarnings=this-property-fallback,some-other-thing`
  // * enable a debuggger when a warning by a specific name is encountered via: `/tests/index.html?debugWarnings=some-other-thing` when the
  if (typeof URLSearchParams !== 'undefined') {
    const queryParams = new URLSearchParams(document.location.search.substring(1));
    const disabledWarnings = queryParams.get('disabledWarnings');
    const debugWarnings = queryParams.get('debugWarnings');

    // When using `/tests/index.html?disabledWarnings=this-property-fallback,some-other-thing`
    // those warnings will be squelched
    if (disabledWarnings) {
      (0, _debug.registerWarnHandler)((message, options, next) => {
        if (!options || !disabledWarnings.includes(options.id)) {
          next.apply(null, [message, options]);
        }
      });
    }

    // When using `/tests/index.html?debugWarnings=some-other-thing` when the
    // `some-other-thing` warning is triggered, this `debugger` will be hit`
    if (debugWarnings) {
      (0, _debug.registerWarnHandler)((message, options, next) => {
        if (options && debugWarnings.includes(options.id)) {
          debugger; // eslint-disable-line no-debugger
        }

        next.apply(null, [message, options]);
      });
    }
  }
});
define("@ember/test-helpers/-tuple", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = tuple;
  // eslint-disable-next-line require-jsdoc
  function tuple() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }
    return args;
  }
});
define("@ember/test-helpers/-utils", ["exports", "rsvp", "@ember/test-helpers/-internal/promise-polyfill", "@ember/test-helpers/dom/-is-form-control"], function (_exports, _rsvp, _promisePolyfill, _isFormControl) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.futureTick = _exports.Promise = void 0;
  _exports.isDisabled = isDisabled;
  _exports.isNumeric = isNumeric;
  _exports.isVisible = isVisible;
  _exports.nextTick = void 0;
  _exports.runDestroyablesFor = runDestroyablesFor;
  /* globals Promise */

  const HAS_PROMISE = typeof Promise === 'function' &&
  // @ts-ignore this is checking if someone has explicitly done `window.Promise = window.Promise || Ember.RSVP.Promise
  Promise !== _rsvp.default.Promise;
  const _Promise = HAS_PROMISE ? Promise : _promisePolyfill.default;
  _exports.Promise = _Promise;
  const nextTick = HAS_PROMISE ? cb => Promise.resolve().then(cb) : _rsvp.default.asap;
  _exports.nextTick = nextTick;
  const futureTick = setTimeout;

  /**
   Retrieves an array of destroyables from the specified property on the object
   provided, iterates that array invoking each function, then deleting the
   property (clearing the array).
  
   @private
   @param {Object} object an object to search for the destroyable array within
   @param {string} property the property on the object that contains the destroyable array
  */
  _exports.futureTick = futureTick;
  function runDestroyablesFor(object, property) {
    let destroyables = object[property];
    if (!destroyables) {
      return;
    }
    for (let i = 0; i < destroyables.length; i++) {
      destroyables[i]();
    }
    delete object[property];
  }

  /**
   Returns whether the passed in string consists only of numeric characters.
  
   @private
   @param {string} n input string
   @returns {boolean} whether the input string consists only of numeric characters
   */
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(Number(n));
  }

  /**
    Checks if an element is considered visible by the focus area spec.
  
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is visible, `false` otherwise
  */
  function isVisible(element) {
    let styles = window.getComputedStyle(element);
    return styles.display !== 'none' && styles.visibility !== 'hidden';
  }

  /**
    Checks if an element is disabled.
  
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is disabled, `false` otherwise
  */
  function isDisabled(element) {
    if ((0, _isFormControl.default)(element)) {
      return element.disabled;
    }
    return false;
  }
});
define("@ember/test-helpers/application", ["exports", "@ember/test-helpers/resolver"], function (_exports, _resolver) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getApplication = getApplication;
  _exports.setApplication = setApplication;
  let __application__;

  /**
    Stores the provided application instance so that tests being ran will be aware of the application under test.
  
    - Required by `setupApplicationContext` method.
    - Used by `setupContext` and `setupRenderingContext` when present.
  
    @public
    @param {Ember.Application} application the application that will be tested
  */
  function setApplication(application) {
    __application__ = application;
    if (!(0, _resolver.getResolver)()) {
      let Resolver = application.Resolver;
      let resolver = Resolver.create({
        namespace: application
      });
      (0, _resolver.setResolver)(resolver);
    }
  }

  /**
    Retrieve the application instance stored by `setApplication`.
  
    @public
    @returns {Ember.Application} the previously stored application instance under test
  */
  function getApplication() {
    return __application__;
  }
});
define("@ember/test-helpers/build-owner", ["exports", "@ember/test-helpers/-utils", "@ember/test-helpers/-internal/build-registry"], function (_exports, _utils, _buildRegistry) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = buildOwner;
  /**
    Creates an "owner" (an object that either _is_ or duck-types like an
    `Ember.ApplicationInstance`) from the provided options.
  
    If `options.application` is present (e.g. setup by an earlier call to
    `setApplication`) an `Ember.ApplicationInstance` is built via
    `application.buildInstance()`.
  
    If `options.application` is not present, we fall back to using
    `options.resolver` instead (setup via `setResolver`). This creates a mock
    "owner" by using a custom created combination of `Ember.Registry`,
    `Ember.Container`, `Ember._ContainerProxyMixin`, and
    `Ember._RegistryProxyMixin`.
  
    @private
    @param {Ember.Application} [application] the Ember.Application to build an instance from
    @param {Ember.Resolver} [resolver] the resolver to use to back a "mock owner"
    @returns {Promise<Ember.ApplicationInstance>} a promise resolving to the generated "owner"
  */
  function buildOwner(application, resolver) {
    if (application) {
      return application.boot().then(app => app.buildInstance().boot());
    }
    if (!resolver) {
      throw new Error('You must set up the ember-test-helpers environment with either `setResolver` or `setApplication` before running any tests.');
    }
    let {
      owner
    } = (0, _buildRegistry.default)(resolver);
    return _utils.Promise.resolve(owner);
  }
});
define("@ember/test-helpers/dom/-get-element", ["exports", "@ember/test-helpers/dom/get-root-element", "@ember/test-helpers/dom/-target"], function (_exports, _getRootElement, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /**
    Used internally by the DOM interaction helpers to find one element.
  
    @private
    @param {string|Element} target the element or selector to retrieve
    @returns {Element} the target or selector
  */
  function getElement(target) {
    if (typeof target === 'string') {
      let rootElement = (0, _getRootElement.default)();
      return rootElement.querySelector(target);
    } else if ((0, _target.isElement)(target) || (0, _target.isDocument)(target)) {
      return target;
    } else if (target instanceof Window) {
      return target.document;
    } else {
      throw new Error('Must use an element or a selector string');
    }
  }
  var _default = getElement;
  _exports.default = _default;
});
define("@ember/test-helpers/dom/-get-elements", ["exports", "@ember/test-helpers/dom/get-root-element"], function (_exports, _getRootElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = getElements;
  /**
    Used internally by the DOM interaction helpers to find multiple elements.
  
    @private
    @param {string} target the selector to retrieve
    @returns {NodeList} the matched elements
  */
  function getElements(target) {
    if (typeof target === 'string') {
      let rootElement = (0, _getRootElement.default)();
      return rootElement.querySelectorAll(target);
    } else {
      throw new Error('Must use a selector string');
    }
  }
});
define("@ember/test-helpers/dom/-get-window-or-element", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-target"], function (_exports, _getElement, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getWindowOrElement = getWindowOrElement;
  /**
    Used internally by the DOM interaction helpers to find either window or an element.
  
    @private
    @param {string|Element} target the window, an element or selector to retrieve
    @returns {Element|Window} the target or selector
  */
  function getWindowOrElement(target) {
    if ((0, _target.isWindow)(target)) {
      return target;
    }
    return (0, _getElement.default)(target);
  }
});
define("@ember/test-helpers/dom/-guard-for-maxlength", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = guardForMaxlength;
  // ref: https://html.spec.whatwg.org/multipage/input.html#concept-input-apply
  const constrainedInputTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];

  /**
    @private
    @param {Element} element - the element to check
    @returns {boolean} `true` when the element should constrain input by the maxlength attribute, `false` otherwise
  */
  function isMaxLengthConstrained(element) {
    return !!Number(element.getAttribute('maxLength')) && (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement && constrainedInputTypes.indexOf(element.type) > -1);
  }

  /**
   * @private
   * @param {Element} element - the element to check
   * @param {string} text - the text being added to element
   * @param {string} testHelper - the test helper context the guard is called from (for Error message)
   * @throws if `element` has `maxlength` & `value` exceeds `maxlength`
   */
  function guardForMaxlength(element, text, testHelper) {
    const maxlength = element.getAttribute('maxlength');
    if (isMaxLengthConstrained(element) && maxlength && text && text.length > Number(maxlength)) {
      throw new Error(`Can not \`${testHelper}\` with text: '${text}' that exceeds maxlength: '${maxlength}'.`);
    }
  }
});
define("@ember/test-helpers/dom/-is-focusable", ["exports", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/dom/-target"], function (_exports, _isFormControl, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = isFocusable;
  // For reference:
  // https://html.spec.whatwg.org/multipage/interaction.html#the-tabindex-attribute
  const FOCUSABLE_TAGS = ['A', 'SUMMARY'];
  // eslint-disable-next-line require-jsdoc
  function isFocusableElement(element) {
    return FOCUSABLE_TAGS.indexOf(element.tagName) > -1;
  }

  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is focusable, `false` otherwise
  */
  function isFocusable(element) {
    if ((0, _target.isWindow)(element)) {
      return false;
    }
    if ((0, _target.isDocument)(element)) {
      return false;
    }
    if ((0, _isFormControl.default)(element)) {
      return !element.disabled;
    }
    if ((0, _target.isContentEditable)(element) || isFocusableElement(element)) {
      return true;
    }
    return element.hasAttribute('tabindex');
  }
});
define("@ember/test-helpers/dom/-is-form-control", ["exports", "@ember/test-helpers/dom/-target"], function (_exports, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = isFormControl;
  const FORM_CONTROL_TAGS = ['INPUT', 'BUTTON', 'SELECT', 'TEXTAREA'];
  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is a form control, `false` otherwise
  */
  function isFormControl(element) {
    return !(0, _target.isWindow)(element) && !(0, _target.isDocument)(element) && FORM_CONTROL_TAGS.indexOf(element.tagName) > -1 && element.type !== 'hidden';
  }
});
define("@ember/test-helpers/dom/-is-select-element", ["exports", "@ember/test-helpers/dom/-target"], function (_exports, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = isSelectElement;
  /**
    @private
    @param {Element} element the element to check
    @returns {boolean} `true` when the element is a select element, `false` otherwise
  */
  function isSelectElement(element) {
    return !(0, _target.isDocument)(element) && element.tagName === 'SELECT';
  }
});
define("@ember/test-helpers/dom/-logging", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.elementToString = elementToString;
  _exports.log = log;
  /**
   * Logs a debug message to the console if the `testHelperLogging` query
   * parameter is set.
   *
   * @private
   * @param {string} helperName Name of the helper
   * @param {string|Element} target The target element or selector
   */
  function log(helperName, target) {
    if (loggingEnabled()) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }
      // eslint-disable-next-line no-console
      console.log(`${helperName}(${[elementToString(target), ...args.filter(Boolean)].join(', ')})`);
    }
  }

  /**
   * Returns whether the test helper logging is enabled or not via the
   * `testHelperLogging` query parameter.
   *
   * @private
   * @returns {boolean} true if enabled
   */
  function loggingEnabled() {
    return typeof location !== 'undefined' && location.search.indexOf('testHelperLogging') !== -1;
  }

  /**
   * This generates a human-readable description to a DOM element.
   *
   * @private
   * @param {*} el The element that should be described
   * @returns {string} A human-readable description
   */
  function elementToString(el) {
    let desc;
    if (el instanceof NodeList) {
      if (el.length === 0) {
        return 'empty NodeList';
      }
      desc = Array.prototype.slice.call(el, 0, 5).map(elementToString).join(', ');
      return el.length > 5 ? `${desc}... (+${el.length - 5} more)` : desc;
    }
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
      return String(el);
    }
    desc = el.tagName.toLowerCase();
    if (el.id) {
      desc += `#${el.id}`;
    }
    if (el.className && !(el.className instanceof SVGAnimatedString)) {
      desc += `.${String(el.className).replace(/\s+/g, '.')}`;
    }
    Array.prototype.forEach.call(el.attributes, function (attr) {
      if (attr.name !== 'class' && attr.name !== 'id') {
        desc += `[${attr.name}${attr.value ? `="${attr.value}"]` : ']'}`;
      }
    });
    return desc;
  }
});
define("@ember/test-helpers/dom/-target", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.isContentEditable = isContentEditable;
  _exports.isDocument = isDocument;
  _exports.isElement = isElement;
  _exports.isWindow = isWindow;
  // eslint-disable-next-line require-jsdoc
  function isElement(target) {
    return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.ELEMENT_NODE;
  }

  // eslint-disable-next-line require-jsdoc
  function isWindow(target) {
    return target instanceof Window;
  }

  // eslint-disable-next-line require-jsdoc
  function isDocument(target) {
    return target !== null && typeof target === 'object' && Reflect.get(target, 'nodeType') === Node.DOCUMENT_NODE;
  }

  // eslint-disable-next-line require-jsdoc
  function isContentEditable(element) {
    return 'isContentEditable' in element && element.isContentEditable;
  }
});
define("@ember/test-helpers/dom/-to-array", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = toArray;
  /**
    @private
    @param {NodeList} nodelist the nodelist to convert to an array
    @returns {Array} an array
  */
  function toArray(nodelist) {
    let array = new Array(nodelist.length);
    for (let i = 0; i < nodelist.length; i++) {
      array[i] = nodelist[i];
    }
    return array;
  }
});
define("@ember/test-helpers/dom/blur", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/dom/-is-focusable", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getElement, _fireEvent, _settled, _utils, _logging, _isFocusable, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.__blur__ = __blur__;
  _exports.default = blur;
  (0, _helperHooks.registerHook)('blur', 'start', target => {
    (0, _logging.log)('blur', target);
  });

  /**
    @private
    @param {Element} element the element to trigger events on
    @param {Element} relatedTarget the element that is focused after blur
    @return {Promise<Event | void>} resolves when settled
  */
  function __blur__(element) {
    let relatedTarget = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    if (!(0, _isFocusable.default)(element)) {
      throw new Error(`${element} is not focusable`);
    }
    let browserIsNotFocused = document.hasFocus && !document.hasFocus();
    let needsCustomEventOptions = relatedTarget !== null;
    if (!needsCustomEventOptions) {
      // makes `document.activeElement` be `body`.
      // If the browser is focused, it also fires a blur event
      element.blur();
    }

    // Chrome/Firefox does not trigger the `blur` event if the window
    // does not have focus. If the document does not have focus then
    // fire `blur` event via native event.
    let options = {
      relatedTarget
    };
    return browserIsNotFocused || needsCustomEventOptions ? _utils.Promise.resolve().then(() => (0, _fireEvent.default)(element, 'blur', {
      bubbles: false,
      ...options
    })).then(() => (0, _fireEvent.default)(element, 'focusout', options)) : _utils.Promise.resolve();
  }

  /**
    Unfocus the specified target.
  
    Sends a number of events intending to simulate a "real" user unfocusing an
    element.
  
    The following events are triggered (in order):
  
    - `blur`
    - `focusout`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle unfocusing a given element.
  
    @public
    @param {string|Element} [target=document.activeElement] the element or selector to unfocus
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Emulating blurring an input using `blur`
    </caption>
  
    blur('input');
  */
  function blur() {
    let target = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.activeElement;
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('blur', 'start', target)).then(() => {
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`blur('${target}')\`.`);
      }
      return __blur__(element).then(() => (0, _settled.default)());
    }).then(() => (0, _helperHooks.runHooks)('blur', 'end', target));
  }
});
define("@ember/test-helpers/dom/click", ["exports", "@ember/test-helpers/dom/-get-window-or-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/focus", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getWindowOrElement, _fireEvent, _focus, _settled, _utils, _isFormControl, _target, _logging, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.DEFAULT_CLICK_OPTIONS = void 0;
  _exports.__click__ = __click__;
  _exports.default = click;
  const PRIMARY_BUTTON = 1;
  const MAIN_BUTTON_PRESSED = 0;
  (0, _helperHooks.registerHook)('click', 'start', target => {
    (0, _logging.log)('click', target);
  });

  /**
   * Represent a particular mouse button being clicked.
   * See https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons for available options.
   */
  const DEFAULT_CLICK_OPTIONS = {
    buttons: PRIMARY_BUTTON,
    button: MAIN_BUTTON_PRESSED
  };

  /**
    @private
    @param {Element} element the element to click on
    @param {MouseEventInit} options the options to be merged into the mouse events
    @return {Promise<Event | void>} resolves when settled
  */
  _exports.DEFAULT_CLICK_OPTIONS = DEFAULT_CLICK_OPTIONS;
  function __click__(element, options) {
    return _utils.Promise.resolve().then(() => (0, _fireEvent.default)(element, 'mousedown', options)).then(mouseDownEvent => !(0, _target.isWindow)(element) && !mouseDownEvent?.defaultPrevented ? (0, _focus.__focus__)(element) : _utils.Promise.resolve()).then(() => (0, _fireEvent.default)(element, 'mouseup', options)).then(() => (0, _fireEvent.default)(element, 'click', options));
  }

  /**
    Clicks on the specified target.
  
    Sends a number of events intending to simulate a "real" user clicking on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle clicking a given element.
  
    Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).
    You can use this to specifiy modifier keys as well.
  
    @public
    @param {string|Element} target the element or selector to click on
    @param {MouseEventInit} _options the options to be merged into the mouse events.
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Emulating clicking a button using `click`
    </caption>
    click('button');
  
    @example
    <caption>
      Emulating clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
    </caption>
  
    click('button', { shiftKey: true });
  */
  function click(target) {
    let _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = {
      ...DEFAULT_CLICK_OPTIONS,
      ..._options
    };
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('click', 'start', target, _options)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `click`.');
      }
      let element = (0, _getWindowOrElement.getWindowOrElement)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`click('${target}')\`.`);
      }
      if ((0, _isFormControl.default)(element) && element.disabled) {
        throw new Error(`Can not \`click\` disabled ${element}`);
      }
      return __click__(element, options).then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('click', 'end', target, _options));
  }
});
define("@ember/test-helpers/dom/double-click", ["exports", "@ember/test-helpers/dom/-get-window-or-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/focus", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/click", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getWindowOrElement, _fireEvent, _focus, _settled, _utils, _click, _target, _logging, _isFormControl, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.__doubleClick__ = __doubleClick__;
  _exports.default = doubleClick;
  (0, _helperHooks.registerHook)('doubleClick', 'start', target => {
    (0, _logging.log)('doubleClick', target);
  });

  /**
    @private
    @param {Element} element the element to double-click on
    @param {MouseEventInit} options the options to be merged into the mouse events
    @returns {Promise<Event | void>} resolves when settled
  */
  function __doubleClick__(element, options) {
    return _utils.Promise.resolve().then(() => (0, _fireEvent.default)(element, 'mousedown', options)).then(mouseDownEvent => {
      return !(0, _target.isWindow)(element) && !mouseDownEvent?.defaultPrevented ? (0, _focus.__focus__)(element) : _utils.Promise.resolve();
    }).then(() => (0, _fireEvent.default)(element, 'mouseup', options)).then(() => (0, _fireEvent.default)(element, 'click', options)).then(() => (0, _fireEvent.default)(element, 'mousedown', options)).then(() => (0, _fireEvent.default)(element, 'mouseup', options)).then(() => (0, _fireEvent.default)(element, 'click', options)).then(() => (0, _fireEvent.default)(element, 'dblclick', options));
  }

  /**
    Double-clicks on the specified target.
  
    Sends a number of events intending to simulate a "real" user clicking on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `mousedown`
    - `mouseup`
    - `click`
    - `mousedown`
    - `mouseup`
    - `click`
    - `dblclick`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
    - `mousedown`
    - `mouseup`
    - `click`
    - `dblclick`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle clicking a given element.
  
    Use the `options` hash to change the parameters of the [MouseEvents](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/MouseEvent).
  
    @public
    @param {string|Element} target the element or selector to double-click on
    @param {MouseEventInit} _options the options to be merged into the mouse events
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Emulating double clicking a button using `doubleClick`
    </caption>
  
    doubleClick('button');
  
    @example
    <caption>
      Emulating double clicking a button and pressing the `shift` key simultaneously using `click` with `options`.
    </caption>
  
    doubleClick('button', { shiftKey: true });
  */
  function doubleClick(target) {
    let _options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = {
      ..._click.DEFAULT_CLICK_OPTIONS,
      ..._options
    };
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('doubleClick', 'start', target, _options)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `doubleClick`.');
      }
      let element = (0, _getWindowOrElement.getWindowOrElement)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`doubleClick('${target}')\`.`);
      }
      if ((0, _isFormControl.default)(element) && element.disabled) {
        throw new Error(`Can not \`doubleClick\` disabled ${element}`);
      }
      return __doubleClick__(element, options).then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('doubleClick', 'end', target, _options));
  }
});
define("@ember/test-helpers/dom/fill-in", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/dom/-guard-for-maxlength", "@ember/test-helpers/dom/focus", "@ember/test-helpers/settled", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getElement, _isFormControl, _guardForMaxlength, _focus, _settled, _fireEvent, _utils, _target, _logging, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = fillIn;
  (0, _helperHooks.registerHook)('fillIn', 'start', (target, text) => {
    (0, _logging.log)('fillIn', target, text);
  });

  /**
    Fill the provided text into the `value` property (or set `.innerHTML` when
    the target is a content editable element) then trigger `change` and `input`
    events on the specified target.
  
    @public
    @param {string|Element} target the element or selector to enter text into
    @param {string} text the text to fill into the target element
    @return {Promise<void>} resolves when the application is settled
  
    @example
    <caption>
      Emulating filling an input with text using `fillIn`
    </caption>
  
    fillIn('input', 'hello world');
  */
  function fillIn(target, text) {
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('fillIn', 'start', target, text)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `fillIn`.');
      }
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`fillIn('${target}')\`.`);
      }
      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `fillIn`.');
      }
      if ((0, _isFormControl.default)(element)) {
        if (element.disabled) {
          throw new Error(`Can not \`fillIn\` disabled '${target}'.`);
        }
        if ('readOnly' in element && element.readOnly) {
          throw new Error(`Can not \`fillIn\` readonly '${target}'.`);
        }
        (0, _guardForMaxlength.default)(element, text, 'fillIn');
        return (0, _focus.__focus__)(element).then(() => {
          element.value = text;
          return element;
        });
      } else if ((0, _target.isContentEditable)(element)) {
        return (0, _focus.__focus__)(element).then(() => {
          element.innerHTML = text;
          return element;
        });
      } else {
        throw new Error('`fillIn` is only usable on form controls or contenteditable elements.');
      }
    }).then(element => (0, _fireEvent.default)(element, 'input').then(() => (0, _fireEvent.default)(element, 'change')).then(_settled.default)).then(() => (0, _helperHooks.runHooks)('fillIn', 'end', target, text));
  }
});
define("@ember/test-helpers/dom/find-all", ["exports", "@ember/test-helpers/dom/-get-elements", "@ember/test-helpers/ie-11-polyfills"], function (_exports, _getElements, _ie11Polyfills) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = findAll;
  // Derived, with modification, from the types for `querySelectorAll`. These
  // would simply be defined as a tweaked re-export as `querySelector` is, but it
  // is non-trivial (to say the least!) to preserve overloads like this while also
  // changing the return type (from `NodeListOf` to `Array`).

  /**
    Find all elements matched by the given selector. Similar to calling
    `querySelectorAll()` on the test root element, but returns an array instead
    of a `NodeList`.
  
    @public
    @param {string} selector the selector to search for
    @return {Array} array of matched elements
  
    @example
    <caption>
      Finding the first element with id 'foo'
    </caption>
    find('#foo');
  */
  function findAll(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `findAll`.');
    }
    if (arguments.length > 1) {
      throw new Error('The `findAll` test helper only takes a single argument.');
    }
    return (0, _ie11Polyfills.toArray)((0, _getElements.default)(selector));
  }
});
define("@ember/test-helpers/dom/find", ["exports", "@ember/test-helpers/dom/-get-element"], function (_exports, _getElement) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = find;
  // Derived from `querySelector` types.

  /**
    Find the first element matched by the given selector. Equivalent to calling
    `querySelector()` on the test root element.
  
    @public
    @param {string} selector the selector to search for
    @return {Element} matched element or null
  
    @example
    <caption>
      Find all of the elements matching '.my-selector'.
    </caption>
    findAll('.my-selector');
  
  */
  function find(selector) {
    if (!selector) {
      throw new Error('Must pass a selector to `find`.');
    }
    if (arguments.length > 1) {
      throw new Error('The `find` test helper only takes a single argument.');
    }
    return (0, _getElement.default)(selector);
  }
});
define("@ember/test-helpers/dom/fire-event", ["exports", "@ember/test-helpers/dom/-target", "@ember/test-helpers/-tuple", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _target, _tuple, _logging, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.KEYBOARD_EVENT_TYPES = void 0;
  _exports._buildKeyboardEvent = _buildKeyboardEvent;
  _exports.default = void 0;
  _exports.isFileSelectionEventType = isFileSelectionEventType;
  _exports.isFileSelectionInput = isFileSelectionInput;
  _exports.isKeyboardEventType = isKeyboardEventType;
  _exports.isMouseEventType = isMouseEventType;
  (0, _helperHooks.registerHook)('fireEvent', 'start', target => {
    (0, _logging.log)('fireEvent', target);
  });

  // eslint-disable-next-line require-jsdoc
  const MOUSE_EVENT_CONSTRUCTOR = (() => {
    try {
      new MouseEvent('test');
      return true;
    } catch (e) {
      return false;
    }
  })();
  const DEFAULT_EVENT_OPTIONS = {
    bubbles: true,
    cancelable: true
  };
  const KEYBOARD_EVENT_TYPES = (0, _tuple.default)('keydown', 'keypress', 'keyup');
  // eslint-disable-next-line require-jsdoc
  _exports.KEYBOARD_EVENT_TYPES = KEYBOARD_EVENT_TYPES;
  function isKeyboardEventType(eventType) {
    return KEYBOARD_EVENT_TYPES.indexOf(eventType) > -1;
  }
  const MOUSE_EVENT_TYPES = (0, _tuple.default)('click', 'mousedown', 'mouseup', 'dblclick', 'mouseenter', 'mouseleave', 'mousemove', 'mouseout', 'mouseover');
  // eslint-disable-next-line require-jsdoc
  function isMouseEventType(eventType) {
    return MOUSE_EVENT_TYPES.indexOf(eventType) > -1;
  }
  const FILE_SELECTION_EVENT_TYPES = (0, _tuple.default)('change');
  // eslint-disable-next-line require-jsdoc
  function isFileSelectionEventType(eventType) {
    return FILE_SELECTION_EVENT_TYPES.indexOf(eventType) > -1;
  }

  // eslint-disable-next-line require-jsdoc
  function isFileSelectionInput(element) {
    return element.files;
  }
  /**
    Internal helper used to build and dispatch events throughout the other DOM helpers.
  
    @private
    @param {Element} element the element to dispatch the event to
    @param {string} eventType the type of event
    @param {Object} [options] additional properties to be set on the event
    @returns {Event} the event that was dispatched
  */
  function fireEvent(element, eventType) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return Promise.resolve().then(() => (0, _helperHooks.runHooks)('fireEvent', 'start', element)).then(() => (0, _helperHooks.runHooks)(`fireEvent:${eventType}`, 'start', element)).then(() => {
      if (!element) {
        throw new Error('Must pass an element to `fireEvent`');
      }
      let event;
      if (isKeyboardEventType(eventType)) {
        event = _buildKeyboardEvent(eventType, options);
      } else if (isMouseEventType(eventType)) {
        let rect;
        if (element instanceof Window && element.document.documentElement) {
          rect = element.document.documentElement.getBoundingClientRect();
        } else if ((0, _target.isDocument)(element)) {
          rect = element.documentElement.getBoundingClientRect();
        } else if ((0, _target.isElement)(element)) {
          rect = element.getBoundingClientRect();
        } else {
          return;
        }
        let x = rect.left + 1;
        let y = rect.top + 1;
        let simulatedCoordinates = {
          screenX: x + 5,
          // Those numbers don't really mean anything.
          screenY: y + 95,
          // They're just to make the screenX/Y be different of clientX/Y..
          clientX: x,
          clientY: y,
          ...options
        };
        event = buildMouseEvent(eventType, simulatedCoordinates);
      } else if (isFileSelectionEventType(eventType) && isFileSelectionInput(element)) {
        event = buildFileEvent(eventType, element, options);
      } else {
        event = buildBasicEvent(eventType, options);
      }
      element.dispatchEvent(event);
      return event;
    }).then(event => (0, _helperHooks.runHooks)(`fireEvent:${eventType}`, 'end', element).then(() => event)).then(event => (0, _helperHooks.runHooks)('fireEvent', 'end', element).then(() => event));
  }
  var _default = fireEvent; // eslint-disable-next-line require-jsdoc
  _exports.default = _default;
  function buildBasicEvent(type) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let event = document.createEvent('Events');
    let bubbles = options.bubbles !== undefined ? options.bubbles : true;
    let cancelable = options.cancelable !== undefined ? options.cancelable : true;
    delete options.bubbles;
    delete options.cancelable;

    // bubbles and cancelable are readonly, so they can be
    // set when initializing event
    event.initEvent(type, bubbles, cancelable);
    for (let prop in options) {
      event[prop] = options[prop];
    }
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildMouseEvent(type) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let event;
    let eventOpts = {
      view: window,
      ...DEFAULT_EVENT_OPTIONS,
      ...options
    };
    if (MOUSE_EVENT_CONSTRUCTOR) {
      event = new MouseEvent(type, eventOpts);
    } else {
      try {
        event = document.createEvent('MouseEvents');
        event.initMouseEvent(type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.detail, eventOpts.screenX, eventOpts.screenY, eventOpts.clientX, eventOpts.clientY, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.button, eventOpts.relatedTarget);
      } catch (e) {
        event = buildBasicEvent(type, options);
      }
    }
    return event;
  }

  // @private
  // eslint-disable-next-line require-jsdoc
  function _buildKeyboardEvent(type) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let eventOpts = {
      ...DEFAULT_EVENT_OPTIONS,
      ...options
    };
    let event;
    let eventMethodName;
    try {
      event = new KeyboardEvent(type, eventOpts);

      // Property definitions are required for B/C for keyboard event usage
      // If this properties are not defined, when listening for key events
      // keyCode/which will be 0. Also, keyCode and which now are string
      // and if app compare it with === with integer key definitions,
      // there will be a fail.
      //
      // https://w3c.github.io/uievents/#interface-keyboardevent
      // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
      Object.defineProperty(event, 'keyCode', {
        get() {
          return parseInt(eventOpts.keyCode);
        }
      });
      Object.defineProperty(event, 'which', {
        get() {
          return parseInt(eventOpts.which);
        }
      });
      return event;
    } catch (e) {
      // left intentionally blank
    }
    try {
      event = document.createEvent('KeyboardEvents');
      eventMethodName = 'initKeyboardEvent';
    } catch (e) {
      // left intentionally blank
    }
    if (!event) {
      try {
        event = document.createEvent('KeyEvents');
        eventMethodName = 'initKeyEvent';
      } catch (e) {
        // left intentionally blank
      }
    }
    if (event && eventMethodName) {
      event[eventMethodName](type, eventOpts.bubbles, eventOpts.cancelable, window, eventOpts.ctrlKey, eventOpts.altKey, eventOpts.shiftKey, eventOpts.metaKey, eventOpts.keyCode, eventOpts.charCode);
    } else {
      event = buildBasicEvent(type, options);
    }
    return event;
  }

  // eslint-disable-next-line require-jsdoc
  function buildFileEvent(type, element) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    let event = buildBasicEvent(type);
    let files = options.files;
    if (Array.isArray(options)) {
      throw new Error('Please pass an object with a files array to `triggerEvent` instead of passing the `options` param as an array to.');
    }
    if (Array.isArray(files)) {
      Object.defineProperty(files, 'item', {
        value(index) {
          return typeof index === 'number' ? this[index] : null;
        },
        configurable: true
      });
      Object.defineProperty(element, 'files', {
        value: files,
        configurable: true
      });
      let elementProto = Object.getPrototypeOf(element);
      let valueProp = Object.getOwnPropertyDescriptor(elementProto, 'value');
      Object.defineProperty(element, 'value', {
        configurable: true,
        get() {
          return valueProp.get.call(element);
        },
        set(value) {
          valueProp.set.call(element, value);

          // We are sure that the value is empty here.
          // For a non-empty value the original setter must raise an exception.
          Object.defineProperty(element, 'files', {
            configurable: true,
            value: []
          });
        }
      });
    }
    Object.defineProperty(event, 'target', {
      value: element
    });
    return event;
  }
});
define("@ember/test-helpers/dom/focus", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/settled", "@ember/test-helpers/dom/-is-focusable", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/-internal/helper-hooks", "@ember/test-helpers/dom/blur"], function (_exports, _getElement, _fireEvent, _settled, _isFocusable, _utils, _target, _logging, _helperHooks, _blur) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.__focus__ = __focus__;
  _exports.default = focus;
  (0, _helperHooks.registerHook)('focus', 'start', target => {
    (0, _logging.log)('focus', target);
  });
  /**
     Get the closest focusable ancestor of a given element (or the element itself
     if it's focusable)
  
     @private
     @param {Element} element the element to trigger events on
     @returns {HTMLElement|SVGElement|null} the focusable element/ancestor or null
     if there is none
   */
  function getClosestFocusable(element) {
    if ((0, _target.isDocument)(element)) {
      return null;
    }
    let maybeFocusable = element;
    while (maybeFocusable && !(0, _isFocusable.default)(maybeFocusable)) {
      maybeFocusable = maybeFocusable.parentElement;
    }
    return maybeFocusable;
  }

  /**
    @private
    @param {Element} element the element to trigger events on
    @return {Promise<FocusRecord | Event | void>} resolves when settled
  */
  function __focus__(element) {
    return _utils.Promise.resolve().then(() => {
      let focusTarget = getClosestFocusable(element);
      const previousFocusedElement = document.activeElement && document.activeElement !== focusTarget && (0, _isFocusable.default)(document.activeElement) ? document.activeElement : null;

      // fire __blur__ manually with the null relatedTarget when the target is not focusable
      // and there was a previously focused element
      return !focusTarget && previousFocusedElement ? (0, _blur.__blur__)(previousFocusedElement, null).then(() => _utils.Promise.resolve({
        focusTarget,
        previousFocusedElement
      })) : _utils.Promise.resolve({
        focusTarget,
        previousFocusedElement
      });
    }).then(_ref => {
      let {
        focusTarget,
        previousFocusedElement
      } = _ref;
      if (!focusTarget) {
        throw new Error('There was a previously focused element');
      }
      let browserIsNotFocused = !document?.hasFocus();

      // fire __blur__ manually with the correct relatedTarget when the browser is not
      // already in focus and there was a previously focused element
      return previousFocusedElement && browserIsNotFocused ? (0, _blur.__blur__)(previousFocusedElement, focusTarget).then(() => _utils.Promise.resolve({
        focusTarget
      })) : _utils.Promise.resolve({
        focusTarget
      });
    }).then(_ref2 => {
      let {
        focusTarget
      } = _ref2;
      // makes `document.activeElement` be `element`. If the browser is focused, it also fires a focus event
      focusTarget.focus();

      // Firefox does not trigger the `focusin` event if the window
      // does not have focus. If the document does not have focus then
      // fire `focusin` event as well.
      let browserIsFocused = document?.hasFocus();
      return browserIsFocused ? _utils.Promise.resolve() :
      // if the browser is not focused the previous `el.focus()` didn't fire an event, so we simulate it
      _utils.Promise.resolve().then(() => (0, _fireEvent.default)(focusTarget, 'focus', {
        bubbles: false
      })).then(() => (0, _fireEvent.default)(focusTarget, 'focusin')).then(() => (0, _settled.default)());
    }).catch(() => {});
  }

  /**
    Focus the specified target.
  
    Sends a number of events intending to simulate a "real" user focusing an
    element.
  
    The following events are triggered (in order):
  
    - `focus`
    - `focusin`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle focusing a given element.
  
    @public
    @param {string|Element} target the element or selector to focus
    @return {Promise<void>} resolves when the application is settled
  
    @example
    <caption>
      Emulating focusing an input using `focus`
    </caption>
  
    focus('input');
  */
  function focus(target) {
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('focus', 'start', target)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `focus`.');
      }
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`focus('${target}')\`.`);
      }
      if (!(0, _isFocusable.default)(element)) {
        throw new Error(`${element} is not focusable`);
      }
      return __focus__(element).then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('focus', 'end', target));
  }
});
define("@ember/test-helpers/dom/get-root-element", ["exports", "@ember/test-helpers/setup-context", "@ember/test-helpers/dom/-target"], function (_exports, _setupContext, _target) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = getRootElement;
  /**
    Get the root element of the application under test (usually `#ember-testing`)
  
    @public
    @returns {Element} the root element
  
    @example
    <caption>
      Getting the root element of the application and checking that it is equal
      to the element with id 'ember-testing'.
    </caption>
    assert.equal(getRootElement(), document.querySelector('#ember-testing'));
  */
  function getRootElement() {
    let context = (0, _setupContext.getContext)();
    if (!context || !(0, _setupContext.isTestContext)(context) || !context.owner) {
      throw new Error('Must setup rendering context before attempting to interact with elements.');
    }
    let owner = context.owner;
    let rootElement;
    // When the host app uses `setApplication` (instead of `setResolver`) the owner has
    // a `rootElement` set on it with the element or id to be used
    if (owner && owner._emberTestHelpersMockOwner === undefined) {
      rootElement = owner.rootElement;
    } else {
      rootElement = '#ember-testing';
    }
    if (rootElement instanceof Window) {
      rootElement = rootElement.document;
    }
    if ((0, _target.isElement)(rootElement) || (0, _target.isDocument)(rootElement)) {
      return rootElement;
    } else if (typeof rootElement === 'string') {
      let _rootElement = document.querySelector(rootElement);
      if (_rootElement) {
        return _rootElement;
      }
      throw new Error(`Application.rootElement (${rootElement}) not found`);
    } else {
      throw new Error('Application.rootElement must be an element or a selector string');
    }
  }
});
define("@ember/test-helpers/dom/scroll-to", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-target", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getElement, _fireEvent, _settled, _utils, _target, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = scrollTo;
  /**
    Scrolls DOM element or selector to the given coordinates.
    @public
    @param {string|HTMLElement} target the element or selector to trigger scroll on
    @param {Number} x x-coordinate
    @param {Number} y y-coordinate
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Scroll DOM element to specific coordinates
    </caption>
  
    scrollTo('#my-long-div', 0, 0); // scroll to top
    scrollTo('#my-long-div', 0, 100); // scroll down
  */
  function scrollTo(target, x, y) {
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('scrollTo', 'start', target)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `scrollTo`.');
      }
      if (x === undefined || y === undefined) {
        throw new Error('Must pass both x and y coordinates to `scrollTo`.');
      }
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`scrollTo('${target}')\`.`);
      }
      if (!(0, _target.isElement)(element)) {
        throw new Error(`"target" must be an element, but was a ${element.nodeType} when calling \`scrollTo('${target}')\`.`);
      }
      element.scrollTop = y;
      element.scrollLeft = x;
      return (0, _fireEvent.default)(element, 'scroll').then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('scrollTo', 'end', target));
  }
});
define("@ember/test-helpers/dom/select", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-is-select-element", "@ember/test-helpers/dom/focus", "@ember/test-helpers/settled", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/-utils", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getElement, _isSelectElement, _focus, _settled, _fireEvent, _utils, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = select;
  /**
    Set the `selected` property true for the provided option the target is a
    select element (or set the select property true for multiple options if the
    multiple attribute is set true on the HTMLSelectElement) then trigger
    `change` and `input` events on the specified target.
  
    @public
    @param {string|Element} target the element or selector for the select element
    @param {string|string[]} options the value/values of the items to select
    @param {boolean} keepPreviouslySelected a flag keep any existing selections
    @return {Promise<void>} resolves when the application is settled
  
    @example
    <caption>
      Emulating selecting an option or multiple options using `select`
    </caption>
  
    select('select', 'apple');
  
    select('select', ['apple', 'orange']);
  
    select('select', ['apple', 'orange'], true);
  */
  function select(target, options) {
    let keepPreviouslySelected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('select', 'start', target, options, keepPreviouslySelected)).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `select`.');
      }
      if (typeof options === 'undefined' || options === null) {
        throw new Error('Must provide an `option` or `options` to select when calling `select`.');
      }
      const element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`select('${target}')\`.`);
      }
      if (!(0, _isSelectElement.default)(element)) {
        throw new Error(`Element is not a HTMLSelectElement when calling \`select('${target}')\`.`);
      }
      if (element.disabled) {
        throw new Error(`Element is disabled when calling \`select('${target}')\`.`);
      }
      options = Array.isArray(options) ? options : [options];
      if (!element.multiple && options.length > 1) {
        throw new Error(`HTMLSelectElement \`multiple\` attribute is set to \`false\` but multiple options were passed when calling \`select('${target}')\`.`);
      }
      return (0, _focus.__focus__)(element).then(() => element);
    }).then(element => {
      for (let i = 0; i < element.options.length; i++) {
        let elementOption = element.options.item(i);
        if (elementOption) {
          if (options.indexOf(elementOption.value) > -1) {
            elementOption.selected = true;
          } else if (!keepPreviouslySelected) {
            elementOption.selected = false;
          }
        }
      }
      return (0, _fireEvent.default)(element, 'input').then(() => (0, _fireEvent.default)(element, 'change')).then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('select', 'end', target, options, keepPreviouslySelected));
  }
});
define("@ember/test-helpers/dom/tab", ["exports", "@ember/test-helpers/dom/get-root-element", "@ember/test-helpers/settled", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/blur", "@ember/test-helpers/dom/focus", "@ember/test-helpers/-utils", "@ember/test-helpers/-internal/helper-hooks", "@ember/test-helpers/dom/-logging"], function (_exports, _getRootElement, _settled, _fireEvent, _target, _blur, _focus, _utils, _helperHooks, _logging) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = triggerTab;
  const SUPPORTS_INERT = ('inert' in Element.prototype);
  const FALLBACK_ELEMENTS = ['CANVAS', 'VIDEO', 'PICTURE'];
  (0, _helperHooks.registerHook)('tab', 'start', target => {
    (0, _logging.log)('tab', target);
  });

  /**
    Gets the active element of a document. IE11 may return null instead of the body as
    other user-agents does when there isn’t an active element.
    @private
    @param {Document} ownerDocument the element to check
    @returns {HTMLElement} the active element of the document
  */
  function getActiveElement(ownerDocument) {
    return ownerDocument.activeElement || ownerDocument.body;
  }
  /**
    Compiles a list of nodes that can be focused. Walks the tree, discards hidden elements and a few edge cases. To calculate the right.
    @private
    @param {Element} root the root element to start traversing on
    @returns {Array} list of focusable nodes
  */
  function compileFocusAreas() {
    let root = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document.body;
    let {
      ownerDocument
    } = root;
    if (!ownerDocument) {
      throw new Error('Element must be in the DOM');
    }
    let activeElement = getActiveElement(ownerDocument);
    let treeWalker = ownerDocument.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      acceptNode: node => {
        // Only visible nodes can be focused, with, at least, one exception; the "area" element.
        // reference: https://html.spec.whatwg.org/multipage/interaction.html#data-model
        if (node.tagName !== 'AREA' && (0, _utils.isVisible)(node) === false) {
          return NodeFilter.FILTER_REJECT;
        }

        // Reject any fallback elements. Fallback elements’s children are only rendered if the UA
        // doesn’t support the element. We make an assumption that they are always supported, we
        // could consider feature detecting every node type, or making it configurable.
        let parentNode = node.parentNode;
        if (parentNode && FALLBACK_ELEMENTS.indexOf(parentNode.tagName) !== -1) {
          return NodeFilter.FILTER_REJECT;
        }

        // Rejects inert containers, if the user agent supports the feature (or if a polyfill is installed.)
        if (SUPPORTS_INERT && node.inert) {
          return NodeFilter.FILTER_REJECT;
        }
        if ((0, _utils.isDisabled)(node)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Always accept the 'activeElement' of the document, as it might fail the next check, elements with tabindex="-1"
        // can be focused programmatically, we'll therefor ensure the current active element is in the list.
        if (node === activeElement) {
          return NodeFilter.FILTER_ACCEPT;
        }

        // UA parses the tabindex attribute and applies its default values, If the tabIndex is non negative, the UA can
        // focus it.
        return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
      }
    });
    let node;
    let elements = [];
    while (node = treeWalker.nextNode()) {
      elements.push(node);
    }
    return elements;
  }

  /**
    Sort elements by their tab indices.
    As older browsers doesn't necessarily implement stabile sort, we'll have to
    manually compare with the index in the original array.
    @private
    @param {Array<HTMLElement>} elements to sort
    @returns {Array<HTMLElement>} list of sorted focusable nodes by their tab index
  */
  function sortElementsByTabIndices(elements) {
    return elements.map((element, index) => {
      return {
        index,
        element
      };
    }).sort((a, b) => {
      if (a.element.tabIndex === b.element.tabIndex) {
        return a.index - b.index;
      } else if (a.element.tabIndex === 0 || b.element.tabIndex === 0) {
        return b.element.tabIndex - a.element.tabIndex;
      }
      return a.element.tabIndex - b.element.tabIndex;
    }).map(entity => entity.element);
  }

  /**
    @private
    @param {Element} root The root element or node to start traversing on.
    @param {HTMLElement} activeElement The element to find the next and previous focus areas of
    @returns {object} The next and previous focus areas of the active element
   */
  function findNextResponders(root, activeElement) {
    let focusAreas = compileFocusAreas(root);
    let sortedFocusAreas = sortElementsByTabIndices(focusAreas);
    let elements = activeElement.tabIndex === -1 ? focusAreas : sortedFocusAreas;
    let index = elements.indexOf(activeElement);
    if (index === -1) {
      return {
        next: sortedFocusAreas[0],
        previous: sortedFocusAreas[sortedFocusAreas.length - 1]
      };
    }
    return {
      next: elements[index + 1],
      previous: elements[index - 1]
    };
  }

  /**
    Emulates the user pressing the tab button.
  
    Sends a number of events intending to simulate a "real" user pressing tab on their
    keyboard.
  
    @public
    @param {Object} [options] optional tab behaviors
    @param {boolean} [options.backwards=false] indicates if the the user navigates backwards
    @param {boolean} [options.unRestrainTabIndex=false] indicates if tabbing should throw an error when tabindex is greater than 0
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Emulating pressing the `TAB` key
    </caption>
    tab();
  
    @example
    <caption>
      Emulating pressing the `SHIFT`+`TAB` key combination
    </caption>
    tab({ backwards: true });
  */
  function triggerTab() {
    let {
      backwards = false,
      unRestrainTabIndex = false
    } = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    return _utils.Promise.resolve().then(() => {
      return triggerResponderChange(backwards, unRestrainTabIndex);
    }).then(() => {
      return (0, _settled.default)();
    });
  }

  /**
    @private
    @param {boolean} backwards when `true` it selects the previous focus area
    @param {boolean} unRestrainTabIndex when `true`, will not throw an error if tabindex > 0 is encountered
    @returns {Promise<void>} resolves when all events are fired
   */
  function triggerResponderChange(backwards, unRestrainTabIndex) {
    let root = (0, _getRootElement.default)();
    let ownerDocument;
    let rootElement;
    if ((0, _target.isDocument)(root)) {
      rootElement = root.body;
      ownerDocument = root;
    } else {
      rootElement = root;
      ownerDocument = root.ownerDocument;
    }
    let keyboardEventOptions = {
      keyCode: 9,
      which: 9,
      key: 'Tab',
      code: 'Tab',
      shiftKey: backwards
    };
    let debugData = {
      keyboardEventOptions,
      ownerDocument,
      rootElement
    };
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('tab', 'start', debugData)).then(() => getActiveElement(ownerDocument)).then(activeElement => (0, _helperHooks.runHooks)('tab', 'targetFound', activeElement).then(() => activeElement)).then(activeElement => {
      let event = (0, _fireEvent._buildKeyboardEvent)('keydown', keyboardEventOptions);
      let defaultNotPrevented = activeElement.dispatchEvent(event);
      if (defaultNotPrevented) {
        // Query the active element again, as it might change during event phase
        activeElement = getActiveElement(ownerDocument);
        let target = findNextResponders(rootElement, activeElement);
        if (target) {
          if (backwards && target.previous) {
            return (0, _focus.__focus__)(target.previous);
          } else if (!backwards && target.next) {
            return (0, _focus.__focus__)(target.next);
          } else {
            return (0, _blur.__blur__)(activeElement);
          }
        }
      }
      return _utils.Promise.resolve();
    }).then(() => {
      let activeElement = getActiveElement(ownerDocument);
      return (0, _fireEvent.default)(activeElement, 'keyup', keyboardEventOptions).then(() => activeElement);
    }).then(activeElement => {
      if (!unRestrainTabIndex && activeElement.tabIndex > 0) {
        throw new Error(`tabindex of greater than 0 is not allowed. Found tabindex=${activeElement.tabIndex}`);
      }
    }).then(() => (0, _helperHooks.runHooks)('tab', 'end', debugData));
  }
});
define("@ember/test-helpers/dom/tap", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/click", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getElement, _fireEvent, _click, _settled, _utils, _logging, _isFormControl, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = tap;
  (0, _helperHooks.registerHook)('tap', 'start', target => {
    (0, _logging.log)('tap', target);
  });

  /**
    Taps on the specified target.
  
    Sends a number of events intending to simulate a "real" user tapping on an
    element.
  
    For non-focusable elements the following events are triggered (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `mouseup`
    - `click`
  
    For focusable (e.g. form control) elements the following events are triggered
    (in order):
  
    - `touchstart`
    - `touchend`
    - `mousedown`
    - `focus`
    - `focusin`
    - `mouseup`
    - `click`
  
    The exact listing of events that are triggered may change over time as needed
    to continue to emulate how actual browsers handle tapping on a given element.
  
    Use the `options` hash to change the parameters of the tap events.
  
    @public
    @param {string|Element} target the element or selector to tap on
    @param {Object} options the options to be merged into the touch events
    @return {Promise<void>} resolves when settled
  
    @example
    <caption>
      Emulating tapping a button using `tap`
    </caption>
  
    tap('button');
  */
  function tap(target) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _utils.Promise.resolve().then(() => {
      return (0, _helperHooks.runHooks)('tap', 'start', target, options);
    }).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `tap`.');
      }
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`tap('${target}')\`.`);
      }
      if ((0, _isFormControl.default)(element) && element.disabled) {
        throw new Error(`Can not \`tap\` disabled ${element}`);
      }
      return (0, _fireEvent.default)(element, 'touchstart', options).then(touchstartEv => (0, _fireEvent.default)(element, 'touchend', options).then(touchendEv => [touchstartEv, touchendEv])).then(_ref => {
        let [touchstartEv, touchendEv] = _ref;
        return !touchstartEv.defaultPrevented && !touchendEv.defaultPrevented ? (0, _click.__click__)(element, options) : _utils.Promise.resolve();
      }).then(_settled.default);
    }).then(() => {
      return (0, _helperHooks.runHooks)('tap', 'end', target, options);
    });
  }
});
define("@ember/test-helpers/dom/trigger-event", ["exports", "@ember/test-helpers/dom/-get-window-or-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _getWindowOrElement, _fireEvent, _settled, _utils, _logging, _isFormControl, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = triggerEvent;
  (0, _helperHooks.registerHook)('triggerEvent', 'start', (target, eventType) => {
    (0, _logging.log)('triggerEvent', target, eventType);
  });

  /**
   * Triggers an event on the specified target.
   *
   * @public
   * @param {string|Element} target the element or selector to trigger the event on
   * @param {string} eventType the type of event to trigger
   * @param {Object} options additional properties to be set on the event
   * @return {Promise<void>} resolves when the application is settled
   *
   * @example
   * <caption>
   * Using `triggerEvent` to upload a file
   *
   * When using `triggerEvent` to upload a file the `eventType` must be `change` and you must pass the
   * `options` param as an object with a key `files` containing an array of
   * [Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob).
   * </caption>
   *
   * triggerEvent(
   *   'input.fileUpload',
   *   'change',
   *   { files: [new Blob(['Ember Rules!'])] }
   * );
   *
   *
   * @example
   * <caption>
   * Using `triggerEvent` to upload a dropped file
   *
   * When using `triggerEvent` to handle a dropped (via drag-and-drop) file, the `eventType` must be `drop`. Assuming your `drop` event handler uses the [DataTransfer API](https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer),
   * you must pass the `options` param as an object with a key of `dataTransfer`. The `options.dataTransfer`     object should have a `files` key, containing an array of [File](https://developer.mozilla.org/en-US/docs/Web/API/File).
   * </caption>
   *
   * triggerEvent(
   *   '[data-test-drop-zone]',
   *   'drop',
   *   {
   *     dataTransfer: {
   *       files: [new File(['Ember Rules!'], 'ember-rules.txt')]
   *     }
   *   }
   * )
   */
  function triggerEvent(target, eventType, options) {
    return _utils.Promise.resolve().then(() => {
      return (0, _helperHooks.runHooks)('triggerEvent', 'start', target, eventType, options);
    }).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerEvent`.');
      }
      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerEvent\``);
      }
      let element = (0, _getWindowOrElement.getWindowOrElement)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`triggerEvent('${target}', ...)\`.`);
      }
      if ((0, _isFormControl.default)(element) && element.disabled) {
        throw new Error(`Can not \`triggerEvent\` on disabled ${element}`);
      }
      return (0, _fireEvent.default)(element, eventType, options).then(_settled.default);
    }).then(() => {
      return (0, _helperHooks.runHooks)('triggerEvent', 'end', target, eventType, options);
    });
  }
});
define("@ember/test-helpers/dom/trigger-key-event", ["exports", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/settled", "@ember/test-helpers/-utils", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/-internal/helper-hooks", "@ember/test-helpers/ie-11-polyfills"], function (_exports, _getElement, _fireEvent, _settled, _utils, _logging, _isFormControl, _helperHooks, _ie11Polyfills) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.__triggerKeyEvent__ = __triggerKeyEvent__;
  _exports.default = triggerKeyEvent;
  (0, _helperHooks.registerHook)('triggerKeyEvent', 'start', (target, eventType, key) => {
    (0, _logging.log)('triggerKeyEvent', target, eventType, key);
  });
  const DEFAULT_MODIFIERS = Object.freeze({
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false
  });

  // This is not a comprehensive list, but it is better than nothing.
  const keyFromKeyCode = {
    8: 'Backspace',
    9: 'Tab',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    48: '0',
    49: '1',
    50: '2',
    51: '3',
    52: '4',
    53: '5',
    54: '6',
    55: '7',
    56: '8',
    57: '9',
    65: 'a',
    66: 'b',
    67: 'c',
    68: 'd',
    69: 'e',
    70: 'f',
    71: 'g',
    72: 'h',
    73: 'i',
    74: 'j',
    75: 'k',
    76: 'l',
    77: 'm',
    78: 'n',
    79: 'o',
    80: 'p',
    81: 'q',
    82: 'r',
    83: 's',
    84: 't',
    85: 'u',
    86: 'v',
    87: 'w',
    88: 'x',
    89: 'y',
    90: 'z',
    91: 'Meta',
    93: 'Meta',
    // There is two keys that map to meta,
    186: ';',
    187: '=',
    188: ',',
    189: '-',
    190: '.',
    191: '/',
    219: '[',
    220: '\\',
    221: ']',
    222: "'"
  };
  const keyFromKeyCodeWithShift = {
    48: ')',
    49: '!',
    50: '@',
    51: '#',
    52: '$',
    53: '%',
    54: '^',
    55: '&',
    56: '*',
    57: '(',
    186: ':',
    187: '+',
    188: '<',
    189: '_',
    190: '>',
    191: '?',
    219: '{',
    220: '|',
    221: '}',
    222: '"'
  };

  /**
    Calculates the value of KeyboardEvent#key given a keycode and the modifiers.
    Note that this works if the key is pressed in combination with the shift key, but it cannot
    detect if caps lock is enabled.
    @param {number} keycode The keycode of the event.
    @param {object} modifiers The modifiers of the event.
    @returns {string} The key string for the event.
   */
  function keyFromKeyCodeAndModifiers(keycode, modifiers) {
    if (keycode > 64 && keycode < 91) {
      if (modifiers.shiftKey) {
        return String.fromCharCode(keycode);
      } else {
        return String.fromCharCode(keycode).toLocaleLowerCase();
      }
    }
    return modifiers.shiftKey && keyFromKeyCodeWithShift[keycode] || keyFromKeyCode[keycode];
  }

  /**
   * Infers the keycode from the given key
   * @param {string} key The KeyboardEvent#key string
   * @returns {number} The keycode for the given key
   */
  function keyCodeFromKey(key) {
    let keys = Object.keys(keyFromKeyCode);
    let keyCode = (0, _ie11Polyfills.find)(keys, keyCode => keyFromKeyCode[Number(keyCode)] === key) || (0, _ie11Polyfills.find)(keys, keyCode => keyFromKeyCode[Number(keyCode)] === key.toLowerCase());
    return keyCode !== undefined ? parseInt(keyCode) : undefined;
  }

  /**
    @private
    @param {Element | Document} element the element to trigger the key event on
    @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
    @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
    @param {Object} [modifiers] the state of various modifier keys
    @return {Promise<Event>} resolves when settled
   */
  function __triggerKeyEvent__(element, eventType, key) {
    let modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_MODIFIERS;
    return _utils.Promise.resolve().then(() => {
      let props;
      if (typeof key === 'number') {
        props = {
          keyCode: key,
          which: key,
          key: keyFromKeyCodeAndModifiers(key, modifiers),
          ...modifiers
        };
      } else if (typeof key === 'string' && key.length !== 0) {
        let firstCharacter = key[0];
        if (!firstCharacter || firstCharacter !== firstCharacter.toUpperCase()) {
          throw new Error(`Must provide a \`key\` to \`triggerKeyEvent\` that starts with an uppercase character but you passed \`${key}\`.`);
        }
        if ((0, _utils.isNumeric)(key) && key.length > 1) {
          throw new Error(`Must provide a numeric \`keyCode\` to \`triggerKeyEvent\` but you passed \`${key}\` as a string.`);
        }
        let keyCode = keyCodeFromKey(key);
        props = {
          keyCode,
          which: keyCode,
          key,
          ...modifiers
        };
      } else {
        throw new Error(`Must provide a \`key\` or \`keyCode\` to \`triggerKeyEvent\``);
      }
      return (0, _fireEvent.default)(element, eventType, props);
    });
  }

  /**
    Triggers a keyboard event of given type in the target element.
    It also requires the developer to provide either a string with the [`key`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values)
    or the numeric [`keyCode`](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) of the pressed key.
    Optionally the user can also provide a POJO with extra modifiers for the event.
  
    @public
    @param {string|Element} target the element or selector to trigger the event on
    @param {'keydown' | 'keyup' | 'keypress'} eventType the type of event to trigger
    @param {number|string} key the `keyCode`(number) or `key`(string) of the event being triggered
    @param {Object} [modifiers] the state of various modifier keys
    @param {boolean} [modifiers.ctrlKey=false] if true the generated event will indicate the control key was pressed during the key event
    @param {boolean} [modifiers.altKey=false] if true the generated event will indicate the alt key was pressed during the key event
    @param {boolean} [modifiers.shiftKey=false] if true the generated event will indicate the shift key was pressed during the key event
    @param {boolean} [modifiers.metaKey=false] if true the generated event will indicate the meta key was pressed during the key event
    @return {Promise<void>} resolves when the application is settled unless awaitSettled is false
  
    @example
    <caption>
      Emulating pressing the `ENTER` key on a button using `triggerKeyEvent`
    </caption>
    triggerKeyEvent('button', 'keydown', 'Enter');
  */
  function triggerKeyEvent(target, eventType, key) {
    let modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : DEFAULT_MODIFIERS;
    return _utils.Promise.resolve().then(() => {
      return (0, _helperHooks.runHooks)('triggerKeyEvent', 'start', target, eventType, key);
    }).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `triggerKeyEvent`.');
      }
      let element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`triggerKeyEvent('${target}', ...)\`.`);
      }
      if (!eventType) {
        throw new Error(`Must provide an \`eventType\` to \`triggerKeyEvent\``);
      }
      if (!(0, _fireEvent.isKeyboardEventType)(eventType)) {
        let validEventTypes = _fireEvent.KEYBOARD_EVENT_TYPES.join(', ');
        throw new Error(`Must provide an \`eventType\` of ${validEventTypes} to \`triggerKeyEvent\` but you passed \`${eventType}\`.`);
      }
      if ((0, _isFormControl.default)(element) && element.disabled) {
        throw new Error(`Can not \`triggerKeyEvent\` on disabled ${element}`);
      }
      return __triggerKeyEvent__(element, eventType, key, modifiers).then(_settled.default);
    }).then(() => (0, _helperHooks.runHooks)('triggerKeyEvent', 'end', target, eventType, key));
  }
});
define("@ember/test-helpers/dom/type-in", ["exports", "@ember/test-helpers/-utils", "@ember/test-helpers/settled", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-is-form-control", "@ember/test-helpers/dom/focus", "@ember/test-helpers/dom/fire-event", "@ember/test-helpers/dom/-guard-for-maxlength", "@ember/test-helpers/dom/-target", "@ember/test-helpers/dom/trigger-key-event", "@ember/test-helpers/dom/-logging", "@ember/test-helpers/-internal/helper-hooks"], function (_exports, _utils, _settled, _getElement, _isFormControl, _focus, _fireEvent, _guardForMaxlength, _target, _triggerKeyEvent, _logging, _helperHooks) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = typeIn;
  (0, _helperHooks.registerHook)('typeIn', 'start', (target, text) => {
    (0, _logging.log)('typeIn', target, text);
  });

  /**
   * Mimics character by character entry into the target `input` or `textarea` element.
   *
   * Allows for simulation of slow entry by passing an optional millisecond delay
   * between key events.
  
   * The major difference between `typeIn` and `fillIn` is that `typeIn` triggers
   * keyboard events as well as `input` and `change`.
   * Typically this looks like `focus` -> `focusin` -> `keydown` -> `keypress` -> `keyup` -> `input` -> `change`
   * per character of the passed text (this may vary on some browsers).
   *
   * @public
   * @param {string|Element} target the element or selector to enter text into
   * @param {string} text the test to fill the element with
   * @param {Object} options {delay: x} (default 50) number of milliseconds to wait per keypress
   * @return {Promise<void>} resolves when the application is settled
   *
   * @example
   * <caption>
   *   Emulating typing in an input using `typeIn`
   * </caption>
   *
   * typeIn('input', 'hello world');
   */
  function typeIn(target, text) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    return _utils.Promise.resolve().then(() => {
      return (0, _helperHooks.runHooks)('typeIn', 'start', target, text, options);
    }).then(() => {
      if (!target) {
        throw new Error('Must pass an element or selector to `typeIn`.');
      }
      const element = (0, _getElement.default)(target);
      if (!element) {
        throw new Error(`Element not found when calling \`typeIn('${target}')\``);
      }
      if ((0, _target.isDocument)(element) || !(0, _isFormControl.default)(element) && !(0, _target.isContentEditable)(element)) {
        throw new Error('`typeIn` is only usable on form controls or contenteditable elements.');
      }
      if (typeof text === 'undefined' || text === null) {
        throw new Error('Must provide `text` when calling `typeIn`.');
      }
      if ((0, _isFormControl.default)(element)) {
        if (element.disabled) {
          throw new Error(`Can not \`typeIn\` disabled '${target}'.`);
        }
        if ('readOnly' in element && element.readOnly) {
          throw new Error(`Can not \`typeIn\` readonly '${target}'.`);
        }
      }
      let {
        delay = 50
      } = options;
      return (0, _focus.__focus__)(element).then(() => fillOut(element, text, delay)).then(() => (0, _fireEvent.default)(element, 'change')).then(_settled.default).then(() => (0, _helperHooks.runHooks)('typeIn', 'end', target, text, options));
    });
  }

  // eslint-disable-next-line require-jsdoc
  function fillOut(element, text, delay) {
    const inputFunctions = text.split('').map(character => keyEntry(element, character));
    return inputFunctions.reduce((currentPromise, func) => {
      return currentPromise.then(() => delayedExecute(delay)).then(func);
    }, _utils.Promise.resolve());
  }

  // eslint-disable-next-line require-jsdoc
  function keyEntry(element, character) {
    let shiftKey = character === character.toUpperCase() && character !== character.toLowerCase();
    let options = {
      shiftKey
    };
    let characterKey = character.toUpperCase();
    return function () {
      return _utils.Promise.resolve().then(() => (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keydown', characterKey, options)).then(() => (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keypress', characterKey, options)).then(() => {
        if ((0, _isFormControl.default)(element)) {
          const newValue = element.value + character;
          (0, _guardForMaxlength.default)(element, newValue, 'typeIn');
          element.value = newValue;
        } else {
          const newValue = element.innerHTML + character;
          element.innerHTML = newValue;
        }
        return (0, _fireEvent.default)(element, 'input');
      }).then(() => (0, _triggerKeyEvent.__triggerKeyEvent__)(element, 'keyup', characterKey, options));
    };
  }

  // eslint-disable-next-line require-jsdoc
  function delayedExecute(delay) {
    return new _utils.Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }
});
define("@ember/test-helpers/dom/wait-for", ["exports", "@ember/test-helpers/wait-until", "@ember/test-helpers/dom/-get-element", "@ember/test-helpers/dom/-get-elements", "@ember/test-helpers/ie-11-polyfills", "@ember/test-helpers/-utils"], function (_exports, _waitUntil, _getElement, _getElements, _ie11Polyfills, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = waitFor;
  /**
    Used to wait for a particular selector to appear in the DOM. Due to the fact
    that it does not wait for general settledness, this is quite useful for testing
    interim DOM states (e.g. loading states, pending promises, etc).
  
    @param {string} selector the selector to wait for
    @param {Object} [options] the options to be used
    @param {number} [options.timeout=1000] the time to wait (in ms) for a match
    @param {number} [options.count=null] the number of elements that should match the provided selector (null means one or more)
    @return {Promise<Element|Element[]>} resolves when the element(s) appear on the page
  
    @example
    <caption>
      Waiting until a selector is rendered:
    </caption>
    await waitFor('.my-selector', { timeout: 2000 })
  */
  function waitFor(selector) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return _utils.Promise.resolve().then(() => {
      if (!selector) {
        throw new Error('Must pass a selector to `waitFor`.');
      }
      let {
        timeout = 1000,
        count = null,
        timeoutMessage
      } = options;
      if (!timeoutMessage) {
        timeoutMessage = `waitFor timed out waiting for selector "${selector}"`;
      }
      let callback;
      if (count !== null) {
        callback = () => {
          let elements = (0, _getElements.default)(selector);
          if (elements.length === count) {
            return (0, _ie11Polyfills.toArray)(elements);
          }
          return;
        };
      } else {
        callback = () => (0, _getElement.default)(selector);
      }
      return (0, _waitUntil.default)(callback, {
        timeout,
        timeoutMessage
      });
    });
  }
});
define("@ember/test-helpers/global", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  /* globals global */
  var _default = (() => {
    if (typeof self !== 'undefined') {
      return self;
    } else if (typeof window !== 'undefined') {
      return window;
    } else if (typeof global !== 'undefined') {
      return global;
    } else {
      return Function('return this')();
    }
  })();
  _exports.default = _default;
});
define("@ember/test-helpers/has-ember-version", ["exports", "ember"], function (_exports, _ember) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = hasEmberVersion;
  /**
    Checks if the currently running Ember version is greater than or equal to the
    specified major and minor version numbers.
  
    @private
    @param {number} major the major version number to compare
    @param {number} minor the minor version number to compare
    @returns {boolean} true if the Ember version is >= MAJOR.MINOR specified, false otherwise
  */
  function hasEmberVersion(major, minor) {
    let numbers = _ember.default.VERSION.split('-')[0]?.split('.');
    if (!numbers || !numbers[0] || !numbers[1]) {
      throw new Error('`Ember.VERSION` is not set.');
    }
    let actualMajor = parseInt(numbers[0], 10);
    let actualMinor = parseInt(numbers[1], 10);
    return actualMajor > major || actualMajor === major && actualMinor >= minor;
  }
});
define("@ember/test-helpers/ie-11-polyfills", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.find = find;
  _exports.toArray = toArray;
  // @ts-nocheck
  /**
   * Polyfills Array.prototype.find for ie11 without mocking the app during test execution
   * @param {array} array to find an element
   * @param {predicate} predicate function to find the element
   * @returns {(number | string | array | function)} found element inside the array
   */
  function find(array, predicate) {
    return Array.prototype.find ? array.find(predicate) : array.filter(predicate)[0];
  }

  /**
   * Polyfills Array.from for ie11 without mocking the app during test execution
   * @param {array} nodeList like data structure(e.g. NodeList)
   * @returns {array} parameter converted to a JS array
   */
  function toArray(nodeList) {
    return Array.from ? Array.from(nodeList) : toArrayPolyfill(nodeList);
  }

  /**
   * @private
   * Polyfills Array.from for ie11 without mocking the app during test execution
   * @param {array} nodeList like data structure(e.g. NodeList)
   * @returns {array} parameter converted to a JS array
   */
  function toArrayPolyfill(nodeList) {
    let array = new Array(nodeList.length);
    for (let i = 0; i < nodeList.length; i++) {
      array[i] = nodeList[i];
    }
    return array;
  }
});
define("@ember/test-helpers/index", ["exports", "@ember/test-helpers/resolver", "@ember/test-helpers/application", "@ember/test-helpers/has-ember-version", "@ember/test-helpers/setup-context", "@ember/test-helpers/teardown-context", "@ember/test-helpers/setup-rendering-context", "@ember/test-helpers/rerender", "@ember/test-helpers/setup-application-context", "@ember/test-helpers/settled", "@ember/test-helpers/wait-until", "@ember/test-helpers/validate-error-handler", "@ember/test-helpers/setup-onerror", "@ember/test-helpers/-internal/debug-info", "@ember/test-helpers/-internal/debug-info-helpers", "@ember/test-helpers/test-metadata", "@ember/test-helpers/-internal/helper-hooks", "@ember/test-helpers/dom/click", "@ember/test-helpers/dom/double-click", "@ember/test-helpers/dom/tab", "@ember/test-helpers/dom/tap", "@ember/test-helpers/dom/focus", "@ember/test-helpers/dom/blur", "@ember/test-helpers/dom/trigger-event", "@ember/test-helpers/dom/trigger-key-event", "@ember/test-helpers/dom/fill-in", "@ember/test-helpers/dom/select", "@ember/test-helpers/dom/wait-for", "@ember/test-helpers/dom/get-root-element", "@ember/test-helpers/dom/find", "@ember/test-helpers/dom/find-all", "@ember/test-helpers/dom/type-in", "@ember/test-helpers/dom/scroll-to"], function (_exports, _resolver, _application, _hasEmberVersion, _setupContext, _teardownContext, _setupRenderingContext, _rerender, _setupApplicationContext, _settled, _waitUntil, _validateErrorHandler, _setupOnerror, _debugInfo, _debugInfoHelpers, _testMetadata, _helperHooks, _click, _doubleClick, _tab, _tap, _focus, _blur, _triggerEvent, _triggerKeyEvent, _fillIn, _select, _waitFor, _getRootElement, _find, _findAll, _typeIn, _scrollTo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "_registerHook", {
    enumerable: true,
    get: function () {
      return _helperHooks.registerHook;
    }
  });
  Object.defineProperty(_exports, "_runHooks", {
    enumerable: true,
    get: function () {
      return _helperHooks.runHooks;
    }
  });
  Object.defineProperty(_exports, "blur", {
    enumerable: true,
    get: function () {
      return _blur.default;
    }
  });
  Object.defineProperty(_exports, "clearRender", {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.clearRender;
    }
  });
  Object.defineProperty(_exports, "click", {
    enumerable: true,
    get: function () {
      return _click.default;
    }
  });
  Object.defineProperty(_exports, "currentRouteName", {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentRouteName;
    }
  });
  Object.defineProperty(_exports, "currentURL", {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.currentURL;
    }
  });
  Object.defineProperty(_exports, "doubleClick", {
    enumerable: true,
    get: function () {
      return _doubleClick.default;
    }
  });
  Object.defineProperty(_exports, "fillIn", {
    enumerable: true,
    get: function () {
      return _fillIn.default;
    }
  });
  Object.defineProperty(_exports, "find", {
    enumerable: true,
    get: function () {
      return _find.default;
    }
  });
  Object.defineProperty(_exports, "findAll", {
    enumerable: true,
    get: function () {
      return _findAll.default;
    }
  });
  Object.defineProperty(_exports, "focus", {
    enumerable: true,
    get: function () {
      return _focus.default;
    }
  });
  Object.defineProperty(_exports, "getApplication", {
    enumerable: true,
    get: function () {
      return _application.getApplication;
    }
  });
  Object.defineProperty(_exports, "getContext", {
    enumerable: true,
    get: function () {
      return _setupContext.getContext;
    }
  });
  Object.defineProperty(_exports, "getDebugInfo", {
    enumerable: true,
    get: function () {
      return _debugInfo.getDebugInfo;
    }
  });
  Object.defineProperty(_exports, "getDeprecations", {
    enumerable: true,
    get: function () {
      return _setupContext.getDeprecations;
    }
  });
  Object.defineProperty(_exports, "getDeprecationsDuringCallback", {
    enumerable: true,
    get: function () {
      return _setupContext.getDeprecationsDuringCallback;
    }
  });
  Object.defineProperty(_exports, "getResolver", {
    enumerable: true,
    get: function () {
      return _resolver.getResolver;
    }
  });
  Object.defineProperty(_exports, "getRootElement", {
    enumerable: true,
    get: function () {
      return _getRootElement.default;
    }
  });
  Object.defineProperty(_exports, "getSettledState", {
    enumerable: true,
    get: function () {
      return _settled.getSettledState;
    }
  });
  Object.defineProperty(_exports, "getTestMetadata", {
    enumerable: true,
    get: function () {
      return _testMetadata.default;
    }
  });
  Object.defineProperty(_exports, "getWarnings", {
    enumerable: true,
    get: function () {
      return _setupContext.getWarnings;
    }
  });
  Object.defineProperty(_exports, "getWarningsDuringCallback", {
    enumerable: true,
    get: function () {
      return _setupContext.getWarningsDuringCallback;
    }
  });
  Object.defineProperty(_exports, "hasEmberVersion", {
    enumerable: true,
    get: function () {
      return _hasEmberVersion.default;
    }
  });
  Object.defineProperty(_exports, "isSettled", {
    enumerable: true,
    get: function () {
      return _settled.isSettled;
    }
  });
  Object.defineProperty(_exports, "pauseTest", {
    enumerable: true,
    get: function () {
      return _setupContext.pauseTest;
    }
  });
  Object.defineProperty(_exports, "registerDebugInfoHelper", {
    enumerable: true,
    get: function () {
      return _debugInfoHelpers.default;
    }
  });
  Object.defineProperty(_exports, "render", {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.render;
    }
  });
  Object.defineProperty(_exports, "rerender", {
    enumerable: true,
    get: function () {
      return _rerender.default;
    }
  });
  Object.defineProperty(_exports, "resetOnerror", {
    enumerable: true,
    get: function () {
      return _setupOnerror.resetOnerror;
    }
  });
  Object.defineProperty(_exports, "resumeTest", {
    enumerable: true,
    get: function () {
      return _setupContext.resumeTest;
    }
  });
  Object.defineProperty(_exports, "scrollTo", {
    enumerable: true,
    get: function () {
      return _scrollTo.default;
    }
  });
  Object.defineProperty(_exports, "select", {
    enumerable: true,
    get: function () {
      return _select.default;
    }
  });
  Object.defineProperty(_exports, "setApplication", {
    enumerable: true,
    get: function () {
      return _application.setApplication;
    }
  });
  Object.defineProperty(_exports, "setContext", {
    enumerable: true,
    get: function () {
      return _setupContext.setContext;
    }
  });
  Object.defineProperty(_exports, "setResolver", {
    enumerable: true,
    get: function () {
      return _resolver.setResolver;
    }
  });
  Object.defineProperty(_exports, "settled", {
    enumerable: true,
    get: function () {
      return _settled.default;
    }
  });
  Object.defineProperty(_exports, "setupApplicationContext", {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.default;
    }
  });
  Object.defineProperty(_exports, "setupContext", {
    enumerable: true,
    get: function () {
      return _setupContext.default;
    }
  });
  Object.defineProperty(_exports, "setupOnerror", {
    enumerable: true,
    get: function () {
      return _setupOnerror.default;
    }
  });
  Object.defineProperty(_exports, "setupRenderingContext", {
    enumerable: true,
    get: function () {
      return _setupRenderingContext.default;
    }
  });
  Object.defineProperty(_exports, "tab", {
    enumerable: true,
    get: function () {
      return _tab.default;
    }
  });
  Object.defineProperty(_exports, "tap", {
    enumerable: true,
    get: function () {
      return _tap.default;
    }
  });
  Object.defineProperty(_exports, "teardownContext", {
    enumerable: true,
    get: function () {
      return _teardownContext.default;
    }
  });
  Object.defineProperty(_exports, "triggerEvent", {
    enumerable: true,
    get: function () {
      return _triggerEvent.default;
    }
  });
  Object.defineProperty(_exports, "triggerKeyEvent", {
    enumerable: true,
    get: function () {
      return _triggerKeyEvent.default;
    }
  });
  Object.defineProperty(_exports, "typeIn", {
    enumerable: true,
    get: function () {
      return _typeIn.default;
    }
  });
  Object.defineProperty(_exports, "unsetContext", {
    enumerable: true,
    get: function () {
      return _setupContext.unsetContext;
    }
  });
  Object.defineProperty(_exports, "validateErrorHandler", {
    enumerable: true,
    get: function () {
      return _validateErrorHandler.default;
    }
  });
  Object.defineProperty(_exports, "visit", {
    enumerable: true,
    get: function () {
      return _setupApplicationContext.visit;
    }
  });
  Object.defineProperty(_exports, "waitFor", {
    enumerable: true,
    get: function () {
      return _waitFor.default;
    }
  });
  Object.defineProperty(_exports, "waitUntil", {
    enumerable: true,
    get: function () {
      return _waitUntil.default;
    }
  });
});
define("@ember/test-helpers/rerender", ["exports", "@ember/test-helpers/-internal/render-settled"], function (_exports, _renderSettled) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = rerender;
  /**
    Returns a promise which will resolve when rendering has completed. In
    this context, rendering is completed when all auto-tracked state that is
    consumed in the template (including any tracked state in models, services,
    etc.  that are then used in a template) has been updated in the DOM.
    
    For example, in a test you might want to update some tracked state and
    then run some assertions after rendering has completed. You _could_ use
    `await settled()` in that location, but in some contexts you don't want to
    wait for full settledness (which includes test waiters, pending AJAX/fetch,
    run loops, etc) but instead only want to know when that updated value has
    been rendered in the DOM. **THAT** is what `await rerender()` is _perfect_
    for.
    @public
    @returns {Promise<void>} a promise which fulfills when rendering has completed
  */
  function rerender() {
    return (0, _renderSettled.default)();
  }
});
define("@ember/test-helpers/resolver", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getResolver = getResolver;
  _exports.setResolver = setResolver;
  let __resolver__;

  /**
    Stores the provided resolver instance so that tests being ran can resolve
    objects in the same way as a normal application.
  
    Used by `setupContext` and `setupRenderingContext` as a fallback when `setApplication` was _not_ used.
  
    @public
    @param {Ember.Resolver} resolver the resolver to be used for testing
  */
  function setResolver(resolver) {
    __resolver__ = resolver;
  }

  /**
    Retrieve the resolver instance stored by `setResolver`.
  
    @public
    @returns {Ember.Resolver} the previously stored resolver
  */
  function getResolver() {
    return __resolver__;
  }
});
define("@ember/test-helpers/settled", ["exports", "@ember/runloop", "ember", "@ember/application/instance", "@ember/test-helpers/-utils", "@ember/test-helpers/wait-until", "@ember/test-helpers/setup-application-context", "@ember/test-waiters", "@ember/test-helpers/-internal/debug-info"], function (_exports, _runloop, _ember, _instance, _utils, _waitUntil, _setupApplicationContext, _testWaiters, _debugInfo) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports._setupAJAXHooks = _setupAJAXHooks;
  _exports._teardownAJAXHooks = _teardownAJAXHooks;
  _exports.default = settled;
  _exports.getSettledState = getSettledState;
  _exports.isSettled = isSettled;
  /* globals jQuery */

  // Ember internally tracks AJAX requests in the same way that we do here for
  // legacy style "acceptance" tests using the `ember-testing.js` asset provided
  // by emberjs/ember.js itself. When `@ember/test-helpers`'s `settled` utility
  // is used in a legacy acceptance test context any pending AJAX requests are
  // not properly considered during the `isSettled` check below.
  //
  // This utilizes a local utility method present in Ember since around 2.8.0 to
  // properly consider pending AJAX requests done within legacy acceptance tests.
  const _internalPendingRequestsModule = (() => {
    let loader = _ember.default.__loader;
    if (loader.registry['ember-testing/test/pending_requests']) {
      // Ember <= 3.1
      return loader.require('ember-testing/test/pending_requests');
    } else if (loader.registry['ember-testing/lib/test/pending_requests']) {
      // Ember >= 3.2
      return loader.require('ember-testing/lib/test/pending_requests');
    }
    return null;
  })();
  const _internalGetPendingRequestsCount = () => {
    if (_internalPendingRequestsModule) {
      return _internalPendingRequestsModule.pendingRequests();
    }
    return 0;
  };
  if (typeof jQuery !== 'undefined' && _internalPendingRequestsModule) {
    // This exists to ensure that the AJAX listeners setup by Ember itself
    // (which as of 2.17 are not properly torn down) get cleared and released
    // when the application is destroyed. Without this, any AJAX requests
    // that happen _between_ acceptance tests will always share
    // `pendingRequests`.
    //
    // This can be removed once Ember 4.0.0 is released
    _instance.default.reopen({
      willDestroy() {
        jQuery(document).off('ajaxSend', _internalPendingRequestsModule.incrementPendingRequests);
        jQuery(document).off('ajaxComplete', _internalPendingRequestsModule.decrementPendingRequests);
        _internalPendingRequestsModule.clearPendingRequests();
        this._super(...arguments);
      }
    });
  }
  let requests;

  /**
    @private
    @returns {number} the count of pending requests
  */
  function pendingRequests() {
    let localRequestsPending = requests !== undefined ? requests.length : 0;
    let internalRequestsPending = _internalGetPendingRequestsCount();
    return localRequestsPending + internalRequestsPending;
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function incrementAjaxPendingRequests(event, xhr) {
    requests.push(xhr);
  }

  /**
    @private
    @param {Event} event (unused)
    @param {XMLHTTPRequest} xhr the XHR that has initiated a request
  */
  function decrementAjaxPendingRequests(event, xhr) {
    // In most Ember versions to date (current version is 2.16) RSVP promises are
    // configured to flush in the actions queue of the Ember run loop, however it
    // is possible that in the future this changes to use "true" micro-task
    // queues.
    //
    // The entire point here, is that _whenever_ promises are resolved will be
    // before the next run of the JS event loop. Then in the next event loop this
    // counter will decrement. In the specific case of AJAX, this means that any
    // promises chained off of `$.ajax` will properly have their `.then` called
    // _before_ this is decremented (and testing continues)
    (0, _utils.nextTick)(() => {
      for (let i = 0; i < requests.length; i++) {
        if (xhr === requests[i]) {
          requests.splice(i, 1);
        }
      }
    }, 0);
  }

  /**
    Clears listeners that were previously setup for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _teardownAJAXHooks() {
    // jQuery will not invoke `ajaxComplete` if
    //    1. `transport.send` throws synchronously and
    //    2. it has an `error` option which also throws synchronously

    // We can no longer handle any remaining requests
    requests = [];
    if (typeof jQuery === 'undefined') {
      return;
    }
    jQuery(document).off('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).off('ajaxComplete', decrementAjaxPendingRequests);
  }

  /**
    Sets up listeners for `ajaxSend` and `ajaxComplete`.
  
    @private
  */
  function _setupAJAXHooks() {
    requests = [];
    if (typeof jQuery === 'undefined') {
      return;
    }
    jQuery(document).on('ajaxSend', incrementAjaxPendingRequests);
    jQuery(document).on('ajaxComplete', decrementAjaxPendingRequests);
  }
  let _internalCheckWaiters;
  let loader = _ember.default.__loader;
  if (loader.registry['ember-testing/test/waiters']) {
    // Ember <= 3.1
    _internalCheckWaiters = loader.require('ember-testing/test/waiters').checkWaiters;
  } else if (loader.registry['ember-testing/lib/test/waiters']) {
    // Ember >= 3.2
    _internalCheckWaiters = loader.require('ember-testing/lib/test/waiters').checkWaiters;
  }

  /**
    @private
    @returns {boolean} true if waiters are still pending
  */
  function checkWaiters() {
    let EmberTest = _ember.default.Test;
    if (_internalCheckWaiters) {
      return _internalCheckWaiters();
    } else if (EmberTest.waiters) {
      if (EmberTest.waiters.some(_ref => {
        let [context, callback] = _ref;
        return !callback.call(context);
      })) {
        return true;
      }
    }
    return false;
  }
  /**
    Check various settledness metrics, and return an object with the following properties:
  
    - `hasRunLoop` - Checks if a run-loop has been started. If it has, this will
      be `true` otherwise it will be `false`.
    - `hasPendingTimers` - Checks if there are scheduled timers in the run-loop.
      These pending timers are primarily registered by `Ember.run.schedule`. If
      there are pending timers, this will be `true`, otherwise `false`.
    - `hasPendingWaiters` - Checks if any registered test waiters are still
      pending (e.g. the waiter returns `true`). If there are pending waiters,
      this will be `true`, otherwise `false`.
    - `hasPendingRequests` - Checks if there are pending AJAX requests (based on
      `ajaxSend` / `ajaxComplete` events triggered by `jQuery.ajax`). If there
      are pending requests, this will be `true`, otherwise `false`.
    - `hasPendingTransitions` - Checks if there are pending route transitions. If the
      router has not been instantiated / setup for the test yet this will return `null`,
      if there are pending transitions, this will be `true`, otherwise `false`.
    - `pendingRequestCount` - The count of pending AJAX requests.
    - `debugInfo` - Debug information that's combined with info return from backburner's
      getDebugInfo method.
    - `isRenderPending` - Checks if there are any pending render operations. This will be true as long
      as there are tracked values in the template that have not been rerendered yet.
  
    @public
    @returns {Object} object with properties for each of the metrics used to determine settledness
  */
  function getSettledState() {
    let hasPendingTimers = _runloop._backburner.hasTimers();
    let hasRunLoop = Boolean(_runloop._backburner.currentInstance);
    let hasPendingLegacyWaiters = checkWaiters();
    let hasPendingTestWaiters = (0, _testWaiters.hasPendingWaiters)();
    let pendingRequestCount = pendingRequests();
    let hasPendingRequests = pendingRequestCount > 0;
    // TODO: Ideally we'd have a function in Ember itself that can synchronously identify whether
    // or not there are any pending render operations, but this will have to suffice for now
    let isRenderPending = !!hasRunLoop;
    return {
      hasPendingTimers,
      hasRunLoop,
      hasPendingWaiters: hasPendingLegacyWaiters || hasPendingTestWaiters,
      hasPendingRequests,
      hasPendingTransitions: (0, _setupApplicationContext.hasPendingTransitions)(),
      isRenderPending,
      pendingRequestCount,
      debugInfo: new _debugInfo.TestDebugInfo({
        hasPendingTimers,
        hasRunLoop,
        hasPendingLegacyWaiters,
        hasPendingTestWaiters,
        hasPendingRequests,
        isRenderPending
      })
    };
  }

  /**
    Checks various settledness metrics (via `getSettledState()`) to determine if things are settled or not.
  
    Settled generally means that there are no pending timers, no pending waiters,
    no pending AJAX requests, and no current run loop. However, new settledness
    metrics may be added and used as they become available.
  
    @public
    @returns {boolean} `true` if settled, `false` otherwise
  */
  function isSettled() {
    let {
      hasPendingTimers,
      hasRunLoop,
      hasPendingRequests,
      hasPendingWaiters,
      hasPendingTransitions,
      isRenderPending
    } = getSettledState();
    if (hasPendingTimers || hasRunLoop || hasPendingRequests || hasPendingWaiters || hasPendingTransitions || isRenderPending) {
      return false;
    }
    return true;
  }

  /**
    Returns a promise that resolves when in a settled state (see `isSettled` for
    a definition of "settled state").
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function settled() {
    return (0, _waitUntil.default)(isSettled, {
      timeout: Infinity
    }).then(() => {});
  }
});
define("@ember/test-helpers/setup-application-context", ["exports", "@ember/object", "@ember/test-helpers/-utils", "@ember/test-helpers/setup-context", "@ember/test-helpers/global", "@ember/test-helpers/has-ember-version", "@ember/test-helpers/settled", "@ember/test-helpers/test-metadata", "@ember/test-helpers/-internal/helper-hooks", "@ember/debug"], function (_exports, _object, _utils, _setupContext, _global, _hasEmberVersion, _settled, _testMetadata, _helperHooks, _debug) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.currentRouteName = currentRouteName;
  _exports.currentURL = currentURL;
  _exports.default = setupApplicationContext;
  _exports.hasPendingTransitions = hasPendingTransitions;
  _exports.isApplicationTestContext = isApplicationTestContext;
  _exports.setupRouterSettlednessTracking = setupRouterSettlednessTracking;
  _exports.visit = visit;
  const CAN_USE_ROUTER_EVENTS = (0, _hasEmberVersion.default)(3, 6);
  let routerTransitionsPending = null;
  const ROUTER = new WeakMap();
  const HAS_SETUP_ROUTER = new WeakMap();

  // eslint-disable-next-line require-jsdoc
  function isApplicationTestContext(context) {
    return (0, _setupContext.isTestContext)(context);
  }

  /**
    Determines if we have any pending router transtions (used to determine `settled` state)
  
    @public
    @returns {(boolean|null)} if there are pending transitions
  */
  function hasPendingTransitions() {
    if (CAN_USE_ROUTER_EVENTS) {
      return routerTransitionsPending;
    }
    let context = (0, _setupContext.getContext)();

    // there is no current context, we cannot check
    if (context === undefined) {
      return null;
    }
    let router = ROUTER.get(context);
    if (router === undefined) {
      // if there is no router (e.g. no `visit` calls made yet), we cannot
      // check for pending transitions but this is explicitly not an error
      // condition
      return null;
    }
    let routerMicrolib = router._routerMicrolib || router.router;
    if (routerMicrolib === undefined) {
      return null;
    }
    return !!routerMicrolib.activeTransition;
  }

  /**
    Setup the current router instance with settledness tracking. Generally speaking this
    is done automatically (during a `visit('/some-url')` invocation), but under some
    circumstances (e.g. a non-application test where you manually call `this.owner.setupRouter()`)
    you may want to call it yourself.
  
    @public
   */
  function setupRouterSettlednessTracking() {
    const context = (0, _setupContext.getContext)();
    if (context === undefined || !(0, _setupContext.isTestContext)(context)) {
      throw new Error('Cannot setupRouterSettlednessTracking outside of a test context');
    }

    // avoid setting up many times for the same context
    if (HAS_SETUP_ROUTER.get(context)) {
      return;
    }
    HAS_SETUP_ROUTER.set(context, true);
    let {
      owner
    } = context;
    let router;
    if (CAN_USE_ROUTER_EVENTS) {
      // SAFETY: unfortunately we cannot `assert` here at present because the
      // class is not exported, only the type, since it is not designed to be
      // sub-classed. The most we can do at present is assert that it at least
      // *exists* and assume that if it does exist, it is bound correctly.
      let routerService = owner.lookup('service:router');
      (true && !(!!routerService) && (0, _debug.assert)('router service is not set up correctly', !!routerService));
      router = routerService;

      // track pending transitions via the public routeWillChange / routeDidChange APIs
      // routeWillChange can fire many times and is only useful to know when we have _started_
      // transitioning, we can then use routeDidChange to signal that the transition has settled
      router.on('routeWillChange', () => routerTransitionsPending = true);
      router.on('routeDidChange', () => routerTransitionsPending = false);
    } else {
      // SAFETY: similarly, this cast cannot be made safer because on the versions
      // where we fall into this path, this is *also* not an exported class.
      let mainRouter = owner.lookup('router:main');
      (true && !(!!mainRouter) && (0, _debug.assert)('router:main is not available', !!mainRouter));
      router = mainRouter;
      ROUTER.set(context, router);
    }

    // hook into teardown to reset local settledness state
    let ORIGINAL_WILL_DESTROY = router.willDestroy;
    router.willDestroy = function () {
      routerTransitionsPending = null;
      return ORIGINAL_WILL_DESTROY.call(this);
    };
  }

  /**
    Navigate the application to the provided URL.
  
    @public
    @param {string} url The URL to visit (e.g. `/posts`)
    @param {object} options app boot options
    @returns {Promise<void>} resolves when settled
  */
  function visit(url, options) {
    const context = (0, _setupContext.getContext)();
    if (!context || !isApplicationTestContext(context)) {
      throw new Error('Cannot call `visit` without having first called `setupApplicationContext`.');
    }
    let {
      owner
    } = context;
    let testMetadata = (0, _testMetadata.default)(context);
    testMetadata.usedHelpers.push('visit');
    return _utils.Promise.resolve().then(() => {
      return (0, _helperHooks.runHooks)('visit', 'start', url, options);
    }).then(() => {
      let visitResult = owner.visit(url, options);
      setupRouterSettlednessTracking();
      return visitResult;
    }).then(() => {
      if (_global.default.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false) {
        context.element = document.querySelector('#ember-testing > .ember-view');
      } else {
        context.element = document.querySelector('#ember-testing');
      }
    }).then(_settled.default).then(() => {
      return (0, _helperHooks.runHooks)('visit', 'end', url, options);
    });
  }

  /**
    @public
    @returns {string} the currently active route name
  */
  function currentRouteName() {
    const context = (0, _setupContext.getContext)();
    if (!context || !isApplicationTestContext(context)) {
      throw new Error('Cannot call `currentRouteName` without having first called `setupApplicationContext`.');
    }
    let router = context.owner.lookup('router:main');
    let currentRouteName = (0, _object.get)(router, 'currentRouteName');
    (true && !(typeof currentRouteName === 'string') && (0, _debug.assert)('currentRouteName shoudl be a string', typeof currentRouteName === 'string'));
    return currentRouteName;
  }
  const HAS_CURRENT_URL_ON_ROUTER = (0, _hasEmberVersion.default)(2, 13);

  /**
    @public
    @returns {string} the applications current url
  */
  function currentURL() {
    const context = (0, _setupContext.getContext)();
    if (!context || !isApplicationTestContext(context)) {
      throw new Error('Cannot call `currentURL` without having first called `setupApplicationContext`.');
    }
    let router = context.owner.lookup('router:main');
    if (HAS_CURRENT_URL_ON_ROUTER) {
      let routerCurrentURL = (0, _object.get)(router, 'currentURL');

      // SAFETY: this path is a lie for the sake of the public-facing types. The
      // framework itself sees this path, but users never do. A user who calls the
      // API without calling `visit()` will see an `UnrecognizedURLError`, rather
      // than getting back `null`.
      if (routerCurrentURL === null) {
        return routerCurrentURL;
      }
      (true && !(typeof routerCurrentURL === 'string') && (0, _debug.assert)(`currentUrl should be a string, but was ${typeof routerCurrentURL}`, typeof routerCurrentURL === 'string'));
      return routerCurrentURL;
    } else {
      // SAFETY: this is *positively ancient* and should probably be removed at
      // some point; old routers which don't have `currentURL` *should* have a
      // `location` with `getURL()` per the docs for 2.12.
      return (0, _object.get)(router, 'location').getURL();
    }
  }

  /**
    Used by test framework addons to setup the provided context for working with
    an application (e.g. routing).
  
    `setupContext` must have been run on the provided context prior to calling
    `setupApplicationContext`.
  
    Sets up the basic framework used by application tests.
  
    @public
    @param {Object} context the context to setup
    @returns {Promise<void>} resolves when the context is set up
  */
  function setupApplicationContext(context) {
    let testMetadata = (0, _testMetadata.default)(context);
    testMetadata.setupTypes.push('setupApplicationContext');
    return _utils.Promise.resolve();
  }
});
define("@ember/test-helpers/setup-context", ["exports", "@ember/runloop", "@ember/object", "@ember/application", "@ember/test-helpers/build-owner", "@ember/test-helpers/settled", "@ember/test-helpers/setup-onerror", "ember", "@ember/debug", "@ember/test-helpers/global", "@ember/test-helpers/resolver", "@ember/test-helpers/application", "@ember/test-helpers/-utils", "@ember/test-helpers/test-metadata", "@ember/destroyable", "@ember/test-helpers/-internal/deprecations", "@ember/test-helpers/-internal/warnings"], function (_exports, _runloop, _object, _application, _buildOwner, _settled, _setupOnerror, _ember, _debug, _global, _resolver, _application2, _utils, _testMetadata, _destroyable, _deprecations, _warnings) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.SetUsage = _exports.ComponentRenderMap = void 0;
  _exports.default = setupContext;
  _exports.getContext = getContext;
  _exports.getDeprecations = getDeprecations;
  _exports.getDeprecationsDuringCallback = getDeprecationsDuringCallback;
  _exports.getWarnings = getWarnings;
  _exports.getWarningsDuringCallback = getWarningsDuringCallback;
  _exports.isTestContext = isTestContext;
  _exports.pauseTest = pauseTest;
  _exports.resumeTest = resumeTest;
  _exports.setContext = setContext;
  _exports.unsetContext = unsetContext;
  // This handler exists to provide the underlying data to enable the following methods:
  // * getDeprecations()
  // * getDeprecationsDuringCallback()
  // * getDeprecationsDuringCallbackForContext()
  (0, _debug.registerDeprecationHandler)((message, options, next) => {
    const context = getContext();
    if (context === undefined) {
      return;
    }
    (0, _deprecations.getDeprecationsForContext)(context).push({
      message,
      options
    });
    next.apply(null, [message, options]);
  });

  // This handler exists to provide the underlying data to enable the following methods:
  // * getWarnings()
  // * getWarningsDuringCallback()
  // * getWarningsDuringCallbackForContext()
  (0, _debug.registerWarnHandler)((message, options, next) => {
    const context = getContext();
    if (context === undefined) {
      return;
    }
    (0, _warnings.getWarningsForContext)(context).push({
      message,
      options
    });
    next.apply(null, [message, options]);
  });
  // eslint-disable-next-line require-jsdoc
  function isTestContext(context) {
    let maybeContext = context;
    return typeof maybeContext['pauseTest'] === 'function' && typeof maybeContext['resumeTest'] === 'function';
  }
  let __test_context__;

  /**
    Stores the provided context as the "global testing context".
  
    Generally setup automatically by `setupContext`.
  
    @public
    @param {Object} context the context to use
  */
  function setContext(context) {
    __test_context__ = context;
  }

  /**
    Retrive the "global testing context" as stored by `setContext`.
  
    @public
    @returns {Object} the previously stored testing context
  */
  function getContext() {
    return __test_context__;
  }

  /**
    Clear the "global testing context".
  
    Generally invoked from `teardownContext`.
  
    @public
  */
  function unsetContext() {
    __test_context__ = undefined;
  }

  /**
   * Returns a promise to be used to pauses the current test (due to being
   * returned from the test itself).  This is useful for debugging while testing
   * or for test-driving.  It allows you to inspect the state of your application
   * at any point.
   *
   * The test framework wrapper (e.g. `ember-qunit` or `ember-mocha`) should
   * ensure that when `pauseTest()` is used, any framework specific test timeouts
   * are disabled.
   *
   * @public
   * @returns {Promise<void>} resolves _only_ when `resumeTest()` is invoked
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { setupRenderingTest } from 'ember-qunit';
   * import { render, click, pauseTest } from '@ember/test-helpers';
   *
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', async function(assert) {
   *     await render(hbs`{{awesome-sauce}}`);
   *
   *     // added here to visualize / interact with the DOM prior
   *     // to the interaction below
   *     await pauseTest();
   *
   *     click('.some-selector');
   *
   *     assert.equal(this.element.textContent, 'this sauce is awesome!');
   *   });
   * });
   */
  function pauseTest() {
    let context = getContext();
    if (!context || !isTestContext(context)) {
      throw new Error('Cannot call `pauseTest` without having first called `setupTest` or `setupRenderingTest`.');
    }
    return context.pauseTest();
  }

  /**
    Resumes a test previously paused by `await pauseTest()`.
  
    @public
  */
  function resumeTest() {
    let context = getContext();
    if (!context || !isTestContext(context)) {
      throw new Error('Cannot call `resumeTest` without having first called `setupTest` or `setupRenderingTest`.');
    }
    context.resumeTest();
  }

  /**
    @private
    @param {Object} context the test context being cleaned up
  */
  function cleanup(context) {
    (0, _settled._teardownAJAXHooks)();

    // SAFETY: this is intimate API *designed* for us to override.
    _ember.default.testing = false;
    unsetContext();
  }

  /**
   * Returns deprecations which have occured so far for a the current test context
   *
   * @public
   * @returns {Array<DeprecationFailure>} An array of deprecation messages
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { getDeprecations } from '@ember/test-helpers';
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', function(assert) {
         const deprecations = getDeprecations() // => returns deprecations which have occured so far in this test
   *   });
   * });
   */
  function getDeprecations() {
    const context = getContext();
    if (!context) {
      throw new Error('[@ember/test-helpers] could not get deprecations if no test context is currently active');
    }
    return (0, _deprecations.getDeprecationsForContext)(context);
  }
  /**
   * Returns deprecations which have occured so far for a the current test context
   *
   * @public
   * @param {Function} [callback] The callback that when executed will have its DeprecationFailure recorded
   * @returns {Array<DeprecationFailure> | Promise<Array<DeprecationFailure>>} An array of deprecation messages
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { getDeprecationsDuringCallback } from '@ember/test-helpers';
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', function(assert) {
   *     const deprecations = getDeprecationsDuringCallback(() => {
   *       // code that might emit some deprecations
   *
   *     }); // => returns deprecations which occured while the callback was invoked
   *   });
   *
   *
   *   test('does something awesome', async function(assert) {
   *     const deprecations = await getDeprecationsDuringCallback(async () => {
   *       // awaited code that might emit some deprecations
   *     }); // => returns deprecations which occured while the callback was invoked
   *   });
   * });
   */
  function getDeprecationsDuringCallback(callback) {
    const context = getContext();
    if (!context) {
      throw new Error('[@ember/test-helpers] could not get deprecations if no test context is currently active');
    }
    return (0, _deprecations.getDeprecationsDuringCallbackForContext)(context, callback);
  }

  /**
   * Returns warnings which have occured so far for a the current test context
   *
   * @public
   * @returns {Array<Warning>} An array of warnings
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { getWarnings } from '@ember/test-helpers';
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', function(assert) {
         const warnings = getWarnings() // => returns warnings which have occured so far in this test
   *   });
   * });
   */
  function getWarnings() {
    const context = getContext();
    if (!context) {
      throw new Error('[@ember/test-helpers] could not get warnings if no test context is currently active');
    }
    return (0, _warnings.getWarningsForContext)(context);
  }
  /**
   * Returns warnings which have occured so far for a the current test context
   *
   * @public
   * @param {Function} [callback] The callback that when executed will have its warnings recorded
   * @returns {Array<Warning> | Promise<Array<Warning>>} An array of warnings information
   * @example <caption>Usage via ember-qunit</caption>
   *
   * import { getWarningsDuringCallback } from '@ember/test-helpers';
   * import { warn } from '@ember/debug';
   *
   * module('awesome-sauce', function(hooks) {
   *   setupRenderingTest(hooks);
   *
   *   test('does something awesome', function(assert) {
   *     const warnings = getWarningsDuringCallback(() => {
   *     warn('some warning');
   *
   *     }); // => returns warnings which occured while the callback was invoked
   *   });
   *
   *   test('does something awesome', async function(assert) {
   *     warn('some warning');
   *
   *     const warnings = await getWarningsDuringCallback(async () => {
   *       warn('some other warning');
   *     }); // => returns warnings which occured while the callback was invoked
   *   });
   * });
   */
  function getWarningsDuringCallback(callback) {
    const context = getContext();
    if (!context) {
      throw new Error('[@ember/test-helpers] could not get warnings if no test context is currently active');
    }
    return (0, _warnings.getWarningsDuringCallbackForContext)(context, callback);
  }

  // This WeakMap is used to track whenever a component is rendered in a test so that we can throw
  // assertions when someone uses `this.{set,setProperties}` while rendering a component.
  const ComponentRenderMap = new WeakMap();
  _exports.ComponentRenderMap = ComponentRenderMap;
  const SetUsage = new WeakMap();

  /**
    Used by test framework addons to setup the provided context for testing.
  
    Responsible for:
  
    - sets the "global testing context" to the provided context (`setContext`)
    - create an owner object and set it on the provided context (e.g. `this.owner`)
    - setup `this.set`, `this.setProperties`, `this.get`, and `this.getProperties` to the provided context
    - setting up AJAX listeners
    - setting up `pauseTest` (also available as `this.pauseTest()`) and `resumeTest` helpers
  
    @public
    @param {Object} base the context to setup
    @param {Object} [options] options used to override defaults
    @param {Resolver} [options.resolver] a resolver to use for customizing normal resolution
    @returns {Promise<Object>} resolves with the context that was setup
  */
  _exports.SetUsage = SetUsage;
  function setupContext(base) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let context = base;

    // SAFETY: this is intimate API *designed* for us to override.
    _ember.default.testing = true;
    setContext(context);
    let testMetadata = (0, _testMetadata.default)(context);
    testMetadata.setupTypes.push('setupContext');
    _runloop._backburner.DEBUG = true;
    (0, _destroyable.registerDestructor)(context, cleanup);
    (0, _setupOnerror._prepareOnerror)(context);
    return _utils.Promise.resolve().then(() => {
      let application = (0, _application2.getApplication)();
      if (application) {
        return application.boot().then(() => {});
      }
      return;
    }).then(() => {
      let {
        resolver
      } = options;

      // This handles precendence, specifying a specific option of
      // resolver always trumps whatever is auto-detected, then we fallback to
      // the suite-wide registrations
      //
      // At some later time this can be extended to support specifying a custom
      // engine or application...
      if (resolver) {
        return (0, _buildOwner.default)(null, resolver);
      }
      return (0, _buildOwner.default)((0, _application2.getApplication)(), (0, _resolver.getResolver)());
    }).then(owner => {
      (0, _destroyable.associateDestroyableChild)(context, owner);
      Object.defineProperty(context, 'owner', {
        configurable: true,
        enumerable: true,
        value: owner,
        writable: false
      });
      (0, _application.setOwner)(context, owner);
      Object.defineProperty(context, 'set', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value(key, value) {
          let ret = (0, _runloop.run)(function () {
            if (ComponentRenderMap.has(context)) {
              (true && !(false) && (0, _debug.assert)('You cannot call `this.set` when passing a component to `render()` (the rendered component does not have access to the test context).'));
            } else {
              let setCalls = SetUsage.get(context);
              if (setCalls === undefined) {
                setCalls = [];
                SetUsage.set(context, setCalls);
              }
              setCalls?.push(key);
            }
            return (0, _object.set)(context, key, value);
          });
          return ret;
        },
        writable: false
      });
      Object.defineProperty(context, 'setProperties', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value(hash) {
          let ret = (0, _runloop.run)(function () {
            if (ComponentRenderMap.has(context)) {
              (true && !(false) && (0, _debug.assert)('You cannot call `this.setProperties` when passing a component to `render()` (the rendered component does not have access to the test context)'));
            } else {
              let setCalls = SetUsage.get(context);
              if (SetUsage.get(context) === undefined) {
                setCalls = [];
                SetUsage.set(context, setCalls);
              }
              setCalls?.push(...Object.keys(hash));
            }
            return (0, _object.setProperties)(context, hash);
          });
          return ret;
        },
        writable: false
      });
      Object.defineProperty(context, 'get', {
        configurable: true,
        enumerable: true,
        value(key) {
          return (0, _object.get)(context, key);
        },
        writable: false
      });
      Object.defineProperty(context, 'getProperties', {
        configurable: true,
        enumerable: true,
        // SAFETY: in all of these `defineProperty` calls, we can't actually guarantee any safety w.r.t. the corresponding field's type in `TestContext`
        value() {
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          return (0, _object.getProperties)(context, args);
        },
        writable: false
      });
      let resume;
      context['resumeTest'] = function resumeTest() {
        (true && !(!!resume) && (0, _debug.assert)('Testing has not been paused. There is nothing to resume.', !!resume));
        resume();
        _global.default.resumeTest = resume = undefined;
      };
      context['pauseTest'] = function pauseTest() {
        console.info('Testing paused. Use `resumeTest()` to continue.'); // eslint-disable-line no-console

        return new _utils.Promise(resolve => {
          resume = resolve;
          _global.default.resumeTest = resumeTest;
        });
      };
      (0, _settled._setupAJAXHooks)();
      return context;
    });
  }
});
define("@ember/test-helpers/setup-onerror", ["exports", "ember", "@ember/test-helpers/setup-context"], function (_exports, _ember, _setupContext) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports._cleanupOnerror = _cleanupOnerror;
  _exports._prepareOnerror = _prepareOnerror;
  _exports.default = setupOnerror;
  _exports.resetOnerror = resetOnerror;
  let cachedOnerror = new Map();

  /**
   * Sets the `Ember.onerror` function for tests. This value is intended to be reset after
   * each test to ensure correct test isolation. To reset, you should simply call `setupOnerror`
   * without an `onError` argument.
   *
   * @public
   * @param {Function} onError the onError function to be set on Ember.onerror
   *
   * @example <caption>Example implementation for `ember-qunit` or `ember-mocha`</caption>
   *
   * import { setupOnerror } from '@ember/test-helpers';
   *
   * test('Ember.onerror is stubbed properly', function(assert) {
   *   setupOnerror(function(err) {
   *     assert.ok(err);
   *   });
   * });
   */
  function setupOnerror(onError) {
    let context = (0, _setupContext.getContext)();
    if (!context) {
      throw new Error('Must setup test context before calling setupOnerror');
    }
    if (!cachedOnerror.has(context)) {
      throw new Error('_cacheOriginalOnerror must be called before setupOnerror. Normally, this will happen as part of your test harness.');
    }
    if (typeof onError !== 'function') {
      onError = cachedOnerror.get(context);
    }
    _ember.default.onerror = onError;
  }

  /**
   * Resets `Ember.onerror` to the value it originally was at the start of the test run.
   * If there is no context or cached value this is a no-op.
   *
   * @public
   *
   * @example
   *
   * import { resetOnerror } from '@ember/test-helpers';
   *
   * QUnit.testDone(function() {
   *   resetOnerror();
   * })
   */
  function resetOnerror() {
    let context = (0, _setupContext.getContext)();
    if (context && cachedOnerror.has(context)) {
      _ember.default.onerror = cachedOnerror.get(context);
    }
  }

  /**
   * Caches the current value of Ember.onerror. When `setupOnerror` is called without a value
   * or when `resetOnerror` is called the value will be set to what was cached here.
   *
   * @private
   * @param {BaseContext} context the text context
   */
  function _prepareOnerror(context) {
    if (cachedOnerror.has(context)) {
      throw new Error('_prepareOnerror should only be called once per-context');
    }
    cachedOnerror.set(context, _ember.default.onerror);
  }

  /**
   * Removes the cached value of Ember.onerror.
   *
   * @private
   * @param {BaseContext} context the text context
   */
  function _cleanupOnerror(context) {
    resetOnerror();
    cachedOnerror.delete(context);
  }
});
define("@ember/test-helpers/setup-rendering-context", ["exports", "@embroider/macros/runtime", "@ember/template-factory", "@ember/runloop", "ember", "@ember/test-helpers/global", "@ember/test-helpers/setup-context", "@ember/test-helpers/-utils", "@ember/test-helpers/settled", "@ember/test-helpers/dom/get-root-element", "@ember/test-helpers/test-metadata", "@ember/debug", "@ember/test-helpers/-internal/helper-hooks", "@ember/test-helpers/has-ember-version", "@ember/test-helpers/-internal/is-component", "@embroider/util"], function (_exports, _runtime, _templateFactory, _runloop, _ember, _global, _setupContext, _utils, _settled, _getRootElement, _testMetadata, _debug, _helperHooks, _hasEmberVersion, _isComponent, _util) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.clearRender = clearRender;
  _exports.default = setupRenderingContext;
  _exports.isRenderingTestContext = isRenderingTestContext;
  _exports.render = render;
  /* globals EmberENV */

  const OUTLET_TEMPLATE = (0, _templateFactory.createTemplateFactory)(
  /*
    {{outlet}}
  */
  {
    "id": "M/1HW24Z",
    "block": "[[[46,[28,[37,1],null,null],null,null,null]],[],false,[\"component\",\"-outlet\"]]",
    "moduleName": "/Users/thorstenk/Desktop/FlashDesignory/Speedometer/resources/todomvc/architecture-examples/emberjs/@ember/test-helpers/setup-rendering-context.js",
    "isStrictMode": false
  });
  const EMPTY_TEMPLATE = (0, _templateFactory.createTemplateFactory)(
  /*
    
  */
  {
    "id": "uZK+OHxi",
    "block": "[[],[],false,[]]",
    "moduleName": "/Users/thorstenk/Desktop/FlashDesignory/Speedometer/resources/todomvc/architecture-examples/emberjs/@ember/test-helpers/setup-rendering-context.js",
    "isStrictMode": false
  });
  const INVOKE_PROVIDED_COMPONENT = (0, _templateFactory.createTemplateFactory)(
  /*
    <this.ProvidedComponent />
  */
  {
    "id": "tIVxRGqg",
    "block": "[[[8,[30,0,[\"ProvidedComponent\"]],null,null,null]],[],false,[]]",
    "moduleName": "/Users/thorstenk/Desktop/FlashDesignory/Speedometer/resources/todomvc/architecture-examples/emberjs/@ember/test-helpers/setup-rendering-context.js",
    "isStrictMode": false
  });
  // eslint-disable-next-line require-jsdoc
  function isRenderingTestContext(context) {
    let maybeContext = context;
    return (0, _setupContext.isTestContext)(context) && typeof maybeContext['render'] === 'function' && typeof maybeContext['clearRender'] === 'function';
  }

  /**
    @private
    @param {Ember.ApplicationInstance} owner the current owner instance
    @param {string} templateFullName the fill template name
    @returns {Template} the template representing `templateFullName`
  */
  function lookupTemplate(owner, templateFullName) {
    let template = owner.lookup(templateFullName);
    if (typeof template === 'function') return template(owner);
    return template;
  }

  /**
    @private
    @param {Ember.ApplicationInstance} owner the current owner instance
    @returns {Template} a template representing {{outlet}}
  */
  function lookupOutletTemplate(owner) {
    let OutletTemplate = lookupTemplate(owner, 'template:-outlet');
    if (!OutletTemplate) {
      owner.register('template:-outlet', OUTLET_TEMPLATE);
      OutletTemplate = lookupTemplate(owner, 'template:-outlet');
    }
    return OutletTemplate;
  }
  let templateId = 0;
  /**
    Renders the provided template and appends it to the DOM.
  
    @public
    @param {Template|Component} templateOrComponent the component (or template) to render
    @param {RenderOptions} options options hash containing engine owner ({ owner: engineOwner })
    @returns {Promise<void>} resolves when settled
  
    @example
    <caption>
      Render a div element with the class 'container'.
    </caption>
    await render(hbs`<div class="container"></div>`);
  */
  function render(templateOrComponent, options) {
    let context = (0, _setupContext.getContext)();
    if (!templateOrComponent) {
      throw new Error('you must pass a template to `render()`');
    }
    return _utils.Promise.resolve().then(() => (0, _helperHooks.runHooks)('render', 'start')).then(() => {
      if (!context || !isRenderingTestContext(context)) {
        throw new Error('Cannot call `render` without having first called `setupRenderingContext`.');
      }
      let {
        owner
      } = context;
      let testMetadata = (0, _testMetadata.default)(context);
      testMetadata.usedHelpers.push('render');

      // SAFETY: this is all wildly unsafe, because it is all using private API.
      // At some point we should define a path forward for this kind of internal
      // API. For now, just flagging it as *NOT* being safe!
      let toplevelView = owner.lookup('-top-level-view:main');
      let OutletTemplate = lookupOutletTemplate(owner);
      let ownerToRenderFrom = options?.owner || owner;
      if ((0, _runtime.macroCondition)(false)) {
        // Pre 3.24, we just don't support rendering components at all, so we error
        // if we find anything that isn't a template.
        const isTemplate = '__id' in templateOrComponent && '__meta' in templateOrComponent || 'id' in templateOrComponent && 'meta' in templateOrComponent;
        if (!isTemplate) {
          throw new Error(`Using \`render\` with something other than a pre-compiled template is not supported until Ember 3.24 (you are on ${_ember.default.VERSION}).`);
        }
        templateId += 1;
        let templateFullName = `template:-undertest-${templateId}`;
        ownerToRenderFrom.register(templateFullName, templateOrComponent);
        templateOrComponent = lookupTemplate(ownerToRenderFrom, templateFullName);
      } else {
        if ((0, _isComponent.default)(templateOrComponent, owner)) {
          // We use this to track when `render` is used with a component so that we can throw an
          // assertion if `this.{set,setProperty} is used in the same test
          _setupContext.ComponentRenderMap.set(context, true);
          const setCalls = _setupContext.SetUsage.get(context);
          if (setCalls !== undefined) {
            (true && !(false) && (0, _debug.assert)(`You cannot call \`this.set\` or \`this.setProperties\` when passing a component to \`render\`, but they were called for the following properties:\n${setCalls.map(key => `  - ${key}`).join('\n')}`));
          }
          let ProvidedComponent = (0, _util.ensureSafeComponent)(templateOrComponent, context);
          context = {
            ProvidedComponent
          };
          templateOrComponent = INVOKE_PROVIDED_COMPONENT;
        } else {
          templateId += 1;
          let templateFullName = `template:-undertest-${templateId}`;
          ownerToRenderFrom.register(templateFullName, templateOrComponent);
          templateOrComponent = lookupTemplate(ownerToRenderFrom, templateFullName);
        }
      }
      let outletState = {
        render: {
          owner,
          // always use the host app owner for application outlet
          into: undefined,
          outlet: 'main',
          name: 'application',
          controller: undefined,
          ViewClass: undefined,
          template: OutletTemplate
        },
        outlets: {
          main: {
            render: {
              owner: ownerToRenderFrom,
              // the actual owner to be used for any lookups
              into: undefined,
              outlet: 'main',
              name: 'index',
              controller: context,
              ViewClass: undefined,
              template: templateOrComponent,
              outlets: {}
            },
            outlets: {}
          }
        }
      };
      toplevelView.setOutletState(outletState);

      // Ember's rendering engine is integration with the run loop so that when a run
      // loop starts, the rendering is scheduled to be done.
      //
      // Ember should be ensuring an instance on its own here (the act of
      // setting outletState should ensureInstance, since we know we need to
      // render), but on Ember < 3.23 that is not guaranteed.
      if (!(0, _hasEmberVersion.default)(3, 23)) {
        // SAFETY: this was correct and type checked on the Ember v3 types, but
        // since the `run` namespace does not exist in Ember v4, this no longer
        // can be type checked. When (eventually) dropping support for Ember v3,
        // and therefore for versions before 3.23, this can be removed entirely.
        _runloop.run.backburner.ensureInstance();
      }

      // returning settled here because the actual rendering does not happen until
      // the renderer detects it is dirty (which happens on backburner's end
      // hook), see the following implementation details:
      //
      // * [view:outlet](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/views/outlet.js#L129-L145) manually dirties its own tag upon `setOutletState`
      // * [backburner's custom end hook](https://github.com/emberjs/ember.js/blob/f94a4b6aef5b41b96ef2e481f35e07608df01440/packages/ember-glimmer/lib/renderer.js#L145-L159) detects that the current revision of the root is no longer the latest, and triggers a new rendering transaction
      return (0, _settled.default)();
    }).then(() => (0, _helperHooks.runHooks)('render', 'end'));
  }

  /**
    Clears any templates previously rendered. This is commonly used for
    confirming behavior that is triggered by teardown (e.g.
    `willDestroyElement`).
  
    @public
    @returns {Promise<void>} resolves when settled
  */
  function clearRender() {
    let context = (0, _setupContext.getContext)();
    if (!context || !isRenderingTestContext(context)) {
      throw new Error('Cannot call `clearRender` without having first called `setupRenderingContext`.');
    }
    return render(EMPTY_TEMPLATE);
  }

  /**
    Used by test framework addons to setup the provided context for rendering.
  
    `setupContext` must have been ran on the provided context
    prior to calling `setupRenderingContext`.
  
    Responsible for:
  
    - Setup the basic framework used for rendering by the
      `render` helper.
    - Ensuring the event dispatcher is properly setup.
    - Setting `this.element` to the root element of the testing
      container (things rendered via `render` will go _into_ this
      element).
  
    @public
    @param {TestContext} context the context to setup for rendering
    @returns {Promise<RenderingTestContext>} resolves with the context that was setup
  
    @example
    <caption>
      Rendering out a paragraph element containing the content 'hello', and then clearing that content via clearRender.
    </caption>
  
    await render(hbs`<p>Hello!</p>`);
    assert.equal(this.element.textContent, 'Hello!', 'has rendered content');
    await clearRender();
    assert.equal(this.element.textContent, '', 'has rendered content');
  */
  function setupRenderingContext(context) {
    let testMetadata = (0, _testMetadata.default)(context);
    testMetadata.setupTypes.push('setupRenderingContext');
    return _utils.Promise.resolve().then(() => {
      let {
        owner
      } = context;
      let renderDeprecationWrapper = function (template) {
        (true && !(false) && (0, _debug.deprecate)('Using this.render has been deprecated, consider using `render` imported from `@ember/test-helpers`.', false, {
          id: 'ember-test-helpers.setup-rendering-context.render',
          until: '3.0.0',
          for: '@ember/test-helpers',
          since: {
            enabled: '2.0.0',
            available: '2.0.0'
          }
        }));
        return render(template);
      };
      let clearRenderDeprecationWrapper = function () {
        (true && !(false) && (0, _debug.deprecate)('Using this.clearRender has been deprecated, consider using `clearRender` imported from `@ember/test-helpers`.', false, {
          id: 'ember-test-helpers.setup-rendering-context.clearRender',
          until: '3.0.0',
          for: '@ember/test-helpers',
          since: {
            enabled: '2.0.0',
            available: '2.0.0'
          }
        }));
        return clearRender();
      };
      Object.defineProperty(context, 'render', {
        configurable: true,
        enumerable: true,
        value: renderDeprecationWrapper,
        writable: false
      });
      Object.defineProperty(context, 'clearRender', {
        configurable: true,
        enumerable: true,
        value: clearRenderDeprecationWrapper,
        writable: false
      });

      // When the host app uses `setApplication` (instead of `setResolver`) the event dispatcher has
      // already been setup via `applicationInstance.boot()` in `./build-owner`. If using
      // `setResolver` (instead of `setApplication`) a "mock owner" is created by extending
      // `Ember._ContainerProxyMixin` and `Ember._RegistryProxyMixin` in this scenario we need to
      // manually start the event dispatcher.
      if (owner._emberTestHelpersMockOwner) {
        let dispatcher = owner.lookup('event_dispatcher:main') || _ember.default.EventDispatcher.create();
        dispatcher.setup({}, '#ember-testing');
      }
      let OutletView = owner.factoryFor ? owner.factoryFor('view:-outlet') : owner._lookupFactory('view:-outlet');
      let environment = owner.lookup('-environment:main');
      let template = owner.lookup('template:-outlet');
      let toplevelView = OutletView.create({
        template,
        environment
      });
      owner.register('-top-level-view:main', {
        create() {
          return toplevelView;
        }
      });

      // initially render a simple empty template
      return render(EMPTY_TEMPLATE).then(() => {
        (0, _runloop.run)(toplevelView, 'appendTo', (0, _getRootElement.default)());
        return (0, _settled.default)();
      });
    }).then(() => {
      Object.defineProperty(context, 'element', {
        configurable: true,
        enumerable: true,
        // ensure the element is based on the wrapping toplevel view
        // Ember still wraps the main application template with a
        // normal tagged view
        //
        // In older Ember versions (2.4) the element itself is not stable,
        // and therefore we cannot update the `this.element` until after the
        // rendering is completed
        value: _global.default.EmberENV._APPLICATION_TEMPLATE_WRAPPER !== false ? (0, _getRootElement.default)().querySelector('.ember-view') : (0, _getRootElement.default)(),
        writable: false
      });
      return context;
    });
  }
});
define("@ember/test-helpers/teardown-context", ["exports", "@ember/test-helpers/-utils", "@ember/test-helpers/settled", "@ember/test-helpers/setup-onerror", "@ember/destroyable"], function (_exports, _utils, _settled, _setupOnerror, _destroyable) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = teardownContext;
  /**
    Used by test framework addons to tear down the provided context after testing is completed.
  
    Responsible for:
  
    - un-setting the "global testing context" (`unsetContext`)
    - destroy the contexts owner object
    - remove AJAX listeners
  
    @public
    @param {Object} context the context to setup
    @param {Object} [options] options used to override defaults
    @param {boolean} [options.waitForSettled=true] should the teardown wait for `settled()`ness
    @returns {Promise<void>} resolves when settled
  */
  function teardownContext(context, options) {
    let waitForSettled = true;
    if (options !== undefined && 'waitForSettled' in options) {
      waitForSettled = options.waitForSettled;
    }
    return _utils.Promise.resolve().then(() => {
      (0, _setupOnerror._cleanupOnerror)(context);
      (0, _destroyable.destroy)(context);
    }).finally(() => {
      if (waitForSettled) {
        return (0, _settled.default)();
      }
      return;
    });
  }
});
define("@ember/test-helpers/test-metadata", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.__TestMetadata = void 0;
  _exports.default = getTestMetadata;
  class TestMetadata {
    constructor() {
      this.setupTypes = [];
      this.usedHelpers = [];
    }
    get isRendering() {
      return this.setupTypes.indexOf('setupRenderingContext') > -1 && this.usedHelpers.indexOf('render') > -1;
    }
    get isApplication() {
      return this.setupTypes.indexOf('setupApplicationContext') > -1;
    }
  }
  _exports.__TestMetadata = TestMetadata;
  // Only export the type side of the item: this way the only way (it is legal) to
  // construct it is here, but users can still reference the type.

  const TEST_METADATA = new WeakMap();

  /**
   * Gets the test metadata associated with the provided test context. Will create
   * a new test metadata object if one does not exist.
   *
   * @param {BaseContext} context the context to use
   * @returns {TestMetadata} the test metadata for the provided context
   */
  function getTestMetadata(context) {
    if (!TEST_METADATA.has(context)) {
      TEST_METADATA.set(context, new TestMetadata());
    }
    return TEST_METADATA.get(context);
  }
});
define("@ember/test-helpers/validate-error-handler", ["exports", "ember"], function (_exports, _ember) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = validateErrorHandler;
  const VALID = Object.freeze({
    isValid: true,
    message: null
  });
  const INVALID = Object.freeze({
    isValid: false,
    message: 'error handler should have re-thrown the provided error'
  });

  /**
   * Validate the provided error handler to confirm that it properly re-throws
   * errors when `Ember.testing` is true.
   *
   * This is intended to be used by test framework hosts (or other libraries) to
   * ensure that `Ember.onerror` is properly configured. Without a check like
   * this, `Ember.onerror` could _easily_ swallow all errors and make it _seem_
   * like everything is just fine (and have green tests) when in reality
   * everything is on fire...
   *
   * @public
   * @param {Function} [callback=Ember.onerror] the callback to validate
   * @returns {Object} object with `isValid` and `message`
   *
   * @example <caption>Example implementation for `ember-qunit`</caption>
   *
   * import { validateErrorHandler } from '@ember/test-helpers';
   *
   * test('Ember.onerror is functioning properly', function(assert) {
   *   let result = validateErrorHandler();
   *   assert.ok(result.isValid, result.message);
   * });
   */
  function validateErrorHandler() {
    let callback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _ember.default.onerror;
    if (callback === undefined || callback === null) {
      return VALID;
    }
    let error = new Error('Error handler validation error!');
    let originalEmberTesting = _ember.default.testing;
    _ember.default.testing = true;
    try {
      callback(error);
    } catch (e) {
      if (e === error) {
        return VALID;
      }
    } finally {
      _ember.default.testing = originalEmberTesting;
    }
    return INVALID;
  }
});
define("@ember/test-helpers/wait-until", ["exports", "@ember/test-helpers/-utils"], function (_exports, _utils) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = waitUntil;
  const TIMEOUTS = [0, 1, 2, 5, 7];
  const MAX_TIMEOUT = 10;
  /**
    Wait for the provided callback to return a truthy value.
  
    This does not leverage `settled()`, and as such can be used to manage async
    while _not_ settled (e.g. "loading" or "pending" states).
  
    @public
    @param {Function} callback the callback to use for testing when waiting should stop
    @param {Object} [options] options used to override defaults
    @param {number} [options.timeout=1000] the maximum amount of time to wait
    @param {string} [options.timeoutMessage='waitUntil timed out'] the message to use in the reject on timeout
    @returns {Promise} resolves with the callback value when it returns a truthy value
  
    @example
    <caption>
      Waiting until a selected element displays text:
    </caption>
    await waitUntil(function() {
      return find('.my-selector').textContent.includes('something')
    }, { timeout: 2000 })
  */
  function waitUntil(callback) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let timeout = 'timeout' in options ? options.timeout : 1000;
    let timeoutMessage = 'timeoutMessage' in options ? options.timeoutMessage : 'waitUntil timed out';

    // creating this error eagerly so it has the proper invocation stack
    let waitUntilTimedOut = new Error(timeoutMessage);
    return new _utils.Promise(function (resolve, reject) {
      let time = 0;

      // eslint-disable-next-line require-jsdoc
      function scheduleCheck(timeoutsIndex) {
        let knownTimeout = TIMEOUTS[timeoutsIndex];
        let interval = knownTimeout === undefined ? MAX_TIMEOUT : knownTimeout;
        (0, _utils.futureTick)(function () {
          time += interval;
          let value;
          try {
            value = callback();
          } catch (error) {
            reject(error);
            return;
          }
          if (value) {
            resolve(value);
          } else if (time < timeout) {
            scheduleCheck(timeoutsIndex + 1);
          } else {
            reject(waitUntilTimedOut);
            return;
          }
        }, interval);
      }
      scheduleCheck(0);
    });
  }
});
define("ember-cli-test-loader/test-support/index", ["exports"], function (_exports) {
  /* globals requirejs, require */
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.addModuleExcludeMatcher = addModuleExcludeMatcher;
  _exports.addModuleIncludeMatcher = addModuleIncludeMatcher;
  _exports.default = void 0;
  let moduleIncludeMatchers = [];
  let moduleExcludeMatchers = [];
  function addModuleIncludeMatcher(fn) {
    moduleIncludeMatchers.push(fn);
  }
  function addModuleExcludeMatcher(fn) {
    moduleExcludeMatchers.push(fn);
  }
  function checkMatchers(matchers, moduleName) {
    return matchers.some(matcher => matcher(moduleName));
  }
  class TestLoader {
    static load() {
      new TestLoader().loadModules();
    }
    constructor() {
      this._didLogMissingUnsee = false;
    }
    shouldLoadModule(moduleName) {
      return moduleName.match(/[-_]test$/);
    }
    listModules() {
      return Object.keys(requirejs.entries);
    }
    listTestModules() {
      let moduleNames = this.listModules();
      let testModules = [];
      let moduleName;
      for (let i = 0; i < moduleNames.length; i++) {
        moduleName = moduleNames[i];
        if (checkMatchers(moduleExcludeMatchers, moduleName)) {
          continue;
        }
        if (checkMatchers(moduleIncludeMatchers, moduleName) || this.shouldLoadModule(moduleName)) {
          testModules.push(moduleName);
        }
      }
      return testModules;
    }
    loadModules() {
      let testModules = this.listTestModules();
      let testModule;
      for (let i = 0; i < testModules.length; i++) {
        testModule = testModules[i];
        this.require(testModule);
        this.unsee(testModule);
      }
    }
    require(moduleName) {
      try {
        require(moduleName);
      } catch (e) {
        this.moduleLoadFailure(moduleName, e);
      }
    }
    unsee(moduleName) {
      if (typeof require.unsee === 'function') {
        require.unsee(moduleName);
      } else if (!this._didLogMissingUnsee) {
        this._didLogMissingUnsee = true;
        if (typeof console !== 'undefined') {
          console.warn('unable to require.unsee, please upgrade loader.js to >= v3.3.0');
        }
      }
    }
    moduleLoadFailure(moduleName, error) {
      console.error('Error loading: ' + moduleName, error.stack);
    }
  }
  _exports.default = TestLoader;
  ;
});
define("ember-page-title/test-support/get-page-title", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.getPageTitle = getPageTitle;
  // Testem appends progress to the title...
  // and there's no way to stop this at the moment

  function getPageTitle(doc) {
    // In Fastboot context we get 2 title elements if we don't remove one from app/index.html
    // In real world applications, it is mandatory to remove <title> from app/index.html
    // We are keeping both for sake for testing browser and fastboot scenarios
    let element = [...(doc || window.document).querySelectorAll('head title')].pop();
    return element && element.innerText.trim().replace(/^\(\d+\/\d+\)/, '');
  }
});
define("ember-page-title/test-support/index", ["exports", "ember-page-title/test-support/get-page-title"], function (_exports, _getPageTitle) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "getPageTitle", {
    enumerable: true,
    get: function () {
      return _getPageTitle.getPageTitle;
    }
  });
});
define("ember-qunit/adapter", ["exports", "ember", "qunit", "@ember/test-helpers/has-ember-version"], function (_exports, _ember, QUnit, _hasEmberVersion) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.default = void 0;
  _exports.nonTestDoneCallback = nonTestDoneCallback;
  function unhandledRejectionAssertion(current, error) {
    let message, source;
    if (typeof error === 'object' && error !== null) {
      message = error.message;
      source = error.stack;
    } else if (typeof error === 'string') {
      message = error;
      source = 'unknown source';
    } else {
      message = 'unhandledRejection occured, but it had no message';
      source = 'unknown source';
    }
    current.assert.pushResult({
      result: false,
      actual: false,
      expected: true,
      message: message,
      source: source
    });
  }
  function nonTestDoneCallback() {}
  let Adapter = _ember.default.Test.Adapter.extend({
    init() {
      this.doneCallbacks = [];
      this.qunit = this.qunit || QUnit;
    },
    asyncStart() {
      let currentTest = this.qunit.config.current;
      let done = currentTest && currentTest.assert ? currentTest.assert.async() : nonTestDoneCallback;
      this.doneCallbacks.push({
        test: currentTest,
        done
      });
    },
    asyncEnd() {
      let currentTest = this.qunit.config.current;
      if (this.doneCallbacks.length === 0) {
        throw new Error('Adapter asyncEnd called when no async was expected. Please create an issue in ember-qunit.');
      }
      let {
        test,
        done
      } = this.doneCallbacks.pop();

      // In future, we should explore fixing this at a different level, specifically
      // addressing the pairing of asyncStart/asyncEnd behavior in a more consistent way.
      if (test === currentTest) {
        done();
      }
    },
    // clobber default implementation of `exception` will be added back for Ember
    // < 2.17 just below...
    exception: null
  });

  // Ember 2.17 and higher do not require the test adapter to have an `exception`
  // method When `exception` is not present, the unhandled rejection is
  // automatically re-thrown and will therefore hit QUnit's own global error
  // handler (therefore appropriately causing test failure)
  if (!(0, _hasEmberVersion.default)(2, 17)) {
    Adapter = Adapter.extend({
      exception(error) {
        unhandledRejectionAssertion(QUnit.config.current, error);
      }
    });
  }
  var _default = Adapter;
  _exports.default = _default;
});
define("ember-qunit/index", ["exports", "ember-qunit/adapter", "ember-qunit/test-loader", "ember-qunit/qunit-configuration", "@ember/runloop", "@ember/test-helpers", "ember", "qunit", "ember-qunit/test-isolation-validation"], function (_exports, _adapter, _testLoader, _qunitConfiguration, _runloop, _testHelpers, _ember, QUnit, _testIsolationValidation) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "QUnitAdapter", {
    enumerable: true,
    get: function () {
      return _adapter.default;
    }
  });
  Object.defineProperty(_exports, "loadTests", {
    enumerable: true,
    get: function () {
      return _testLoader.loadTests;
    }
  });
  Object.defineProperty(_exports, "nonTestDoneCallback", {
    enumerable: true,
    get: function () {
      return _adapter.nonTestDoneCallback;
    }
  });
  _exports.setupApplicationTest = setupApplicationTest;
  _exports.setupEmberOnerrorValidation = setupEmberOnerrorValidation;
  _exports.setupEmberTesting = setupEmberTesting;
  _exports.setupRenderingTest = setupRenderingTest;
  _exports.setupResetOnerror = setupResetOnerror;
  _exports.setupTest = setupTest;
  _exports.setupTestAdapter = setupTestAdapter;
  _exports.setupTestContainer = setupTestContainer;
  _exports.setupTestIsolationValidation = setupTestIsolationValidation;
  _exports.start = start;
  _exports.startTests = startTests;
  /* globals Testem */

  if (typeof Testem !== 'undefined') {
    Testem.hookIntoTestFramework();
  }
  let waitForSettled = true;
  function setupTest(hooks, _options) {
    let options = {
      waitForSettled,
      ..._options
    };
    hooks.beforeEach(function (assert) {
      let testMetadata = (0, _testHelpers.getTestMetadata)(this);
      testMetadata.framework = 'qunit';
      return (0, _testHelpers.setupContext)(this, options).then(() => {
        let originalPauseTest = this.pauseTest;
        this.pauseTest = function QUnit_pauseTest() {
          assert.timeout(-1); // prevent the test from timing out

          // This is a temporary work around for
          // https://github.com/emberjs/ember-qunit/issues/496 this clears the
          // timeout that would fail the test when it hits the global testTimeout
          // value.
          clearTimeout(QUnit.config.timeout);
          return originalPauseTest.call(this);
        };
      });
    });
    hooks.afterEach(function () {
      return (0, _testHelpers.teardownContext)(this, options);
    });
  }
  function setupRenderingTest(hooks, _options) {
    let options = {
      waitForSettled,
      ..._options
    };
    setupTest(hooks, options);
    hooks.beforeEach(function () {
      return (0, _testHelpers.setupRenderingContext)(this);
    });
  }
  function setupApplicationTest(hooks, _options) {
    let options = {
      waitForSettled,
      ..._options
    };
    setupTest(hooks, options);
    hooks.beforeEach(function () {
      return (0, _testHelpers.setupApplicationContext)(this);
    });
  }

  /**
     Uses current URL configuration to setup the test container.
  
     * If `?nocontainer` is set, the test container will be hidden.
     * If `?devmode` or `?fullscreencontainer` is set, the test container will be
       made full screen.
  
     @method setupTestContainer
   */
  function setupTestContainer() {
    let testContainer = document.getElementById('ember-testing-container');
    if (!testContainer) {
      return;
    }
    let params = QUnit.urlParams;
    let containerVisibility = params.nocontainer ? 'hidden' : 'visible';
    if (params.devmode || params.fullscreencontainer) {
      testContainer.className = ' full-screen';
    }
    testContainer.style.visibility = containerVisibility;
  }

  /**
     Instruct QUnit to start the tests.
     @method startTests
   */
  function startTests() {
    QUnit.start();
  }

  /**
     Sets up the `Ember.Test` adapter for usage with QUnit 2.x.
  
     @method setupTestAdapter
   */
  function setupTestAdapter() {
    _ember.default.Test.adapter = _adapter.default.create();
  }

  /**
    Ensures that `Ember.testing` is set to `true` before each test begins
    (including `before` / `beforeEach`), and reset to `false` after each test is
    completed. This is done via `QUnit.testStart` and `QUnit.testDone`.
  
   */
  function setupEmberTesting() {
    QUnit.testStart(() => {
      _ember.default.testing = true;
    });
    QUnit.testDone(() => {
      _ember.default.testing = false;
    });
  }

  /**
    Ensures that `Ember.onerror` (if present) is properly configured to re-throw
    errors that occur while `Ember.testing` is `true`.
  */
  function setupEmberOnerrorValidation() {
    QUnit.module('ember-qunit: Ember.onerror validation', function () {
      QUnit.test('Ember.onerror is functioning properly', function (assert) {
        assert.expect(1);
        let result = (0, _testHelpers.validateErrorHandler)();
        assert.ok(result.isValid, `Ember.onerror handler with invalid testing behavior detected. An Ember.onerror handler _must_ rethrow exceptions when \`Ember.testing\` is \`true\` or the test suite is unreliable. See https://git.io/vbine for more details.`);
      });
    });
  }
  function setupResetOnerror() {
    QUnit.testDone(_testHelpers.resetOnerror);
  }
  function setupTestIsolationValidation(delay) {
    waitForSettled = false;
    _runloop._backburner.DEBUG = true;
    QUnit.on('testStart', () => (0, _testIsolationValidation.installTestNotIsolatedHook)(delay));
  }

  /**
     @method start
     @param {Object} [options] Options to be used for enabling/disabling behaviors
     @param {Boolean} [options.loadTests] If `false` tests will not be loaded automatically.
     @param {Boolean} [options.setupTestContainer] If `false` the test container will not
     be setup based on `devmode`, `dockcontainer`, or `nocontainer` URL params.
     @param {Boolean} [options.startTests] If `false` tests will not be automatically started
     (you must run `QUnit.start()` to kick them off).
     @param {Boolean} [options.setupTestAdapter] If `false` the default Ember.Test adapter will
     not be updated.
     @param {Boolean} [options.setupEmberTesting] `false` opts out of the
     default behavior of setting `Ember.testing` to `true` before all tests and
     back to `false` after each test will.
     @param {Boolean} [options.setupEmberOnerrorValidation] If `false` validation
     of `Ember.onerror` will be disabled.
     @param {Boolean} [options.setupTestIsolationValidation] If `false` test isolation validation
     will be disabled.
     @param {Number} [options.testIsolationValidationDelay] When using
     setupTestIsolationValidation this number represents the maximum amount of
     time in milliseconds that is allowed _after_ the test is completed for all
     async to have been completed. The default value is 50.
   */
  function start() {
    let options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    if (options.loadTests !== false) {
      (0, _testLoader.loadTests)();
    }
    if (options.setupTestContainer !== false) {
      setupTestContainer();
    }
    if (options.setupTestAdapter !== false) {
      setupTestAdapter();
    }
    if (options.setupEmberTesting !== false) {
      setupEmberTesting();
    }
    if (options.setupEmberOnerrorValidation !== false) {
      setupEmberOnerrorValidation();
    }
    if (typeof options.setupTestIsolationValidation !== 'undefined' && options.setupTestIsolationValidation !== false) {
      setupTestIsolationValidation(options.testIsolationValidationDelay);
    }
    if (options.startTests !== false) {
      startTests();
    }
    setupResetOnerror();
  }
});
define("ember-qunit/qunit-configuration", ["qunit"], function (QUnit) {
  "use strict";

  QUnit.config.autostart = false;
  QUnit.config.urlConfig.push({
    id: 'nocontainer',
    label: 'Hide container'
  });
  QUnit.config.urlConfig.push({
    id: 'nolint',
    label: 'Disable Linting'
  });
  QUnit.config.urlConfig.push({
    id: 'devmode',
    label: 'Development mode'
  });
  QUnit.config.testTimeout = QUnit.urlParams.devmode ? null : 60000; //Default Test Timeout 60 Seconds
});
define("ember-qunit/test-isolation-validation", ["exports", "qunit", "@ember/runloop", "@ember/test-helpers"], function (_exports, QUnit, _runloop, _testHelpers) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.detectIfTestNotIsolated = detectIfTestNotIsolated;
  _exports.installTestNotIsolatedHook = installTestNotIsolatedHook;
  /* eslint-disable no-console */

  /**
   * Detects if a specific test isn't isolated. A test is considered
   * not isolated if it:
   *
   * - has pending timers
   * - is in a runloop
   * - has pending AJAX requests
   * - has pending test waiters
   *
   * @function detectIfTestNotIsolated
   * @param {Object} testInfo
   * @param {string} testInfo.module The name of the test module
   * @param {string} testInfo.name The test name
   */
  function detectIfTestNotIsolated(test) {
    let message = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
    if (!(0, _testHelpers.isSettled)()) {
      let {
        debugInfo
      } = (0, _testHelpers.getSettledState)();
      console.group(`${test.module.name}: ${test.testName}`);
      debugInfo.toConsole();
      console.groupEnd();
      test.expected++;
      test.assert.pushResult({
        result: false,
        message: `${message} \nMore information has been printed to the console. Please use that information to help in debugging.\n\n`
      });
    }
  }

  /**
   * Installs a hook to detect if a specific test isn't isolated.
   * This hook is installed by patching into the `test.finish` method,
   * which allows us to be very precise as to when the detection occurs.
   *
   * @function installTestNotIsolatedHook
   * @param {number} delay the delay delay to use when checking for isolation validation
   */
  function installTestNotIsolatedHook() {
    let delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 50;
    if (!(0, _testHelpers.getDebugInfo)()) {
      return;
    }
    let test = QUnit.config.current;
    let finish = test.finish;
    let pushFailure = test.pushFailure;
    test.pushFailure = function (message) {
      if (message.indexOf('Test took longer than') === 0) {
        detectIfTestNotIsolated(this, message);
      } else {
        return pushFailure.apply(this, arguments);
      }
    };

    // We're hooking into `test.finish`, which utilizes internal ordering of
    // when a test's hooks are invoked. We do this mainly because we need
    // greater precision as to when to detect and subsequently report if the
    // test is isolated.
    //
    // We looked at using:
    // - `afterEach`
    //    - the ordering of when the `afterEach` is called is not easy to guarantee
    //      (ancestor `afterEach`es have to be accounted for too)
    // - `QUnit.on('testEnd')`
    //    - is executed too late; the test is already considered done so
    //      we're unable to push a new assert to fail the current test
    // - 'QUnit.done'
    //    - it detaches the failure from the actual test that failed, making it
    //      more confusing to the end user.
    test.finish = function () {
      let doFinish = () => finish.apply(this, arguments);
      if ((0, _testHelpers.isSettled)()) {
        return doFinish();
      } else {
        return (0, _testHelpers.waitUntil)(_testHelpers.isSettled, {
          timeout: delay
        }).catch(() => {
          // we consider that when waitUntil times out, you're in a state of
          // test isolation violation. The nature of the error is irrelevant
          // in this case, and we want to allow the error to fall through
          // to the finally, where cleanup occurs.
        }).finally(() => {
          detectIfTestNotIsolated(this, 'Test is not isolated (async execution is extending beyond the duration of the test).');

          // canceling timers here isn't perfect, but is as good as we can do
          // to attempt to prevent future tests from failing due to this test's
          // leakage
          (0, _runloop._cancelTimers)();
          return doFinish();
        });
      }
    };
  }
});
define("ember-qunit/test-loader", ["exports", "qunit", "ember-cli-test-loader/test-support/index"], function (_exports, QUnit, _index) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.TestLoader = void 0;
  _exports.loadTests = loadTests;
  (0, _index.addModuleExcludeMatcher)(function (moduleName) {
    return QUnit.urlParams.nolint && moduleName.match(/\.(jshint|lint-test)$/);
  });
  (0, _index.addModuleIncludeMatcher)(function (moduleName) {
    return moduleName.match(/\.jshint$/);
  });
  let moduleLoadFailures = [];
  QUnit.done(function () {
    let length = moduleLoadFailures.length;
    try {
      if (length === 0) {
        // do nothing
      } else if (length === 1) {
        throw moduleLoadFailures[0];
      } else {
        throw new Error('\n' + moduleLoadFailures.join('\n'));
      }
    } finally {
      // ensure we release previously captured errors.
      moduleLoadFailures = [];
    }
  });
  class TestLoader extends _index.default {
    moduleLoadFailure(moduleName, error) {
      moduleLoadFailures.push(error);
      QUnit.module('TestLoader Failures');
      QUnit.test(moduleName + ': could not be loaded', function () {
        throw error;
      });
    }
  }

  /**
     Load tests following the default patterns:
  
     * The module name ends with `-test`
     * The module name ends with `.jshint`
  
     Excludes tests that match the following
     patterns when `?nolint` URL param is set:
  
     * The module name ends with `.jshint`
     * The module name ends with `-lint-test`
  
     @method loadTests
   */
  _exports.TestLoader = TestLoader;
  function loadTests() {
    new TestLoader().loadModules();
  }
});
define("ember-test-helpers/has-ember-version", ["exports", "@ember/test-helpers/has-ember-version"], function (_exports, _hasEmberVersion) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  Object.defineProperty(_exports, "default", {
    enumerable: true,
    get: function () {
      return _hasEmberVersion.default;
    }
  });
});
define("qunit-dom/index", ["exports"], function (_exports) {
  "use strict";

  Object.defineProperty(_exports, "__esModule", {
    value: true
  });
  _exports.install = install;
  _exports.setup = setup;
  function exists(options, message) {
    var expectedCount = null;
    if (typeof options === 'string') {
      message = options;
    } else if (options) {
      expectedCount = options.count;
    }
    var elements = this.findElements();
    if (expectedCount === null) {
      var result = elements.length > 0;
      var expected = format(this.targetDescription);
      var actual = result ? expected : format(this.targetDescription, 0);
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
    } else if (typeof expectedCount === 'number') {
      var result = elements.length === expectedCount;
      var actual = format(this.targetDescription, elements.length);
      var expected = format(this.targetDescription, expectedCount);
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
    } else {
      throw new TypeError("Unexpected Parameter: " + expectedCount);
    }
  }
  function format(selector, num) {
    if (num === undefined || num === null) {
      return "Element " + selector + " exists";
    } else if (num === 0) {
      return "Element " + selector + " does not exist";
    } else if (num === 1) {
      return "Element " + selector + " exists once";
    } else if (num === 2) {
      return "Element " + selector + " exists twice";
    } else {
      return "Element " + selector + " exists " + num + " times";
    }
  }

  // imported from https://github.com/nathanboktae/chai-dom
  function elementToString(el) {
    if (!el) return '<not found>';
    var desc;
    if (el instanceof NodeList) {
      if (el.length === 0) {
        return 'empty NodeList';
      }
      desc = Array.prototype.slice.call(el, 0, 5).map(elementToString).join(', ');
      return el.length > 5 ? desc + "... (+" + (el.length - 5) + " more)" : desc;
    }
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
      return String(el);
    }
    desc = el.tagName.toLowerCase();
    if (el.id) {
      desc += "#" + el.id;
    }
    if (el.className && !(el.className instanceof SVGAnimatedString)) {
      desc += "." + String(el.className).replace(/\s+/g, '.');
    }
    Array.prototype.forEach.call(el.attributes, function (attr) {
      if (attr.name !== 'class' && attr.name !== 'id') {
        desc += "[" + attr.name + (attr.value ? "=\"" + attr.value + "\"]" : ']');
      }
    });
    return desc;
  }
  function focused(message) {
    var element = this.findTargetElement();
    if (!element) return;
    var result = document.activeElement === element;
    var actual = elementToString(document.activeElement);
    var expected = elementToString(this.target);
    if (!message) {
      message = "Element " + expected + " is focused";
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function notFocused(message) {
    var element = this.findTargetElement();
    if (!element) return;
    var result = document.activeElement !== element;
    var expected = "Element " + this.targetDescription + " is not focused";
    var actual = result ? expected : "Element " + this.targetDescription + " is focused";
    if (!message) {
      message = expected;
    }
    this.pushResult({
      result: result,
      message: message,
      actual: actual,
      expected: expected
    });
  }
  function checked(message) {
    var element = this.findTargetElement();
    if (!element) return;
    var isChecked = element.checked === true;
    var isNotChecked = element.checked === false;
    var result = isChecked;
    var hasCheckedProp = isChecked || isNotChecked;
    if (!hasCheckedProp) {
      var ariaChecked = element.getAttribute('aria-checked');
      if (ariaChecked !== null) {
        result = ariaChecked === 'true';
      }
    }
    var actual = result ? 'checked' : 'not checked';
    var expected = 'checked';
    if (!message) {
      message = "Element " + elementToString(this.target) + " is checked";
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function notChecked(message) {
    var element = this.findTargetElement();
    if (!element) return;
    var isChecked = element.checked === true;
    var isNotChecked = element.checked === false;
    var result = !isChecked;
    var hasCheckedProp = isChecked || isNotChecked;
    if (!hasCheckedProp) {
      var ariaChecked = element.getAttribute('aria-checked');
      if (ariaChecked !== null) {
        result = ariaChecked !== 'true';
      }
    }
    var actual = result ? 'not checked' : 'checked';
    var expected = 'not checked';
    if (!message) {
      message = "Element " + elementToString(this.target) + " is not checked";
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function required(message) {
    var element = this.findTargetElement();
    if (!element) return;
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      throw new TypeError("Unexpected Element Type: " + element.toString());
    }
    var result = element.required === true;
    var actual = result ? 'required' : 'not required';
    var expected = 'required';
    if (!message) {
      message = "Element " + elementToString(this.target) + " is required";
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function notRequired(message) {
    var element = this.findTargetElement();
    if (!element) return;
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement)) {
      throw new TypeError("Unexpected Element Type: " + element.toString());
    }
    var result = element.required === false;
    var actual = !result ? 'required' : 'not required';
    var expected = 'not required';
    if (!message) {
      message = "Element " + elementToString(this.target) + " is not required";
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function isValid(message, options) {
    if (options === void 0) {
      options = {};
    }
    var element = this.findTargetElement();
    if (!element) return;
    if (!(element instanceof HTMLFormElement || element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLButtonElement || element instanceof HTMLOutputElement || element instanceof HTMLSelectElement)) {
      throw new TypeError("Unexpected Element Type: " + element.toString());
    }
    var validity = element.reportValidity() === true;
    var result = validity === !options.inverted;
    var actual = validity ? 'valid' : 'not valid';
    var expected = options.inverted ? 'not valid' : 'valid';
    if (!message) {
      message = "Element " + elementToString(this.target) + " is " + actual;
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }

  // Visible logic based on jQuery's
  // https://github.com/jquery/jquery/blob/4a2bcc27f9c3ee24b3effac0fbe1285d1ee23cc5/src/css/hiddenVisibleSelectors.js#L11-L13
  function visible(el) {
    if (el === null) return false;
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return false;
    var clientRects = el.getClientRects();
    if (clientRects.length === 0) return false;
    for (var i = 0; i < clientRects.length; i++) {
      var rect = clientRects[i];
      if (rect.width !== 0 && rect.height !== 0) return true;
    }
    return false;
  }
  function isVisible(options, message) {
    var expectedCount = null;
    if (typeof options === 'string') {
      message = options;
    } else if (options) {
      expectedCount = options.count;
    }
    var elements = this.findElements().filter(visible);
    if (expectedCount === null) {
      var result = elements.length > 0;
      var expected = format$1(this.targetDescription);
      var actual = result ? expected : format$1(this.targetDescription, 0);
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
    } else if (typeof expectedCount === 'number') {
      var result = elements.length === expectedCount;
      var actual = format$1(this.targetDescription, elements.length);
      var expected = format$1(this.targetDescription, expectedCount);
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
    } else {
      throw new TypeError("Unexpected Parameter: " + expectedCount);
    }
  }
  function format$1(selector, num) {
    if (num === undefined || num === null) {
      return "Element " + selector + " is visible";
    } else if (num === 0) {
      return "Element " + selector + " is not visible";
    } else if (num === 1) {
      return "Element " + selector + " is visible once";
    } else if (num === 2) {
      return "Element " + selector + " is visible twice";
    } else {
      return "Element " + selector + " is visible " + num + " times";
    }
  }
  function isDisabled(message, options) {
    if (options === void 0) {
      options = {};
    }
    var inverted = options.inverted;
    var element = this.findTargetElement();
    if (!element) return;
    if (!(element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement || element instanceof HTMLButtonElement || element instanceof HTMLOptGroupElement || element instanceof HTMLOptionElement || element instanceof HTMLFieldSetElement)) {
      throw new TypeError("Unexpected Element Type: " + element.toString());
    }
    var result = element.disabled === !inverted;
    var actual = element.disabled === false ? "Element " + this.targetDescription + " is not disabled" : "Element " + this.targetDescription + " is disabled";
    var expected = inverted ? "Element " + this.targetDescription + " is not disabled" : "Element " + this.targetDescription + " is disabled";
    if (!message) {
      message = expected;
    }
    this.pushResult({
      result: result,
      actual: actual,
      expected: expected,
      message: message
    });
  }
  function matchesSelector(elements, compareSelector) {
    var failures = elements.filter(function (it) {
      return !it.matches(compareSelector);
    });
    return failures.length;
  }
  function collapseWhitespace(string) {
    return string.replace(/[\t\r\n]/g, ' ').replace(/ +/g, ' ').replace(/^ /, '').replace(/ $/, '');
  }

  /**
   * This function can be used to convert a NodeList to a regular array.
   * We should be using `Array.from()` for this, but IE11 doesn't support that :(
   *
   * @private
   */
  function toArray(list) {
    return Array.prototype.slice.call(list);
  }
  var DOMAssertions = /** @class */function () {
    function DOMAssertions(target, rootElement, testContext) {
      this.target = target;
      this.rootElement = rootElement;
      this.testContext = testContext;
    }
    /**
     * Assert an {@link HTMLElement} (or multiple) matching the `selector` exists.
     *
     * @param {object?} options
     * @param {number?} options.count
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').exists();
     * assert.dom('.choice').exists({ count: 4 });
     *
     * @see {@link #doesNotExist}
     */
    DOMAssertions.prototype.exists = function (options, message) {
      exists.call(this, options, message);
      return this;
    };
    /**
     * Assert an {@link HTMLElement} matching the `selector` does not exists.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.should-not-exist').doesNotExist();
     *
     * @see {@link #exists}
     */
    DOMAssertions.prototype.doesNotExist = function (message) {
      exists.call(this, {
        count: 0
      }, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently checked.
     *
     * Note: This also supports `aria-checked="true/false"`.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.active').isChecked();
     *
     * @see {@link #isNotChecked}
     */
    DOMAssertions.prototype.isChecked = function (message) {
      checked.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently unchecked.
     *
     * Note: This also supports `aria-checked="true/false"`.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.active').isNotChecked();
     *
     * @see {@link #isChecked}
     */
    DOMAssertions.prototype.isNotChecked = function (message) {
      notChecked.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently focused.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.email').isFocused();
     *
     * @see {@link #isNotFocused}
     */
    DOMAssertions.prototype.isFocused = function (message) {
      focused.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is not currently focused.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').isNotFocused();
     *
     * @see {@link #isFocused}
     */
    DOMAssertions.prototype.isNotFocused = function (message) {
      notFocused.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently required.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="text"]').isRequired();
     *
     * @see {@link #isNotRequired}
     */
    DOMAssertions.prototype.isRequired = function (message) {
      required.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is currently not required.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="text"]').isNotRequired();
     *
     * @see {@link #isRequired}
     */
    DOMAssertions.prototype.isNotRequired = function (message) {
      notRequired.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} passes validation
     *
     * Validity is determined by asserting that:
     *
     * - `element.reportValidity() === true`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.input').isValid();
     *
     * @see {@link #isValid}
     */
    DOMAssertions.prototype.isValid = function (message) {
      isValid.call(this, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} does not pass validation
     *
     * Validity is determined by asserting that:
     *
     * - `element.reportValidity() === true`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.input').isNotValid();
     *
     * @see {@link #isValid}
     */
    DOMAssertions.prototype.isNotValid = function (message) {
      isValid.call(this, message, {
        inverted: true
      });
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` exists and is visible.
     *
     * Visibility is determined by asserting that:
     *
     * - the element's offsetWidth and offsetHeight are non-zero
     * - any of the element's DOMRect objects have a non-zero size
     *
     * Additionally, visibility in this case means that the element is visible on the page,
     * but not necessarily in the viewport.
     *
     * @param {object?} options
     * @param {number?} options.count
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').isVisible();
     * assert.dom('.choice').isVisible({ count: 4 });
     *
     * @see {@link #isNotVisible}
     */
    DOMAssertions.prototype.isVisible = function (options, message) {
      isVisible.call(this, options, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` does not exist or is not visible on the page.
     *
     * Visibility is determined by asserting that:
     *
     * - the element's offsetWidth or offsetHeight are zero
     * - all of the element's DOMRect objects have a size of zero
     *
     * Additionally, visibility in this case means that the element is visible on the page,
     * but not necessarily in the viewport.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isNotVisible();
     *
     * @see {@link #isVisible}
     */
    DOMAssertions.prototype.isNotVisible = function (message) {
      isVisible.call(this, {
        count: 0
      }, message);
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} has an attribute with the provided `name`
     * and optionally checks if the attribute `value` matches the provided text
     * or regular expression.
     *
     * @param {string} name
     * @param {string|RegExp|object?} value
     * @param {string?} message
     *
     * @example
     * assert.dom('input.password-input').hasAttribute('type', 'password');
     *
     * @see {@link #doesNotHaveAttribute}
     */
    DOMAssertions.prototype.hasAttribute = function (name, value, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      if (arguments.length === 1) {
        value = {
          any: true
        };
      }
      var actualValue = element.getAttribute(name);
      if (value instanceof RegExp) {
        var result = value.test(actualValue);
        var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value matching " + value;
        var actual = actualValue === null ? "Element " + this.targetDescription + " does not have attribute \"" + name + "\"" : "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(actualValue);
        if (!message) {
          message = expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else if (value.any === true) {
        var result = actualValue !== null;
        var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\"";
        var actual = result ? expected : "Element " + this.targetDescription + " does not have attribute \"" + name + "\"";
        if (!message) {
          message = expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        var result = value === actualValue;
        var expected = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(value);
        var actual = actualValue === null ? "Element " + this.targetDescription + " does not have attribute \"" + name + "\"" : "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(actualValue);
        if (!message) {
          message = expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} has no attribute with the provided `name`.
     *
     * **Aliases:** `hasNoAttribute`, `lacksAttribute`
     *
     * @param {string} name
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasNoAttribute('disabled');
     *
     * @see {@link #hasAttribute}
     */
    DOMAssertions.prototype.doesNotHaveAttribute = function (name, message) {
      var element = this.findTargetElement();
      if (!element) return;
      var result = !element.hasAttribute(name);
      var expected = "Element " + this.targetDescription + " does not have attribute \"" + name + "\"";
      var actual = expected;
      if (!result) {
        var value = element.getAttribute(name);
        actual = "Element " + this.targetDescription + " has attribute \"" + name + "\" with value " + JSON.stringify(value);
      }
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      return this;
    };
    DOMAssertions.prototype.hasNoAttribute = function (name, message) {
      return this.doesNotHaveAttribute(name, message);
    };
    DOMAssertions.prototype.lacksAttribute = function (name, message) {
      return this.doesNotHaveAttribute(name, message);
    };
    /**
     * Assert that the {@link HTMLElement} has an ARIA attribute with the provided
     * `name` and optionally checks if the attribute `value` matches the provided
     * text or regular expression.
     *
     * @param {string} name
     * @param {string|RegExp|object?} value
     * @param {string?} message
     *
     * @example
     * assert.dom('button').hasAria('pressed', 'true');
     *
     * @see {@link #hasNoAria}
     */
    DOMAssertions.prototype.hasAria = function (name, value, message) {
      return this.hasAttribute("aria-" + name, value, message);
    };
    /**
     * Assert that the {@link HTMLElement} has no ARIA attribute with the
     * provided `name`.
     *
     * @param {string} name
     * @param {string?} message
     *
     * @example
     * assert.dom('button').doesNotHaveAria('pressed');
     *
     * @see {@link #hasAria}
     */
    DOMAssertions.prototype.doesNotHaveAria = function (name, message) {
      return this.doesNotHaveAttribute("aria-" + name, message);
    };
    /**
     * Assert that the {@link HTMLElement} has a property with the provided `name`
     * and checks if the property `value` matches the provided text or regular
     * expression.
     *
     * @param {string} name
     * @param {RegExp|any} value
     * @param {string?} message
     *
     * @example
     * assert.dom('input.password-input').hasProperty('type', 'password');
     *
     * @see {@link #doesNotHaveProperty}
     */
    DOMAssertions.prototype.hasProperty = function (name, value, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var description = this.targetDescription;
      var actualValue = element[name];
      if (value instanceof RegExp) {
        var result = value.test(String(actualValue));
        var expected = "Element " + description + " has property \"" + name + "\" with value matching " + value;
        var actual = "Element " + description + " has property \"" + name + "\" with value " + JSON.stringify(actualValue);
        if (!message) {
          message = expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        var result = value === actualValue;
        var expected = "Element " + description + " has property \"" + name + "\" with value " + JSON.stringify(value);
        var actual = "Element " + description + " has property \"" + name + "\" with value " + JSON.stringify(actualValue);
        if (!message) {
          message = expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is disabled.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isDisabled();
     *
     * @see {@link #isNotDisabled}
     */
    DOMAssertions.prototype.isDisabled = function (message) {
      isDisabled.call(this, message);
      return this;
    };
    /**
     *  Assert that the {@link HTMLElement} or an {@link HTMLElement} matching the
     * `selector` is not disabled.
     *
     * **Aliases:** `isEnabled`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('.foo').isNotDisabled();
     *
     * @see {@link #isDisabled}
     */
    DOMAssertions.prototype.isNotDisabled = function (message) {
      isDisabled.call(this, message, {
        inverted: true
      });
      return this;
    };
    DOMAssertions.prototype.isEnabled = function (message) {
      return this.isNotDisabled(message);
    };
    /**
     * Assert that the {@link HTMLElement} has the `expected` CSS class using
     * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
     *
     * `expected` can also be a regular expression, and the assertion will return
     * true if any of the element's CSS classes match.
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').hasClass('secret-password-input');
     *
     * @example
     * assert.dom('input[type="password"]').hasClass(/.*password-input/);
     *
     * @see {@link #doesNotHaveClass}
     */
    DOMAssertions.prototype.hasClass = function (expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var actual = element.classList.toString();
      if (expected instanceof RegExp) {
        var classNames = Array.prototype.slice.call(element.classList);
        var result = classNames.some(function (className) {
          return expected.test(className);
        });
        if (!message) {
          message = "Element " + this.targetDescription + " has CSS class matching " + expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        var result = element.classList.contains(expected);
        if (!message) {
          message = "Element " + this.targetDescription + " has CSS class \"" + expected + "\"";
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the {@link HTMLElement} does not have the `expected` CSS class using
     * [`classList`](https://developer.mozilla.org/en-US/docs/Web/API/Element/classList).
     *
     * `expected` can also be a regular expression, and the assertion will return
     * true if none of the element's CSS classes match.
     *
     * **Aliases:** `hasNoClass`, `lacksClass`
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input[type="password"]').doesNotHaveClass('username-input');
     *
     * @example
     * assert.dom('input[type="password"]').doesNotHaveClass(/username-.*-input/);
     *
     * @see {@link #hasClass}
     */
    DOMAssertions.prototype.doesNotHaveClass = function (expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var actual = element.classList.toString();
      if (expected instanceof RegExp) {
        var classNames = Array.prototype.slice.call(element.classList);
        var result = classNames.every(function (className) {
          return !expected.test(className);
        });
        if (!message) {
          message = "Element " + this.targetDescription + " does not have CSS class matching " + expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: "not: " + expected,
          message: message
        });
      } else {
        var result = !element.classList.contains(expected);
        if (!message) {
          message = "Element " + this.targetDescription + " does not have CSS class \"" + expected + "\"";
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: "not: " + expected,
          message: message
        });
      }
      return this;
    };
    DOMAssertions.prototype.hasNoClass = function (expected, message) {
      return this.doesNotHaveClass(expected, message);
    };
    DOMAssertions.prototype.lacksClass = function (expected, message) {
      return this.doesNotHaveClass(expected, message);
    };
    /**
     * Assert that the [HTMLElement][] has the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').hasStyle({
     *   opacity: 1,
     *   display: 'block'
     * });
     *
     * @see {@link #hasClass}
     */
    DOMAssertions.prototype.hasStyle = function (expected, message) {
      return this.hasPseudoElementStyle(null, expected, message);
    };
    /**
     * Assert that the pseudo element for `selector` of the [HTMLElement][] has the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {string} selector
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').hasPseudoElementStyle(':after', {
     *   content: '";"',
     * });
     *
     * @see {@link #hasClass}
     */
    DOMAssertions.prototype.hasPseudoElementStyle = function (selector, expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var computedStyle = window.getComputedStyle(element, selector);
      var expectedProperties = Object.keys(expected);
      if (expectedProperties.length <= 0) {
        throw new TypeError("Missing style expectations. There must be at least one style property in the passed in expectation object.");
      }
      var result = expectedProperties.every(function (property) {
        return computedStyle[property] === expected[property];
      });
      var actual = {};
      expectedProperties.forEach(function (property) {
        return actual[property] = computedStyle[property];
      });
      if (!message) {
        var normalizedSelector = selector ? selector.replace(/^:{0,2}/, '::') : '';
        message = "Element " + this.targetDescription + normalizedSelector + " has style \"" + JSON.stringify(expected) + "\"";
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      return this;
    };
    /**
     * Assert that the [HTMLElement][] does not have the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').doesNotHaveStyle({
     *   opacity: 1,
     *   display: 'block'
     * });
     *
     * @see {@link #hasClass}
     */
    DOMAssertions.prototype.doesNotHaveStyle = function (expected, message) {
      return this.doesNotHavePseudoElementStyle(null, expected, message);
    };
    /**
     * Assert that the pseudo element for `selector` of the [HTMLElement][] does not have the `expected` style declarations using
     * [`window.getComputedStyle`](https://developer.mozilla.org/en-US/docs/Web/API/Window/getComputedStyle).
     *
     * @param {string} selector
     * @param {object} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('.progress-bar').doesNotHavePseudoElementStyle(':after', {
     *   content: '";"',
     * });
     *
     * @see {@link #hasClass}
     */
    DOMAssertions.prototype.doesNotHavePseudoElementStyle = function (selector, expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var computedStyle = window.getComputedStyle(element, selector);
      var expectedProperties = Object.keys(expected);
      if (expectedProperties.length <= 0) {
        throw new TypeError("Missing style expectations. There must be at least one style property in the passed in expectation object.");
      }
      var result = expectedProperties.some(function (property) {
        return computedStyle[property] !== expected[property];
      });
      var actual = {};
      expectedProperties.forEach(function (property) {
        return actual[property] = computedStyle[property];
      });
      if (!message) {
        var normalizedSelector = selector ? selector.replace(/^:{0,2}/, '::') : '';
        message = "Element " + this.targetDescription + normalizedSelector + " does not have style \"" + JSON.stringify(expected) + "\"";
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      return this;
    };
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` matches the `expected` text, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute and stripping/collapsing whitespace.
     *
     * `expected` can also be a regular expression.
     *
     * > Note: This assertion will collapse whitespace if the type you pass in is a string.
     * > If you are testing specifically for whitespace integrity, pass your expected text
     * > in as a RegEx pattern.
     *
     * **Aliases:** `matchesText`
     *
     * @param {string|RegExp} expected
     * @param {string?} message
     *
     * @example
     * // <h2 id="title">
     * //   Welcome to <b>QUnit</b>
     * // </h2>
     *
     * assert.dom('#title').hasText('Welcome to QUnit');
     *
     * @example
     * assert.dom('.foo').hasText(/[12]\d{3}/);
     *
     * @see {@link #includesText}
     */
    DOMAssertions.prototype.hasText = function (expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      if (expected instanceof RegExp) {
        var result = expected.test(element.textContent);
        var actual = element.textContent;
        if (!message) {
          message = "Element " + this.targetDescription + " has text matching " + expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else if (expected.any === true) {
        var result = Boolean(element.textContent);
        var expected_1 = "Element " + this.targetDescription + " has a text";
        var actual = result ? expected_1 : "Element " + this.targetDescription + " has no text";
        if (!message) {
          message = expected_1;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected_1,
          message: message
        });
      } else if (typeof expected === 'string') {
        expected = collapseWhitespace(expected);
        var actual = collapseWhitespace(element.textContent);
        var result = actual === expected;
        if (!message) {
          message = "Element " + this.targetDescription + " has text \"" + expected + "\"";
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        throw new TypeError("You must pass a string or Regular Expression to \"hasText\". You passed " + expected + ".");
      }
      return this;
    };
    DOMAssertions.prototype.matchesText = function (expected, message) {
      return this.hasText(expected, message);
    };
    /**
     * Assert that the `textContent` property of an {@link HTMLElement} is not empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('button.share').hasAnyText();
     *
     * @see {@link #hasText}
     */
    DOMAssertions.prototype.hasAnyText = function (message) {
      return this.hasText({
        any: true
      }, message);
    };
    /**
     * Assert that the `textContent` property of an {@link HTMLElement} is empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('div').hasNoText();
     *
     * @see {@link #hasNoText}
     */
    DOMAssertions.prototype.hasNoText = function (message) {
      return this.hasText('', message);
    };
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` contains the given `text`, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute.
     *
     * > Note: This assertion will collapse whitespace in `textContent` before searching.
     * > If you would like to assert on a string that *should* contain line breaks, tabs,
     * > more than one space in a row, or starting/ending whitespace, use the {@link #hasText}
     * > selector and pass your expected text in as a RegEx pattern.
     *
     * **Aliases:** `containsText`, `hasTextContaining`
     *
     * @param {string} text
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').includesText('Welcome');
     *
     * @see {@link #hasText}
     */
    DOMAssertions.prototype.includesText = function (text, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var collapsedText = collapseWhitespace(element.textContent);
      var result = collapsedText.indexOf(text) !== -1;
      var actual = collapsedText;
      var expected = text;
      if (!message) {
        message = "Element " + this.targetDescription + " has text containing \"" + text + "\"";
      }
      if (!result && text !== collapseWhitespace(text)) {
        console.warn('The `.includesText()`, `.containsText()`, and `.hasTextContaining()` assertions collapse whitespace. The text you are checking for contains whitespace that may have made your test fail incorrectly. Try the `.hasText()` assertion passing in your expected text as a RegExp pattern. Your text:\n' + text);
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      return this;
    };
    DOMAssertions.prototype.containsText = function (expected, message) {
      return this.includesText(expected, message);
    };
    DOMAssertions.prototype.hasTextContaining = function (expected, message) {
      return this.includesText(expected, message);
    };
    /**
     * Assert that the text of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` does not include the given `text`, using the
     * [`textContent`](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent)
     * attribute.
     *
     * **Aliases:** `doesNotContainText`, `doesNotHaveTextContaining`
     *
     * @param {string} text
     * @param {string?} message
     *
     * @example
     * assert.dom('#title').doesNotIncludeText('Welcome');
     */
    DOMAssertions.prototype.doesNotIncludeText = function (text, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      var collapsedText = collapseWhitespace(element.textContent);
      var result = collapsedText.indexOf(text) === -1;
      var expected = "Element " + this.targetDescription + " does not include text \"" + text + "\"";
      var actual = expected;
      if (!result) {
        actual = "Element " + this.targetDescription + " includes text \"" + text + "\"";
      }
      if (!message) {
        message = expected;
      }
      this.pushResult({
        result: result,
        actual: actual,
        expected: expected,
        message: message
      });
      return this;
    };
    DOMAssertions.prototype.doesNotContainText = function (unexpected, message) {
      return this.doesNotIncludeText(unexpected, message);
    };
    DOMAssertions.prototype.doesNotHaveTextContaining = function (unexpected, message) {
      return this.doesNotIncludeText(unexpected, message);
    };
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} matches
     * the `expected` text or regular expression.
     *
     * If no `expected` value is provided, the assertion will fail if the
     * `value` is an empty string.
     *
     * @param {string|RegExp|object?} expected
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasValue('HSimpson');
        * @see {@link #hasAnyValue}
     * @see {@link #hasNoValue}
     */
    DOMAssertions.prototype.hasValue = function (expected, message) {
      var element = this.findTargetElement();
      if (!element) return this;
      if (arguments.length === 0) {
        expected = {
          any: true
        };
      }
      var value = element.value;
      if (expected instanceof RegExp) {
        var result = expected.test(value);
        var actual = value;
        if (!message) {
          message = "Element " + this.targetDescription + " has value matching " + expected;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      } else if (expected.any === true) {
        var result = Boolean(value);
        var expected_2 = "Element " + this.targetDescription + " has a value";
        var actual = result ? expected_2 : "Element " + this.targetDescription + " has no value";
        if (!message) {
          message = expected_2;
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected_2,
          message: message
        });
      } else {
        var actual = value;
        var result = actual === expected;
        if (!message) {
          message = "Element " + this.targetDescription + " has value \"" + expected + "\"";
        }
        this.pushResult({
          result: result,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} is not empty.
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasAnyValue();
     *
     * @see {@link #hasValue}
     * @see {@link #hasNoValue}
     */
    DOMAssertions.prototype.hasAnyValue = function (message) {
      return this.hasValue({
        any: true
      }, message);
    };
    /**
     * Assert that the `value` property of an {@link HTMLInputElement} is empty.
     *
     * **Aliases:** `lacksValue`
     *
     * @param {string?} message
     *
     * @example
     * assert.dom('input.username').hasNoValue();
     *
     * @see {@link #hasValue}
     * @see {@link #hasAnyValue}
     */
    DOMAssertions.prototype.hasNoValue = function (message) {
      return this.hasValue('', message);
    };
    DOMAssertions.prototype.lacksValue = function (message) {
      return this.hasNoValue(message);
    };
    /**
     * Assert that the target selector selects only Elements that are also selected by
     * compareSelector.
     *
     * @param {string} compareSelector
     * @param {string?} message
     *
     * @example
     * assert.dom('p.red').matchesSelector('div.wrapper p:last-child')
     */
    DOMAssertions.prototype.matchesSelector = function (compareSelector, message) {
      var targetElements = this.target instanceof Element ? [this.target] : this.findElements();
      var targets = targetElements.length;
      var matchFailures = matchesSelector(targetElements, compareSelector);
      var singleElement = targets === 1;
      var selectedByPart = this.target instanceof Element ? 'passed' : "selected by " + this.target;
      var actual;
      var expected;
      if (matchFailures === 0) {
        // no failures matching.
        if (!message) {
          message = singleElement ? "The element " + selectedByPart + " also matches the selector " + compareSelector + "." : targets + " elements, selected by " + this.target + ", also match the selector " + compareSelector + ".";
        }
        actual = expected = message;
        this.pushResult({
          result: true,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        var difference = targets - matchFailures;
        // there were failures when matching.
        if (!message) {
          message = singleElement ? "The element " + selectedByPart + " did not also match the selector " + compareSelector + "." : matchFailures + " out of " + targets + " elements selected by " + this.target + " did not also match the selector " + compareSelector + ".";
        }
        actual = singleElement ? message : difference + " elements matched " + compareSelector + ".";
        expected = singleElement ? "The element should have matched " + compareSelector + "." : targets + " elements should have matched " + compareSelector + ".";
        this.pushResult({
          result: false,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the target selector selects only Elements that are not also selected by
     * compareSelector.
     *
     * @param {string} compareSelector
     * @param {string?} message
     *
     * @example
     * assert.dom('input').doesNotMatchSelector('input[disabled]')
     */
    DOMAssertions.prototype.doesNotMatchSelector = function (compareSelector, message) {
      var targetElements = this.target instanceof Element ? [this.target] : this.findElements();
      var targets = targetElements.length;
      var matchFailures = matchesSelector(targetElements, compareSelector);
      var singleElement = targets === 1;
      var selectedByPart = this.target instanceof Element ? 'passed' : "selected by " + this.target;
      var actual;
      var expected;
      if (matchFailures === targets) {
        // the assertion is successful because no element matched the other selector.
        if (!message) {
          message = singleElement ? "The element " + selectedByPart + " did not also match the selector " + compareSelector + "." : targets + " elements, selected by " + this.target + ", did not also match the selector " + compareSelector + ".";
        }
        actual = expected = message;
        this.pushResult({
          result: true,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        var difference = targets - matchFailures;
        // the assertion fails because at least one element matched the other selector.
        if (!message) {
          message = singleElement ? "The element " + selectedByPart + " must not also match the selector " + compareSelector + "." : difference + " elements out of " + targets + ", selected by " + this.target + ", must not also match the selector " + compareSelector + ".";
        }
        actual = singleElement ? "The element " + selectedByPart + " matched " + compareSelector + "." : matchFailures + " elements did not match " + compareSelector + ".";
        expected = singleElement ? message : targets + " elements should not have matched " + compareSelector + ".";
        this.pushResult({
          result: false,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` matches the `expected` tagName, using the
     * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
     * property of the {@link HTMLElement}.
     *
     * @param {string} expected
     * @param {string?} message
     *
     * @example
     * // <h1 id="title">
     * //   Title
     * // </h1>
     *
     * assert.dom('#title').hasTagName('h1');
     */
    DOMAssertions.prototype.hasTagName = function (tagName, message) {
      var element = this.findTargetElement();
      var actual;
      var expected;
      if (!element) return this;
      if (typeof tagName !== 'string') {
        throw new TypeError("You must pass a string to \"hasTagName\". You passed " + tagName + ".");
      }
      actual = element.tagName.toLowerCase();
      expected = tagName.toLowerCase();
      if (actual === expected) {
        if (!message) {
          message = "Element " + this.targetDescription + " has tagName " + expected;
        }
        this.pushResult({
          result: true,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        if (!message) {
          message = "Element " + this.targetDescription + " does not have tagName " + expected;
        }
        this.pushResult({
          result: false,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * Assert that the tagName of the {@link HTMLElement} or an {@link HTMLElement}
     * matching the `selector` does not match the `expected` tagName, using the
     * [`tagName`](https://developer.mozilla.org/en-US/docs/Web/API/Element/tagName)
     * property of the {@link HTMLElement}.
     *
     * @param {string} expected
     * @param {string?} message
     *
     * @example
     * // <section id="block">
     * //   Title
     * // </section>
     *
     * assert.dom('section#block').doesNotHaveTagName('div');
     */
    DOMAssertions.prototype.doesNotHaveTagName = function (tagName, message) {
      var element = this.findTargetElement();
      var actual;
      var expected;
      if (!element) return this;
      if (typeof tagName !== 'string') {
        throw new TypeError("You must pass a string to \"doesNotHaveTagName\". You passed " + tagName + ".");
      }
      actual = element.tagName.toLowerCase();
      expected = tagName.toLowerCase();
      if (actual !== expected) {
        if (!message) {
          message = "Element " + this.targetDescription + " does not have tagName " + expected;
        }
        this.pushResult({
          result: true,
          actual: actual,
          expected: expected,
          message: message
        });
      } else {
        if (!message) {
          message = "Element " + this.targetDescription + " has tagName " + expected;
        }
        this.pushResult({
          result: false,
          actual: actual,
          expected: expected,
          message: message
        });
      }
      return this;
    };
    /**
     * @private
     */
    DOMAssertions.prototype.pushResult = function (result) {
      this.testContext.pushResult(result);
    };
    /**
     * Finds a valid HTMLElement from target, or pushes a failing assertion if a valid
     * element is not found.
     * @private
     * @returns (HTMLElement|null) a valid HTMLElement, or null
     */
    DOMAssertions.prototype.findTargetElement = function () {
      var el = this.findElement();
      if (el === null) {
        var message = "Element " + (this.target || '<unknown>') + " should exist";
        this.pushResult({
          message: message,
          result: false,
          actual: undefined,
          expected: undefined
        });
        return null;
      }
      return el;
    };
    /**
     * Finds a valid HTMLElement from target
     * @private
     * @returns (HTMLElement|null) a valid HTMLElement, or null
     * @throws TypeError will be thrown if target is an unrecognized type
     */
    DOMAssertions.prototype.findElement = function () {
      if (this.target === null) {
        return null;
      } else if (typeof this.target === 'string') {
        return this.rootElement.querySelector(this.target);
      } else if (this.target instanceof Element) {
        return this.target;
      } else {
        throw new TypeError("Unexpected Parameter: " + this.target);
      }
    };
    /**
     * Finds a collection of Element instances from target using querySelectorAll
     * @private
     * @returns (Element[]) an array of Element instances
     * @throws TypeError will be thrown if target is an unrecognized type
     */
    DOMAssertions.prototype.findElements = function () {
      if (this.target === null) {
        return [];
      } else if (typeof this.target === 'string') {
        return toArray(this.rootElement.querySelectorAll(this.target));
      } else if (this.target instanceof Element) {
        return [this.target];
      } else {
        throw new TypeError("Unexpected Parameter: " + this.target);
      }
    };
    Object.defineProperty(DOMAssertions.prototype, "targetDescription", {
      /**
       * @private
       */
      get: function () {
        return elementToString(this.target);
      },
      enumerable: false,
      configurable: true
    });
    return DOMAssertions;
  }();
  var _getRootElement = function () {
    return null;
  };
  function overrideRootElement(fn) {
    _getRootElement = fn;
  }
  function getRootElement() {
    return _getRootElement();
  }
  function install(assert) {
    assert.dom = function (target, rootElement) {
      if (!isValidRootElement(rootElement)) {
        throw new Error(rootElement + " is not a valid root element");
      }
      rootElement = rootElement || this.dom.rootElement || getRootElement();
      if (arguments.length === 0) {
        target = rootElement instanceof Element ? rootElement : null;
      }
      return new DOMAssertions(target, rootElement, this);
    };
    function isValidRootElement(element) {
      return !element || typeof element === 'object' && typeof element.querySelector === 'function' && typeof element.querySelectorAll === 'function';
    }
  }
  function setup(assert, options) {
    if (options === void 0) {
      options = {};
    }
    install(assert);
    var getRootElement = typeof options.getRootElement === 'function' ? options.getRootElement : function () {
      return document.querySelector('#ember-testing');
    };
    overrideRootElement(getRootElement);
  }
});
/*
  used to determine if the application should be booted immediately when `app-name.js` is evaluated
  when `runningTests` the `app-name.js` file will **not** import the applications `app/app.js` and
  call `Application.create(...)` on it. Additionally, applications can opt-out of this behavior by
  setting `autoRun` to `false` in their `ember-cli-build.js`
*/
runningTests = true;

/*
  This file overrides a file built into ember-cli's build pipeline and prevents
  this built-in `Testem.hookIntoTestFramework` invocation:

  https://github.com/ember-cli/ember-cli/blob/v3.20.0/lib/broccoli/test-support-suffix.js#L3-L5
*/
;
var __ember_auto_import__ =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// install a JSONP callback for chunk loading
/******/ 	function webpackJsonpCallback(data) {
/******/ 		var chunkIds = data[0];
/******/ 		var moreModules = data[1];
/******/ 		var executeModules = data[2];
/******/
/******/ 		// add "moreModules" to the modules object,
/******/ 		// then flag all "chunkIds" as loaded and fire callback
/******/ 		var moduleId, chunkId, i = 0, resolves = [];
/******/ 		for(;i < chunkIds.length; i++) {
/******/ 			chunkId = chunkIds[i];
/******/ 			if(Object.prototype.hasOwnProperty.call(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 				resolves.push(installedChunks[chunkId][0]);
/******/ 			}
/******/ 			installedChunks[chunkId] = 0;
/******/ 		}
/******/ 		for(moduleId in moreModules) {
/******/ 			if(Object.prototype.hasOwnProperty.call(moreModules, moduleId)) {
/******/ 				modules[moduleId] = moreModules[moduleId];
/******/ 			}
/******/ 		}
/******/ 		if(parentJsonpFunction) parentJsonpFunction(data);
/******/
/******/ 		while(resolves.length) {
/******/ 			resolves.shift()();
/******/ 		}
/******/
/******/ 		// add entry modules from loaded chunk to deferred list
/******/ 		deferredModules.push.apply(deferredModules, executeModules || []);
/******/
/******/ 		// run deferred modules when all chunks ready
/******/ 		return checkDeferredModules();
/******/ 	};
/******/ 	function checkDeferredModules() {
/******/ 		var result;
/******/ 		for(var i = 0; i < deferredModules.length; i++) {
/******/ 			var deferredModule = deferredModules[i];
/******/ 			var fulfilled = true;
/******/ 			for(var j = 1; j < deferredModule.length; j++) {
/******/ 				var depId = deferredModule[j];
/******/ 				if(installedChunks[depId] !== 0) fulfilled = false;
/******/ 			}
/******/ 			if(fulfilled) {
/******/ 				deferredModules.splice(i--, 1);
/******/ 				result = __webpack_require__(__webpack_require__.s = deferredModule[0]);
/******/ 			}
/******/ 		}
/******/
/******/ 		return result;
/******/ 	}
/******/
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// object to store loaded and loading chunks
/******/ 	// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 	// Promise = chunk loading, 0 = chunk loaded
/******/ 	var installedChunks = {
/******/ 		"tests": 0
/******/ 	};
/******/
/******/ 	var deferredModules = [];
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	var jsonpArray = window["webpackJsonp_ember_auto_import_"] = window["webpackJsonp_ember_auto_import_"] || [];
/******/ 	var oldJsonpFunction = jsonpArray.push.bind(jsonpArray);
/******/ 	jsonpArray.push = webpackJsonpCallback;
/******/ 	jsonpArray = jsonpArray.slice();
/******/ 	for(var i = 0; i < jsonpArray.length; i++) webpackJsonpCallback(jsonpArray[i]);
/******/ 	var parentJsonpFunction = oldJsonpFunction;
/******/
/******/
/******/ 	// add entry module to deferred list
/******/ 	deferredModules.push([1,"vendors~tests"]);
/******/ 	// run deferred modules when ready
/******/ 	return checkDeferredModules();
/******/ })
/************************************************************************/
/******/ ({

/***/ "../../../../../../../../../private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js":
/*!**************************************************************************************************************************!*\
  !*** /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js ***!
  \**************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("\nwindow._eai_r = require;\nwindow._eai_d = define;\n\n\n//# sourceURL=webpack://__ember_auto_import__//private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js?");

/***/ }),

/***/ "../../../../../../../../../private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js":
/*!******************************************************************************************************************************!*\
  !*** /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js ***!
  \******************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("\nif (typeof document !== 'undefined') {\n  __webpack_require__.p = (function(){\n    var scripts = document.querySelectorAll('script');\n    return scripts[scripts.length - 1].src.replace(/\\/[^/]*$/, '/');\n  })();\n}\n\nmodule.exports = (function(){\n  var d = _eai_d;\n  var r = _eai_r;\n  window.emberAutoImportDynamic = function(specifier) {\n    if (arguments.length === 1) {\n      return r('_eai_dyn_' + specifier);\n    } else {\n      return r('_eai_dynt_' + specifier)(Array.prototype.slice.call(arguments, 1))\n    }\n  };\n    d('qunit', [], function() { return __webpack_require__(/*! ./node_modules/qunit/qunit/qunit.js */ \"./node_modules/qunit/qunit/qunit.js\"); });\n})();\n\n\n//# sourceURL=webpack://__ember_auto_import__//private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js?");

/***/ }),

/***/ 1:
/*!*******************************************************************************************************************************************************************************************************************************************************!*\
  !*** multi /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js ***!
  \*******************************************************************************************************************************************************************************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("__webpack_require__(/*! /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js */\"../../../../../../../../../private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js\");\nmodule.exports = __webpack_require__(/*! /private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js */\"../../../../../../../../../private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js\");\n\n\n//# sourceURL=webpack://__ember_auto_import__/multi_/private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/l.js_/private/var/folders/2c/s94v5r3n1_jc2th_2hhj_n20013_y2/T/broccoli-91980ZtLrqIvEZAMV/cache-325-bundler/staging/tests.js?");

/***/ })

/******/ });;
(window["webpackJsonp_ember_auto_import_"] = window["webpackJsonp_ember_auto_import_"] || []).push([["vendors~tests"],{

/***/ "./node_modules/qunit/qunit/qunit.js":
/*!*******************************************!*\
  !*** ./node_modules/qunit/qunit/qunit.js ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("/* WEBPACK VAR INJECTION */(function(module) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!\n * QUnit 2.19.4\n * https://qunitjs.com/\n *\n * Copyright OpenJS Foundation and other contributors\n * Released under the MIT license\n * https://jquery.org/license\n */\n(function () {\n  'use strict';\n\n  function _typeof(obj) {\n    \"@babel/helpers - typeof\";\n\n    return _typeof = \"function\" == typeof Symbol && \"symbol\" == typeof Symbol.iterator ? function (obj) {\n      return typeof obj;\n    } : function (obj) {\n      return obj && \"function\" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? \"symbol\" : typeof obj;\n    }, _typeof(obj);\n  }\n  function _classCallCheck(instance, Constructor) {\n    if (!(instance instanceof Constructor)) {\n      throw new TypeError(\"Cannot call a class as a function\");\n    }\n  }\n  function _defineProperties(target, props) {\n    for (var i = 0; i < props.length; i++) {\n      var descriptor = props[i];\n      descriptor.enumerable = descriptor.enumerable || false;\n      descriptor.configurable = true;\n      if (\"value\" in descriptor) descriptor.writable = true;\n      Object.defineProperty(target, descriptor.key, descriptor);\n    }\n  }\n  function _createClass(Constructor, protoProps, staticProps) {\n    if (protoProps) _defineProperties(Constructor.prototype, protoProps);\n    if (staticProps) _defineProperties(Constructor, staticProps);\n    Object.defineProperty(Constructor, \"prototype\", {\n      writable: false\n    });\n    return Constructor;\n  }\n  function _slicedToArray(arr, i) {\n    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();\n  }\n  function _toConsumableArray(arr) {\n    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();\n  }\n  function _arrayWithoutHoles(arr) {\n    if (Array.isArray(arr)) return _arrayLikeToArray(arr);\n  }\n  function _arrayWithHoles(arr) {\n    if (Array.isArray(arr)) return arr;\n  }\n  function _iterableToArray(iter) {\n    if (typeof Symbol !== \"undefined\" && iter[Symbol.iterator] != null || iter[\"@@iterator\"] != null) return Array.from(iter);\n  }\n  function _iterableToArrayLimit(arr, i) {\n    var _i = arr == null ? null : typeof Symbol !== \"undefined\" && arr[Symbol.iterator] || arr[\"@@iterator\"];\n    if (_i == null) return;\n    var _arr = [];\n    var _n = true;\n    var _d = false;\n    var _s, _e;\n    try {\n      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {\n        _arr.push(_s.value);\n        if (i && _arr.length === i) break;\n      }\n    } catch (err) {\n      _d = true;\n      _e = err;\n    } finally {\n      try {\n        if (!_n && _i[\"return\"] != null) _i[\"return\"]();\n      } finally {\n        if (_d) throw _e;\n      }\n    }\n    return _arr;\n  }\n  function _unsupportedIterableToArray(o, minLen) {\n    if (!o) return;\n    if (typeof o === \"string\") return _arrayLikeToArray(o, minLen);\n    var n = Object.prototype.toString.call(o).slice(8, -1);\n    if (n === \"Object\" && o.constructor) n = o.constructor.name;\n    if (n === \"Map\" || n === \"Set\") return Array.from(o);\n    if (n === \"Arguments\" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);\n  }\n  function _arrayLikeToArray(arr, len) {\n    if (len == null || len > arr.length) len = arr.length;\n    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];\n    return arr2;\n  }\n  function _nonIterableSpread() {\n    throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n  }\n  function _nonIterableRest() {\n    throw new TypeError(\"Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n  }\n  function _createForOfIteratorHelper(o, allowArrayLike) {\n    var it = typeof Symbol !== \"undefined\" && o[Symbol.iterator] || o[\"@@iterator\"];\n    if (!it) {\n      if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === \"number\") {\n        if (it) o = it;\n        var i = 0;\n        var F = function () {};\n        return {\n          s: F,\n          n: function () {\n            if (i >= o.length) return {\n              done: true\n            };\n            return {\n              done: false,\n              value: o[i++]\n            };\n          },\n          e: function (e) {\n            throw e;\n          },\n          f: F\n        };\n      }\n      throw new TypeError(\"Invalid attempt to iterate non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\");\n    }\n    var normalCompletion = true,\n      didErr = false,\n      err;\n    return {\n      s: function () {\n        it = it.call(o);\n      },\n      n: function () {\n        var step = it.next();\n        normalCompletion = step.done;\n        return step;\n      },\n      e: function (e) {\n        didErr = true;\n        err = e;\n      },\n      f: function () {\n        try {\n          if (!normalCompletion && it.return != null) it.return();\n        } finally {\n          if (didErr) throw err;\n        }\n      }\n    };\n  }\n\n  // We don't use global-this-polyfill [1], because it modifies\n  // the globals scope by default. QUnit must not affect the host context\n  // as developers may test their project may be such a polyfill, and/or\n  // they may intentionally test their project with and without certain\n  // polyfills and we must not affect that. It also uses an obscure\n  // mechanism that seems to sometimes causes a runtime error in older\n  // browsers (specifically Safari and IE versions that support\n  // Object.defineProperty but then report _T_ as undefined).\n  // [1] https://github.com/ungap/global-this/blob/v0.4.4/esm/index.js\n  //\n  // Another way is `Function('return this')()`, but doing so relies\n  // on eval which will cause a CSP error on some servers.\n  //\n  // Instead, simply check the four options that already exist\n  // in all supported environments.\n  function getGlobalThis() {\n    if (typeof globalThis !== 'undefined') {\n      // For SpiderMonkey, modern browsers, and recent Node.js\n      // eslint-disable-next-line no-undef\n      return globalThis;\n    }\n    if (typeof self !== 'undefined') {\n      // For web workers\n      // eslint-disable-next-line no-undef\n      return self;\n    }\n    if (typeof window$1 !== 'undefined') {\n      // For document context in browsers\n      return window$1;\n    }\n    if (typeof global !== 'undefined') {\n      // For Node.js\n      // eslint-disable-next-line no-undef\n      return global;\n    }\n    throw new Error('Unable to locate global object');\n  }\n\n  // This avoids a simple `export const` assignment as that would lead Rollup\n  // to change getGlobalThis and use the same (generated) variable name there.\n  var g = getGlobalThis();\n  var window$1 = g.window;\n  var console$1 = g.console;\n  var setTimeout$1 = g.setTimeout;\n  var clearTimeout = g.clearTimeout;\n  var document = window$1 && window$1.document;\n  var navigator = window$1 && window$1.navigator;\n  var localSessionStorage = function () {\n    var x = 'qunit-test-string';\n    try {\n      g.sessionStorage.setItem(x, x);\n      g.sessionStorage.removeItem(x);\n      return g.sessionStorage;\n    } catch (e) {\n      return undefined;\n    }\n  }();\n\n  // Basic fallback for ES6 Map\n  // Support: IE 9-10, Safari 7, PhantomJS; Map is undefined\n  // Support: iOS 8; `new Map(iterable)` is not supported\n  //\n  // Fallback for ES7 Map#keys\n  // Support: IE 11; Map#keys is undefined\n  var StringMap = typeof g.Map === 'function' && typeof g.Map.prototype.keys === 'function' && typeof g.Symbol === 'function' && _typeof(g.Symbol.iterator) === 'symbol' ? g.Map : function StringMap(input) {\n    var _this = this;\n    var store = Object.create(null);\n    var hasOwn = Object.prototype.hasOwnProperty;\n    this.has = function (strKey) {\n      return hasOwn.call(store, strKey);\n    };\n    this.get = function (strKey) {\n      return store[strKey];\n    };\n    this.set = function (strKey, val) {\n      if (!hasOwn.call(store, strKey)) {\n        this.size++;\n      }\n      store[strKey] = val;\n      return this;\n    };\n    this.delete = function (strKey) {\n      if (hasOwn.call(store, strKey)) {\n        delete store[strKey];\n        this.size--;\n      }\n    };\n    this.forEach = function (callback) {\n      for (var strKey in store) {\n        callback(store[strKey], strKey);\n      }\n    };\n    this.keys = function () {\n      return Object.keys(store);\n    };\n    this.clear = function () {\n      store = Object.create(null);\n      this.size = 0;\n    };\n    this.size = 0;\n    if (input) {\n      input.forEach(function (val, strKey) {\n        _this.set(strKey, val);\n      });\n    }\n  };\n\n  // Basic fallback for ES6 Set\n  // Support: IE 11, `new Set(iterable)` parameter not yet implemented\n  // Test for Set#values() which came after Set(iterable).\n  var StringSet = typeof g.Set === 'function' && typeof g.Set.prototype.values === 'function' ? g.Set : function (input) {\n    var set = Object.create(null);\n    if (Array.isArray(input)) {\n      input.forEach(function (item) {\n        set[item] = true;\n      });\n    }\n    return {\n      add: function add(value) {\n        set[value] = true;\n      },\n      has: function has(value) {\n        return value in set;\n      },\n      get size() {\n        return Object.keys(set).length;\n      }\n    };\n  };\n\n  // Support: IE 9\n  // Detect if the console object exists and no-op otherwise.\n  // This allows support for IE 9, which doesn't have a console\n  // object if the developer tools are not open.\n\n  // Support: IE 9\n  // Function#bind is supported, but no console.log.bind().\n\n  // Support: SpiderMonkey (mozjs 68+)\n  // The console object has a log method, but no warn method.\n\n  var Logger = {\n    warn: console$1 ? Function.prototype.bind.call(console$1.warn || console$1.log, console$1) : function () {}\n  };\n  var toString = Object.prototype.toString;\n  var hasOwn$1 = Object.prototype.hasOwnProperty;\n  var nativePerf = getNativePerf();\n\n  // TODO: Consider using globalThis instead so that perf marks work\n  // in Node.js as well. As they can have overhead, we should also\n  // have a way to disable these, and/or make them an opt-in reporter\n  // in QUnit 3 and then support globalThis.\n  // For example: `QUnit.addReporter(QUnit.reporters.perf)`.\n  function getNativePerf() {\n    if (window$1 && typeof window$1.performance !== 'undefined' && typeof window$1.performance.mark === 'function' && typeof window$1.performance.measure === 'function') {\n      return window$1.performance;\n    } else {\n      return undefined;\n    }\n  }\n  var performance = {\n    now: nativePerf ? nativePerf.now.bind(nativePerf) : Date.now,\n    measure: nativePerf ? function (comment, startMark, endMark) {\n      // `performance.measure` may fail if the mark could not be found.\n      // reasons a specific mark could not be found include: outside code invoking `performance.clearMarks()`\n      try {\n        nativePerf.measure(comment, startMark, endMark);\n      } catch (ex) {\n        Logger.warn('performance.measure could not be executed because of ', ex.message);\n      }\n    } : function () {},\n    mark: nativePerf ? nativePerf.mark.bind(nativePerf) : function () {}\n  };\n\n  // Returns a new Array with the elements that are in a but not in b\n  function diff(a, b) {\n    return a.filter(function (a) {\n      return b.indexOf(a) === -1;\n    });\n  }\n\n  /**\n   * Determines whether an element exists in a given array or not.\n   *\n   * @method inArray\n   * @param {any} elem\n   * @param {Array} array\n   * @return {boolean}\n   */\n  function inArray(elem, array) {\n    return array.indexOf(elem) !== -1;\n  }\n\n  /**\n   * Recursively clone an object into a plain array or object, taking only the\n   * own enumerable properties.\n   *\n   * @param {any} obj\n   * @param {bool} [allowArray=true]\n   * @return {Object|Array}\n   */\n  function objectValues(obj) {\n    var allowArray = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;\n    var vals = allowArray && is('array', obj) ? [] : {};\n    for (var key in obj) {\n      if (hasOwn$1.call(obj, key)) {\n        var val = obj[key];\n        vals[key] = val === Object(val) ? objectValues(val, allowArray) : val;\n      }\n    }\n    return vals;\n  }\n\n  /**\n   * Recursively clone an object into a plain object, taking only the\n   * subset of own enumerable properties that exist a given model.\n   *\n   * @param {any} obj\n   * @param {any} model\n   * @return {Object}\n   */\n  function objectValuesSubset(obj, model) {\n    // Return primitive values unchanged to avoid false positives or confusing\n    // results from assert.propContains().\n    // E.g. an actual null or false wrongly equaling an empty object,\n    // or an actual string being reported as object not matching a partial object.\n    if (obj !== Object(obj)) {\n      return obj;\n    }\n\n    // Unlike objectValues(), subset arrays to a plain objects as well.\n    // This enables subsetting [20, 30] with {1: 30}.\n    var subset = {};\n    for (var key in model) {\n      if (hasOwn$1.call(model, key) && hasOwn$1.call(obj, key)) {\n        subset[key] = objectValuesSubset(obj[key], model[key]);\n      }\n    }\n    return subset;\n  }\n  function extend(a, b, undefOnly) {\n    for (var prop in b) {\n      if (hasOwn$1.call(b, prop)) {\n        if (b[prop] === undefined) {\n          delete a[prop];\n        } else if (!(undefOnly && typeof a[prop] !== 'undefined')) {\n          a[prop] = b[prop];\n        }\n      }\n    }\n    return a;\n  }\n  function objectType(obj) {\n    if (typeof obj === 'undefined') {\n      return 'undefined';\n    }\n\n    // Consider: typeof null === object\n    if (obj === null) {\n      return 'null';\n    }\n    var match = toString.call(obj).match(/^\\[object\\s(.*)\\]$/);\n    var type = match && match[1];\n    switch (type) {\n      case 'Number':\n        if (isNaN(obj)) {\n          return 'nan';\n        }\n        return 'number';\n      case 'String':\n      case 'Boolean':\n      case 'Array':\n      case 'Set':\n      case 'Map':\n      case 'Date':\n      case 'RegExp':\n      case 'Function':\n      case 'Symbol':\n        return type.toLowerCase();\n      default:\n        return _typeof(obj);\n    }\n  }\n\n  // Safe object type checking\n  function is(type, obj) {\n    return objectType(obj) === type;\n  }\n\n  // Based on Java's String.hashCode, a simple but not\n  // rigorously collision resistant hashing function\n  function generateHash(module, testName) {\n    var str = module + '\\x1C' + testName;\n    var hash = 0;\n    for (var i = 0; i < str.length; i++) {\n      hash = (hash << 5) - hash + str.charCodeAt(i);\n      hash |= 0;\n    }\n\n    // Convert the possibly negative integer hash code into an 8 character hex string, which isn't\n    // strictly necessary but increases user understanding that the id is a SHA-like hash\n    var hex = (0x100000000 + hash).toString(16);\n    if (hex.length < 8) {\n      hex = '0000000' + hex;\n    }\n    return hex.slice(-8);\n  }\n\n  /**\n   * Converts an error into a simple string for comparisons.\n   *\n   * @param {Error|any} error\n   * @return {string}\n   */\n  function errorString(error) {\n    // Use String() instead of toString() to handle non-object values like undefined or null.\n    var resultErrorString = String(error);\n\n    // If the error wasn't a subclass of Error but something like\n    // an object literal with name and message properties...\n    if (resultErrorString.slice(0, 7) === '[object') {\n      // Based on https://es5.github.io/#x15.11.4.4\n      return (error.name || 'Error') + (error.message ? \": \".concat(error.message) : '');\n    } else {\n      return resultErrorString;\n    }\n  }\n  var BOXABLE_TYPES = new StringSet(['boolean', 'number', 'string']);\n\n  // Memory for previously seen containers (object, array, map, set).\n  // Used for recursion detection, and to avoid repeated comparison.\n  //\n  // Elements are { a: val, b: val }.\n  var memory = [];\n  function useStrictEquality(a, b) {\n    return a === b;\n  }\n  function useObjectValueEquality(a, b) {\n    return a === b || a.valueOf() === b.valueOf();\n  }\n  function compareConstructors(a, b) {\n    // Comparing constructors is more strict than using `instanceof`\n    return getConstructor(a) === getConstructor(b);\n  }\n  function getConstructor(obj) {\n    var proto = Object.getPrototypeOf(obj);\n\n    // If the obj prototype descends from a null constructor, treat it\n    // as a null prototype.\n    // Ref https://github.com/qunitjs/qunit/issues/851\n    //\n    // Allow objects with no prototype, from Object.create(null), to be equivalent to\n    // plain objects that have Object as their constructor.\n    return !proto || proto.constructor === null ? Object : obj.constructor;\n  }\n  function getRegExpFlags(regexp) {\n    return 'flags' in regexp ? regexp.flags : regexp.toString().match(/[gimuy]*$/)[0];\n  }\n\n  // Specialised comparisons after entryTypeCallbacks.object, based on `objectType()`\n  var objTypeCallbacks = {\n    undefined: useStrictEquality,\n    null: useStrictEquality,\n    // Handle boxed boolean\n    boolean: useObjectValueEquality,\n    number: function number(a, b) {\n      // Handle NaN and boxed number\n      return a === b || a.valueOf() === b.valueOf() || isNaN(a.valueOf()) && isNaN(b.valueOf());\n    },\n    // Handle boxed string\n    string: useObjectValueEquality,\n    symbol: useStrictEquality,\n    date: useObjectValueEquality,\n    nan: function nan() {\n      return true;\n    },\n    regexp: function regexp(a, b) {\n      return a.source === b.source &&\n      // Include flags in the comparison\n      getRegExpFlags(a) === getRegExpFlags(b);\n    },\n    // identical reference only\n    function: useStrictEquality,\n    array: function array(a, b) {\n      if (a.length !== b.length) {\n        // Safe and faster\n        return false;\n      }\n      for (var i = 0; i < a.length; i++) {\n        if (!typeEquiv(a[i], b[i])) {\n          return false;\n        }\n      }\n      return true;\n    },\n    // Define sets a and b to be equivalent if for each element aVal in a, there\n    // is some element bVal in b such that aVal and bVal are equivalent. Element\n    // repetitions are not counted, so these are equivalent:\n    // a = new Set( [ X={}, Y=[], Y ] );\n    // b = new Set( [ Y, X, X ] );\n    set: function set(a, b) {\n      if (a.size !== b.size) {\n        // This optimization has certain quirks because of the lack of\n        // repetition counting. For instance, adding the same\n        // (reference-identical) element to two equivalent sets can\n        // make them non-equivalent.\n        return false;\n      }\n      var outerEq = true;\n      a.forEach(function (aVal) {\n        // Short-circuit if the result is already known. (Using for...of\n        // with a break clause would be cleaner here, but it would cause\n        // a syntax error on older JavaScript implementations even if\n        // Set is unused)\n        if (!outerEq) {\n          return;\n        }\n        var innerEq = false;\n        b.forEach(function (bVal) {\n          // Likewise, short-circuit if the result is already known\n          if (innerEq) {\n            return;\n          }\n\n          // Swap out the global memory, as nested typeEquiv() would clobber it\n          var originalMemory = memory;\n          memory = [];\n          if (typeEquiv(bVal, aVal)) {\n            innerEq = true;\n          }\n          // Restore\n          memory = originalMemory;\n        });\n        if (!innerEq) {\n          outerEq = false;\n        }\n      });\n      return outerEq;\n    },\n    // Define maps a and b to be equivalent if for each key-value pair (aKey, aVal)\n    // in a, there is some key-value pair (bKey, bVal) in b such that\n    // [ aKey, aVal ] and [ bKey, bVal ] are equivalent. Key repetitions are not\n    // counted, so these are equivalent:\n    // a = new Map( [ [ {}, 1 ], [ {}, 1 ], [ [], 1 ] ] );\n    // b = new Map( [ [ {}, 1 ], [ [], 1 ], [ [], 1 ] ] );\n    map: function map(a, b) {\n      if (a.size !== b.size) {\n        // This optimization has certain quirks because of the lack of\n        // repetition counting. For instance, adding the same\n        // (reference-identical) key-value pair to two equivalent maps\n        // can make them non-equivalent.\n        return false;\n      }\n      var outerEq = true;\n      a.forEach(function (aVal, aKey) {\n        // Short-circuit if the result is already known. (Using for...of\n        // with a break clause would be cleaner here, but it would cause\n        // a syntax error on older JavaScript implementations even if\n        // Map is unused)\n        if (!outerEq) {\n          return;\n        }\n        var innerEq = false;\n        b.forEach(function (bVal, bKey) {\n          // Likewise, short-circuit if the result is already known\n          if (innerEq) {\n            return;\n          }\n\n          // Swap out the global memory, as nested typeEquiv() would clobber it\n          var originalMemory = memory;\n          memory = [];\n          if (objTypeCallbacks.array([bVal, bKey], [aVal, aKey])) {\n            innerEq = true;\n          }\n          // Restore\n          memory = originalMemory;\n        });\n        if (!innerEq) {\n          outerEq = false;\n        }\n      });\n      return outerEq;\n    }\n  };\n\n  // Entry points from typeEquiv, based on `typeof`\n  var entryTypeCallbacks = {\n    undefined: useStrictEquality,\n    null: useStrictEquality,\n    boolean: useStrictEquality,\n    number: function number(a, b) {\n      // Handle NaN\n      return a === b || isNaN(a) && isNaN(b);\n    },\n    string: useStrictEquality,\n    symbol: useStrictEquality,\n    function: useStrictEquality,\n    object: function object(a, b) {\n      // Handle memory (skip recursion)\n      if (memory.some(function (pair) {\n        return pair.a === a && pair.b === b;\n      })) {\n        return true;\n      }\n      memory.push({\n        a: a,\n        b: b\n      });\n      var aObjType = objectType(a);\n      var bObjType = objectType(b);\n      if (aObjType !== 'object' || bObjType !== 'object') {\n        // Handle literal `null`\n        // Handle: Array, Map/Set, Date, Regxp/Function, boxed primitives\n        return aObjType === bObjType && objTypeCallbacks[aObjType](a, b);\n      }\n\n      // NOTE: Literal null must not make it here as it would throw\n      if (compareConstructors(a, b) === false) {\n        return false;\n      }\n      var aProperties = [];\n      var bProperties = [];\n\n      // Be strict and go deep, no filtering with hasOwnProperty.\n      for (var i in a) {\n        // Collect a's properties\n        aProperties.push(i);\n\n        // Skip OOP methods that look the same\n        if (a.constructor !== Object && typeof a.constructor !== 'undefined' && typeof a[i] === 'function' && typeof b[i] === 'function' && a[i].toString() === b[i].toString()) {\n          continue;\n        }\n        if (!typeEquiv(a[i], b[i])) {\n          return false;\n        }\n      }\n      for (var _i in b) {\n        // Collect b's properties\n        bProperties.push(_i);\n      }\n      return objTypeCallbacks.array(aProperties.sort(), bProperties.sort());\n    }\n  };\n  function typeEquiv(a, b) {\n    // Optimization: Only perform type-specific comparison when pairs are not strictly equal.\n    if (a === b) {\n      return true;\n    }\n    var aType = _typeof(a);\n    var bType = _typeof(b);\n    if (aType !== bType) {\n      // Support comparing primitive to boxed primitives\n      // Try again after possibly unwrapping one\n      return (aType === 'object' && BOXABLE_TYPES.has(objectType(a)) ? a.valueOf() : a) === (bType === 'object' && BOXABLE_TYPES.has(objectType(b)) ? b.valueOf() : b);\n    }\n    return entryTypeCallbacks[aType](a, b);\n  }\n  function innerEquiv(a, b) {\n    var res = typeEquiv(a, b);\n    // Release any retained objects and reset recursion detection for next call\n    memory = [];\n    return res;\n  }\n\n  /**\n   * Test any two types of JavaScript values for equality.\n   *\n   * @author Philippe Rathé <prathe@gmail.com>\n   * @author David Chan <david@troi.org>\n   */\n  function equiv(a, b) {\n    if (arguments.length === 2) {\n      return a === b || innerEquiv(a, b);\n    }\n\n    // Given 0 or 1 arguments, just return true (nothing to compare).\n    // Given (A,B,C,D) compare C,D then B,C then A,B.\n    var i = arguments.length - 1;\n    while (i > 0) {\n      if (!innerEquiv(arguments[i - 1], arguments[i])) {\n        return false;\n      }\n      i--;\n    }\n    return true;\n  }\n\n  /**\n   * Config object: Maintain internal state\n   * Later exposed as QUnit.config\n   * `config` initialized at top of scope\n   */\n  var config = {\n    // HTML Reporter: Modify document.title when suite is done\n    altertitle: true,\n    // HTML Reporter: collapse every test except the first failing test\n    // If false, all failing tests will be expanded\n    collapse: true,\n    // whether or not to fail when there are zero tests\n    // defaults to `true`\n    failOnZeroTests: true,\n    // Select by pattern or case-insensitive substring match against \"moduleName: testName\"\n    filter: undefined,\n    // Depth up-to which object will be dumped\n    maxDepth: 5,\n    // Select case-insensitive match of the module name\n    module: undefined,\n    // HTML Reporter: Select module/test by array of internal IDs\n    moduleId: undefined,\n    // By default, run previously failed tests first\n    // very useful in combination with \"Hide passed tests\" checked\n    reorder: true,\n    // When enabled, all tests must call expect()\n    requireExpects: false,\n    // By default, scroll to top of the page when suite is done\n    scrolltop: true,\n    // The storage module to use for reordering tests\n    storage: localSessionStorage,\n    testId: undefined,\n    // HTML Reporter: List of URL parameters that are given visual controls\n    urlConfig: [],\n    // Internal: The first unnamed module\n    //\n    // By being defined as the intial value for currentModule, it is the\n    // receptacle and implied parent for any global tests. It is as if we\n    // called `QUnit.module( \"\" );` before any other tests were defined.\n    //\n    // If we reach begin() and no tests were put in it, we dequeue it as if it\n    // never existed, and in that case never expose it to the events and\n    // callbacks API.\n    //\n    // When global tests are defined, then this unnamed module will execute\n    // as any other module, including moduleStart/moduleDone events etc.\n    //\n    // Since this module isn't explicitly created by the user, they have no\n    // access to add hooks for it. The hooks object is defined to comply\n    // with internal expectations of test.js, but they will be empty.\n    // To apply hooks, place tests explicitly in a QUnit.module(), and use\n    // its hooks accordingly.\n    //\n    // For global hooks that apply to all tests and all modules, use QUnit.hooks.\n    //\n    // NOTE: This is *not* a \"global module\". It is not an ancestor of all modules\n    // and tests. It is merely the parent for any tests defined globally,\n    // before the first QUnit.module(). As such, the events for this unnamed\n    // module will fire as normal, right after its last test, and *not* at\n    // the end of the test run.\n    //\n    // NOTE: This also should probably also not become a global module, unless\n    // we keep it out of the public API. For example, it would likely not\n    // improve the user interface and plugin behaviour if all modules became\n    // wrapped between the start and end events of this module, and thus\n    // needlessly add indentation, indirection, or other visible noise.\n    // Unit tests for the callbacks API would detect that as a regression.\n    currentModule: {\n      name: '',\n      tests: [],\n      childModules: [],\n      testsRun: 0,\n      testsIgnored: 0,\n      hooks: {\n        before: [],\n        beforeEach: [],\n        afterEach: [],\n        after: []\n      }\n    },\n    // Internal: Exposed to make resets easier\n    // Ref https://github.com/qunitjs/qunit/pull/1598\n    globalHooks: {},\n    // Internal state\n    blocking: true,\n    callbacks: {},\n    modules: [],\n    queue: [],\n    stats: {\n      all: 0,\n      bad: 0,\n      testCount: 0\n    }\n  };\n\n  // Apply a predefined QUnit.config object\n  //\n  // Ignore QUnit.config if it is a QUnit distribution instead of preconfig.\n  // That means QUnit was loaded twice! (Use the same approach as export.js)\n  var preConfig = g && g.QUnit && !g.QUnit.version && g.QUnit.config;\n  if (preConfig) {\n    extend(config, preConfig);\n  }\n\n  // Push a loose unnamed module to the modules collection\n  config.modules.push(config.currentModule);\n  var dump = function () {\n    function quote(str) {\n      return '\"' + str.toString().replace(/\\\\/g, '\\\\\\\\').replace(/\"/g, '\\\\\"') + '\"';\n    }\n    function literal(o) {\n      return o + '';\n    }\n    function join(pre, arr, post) {\n      var s = dump.separator();\n      var inner = dump.indent(1);\n      if (arr.join) {\n        arr = arr.join(',' + s + inner);\n      }\n      if (!arr) {\n        return pre + post;\n      }\n      var base = dump.indent();\n      return [pre, inner + arr, base + post].join(s);\n    }\n    function array(arr, stack) {\n      if (dump.maxDepth && dump.depth > dump.maxDepth) {\n        return '[object Array]';\n      }\n      this.up();\n      var i = arr.length;\n      var ret = new Array(i);\n      while (i--) {\n        ret[i] = this.parse(arr[i], undefined, stack);\n      }\n      this.down();\n      return join('[', ret, ']');\n    }\n    function isArray(obj) {\n      return (\n        // Native Arrays\n        toString.call(obj) === '[object Array]' ||\n        // NodeList objects\n        typeof obj.length === 'number' && obj.item !== undefined && (obj.length ? obj.item(0) === obj[0] : obj.item(0) === null && obj[0] === undefined)\n      );\n    }\n    var reName = /^function (\\w+)/;\n    var dump = {\n      // The objType is used mostly internally, you can fix a (custom) type in advance\n      parse: function parse(obj, objType, stack) {\n        stack = stack || [];\n        var objIndex = stack.indexOf(obj);\n        if (objIndex !== -1) {\n          return \"recursion(\".concat(objIndex - stack.length, \")\");\n        }\n        objType = objType || this.typeOf(obj);\n        var parser = this.parsers[objType];\n        var parserType = _typeof(parser);\n        if (parserType === 'function') {\n          stack.push(obj);\n          var res = parser.call(this, obj, stack);\n          stack.pop();\n          return res;\n        }\n        if (parserType === 'string') {\n          return parser;\n        }\n        return '[ERROR: Missing QUnit.dump formatter for type ' + objType + ']';\n      },\n      typeOf: function typeOf(obj) {\n        var type;\n        if (obj === null) {\n          type = 'null';\n        } else if (typeof obj === 'undefined') {\n          type = 'undefined';\n        } else if (is('regexp', obj)) {\n          type = 'regexp';\n        } else if (is('date', obj)) {\n          type = 'date';\n        } else if (is('function', obj)) {\n          type = 'function';\n        } else if (obj.setInterval !== undefined && obj.document !== undefined && obj.nodeType === undefined) {\n          type = 'window';\n        } else if (obj.nodeType === 9) {\n          type = 'document';\n        } else if (obj.nodeType) {\n          type = 'node';\n        } else if (isArray(obj)) {\n          type = 'array';\n        } else if (obj.constructor === Error.prototype.constructor) {\n          type = 'error';\n        } else {\n          type = _typeof(obj);\n        }\n        return type;\n      },\n      separator: function separator() {\n        if (this.multiline) {\n          return this.HTML ? '<br />' : '\\n';\n        } else {\n          return this.HTML ? '&#160;' : ' ';\n        }\n      },\n      // Extra can be a number, shortcut for increasing-calling-decreasing\n      indent: function indent(extra) {\n        if (!this.multiline) {\n          return '';\n        }\n        var chr = this.indentChar;\n        if (this.HTML) {\n          chr = chr.replace(/\\t/g, '   ').replace(/ /g, '&#160;');\n        }\n        return new Array(this.depth + (extra || 0)).join(chr);\n      },\n      up: function up(a) {\n        this.depth += a || 1;\n      },\n      down: function down(a) {\n        this.depth -= a || 1;\n      },\n      setParser: function setParser(name, parser) {\n        this.parsers[name] = parser;\n      },\n      // The next 3 are exposed so you can use them\n      quote: quote,\n      literal: literal,\n      join: join,\n      depth: 1,\n      maxDepth: config.maxDepth,\n      // This is the list of parsers, to modify them, use dump.setParser\n      parsers: {\n        window: '[Window]',\n        document: '[Document]',\n        error: function error(_error) {\n          return 'Error(\"' + _error.message + '\")';\n        },\n        // This has been unused since QUnit 1.0.0.\n        // @todo Deprecate and remove.\n        unknown: '[Unknown]',\n        null: 'null',\n        undefined: 'undefined',\n        function: function _function(fn) {\n          var ret = 'function';\n\n          // Functions never have name in IE\n          var name = 'name' in fn ? fn.name : (reName.exec(fn) || [])[1];\n          if (name) {\n            ret += ' ' + name;\n          }\n          ret += '(';\n          ret = [ret, dump.parse(fn, 'functionArgs'), '){'].join('');\n          return join(ret, dump.parse(fn, 'functionCode'), '}');\n        },\n        array: array,\n        nodelist: array,\n        arguments: array,\n        object: function object(map, stack) {\n          var ret = [];\n          if (dump.maxDepth && dump.depth > dump.maxDepth) {\n            return '[object Object]';\n          }\n          dump.up();\n          var keys = [];\n          for (var key in map) {\n            keys.push(key);\n          }\n\n          // Some properties are not always enumerable on Error objects.\n          var nonEnumerableProperties = ['message', 'name'];\n          for (var i in nonEnumerableProperties) {\n            var _key = nonEnumerableProperties[i];\n            if (_key in map && !inArray(_key, keys)) {\n              keys.push(_key);\n            }\n          }\n          keys.sort();\n          for (var _i = 0; _i < keys.length; _i++) {\n            var _key2 = keys[_i];\n            var val = map[_key2];\n            ret.push(dump.parse(_key2, 'key') + ': ' + dump.parse(val, undefined, stack));\n          }\n          dump.down();\n          return join('{', ret, '}');\n        },\n        node: function node(_node) {\n          var open = dump.HTML ? '&lt;' : '<';\n          var close = dump.HTML ? '&gt;' : '>';\n          var tag = _node.nodeName.toLowerCase();\n          var ret = open + tag;\n          var attrs = _node.attributes;\n          if (attrs) {\n            for (var i = 0; i < attrs.length; i++) {\n              var val = attrs[i].nodeValue;\n\n              // IE6 includes all attributes in .attributes, even ones not explicitly\n              // set. Those have values like undefined, null, 0, false, \"\" or\n              // \"inherit\".\n              if (val && val !== 'inherit') {\n                ret += ' ' + attrs[i].nodeName + '=' + dump.parse(val, 'attribute');\n              }\n            }\n          }\n          ret += close;\n\n          // Show content of TextNode or CDATASection\n          if (_node.nodeType === 3 || _node.nodeType === 4) {\n            ret += _node.nodeValue;\n          }\n          return ret + open + '/' + tag + close;\n        },\n        // Function calls it internally, it's the arguments part of the function\n        functionArgs: function functionArgs(fn) {\n          var l = fn.length;\n          if (!l) {\n            return '';\n          }\n          var args = new Array(l);\n          while (l--) {\n            // 97 is 'a'\n            args[l] = String.fromCharCode(97 + l);\n          }\n          return ' ' + args.join(', ') + ' ';\n        },\n        // Object calls it internally, the key part of an item in a map\n        key: quote,\n        // Function calls it internally, it's the content of the function\n        functionCode: '[code]',\n        // Node calls it internally, it's a html attribute value\n        attribute: quote,\n        string: quote,\n        date: quote,\n        regexp: literal,\n        number: literal,\n        boolean: literal,\n        symbol: function symbol(sym) {\n          return sym.toString();\n        }\n      },\n      // If true, entities are escaped ( <, >, \\t, space and \\n )\n      HTML: false,\n      // Indentation unit\n      indentChar: '  ',\n      // If true, items in a collection, are separated by a \\n, else just a space.\n      multiline: true\n    };\n    return dump;\n  }();\n  var SuiteReport = /*#__PURE__*/function () {\n    function SuiteReport(name, parentSuite) {\n      _classCallCheck(this, SuiteReport);\n      this.name = name;\n      this.fullName = parentSuite ? parentSuite.fullName.concat(name) : [];\n\n      // When an \"error\" event is emitted from onUncaughtException(), the\n      // \"runEnd\" event should report the status as failed. The \"runEnd\" event data\n      // is tracked through this property (via the \"runSuite\" instance).\n      this.globalFailureCount = 0;\n      this.tests = [];\n      this.childSuites = [];\n      if (parentSuite) {\n        parentSuite.pushChildSuite(this);\n      }\n    }\n    _createClass(SuiteReport, [{\n      key: \"start\",\n      value: function start(recordTime) {\n        if (recordTime) {\n          this._startTime = performance.now();\n          var suiteLevel = this.fullName.length;\n          performance.mark(\"qunit_suite_\".concat(suiteLevel, \"_start\"));\n        }\n        return {\n          name: this.name,\n          fullName: this.fullName.slice(),\n          tests: this.tests.map(function (test) {\n            return test.start();\n          }),\n          childSuites: this.childSuites.map(function (suite) {\n            return suite.start();\n          }),\n          testCounts: {\n            total: this.getTestCounts().total\n          }\n        };\n      }\n    }, {\n      key: \"end\",\n      value: function end(recordTime) {\n        if (recordTime) {\n          this._endTime = performance.now();\n          var suiteLevel = this.fullName.length;\n          var suiteName = this.fullName.join(' – ');\n          performance.mark(\"qunit_suite_\".concat(suiteLevel, \"_end\"));\n          performance.measure(suiteLevel === 0 ? 'QUnit Test Run' : \"QUnit Test Suite: \".concat(suiteName), \"qunit_suite_\".concat(suiteLevel, \"_start\"), \"qunit_suite_\".concat(suiteLevel, \"_end\"));\n        }\n        return {\n          name: this.name,\n          fullName: this.fullName.slice(),\n          tests: this.tests.map(function (test) {\n            return test.end();\n          }),\n          childSuites: this.childSuites.map(function (suite) {\n            return suite.end();\n          }),\n          testCounts: this.getTestCounts(),\n          runtime: this.getRuntime(),\n          status: this.getStatus()\n        };\n      }\n    }, {\n      key: \"pushChildSuite\",\n      value: function pushChildSuite(suite) {\n        this.childSuites.push(suite);\n      }\n    }, {\n      key: \"pushTest\",\n      value: function pushTest(test) {\n        this.tests.push(test);\n      }\n    }, {\n      key: \"getRuntime\",\n      value: function getRuntime() {\n        return Math.round(this._endTime - this._startTime);\n      }\n    }, {\n      key: \"getTestCounts\",\n      value: function getTestCounts() {\n        var counts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {\n          passed: 0,\n          failed: 0,\n          skipped: 0,\n          todo: 0,\n          total: 0\n        };\n        counts.failed += this.globalFailureCount;\n        counts.total += this.globalFailureCount;\n        counts = this.tests.reduce(function (counts, test) {\n          if (test.valid) {\n            counts[test.getStatus()]++;\n            counts.total++;\n          }\n          return counts;\n        }, counts);\n        return this.childSuites.reduce(function (counts, suite) {\n          return suite.getTestCounts(counts);\n        }, counts);\n      }\n    }, {\n      key: \"getStatus\",\n      value: function getStatus() {\n        var _this$getTestCounts = this.getTestCounts(),\n          total = _this$getTestCounts.total,\n          failed = _this$getTestCounts.failed,\n          skipped = _this$getTestCounts.skipped,\n          todo = _this$getTestCounts.todo;\n        if (failed) {\n          return 'failed';\n        } else {\n          if (skipped === total) {\n            return 'skipped';\n          } else if (todo === total) {\n            return 'todo';\n          } else {\n            return 'passed';\n          }\n        }\n      }\n    }]);\n    return SuiteReport;\n  }();\n  var moduleStack = [];\n  var runSuite = new SuiteReport();\n  function isParentModuleInQueue() {\n    var modulesInQueue = config.modules.filter(function (module) {\n      return !module.ignored;\n    }).map(function (module) {\n      return module.moduleId;\n    });\n    return moduleStack.some(function (module) {\n      return modulesInQueue.includes(module.moduleId);\n    });\n  }\n  function createModule(name, testEnvironment, modifiers) {\n    var parentModule = moduleStack.length ? moduleStack.slice(-1)[0] : null;\n    var moduleName = parentModule !== null ? [parentModule.name, name].join(' > ') : name;\n    var parentSuite = parentModule ? parentModule.suiteReport : runSuite;\n    var skip = parentModule !== null && parentModule.skip || modifiers.skip;\n    var todo = parentModule !== null && parentModule.todo || modifiers.todo;\n    var env = {};\n    if (parentModule) {\n      extend(env, parentModule.testEnvironment);\n    }\n    extend(env, testEnvironment);\n    var module = {\n      name: moduleName,\n      parentModule: parentModule,\n      hooks: {\n        before: [],\n        beforeEach: [],\n        afterEach: [],\n        after: []\n      },\n      testEnvironment: env,\n      tests: [],\n      moduleId: generateHash(moduleName),\n      testsRun: 0,\n      testsIgnored: 0,\n      childModules: [],\n      suiteReport: new SuiteReport(name, parentSuite),\n      // Initialised by test.js when the module start executing,\n      // i.e. before the first test in this module (or a child).\n      stats: null,\n      // Pass along `skip` and `todo` properties from parent module, in case\n      // there is one, to childs. And use own otherwise.\n      // This property will be used to mark own tests and tests of child suites\n      // as either `skipped` or `todo`.\n      skip: skip,\n      todo: skip ? false : todo,\n      ignored: modifiers.ignored || false\n    };\n    if (parentModule) {\n      parentModule.childModules.push(module);\n    }\n    config.modules.push(module);\n    return module;\n  }\n  function setHookFromEnvironment(hooks, environment, name) {\n    var potentialHook = environment[name];\n    if (typeof potentialHook === 'function') {\n      hooks[name].push(potentialHook);\n    }\n    delete environment[name];\n  }\n  function makeSetHook(module, hookName) {\n    return function setHook(callback) {\n      if (config.currentModule !== module) {\n        Logger.warn('The `' + hookName + '` hook was called inside the wrong module (`' + config.currentModule.name + '`). ' + 'Instead, use hooks provided by the callback to the containing module (`' + module.name + '`). ' + 'This will become an error in QUnit 3.0.');\n      }\n      module.hooks[hookName].push(callback);\n    };\n  }\n  function processModule(name, options, executeNow) {\n    var modifiers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};\n    if (typeof options === 'function') {\n      executeNow = options;\n      options = undefined;\n    }\n    var module = createModule(name, options, modifiers);\n\n    // Transfer any initial hooks from the options object to the 'hooks' object\n    var testEnvironment = module.testEnvironment;\n    var hooks = module.hooks;\n    setHookFromEnvironment(hooks, testEnvironment, 'before');\n    setHookFromEnvironment(hooks, testEnvironment, 'beforeEach');\n    setHookFromEnvironment(hooks, testEnvironment, 'afterEach');\n    setHookFromEnvironment(hooks, testEnvironment, 'after');\n    var moduleFns = {\n      before: makeSetHook(module, 'before'),\n      beforeEach: makeSetHook(module, 'beforeEach'),\n      afterEach: makeSetHook(module, 'afterEach'),\n      after: makeSetHook(module, 'after')\n    };\n    var prevModule = config.currentModule;\n    config.currentModule = module;\n    if (typeof executeNow === 'function') {\n      moduleStack.push(module);\n      try {\n        var cbReturnValue = executeNow.call(module.testEnvironment, moduleFns);\n        if (cbReturnValue && typeof cbReturnValue.then === 'function') {\n          Logger.warn('Returning a promise from a module callback is not supported. ' + 'Instead, use hooks for async behavior. ' + 'This will become an error in QUnit 3.0.');\n        }\n      } finally {\n        // If the module closure threw an uncaught error during the load phase,\n        // we let this bubble up to global error handlers. But, not until after\n        // we teardown internal state to ensure correct module nesting.\n        // Ref https://github.com/qunitjs/qunit/issues/1478.\n        moduleStack.pop();\n        config.currentModule = module.parentModule || prevModule;\n      }\n    }\n  }\n  var focused$1 = false; // indicates that the \"only\" filter was used\n\n  function module$1(name, options, executeNow) {\n    var ignored = focused$1 && !isParentModuleInQueue();\n    processModule(name, options, executeNow, {\n      ignored: ignored\n    });\n  }\n  module$1.only = function () {\n    if (!focused$1) {\n      // Upon the first module.only() call,\n      // delete any and all previously registered modules and tests.\n      config.modules.length = 0;\n      config.queue.length = 0;\n\n      // Ignore any tests declared after this block within the same\n      // module parent. https://github.com/qunitjs/qunit/issues/1645\n      config.currentModule.ignored = true;\n    }\n    focused$1 = true;\n    processModule.apply(void 0, arguments);\n  };\n  module$1.skip = function (name, options, executeNow) {\n    if (focused$1) {\n      return;\n    }\n    processModule(name, options, executeNow, {\n      skip: true\n    });\n  };\n  module$1.todo = function (name, options, executeNow) {\n    if (focused$1) {\n      return;\n    }\n    processModule(name, options, executeNow, {\n      todo: true\n    });\n  };\n\n  // Doesn't support IE9, it will return undefined on these browsers\n  // See also https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error/Stack\n  var fileName = (sourceFromStacktrace(0) || '').replace(/(:\\d+)+\\)?/, '')\n  // Remove anything prior to the last slash (Unix/Windows)\n  // from the last frame\n  .replace(/.+[/\\\\]/, '');\n  function extractStacktrace(e, offset) {\n    offset = offset === undefined ? 4 : offset;\n    if (e && e.stack) {\n      var stack = e.stack.split('\\n');\n      if (/^error$/i.test(stack[0])) {\n        stack.shift();\n      }\n      if (fileName) {\n        var include = [];\n        for (var i = offset; i < stack.length; i++) {\n          if (stack[i].indexOf(fileName) !== -1) {\n            break;\n          }\n          include.push(stack[i]);\n        }\n        if (include.length) {\n          return include.join('\\n');\n        }\n      }\n      return stack[offset];\n    }\n  }\n  function sourceFromStacktrace(offset) {\n    var error = new Error();\n\n    // Support: Safari <=7 only, IE <=10 - 11 only\n    // Not all browsers generate the `stack` property for `new Error()`, see also #636\n    if (!error.stack) {\n      try {\n        throw error;\n      } catch (err) {\n        error = err;\n      }\n    }\n    return extractStacktrace(error, offset);\n  }\n  var Assert = /*#__PURE__*/function () {\n    function Assert(testContext) {\n      _classCallCheck(this, Assert);\n      this.test = testContext;\n    }\n    _createClass(Assert, [{\n      key: \"timeout\",\n      value: function timeout(duration) {\n        if (typeof duration !== 'number') {\n          throw new Error('You must pass a number as the duration to assert.timeout');\n        }\n        this.test.timeout = duration;\n\n        // If a timeout has been set, clear it and reset with the new duration\n        if (config.timeout) {\n          clearTimeout(config.timeout);\n          config.timeout = null;\n          if (config.timeoutHandler && this.test.timeout > 0) {\n            this.test.internalResetTimeout(this.test.timeout);\n          }\n        }\n      }\n\n      // Documents a \"step\", which is a string value, in a test as a passing assertion\n    }, {\n      key: \"step\",\n      value: function step(message) {\n        var assertionMessage = message;\n        var result = !!message;\n        this.test.steps.push(message);\n        if (typeof message === 'undefined' || message === '') {\n          assertionMessage = 'You must provide a message to assert.step';\n        } else if (typeof message !== 'string') {\n          assertionMessage = 'You must provide a string value to assert.step';\n          result = false;\n        }\n        this.pushResult({\n          result: result,\n          message: assertionMessage\n        });\n      }\n\n      // Verifies the steps in a test match a given array of string values\n    }, {\n      key: \"verifySteps\",\n      value: function verifySteps(steps, message) {\n        // Since the steps array is just string values, we can clone with slice\n        var actualStepsClone = this.test.steps.slice();\n        this.deepEqual(actualStepsClone, steps, message);\n        this.test.steps.length = 0;\n      }\n    }, {\n      key: \"expect\",\n      value: function expect(asserts) {\n        if (arguments.length === 1) {\n          this.test.expected = asserts;\n        } else {\n          return this.test.expected;\n        }\n      }\n\n      // Create a new async pause and return a new function that can release the pause.\n    }, {\n      key: \"async\",\n      value: function async(count) {\n        var requiredCalls = count === undefined ? 1 : count;\n        return this.test.internalStop(requiredCalls);\n      }\n\n      // Exports test.push() to the user API\n      // Alias of pushResult.\n    }, {\n      key: \"push\",\n      value: function push(result, actual, expected, message, negative) {\n        Logger.warn('assert.push is deprecated and will be removed in QUnit 3.0.' + ' Please use assert.pushResult instead (https://api.qunitjs.com/assert/pushResult).');\n        var currentAssert = this instanceof Assert ? this : config.current.assert;\n        return currentAssert.pushResult({\n          result: result,\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: negative\n        });\n      }\n    }, {\n      key: \"pushResult\",\n      value: function pushResult(resultInfo) {\n        // Destructure of resultInfo = { result, actual, expected, message, negative }\n        var assert = this;\n        var currentTest = assert instanceof Assert && assert.test || config.current;\n\n        // Backwards compatibility fix.\n        // Allows the direct use of global exported assertions and QUnit.assert.*\n        // Although, it's use is not recommended as it can leak assertions\n        // to other tests from async tests, because we only get a reference to the current test,\n        // not exactly the test where assertion were intended to be called.\n        if (!currentTest) {\n          throw new Error('assertion outside test context, in ' + sourceFromStacktrace(2));\n        }\n        if (!(assert instanceof Assert)) {\n          assert = currentTest.assert;\n        }\n        return assert.test.pushResult(resultInfo);\n      }\n    }, {\n      key: \"ok\",\n      value: function ok(result, message) {\n        if (!message) {\n          message = result ? 'okay' : \"failed, expected argument to be truthy, was: \".concat(dump.parse(result));\n        }\n        this.pushResult({\n          result: !!result,\n          actual: result,\n          expected: true,\n          message: message\n        });\n      }\n    }, {\n      key: \"notOk\",\n      value: function notOk(result, message) {\n        if (!message) {\n          message = !result ? 'okay' : \"failed, expected argument to be falsy, was: \".concat(dump.parse(result));\n        }\n        this.pushResult({\n          result: !result,\n          actual: result,\n          expected: false,\n          message: message\n        });\n      }\n    }, {\n      key: \"true\",\n      value: function _true(result, message) {\n        this.pushResult({\n          result: result === true,\n          actual: result,\n          expected: true,\n          message: message\n        });\n      }\n    }, {\n      key: \"false\",\n      value: function _false(result, message) {\n        this.pushResult({\n          result: result === false,\n          actual: result,\n          expected: false,\n          message: message\n        });\n      }\n    }, {\n      key: \"equal\",\n      value: function equal(actual, expected, message) {\n        this.pushResult({\n          // eslint-disable-next-line eqeqeq\n          result: expected == actual,\n          actual: actual,\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"notEqual\",\n      value: function notEqual(actual, expected, message) {\n        this.pushResult({\n          // eslint-disable-next-line eqeqeq\n          result: expected != actual,\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: true\n        });\n      }\n    }, {\n      key: \"propEqual\",\n      value: function propEqual(actual, expected, message) {\n        actual = objectValues(actual);\n        expected = objectValues(expected);\n        this.pushResult({\n          result: equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"notPropEqual\",\n      value: function notPropEqual(actual, expected, message) {\n        actual = objectValues(actual);\n        expected = objectValues(expected);\n        this.pushResult({\n          result: !equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: true\n        });\n      }\n    }, {\n      key: \"propContains\",\n      value: function propContains(actual, expected, message) {\n        actual = objectValuesSubset(actual, expected);\n\n        // The expected parameter is usually a plain object, but clone it for\n        // consistency with propEqual(), and to make it easy to explain that\n        // inheritence is not considered (on either side), and to support\n        // recursively checking subsets of nested objects.\n        expected = objectValues(expected, false);\n        this.pushResult({\n          result: equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"notPropContains\",\n      value: function notPropContains(actual, expected, message) {\n        actual = objectValuesSubset(actual, expected);\n        expected = objectValues(expected);\n        this.pushResult({\n          result: !equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: true\n        });\n      }\n    }, {\n      key: \"deepEqual\",\n      value: function deepEqual(actual, expected, message) {\n        this.pushResult({\n          result: equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"notDeepEqual\",\n      value: function notDeepEqual(actual, expected, message) {\n        this.pushResult({\n          result: !equiv(actual, expected),\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: true\n        });\n      }\n    }, {\n      key: \"strictEqual\",\n      value: function strictEqual(actual, expected, message) {\n        this.pushResult({\n          result: expected === actual,\n          actual: actual,\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"notStrictEqual\",\n      value: function notStrictEqual(actual, expected, message) {\n        this.pushResult({\n          result: expected !== actual,\n          actual: actual,\n          expected: expected,\n          message: message,\n          negative: true\n        });\n      }\n    }, {\n      key: 'throws',\n      value: function throws(block, expected, message) {\n        var _validateExpectedExce = validateExpectedExceptionArgs(expected, message, 'throws');\n        var _validateExpectedExce2 = _slicedToArray(_validateExpectedExce, 2);\n        expected = _validateExpectedExce2[0];\n        message = _validateExpectedExce2[1];\n        var currentTest = this instanceof Assert && this.test || config.current;\n        if (typeof block !== 'function') {\n          currentTest.assert.pushResult({\n            result: false,\n            actual: block,\n            message: 'The value provided to `assert.throws` in ' + '\"' + currentTest.testName + '\" was not a function.'\n          });\n          return;\n        }\n        var actual;\n        var result = false;\n        currentTest.ignoreGlobalErrors = true;\n        try {\n          block.call(currentTest.testEnvironment);\n        } catch (e) {\n          actual = e;\n        }\n        currentTest.ignoreGlobalErrors = false;\n        if (actual) {\n          var _validateException = validateException(actual, expected, message);\n          var _validateException2 = _slicedToArray(_validateException, 3);\n          result = _validateException2[0];\n          expected = _validateException2[1];\n          message = _validateException2[2];\n        }\n        currentTest.assert.pushResult({\n          result: result,\n          // undefined if it didn't throw\n          actual: actual && errorString(actual),\n          expected: expected,\n          message: message\n        });\n      }\n    }, {\n      key: \"rejects\",\n      value: function rejects(promise, expected, message) {\n        var _validateExpectedExce3 = validateExpectedExceptionArgs(expected, message, 'rejects');\n        var _validateExpectedExce4 = _slicedToArray(_validateExpectedExce3, 2);\n        expected = _validateExpectedExce4[0];\n        message = _validateExpectedExce4[1];\n        var currentTest = this instanceof Assert && this.test || config.current;\n        var then = promise && promise.then;\n        if (typeof then !== 'function') {\n          currentTest.assert.pushResult({\n            result: false,\n            message: 'The value provided to `assert.rejects` in ' + '\"' + currentTest.testName + '\" was not a promise.',\n            actual: promise\n          });\n          return;\n        }\n        var done = this.async();\n        return then.call(promise, function handleFulfillment() {\n          currentTest.assert.pushResult({\n            result: false,\n            message: 'The promise returned by the `assert.rejects` callback in ' + '\"' + currentTest.testName + '\" did not reject.',\n            actual: promise\n          });\n          done();\n        }, function handleRejection(actual) {\n          var result;\n          var _validateException3 = validateException(actual, expected, message);\n          var _validateException4 = _slicedToArray(_validateException3, 3);\n          result = _validateException4[0];\n          expected = _validateException4[1];\n          message = _validateException4[2];\n          currentTest.assert.pushResult({\n            result: result,\n            // leave rejection value of undefined as-is\n            actual: actual && errorString(actual),\n            expected: expected,\n            message: message\n          });\n          done();\n        });\n      }\n    }]);\n    return Assert;\n  }();\n  function validateExpectedExceptionArgs(expected, message, assertionMethod) {\n    var expectedType = objectType(expected);\n\n    // 'expected' is optional unless doing string comparison\n    if (expectedType === 'string') {\n      if (message === undefined) {\n        message = expected;\n        expected = undefined;\n        return [expected, message];\n      } else {\n        throw new Error('assert.' + assertionMethod + ' does not accept a string value for the expected argument.\\n' + 'Use a non-string object value (e.g. RegExp or validator function) ' + 'instead if necessary.');\n      }\n    }\n    var valid = !expected ||\n    // TODO: be more explicit here\n    expectedType === 'regexp' || expectedType === 'function' || expectedType === 'object';\n    if (!valid) {\n      throw new Error('Invalid expected value type (' + expectedType + ') ' + 'provided to assert.' + assertionMethod + '.');\n    }\n    return [expected, message];\n  }\n  function validateException(actual, expected, message) {\n    var result = false;\n    var expectedType = objectType(expected);\n\n    // These branches should be exhaustive, based on validation done in validateExpectedException\n\n    // We don't want to validate\n    if (!expected) {\n      result = true;\n\n      // Expected is a regexp\n    } else if (expectedType === 'regexp') {\n      result = expected.test(errorString(actual));\n\n      // Log the string form of the regexp\n      expected = String(expected);\n\n      // Expected is a constructor, maybe an Error constructor.\n      // Note the extra check on its prototype - this is an implicit\n      // requirement of \"instanceof\", else it will throw a TypeError.\n    } else if (expectedType === 'function' && expected.prototype !== undefined && actual instanceof expected) {\n      result = true;\n\n      // Expected is an Error object\n    } else if (expectedType === 'object') {\n      result = actual instanceof expected.constructor && actual.name === expected.name && actual.message === expected.message;\n\n      // Log the string form of the Error object\n      expected = errorString(expected);\n\n      // Expected is a validation function which returns true if validation passed\n    } else if (expectedType === 'function') {\n      // protect against accidental semantics which could hard error in the test\n      try {\n        result = expected.call({}, actual) === true;\n        expected = null;\n      } catch (e) {\n        // assign the \"expected\" to a nice error string to communicate the local failure to the user\n        expected = errorString(e);\n      }\n    }\n    return [result, expected, message];\n  }\n\n  // Provide an alternative to assert.throws(), for environments that consider throws a reserved word\n  // Known to us are: Closure Compiler, Narwhal\n  // eslint-disable-next-line dot-notation\n  Assert.prototype.raises = Assert.prototype['throws'];\n  var LISTENERS = Object.create(null);\n  var SUPPORTED_EVENTS = ['error', 'runStart', 'suiteStart', 'testStart', 'assertion', 'testEnd', 'suiteEnd', 'runEnd'];\n\n  /**\n   * Emits an event with the specified data to all currently registered listeners.\n   * Callbacks will fire in the order in which they are registered (FIFO). This\n   * function is not exposed publicly; it is used by QUnit internals to emit\n   * logging events.\n   *\n   * @private\n   * @method emit\n   * @param {string} eventName\n   * @param {Object} data\n   * @return {void}\n   */\n  function emit(eventName, data) {\n    if (typeof eventName !== 'string') {\n      throw new TypeError('eventName must be a string when emitting an event');\n    }\n\n    // Clone the callbacks in case one of them registers a new callback\n    var originalCallbacks = LISTENERS[eventName];\n    var callbacks = originalCallbacks ? _toConsumableArray(originalCallbacks) : [];\n    for (var i = 0; i < callbacks.length; i++) {\n      callbacks[i](data);\n    }\n  }\n\n  /**\n   * Registers a callback as a listener to the specified event.\n   *\n   * @public\n   * @method on\n   * @param {string} eventName\n   * @param {Function} callback\n   * @return {void}\n   */\n  function on(eventName, callback) {\n    if (typeof eventName !== 'string') {\n      throw new TypeError('eventName must be a string when registering a listener');\n    } else if (!inArray(eventName, SUPPORTED_EVENTS)) {\n      var events = SUPPORTED_EVENTS.join(', ');\n      throw new Error(\"\\\"\".concat(eventName, \"\\\" is not a valid event; must be one of: \").concat(events, \".\"));\n    } else if (typeof callback !== 'function') {\n      throw new TypeError('callback must be a function when registering a listener');\n    }\n    if (!LISTENERS[eventName]) {\n      LISTENERS[eventName] = [];\n    }\n\n    // Don't register the same callback more than once\n    if (!inArray(callback, LISTENERS[eventName])) {\n      LISTENERS[eventName].push(callback);\n    }\n  }\n  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};\n  function commonjsRequire(path) {\n    throw new Error('Could not dynamically require \"' + path + '\". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');\n  }\n  var promisePolyfill = {\n    exports: {}\n  };\n  (function () {\n    /** @suppress {undefinedVars} */\n    var globalNS = function () {\n      // the only reliable means to get the global object is\n      // `Function('return this')()`\n      // However, this causes CSP violations in Chrome apps.\n      if (typeof globalThis !== 'undefined') {\n        return globalThis;\n      }\n      if (typeof self !== 'undefined') {\n        return self;\n      }\n      if (typeof window !== 'undefined') {\n        return window;\n      }\n      if (typeof commonjsGlobal !== 'undefined') {\n        return commonjsGlobal;\n      }\n      throw new Error('unable to locate global object');\n    }();\n\n    // Expose the polyfill if Promise is undefined or set to a\n    // non-function value. The latter can be due to a named HTMLElement\n    // being exposed by browsers for legacy reasons.\n    // https://github.com/taylorhakes/promise-polyfill/issues/114\n    if (typeof globalNS['Promise'] === 'function') {\n      promisePolyfill.exports = globalNS['Promise'];\n      return;\n    }\n\n    /**\n     * @this {Promise}\n     */\n    function finallyConstructor(callback) {\n      var constructor = this.constructor;\n      return this.then(function (value) {\n        // @ts-ignore\n        return constructor.resolve(callback()).then(function () {\n          return value;\n        });\n      }, function (reason) {\n        // @ts-ignore\n        return constructor.resolve(callback()).then(function () {\n          // @ts-ignore\n          return constructor.reject(reason);\n        });\n      });\n    }\n    function allSettled(arr) {\n      var P = this;\n      return new P(function (resolve, reject) {\n        if (!(arr && typeof arr.length !== 'undefined')) {\n          return reject(new TypeError(_typeof(arr) + ' ' + arr + ' is not iterable(cannot read property Symbol(Symbol.iterator))'));\n        }\n        var args = Array.prototype.slice.call(arr);\n        if (args.length === 0) return resolve([]);\n        var remaining = args.length;\n        function res(i, val) {\n          if (val && (_typeof(val) === 'object' || typeof val === 'function')) {\n            var then = val.then;\n            if (typeof then === 'function') {\n              then.call(val, function (val) {\n                res(i, val);\n              }, function (e) {\n                args[i] = {\n                  status: 'rejected',\n                  reason: e\n                };\n                if (--remaining === 0) {\n                  resolve(args);\n                }\n              });\n              return;\n            }\n          }\n          args[i] = {\n            status: 'fulfilled',\n            value: val\n          };\n          if (--remaining === 0) {\n            resolve(args);\n          }\n        }\n        for (var i = 0; i < args.length; i++) {\n          res(i, args[i]);\n        }\n      });\n    }\n\n    // Store setTimeout reference so promise-polyfill will be unaffected by\n    // other code modifying setTimeout (like sinon.useFakeTimers())\n    var setTimeoutFunc = setTimeout;\n    function isArray(x) {\n      return Boolean(x && typeof x.length !== 'undefined');\n    }\n    function noop() {}\n\n    // Polyfill for Function.prototype.bind\n    function bind(fn, thisArg) {\n      return function () {\n        fn.apply(thisArg, arguments);\n      };\n    }\n\n    /**\n     * @constructor\n     * @param {Function} fn\n     */\n    function Promise(fn) {\n      if (!(this instanceof Promise)) throw new TypeError('Promises must be constructed via new');\n      if (typeof fn !== 'function') throw new TypeError('not a function');\n      /** @type {!number} */\n      this._state = 0;\n      /** @type {!boolean} */\n      this._handled = false;\n      /** @type {Promise|undefined} */\n      this._value = undefined;\n      /** @type {!Array<!Function>} */\n      this._deferreds = [];\n      doResolve(fn, this);\n    }\n    function handle(self, deferred) {\n      while (self._state === 3) {\n        self = self._value;\n      }\n      if (self._state === 0) {\n        self._deferreds.push(deferred);\n        return;\n      }\n      self._handled = true;\n      Promise._immediateFn(function () {\n        var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;\n        if (cb === null) {\n          (self._state === 1 ? resolve : reject)(deferred.promise, self._value);\n          return;\n        }\n        var ret;\n        try {\n          ret = cb(self._value);\n        } catch (e) {\n          reject(deferred.promise, e);\n          return;\n        }\n        resolve(deferred.promise, ret);\n      });\n    }\n    function resolve(self, newValue) {\n      try {\n        // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure\n        if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');\n        if (newValue && (_typeof(newValue) === 'object' || typeof newValue === 'function')) {\n          var then = newValue.then;\n          if (newValue instanceof Promise) {\n            self._state = 3;\n            self._value = newValue;\n            finale(self);\n            return;\n          } else if (typeof then === 'function') {\n            doResolve(bind(then, newValue), self);\n            return;\n          }\n        }\n        self._state = 1;\n        self._value = newValue;\n        finale(self);\n      } catch (e) {\n        reject(self, e);\n      }\n    }\n    function reject(self, newValue) {\n      self._state = 2;\n      self._value = newValue;\n      finale(self);\n    }\n    function finale(self) {\n      if (self._state === 2 && self._deferreds.length === 0) {\n        Promise._immediateFn(function () {\n          if (!self._handled) {\n            Promise._unhandledRejectionFn(self._value);\n          }\n        });\n      }\n      for (var i = 0, len = self._deferreds.length; i < len; i++) {\n        handle(self, self._deferreds[i]);\n      }\n      self._deferreds = null;\n    }\n\n    /**\n     * @constructor\n     */\n    function Handler(onFulfilled, onRejected, promise) {\n      this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;\n      this.onRejected = typeof onRejected === 'function' ? onRejected : null;\n      this.promise = promise;\n    }\n\n    /**\n     * Take a potentially misbehaving resolver function and make sure\n     * onFulfilled and onRejected are only called once.\n     *\n     * Makes no guarantees about asynchrony.\n     */\n    function doResolve(fn, self) {\n      var done = false;\n      try {\n        fn(function (value) {\n          if (done) return;\n          done = true;\n          resolve(self, value);\n        }, function (reason) {\n          if (done) return;\n          done = true;\n          reject(self, reason);\n        });\n      } catch (ex) {\n        if (done) return;\n        done = true;\n        reject(self, ex);\n      }\n    }\n    Promise.prototype['catch'] = function (onRejected) {\n      return this.then(null, onRejected);\n    };\n    Promise.prototype.then = function (onFulfilled, onRejected) {\n      // @ts-ignore\n      var prom = new this.constructor(noop);\n      handle(this, new Handler(onFulfilled, onRejected, prom));\n      return prom;\n    };\n    Promise.prototype['finally'] = finallyConstructor;\n    Promise.all = function (arr) {\n      return new Promise(function (resolve, reject) {\n        if (!isArray(arr)) {\n          return reject(new TypeError('Promise.all accepts an array'));\n        }\n        var args = Array.prototype.slice.call(arr);\n        if (args.length === 0) return resolve([]);\n        var remaining = args.length;\n        function res(i, val) {\n          try {\n            if (val && (_typeof(val) === 'object' || typeof val === 'function')) {\n              var then = val.then;\n              if (typeof then === 'function') {\n                then.call(val, function (val) {\n                  res(i, val);\n                }, reject);\n                return;\n              }\n            }\n            args[i] = val;\n            if (--remaining === 0) {\n              resolve(args);\n            }\n          } catch (ex) {\n            reject(ex);\n          }\n        }\n        for (var i = 0; i < args.length; i++) {\n          res(i, args[i]);\n        }\n      });\n    };\n    Promise.allSettled = allSettled;\n    Promise.resolve = function (value) {\n      if (value && _typeof(value) === 'object' && value.constructor === Promise) {\n        return value;\n      }\n      return new Promise(function (resolve) {\n        resolve(value);\n      });\n    };\n    Promise.reject = function (value) {\n      return new Promise(function (resolve, reject) {\n        reject(value);\n      });\n    };\n    Promise.race = function (arr) {\n      return new Promise(function (resolve, reject) {\n        if (!isArray(arr)) {\n          return reject(new TypeError('Promise.race accepts an array'));\n        }\n        for (var i = 0, len = arr.length; i < len; i++) {\n          Promise.resolve(arr[i]).then(resolve, reject);\n        }\n      });\n    };\n\n    // Use polyfill for setImmediate for performance gains\n    Promise._immediateFn =\n    // @ts-ignore\n    typeof setImmediate === 'function' && function (fn) {\n      // @ts-ignore\n      setImmediate(fn);\n    } || function (fn) {\n      setTimeoutFunc(fn, 0);\n    };\n    Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {\n      if (typeof console !== 'undefined' && console) {\n        console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console\n      }\n    };\n\n    promisePolyfill.exports = Promise;\n  })();\n  var _Promise = promisePolyfill.exports;\n\n  // Register logging callbacks\n  function registerLoggingCallbacks(obj) {\n    var callbackNames = ['begin', 'done', 'log', 'testStart', 'testDone', 'moduleStart', 'moduleDone'];\n    function registerLoggingCallback(key) {\n      return function loggingCallback(callback) {\n        if (typeof callback !== 'function') {\n          throw new Error('Callback parameter must be a function');\n        }\n        config.callbacks[key].push(callback);\n      };\n    }\n    for (var i = 0; i < callbackNames.length; i++) {\n      var key = callbackNames[i];\n\n      // Initialize key collection of logging callback\n      if (typeof config.callbacks[key] === 'undefined') {\n        config.callbacks[key] = [];\n      }\n      obj[key] = registerLoggingCallback(key);\n    }\n  }\n  function runLoggingCallbacks(key, args) {\n    var callbacks = config.callbacks[key];\n\n    // Handling 'log' callbacks separately. Unlike the other callbacks,\n    // the log callback is not controlled by the processing queue,\n    // but rather used by asserts. Hence to promisfy the 'log' callback\n    // would mean promisfying each step of a test\n    if (key === 'log') {\n      callbacks.map(function (callback) {\n        return callback(args);\n      });\n      return;\n    }\n\n    // ensure that each callback is executed serially\n    var promiseChain = _Promise.resolve();\n    callbacks.forEach(function (callback) {\n      promiseChain = promiseChain.then(function () {\n        return _Promise.resolve(callback(args));\n      });\n    });\n    return promiseChain;\n  }\n  var priorityCount = 0;\n  var unitSampler;\n\n  // This is a queue of functions that are tasks within a single test.\n  // After tests are dequeued from config.queue they are expanded into\n  // a set of tasks in this queue.\n  var taskQueue = [];\n\n  /**\n   * Advances the taskQueue to the next task. If the taskQueue is empty,\n   * process the testQueue\n   */\n  function advance() {\n    advanceTaskQueue();\n    if (!taskQueue.length && !config.blocking && !config.current) {\n      advanceTestQueue();\n    }\n  }\n\n  /**\n   * Advances the taskQueue with an increased depth\n   */\n  function advanceTaskQueue() {\n    var start = performance.now();\n    config.depth = (config.depth || 0) + 1;\n    processTaskQueue(start);\n    config.depth--;\n  }\n\n  /**\n   * Process the first task on the taskQueue as a promise.\n   * Each task is a function added by Test#queue() in /src/test.js\n   */\n  function processTaskQueue(start) {\n    if (taskQueue.length && !config.blocking) {\n      var elapsedTime = performance.now() - start;\n\n      // The updateRate ensures that a user interface (HTML Reporter) can be updated\n      // at least once every second. This can also prevent browsers from prompting\n      // a warning about long running scripts.\n      if (!setTimeout$1 || config.updateRate <= 0 || elapsedTime < config.updateRate) {\n        var task = taskQueue.shift();\n        _Promise.resolve(task()).then(function () {\n          if (!taskQueue.length) {\n            advance();\n          } else {\n            processTaskQueue(start);\n          }\n        });\n      } else {\n        setTimeout$1(advance);\n      }\n    }\n  }\n\n  /**\n   * Advance the testQueue to the next test to process. Call done() if testQueue completes.\n   */\n  function advanceTestQueue() {\n    if (!config.blocking && !config.queue.length && config.depth === 0) {\n      done();\n      return;\n    }\n    var testTasks = config.queue.shift();\n    addToTaskQueue(testTasks());\n    if (priorityCount > 0) {\n      priorityCount--;\n    }\n    advance();\n  }\n\n  /**\n   * Enqueue the tasks for a test into the task queue.\n   * @param {Array} tasksArray\n   */\n  function addToTaskQueue(tasksArray) {\n    taskQueue.push.apply(taskQueue, _toConsumableArray(tasksArray));\n  }\n\n  /**\n   * Return the number of tasks remaining in the task queue to be processed.\n   * @return {number}\n   */\n  function taskQueueLength() {\n    return taskQueue.length;\n  }\n\n  /**\n   * Adds a test to the TestQueue for execution.\n   * @param {Function} testTasksFunc\n   * @param {boolean} prioritize\n   * @param {string} seed\n   */\n  function addToTestQueue(testTasksFunc, prioritize, seed) {\n    if (prioritize) {\n      config.queue.splice(priorityCount++, 0, testTasksFunc);\n    } else if (seed) {\n      if (!unitSampler) {\n        unitSampler = unitSamplerGenerator(seed);\n      }\n\n      // Insert into a random position after all prioritized items\n      var index = Math.floor(unitSampler() * (config.queue.length - priorityCount + 1));\n      config.queue.splice(priorityCount + index, 0, testTasksFunc);\n    } else {\n      config.queue.push(testTasksFunc);\n    }\n  }\n\n  /**\n   * Creates a seeded \"sample\" generator which is used for randomizing tests.\n   */\n  function unitSamplerGenerator(seed) {\n    // 32-bit xorshift, requires only a nonzero seed\n    // https://excamera.com/sphinx/article-xorshift.html\n    var sample = parseInt(generateHash(seed), 16) || -1;\n    return function () {\n      sample ^= sample << 13;\n      sample ^= sample >>> 17;\n      sample ^= sample << 5;\n\n      // ECMAScript has no unsigned number type\n      if (sample < 0) {\n        sample += 0x100000000;\n      }\n      return sample / 0x100000000;\n    };\n  }\n\n  /**\n   * This function is called when the ProcessingQueue is done processing all\n   * items. It handles emitting the final run events.\n   */\n  function done() {\n    // We have reached the end of the processing queue and are about to emit the\n    // \"runEnd\" event after which reporters typically stop listening and exit\n    // the process. First, check if we need to emit one final test.\n    if (config.stats.testCount === 0 && config.failOnZeroTests === true) {\n      var error;\n      if (config.filter && config.filter.length) {\n        error = new Error(\"No tests matched the filter \\\"\".concat(config.filter, \"\\\".\"));\n      } else if (config.module && config.module.length) {\n        error = new Error(\"No tests matched the module \\\"\".concat(config.module, \"\\\".\"));\n      } else if (config.moduleId && config.moduleId.length) {\n        error = new Error(\"No tests matched the moduleId \\\"\".concat(config.moduleId, \"\\\".\"));\n      } else if (config.testId && config.testId.length) {\n        error = new Error(\"No tests matched the testId \\\"\".concat(config.testId, \"\\\".\"));\n      } else {\n        error = new Error('No tests were run.');\n      }\n      test('global failure', extend(function (assert) {\n        assert.pushResult({\n          result: false,\n          message: error.message,\n          source: error.stack\n        });\n      }, {\n        validTest: true\n      }));\n\n      // We do need to call `advance()` in order to resume the processing queue.\n      // Once this new test is finished processing, we'll reach `done` again, and\n      // that time the above condition will evaluate to false.\n      advance();\n      return;\n    }\n    var storage = config.storage;\n    var runtime = Math.round(performance.now() - config.started);\n    var passed = config.stats.all - config.stats.bad;\n    ProcessingQueue.finished = true;\n    emit('runEnd', runSuite.end(true));\n    runLoggingCallbacks('done', {\n      // @deprecated since 2.19.0 Use done() without `details` parameter,\n      // or use `QUnit.on('runEnd')` instead. Parameter to be replaced in\n      // QUnit 3.0 with test counts.\n      passed: passed,\n      failed: config.stats.bad,\n      total: config.stats.all,\n      runtime: runtime\n    }).then(function () {\n      // Clear own storage items if all tests passed\n      if (storage && config.stats.bad === 0) {\n        for (var i = storage.length - 1; i >= 0; i--) {\n          var key = storage.key(i);\n          if (key.indexOf('qunit-test-') === 0) {\n            storage.removeItem(key);\n          }\n        }\n      }\n    });\n  }\n  var ProcessingQueue = {\n    finished: false,\n    add: addToTestQueue,\n    advance: advance,\n    taskCount: taskQueueLength\n  };\n  var TestReport = /*#__PURE__*/function () {\n    function TestReport(name, suite, options) {\n      _classCallCheck(this, TestReport);\n      this.name = name;\n      this.suiteName = suite.name;\n      this.fullName = suite.fullName.concat(name);\n      this.runtime = 0;\n      this.assertions = [];\n      this.skipped = !!options.skip;\n      this.todo = !!options.todo;\n      this.valid = options.valid;\n      this._startTime = 0;\n      this._endTime = 0;\n      suite.pushTest(this);\n    }\n    _createClass(TestReport, [{\n      key: \"start\",\n      value: function start(recordTime) {\n        if (recordTime) {\n          this._startTime = performance.now();\n          performance.mark('qunit_test_start');\n        }\n        return {\n          name: this.name,\n          suiteName: this.suiteName,\n          fullName: this.fullName.slice()\n        };\n      }\n    }, {\n      key: \"end\",\n      value: function end(recordTime) {\n        if (recordTime) {\n          this._endTime = performance.now();\n          if (performance) {\n            performance.mark('qunit_test_end');\n            var testName = this.fullName.join(' – ');\n            performance.measure(\"QUnit Test: \".concat(testName), 'qunit_test_start', 'qunit_test_end');\n          }\n        }\n        return extend(this.start(), {\n          runtime: this.getRuntime(),\n          status: this.getStatus(),\n          errors: this.getFailedAssertions(),\n          assertions: this.getAssertions()\n        });\n      }\n    }, {\n      key: \"pushAssertion\",\n      value: function pushAssertion(assertion) {\n        this.assertions.push(assertion);\n      }\n    }, {\n      key: \"getRuntime\",\n      value: function getRuntime() {\n        return Math.round(this._endTime - this._startTime);\n      }\n    }, {\n      key: \"getStatus\",\n      value: function getStatus() {\n        if (this.skipped) {\n          return 'skipped';\n        }\n        var testPassed = this.getFailedAssertions().length > 0 ? this.todo : !this.todo;\n        if (!testPassed) {\n          return 'failed';\n        } else if (this.todo) {\n          return 'todo';\n        } else {\n          return 'passed';\n        }\n      }\n    }, {\n      key: \"getFailedAssertions\",\n      value: function getFailedAssertions() {\n        return this.assertions.filter(function (assertion) {\n          return !assertion.passed;\n        });\n      }\n    }, {\n      key: \"getAssertions\",\n      value: function getAssertions() {\n        return this.assertions.slice();\n      }\n\n      // Remove actual and expected values from assertions. This is to prevent\n      // leaking memory throughout a test suite.\n    }, {\n      key: \"slimAssertions\",\n      value: function slimAssertions() {\n        this.assertions = this.assertions.map(function (assertion) {\n          delete assertion.actual;\n          delete assertion.expected;\n          return assertion;\n        });\n      }\n    }]);\n    return TestReport;\n  }();\n  function Test(settings) {\n    this.expected = null;\n    this.assertions = [];\n    this.module = config.currentModule;\n    this.steps = [];\n    this.timeout = undefined;\n    this.data = undefined;\n    this.withData = false;\n    this.pauses = new StringMap();\n    this.nextPauseId = 1;\n\n    // For the most common case, we have:\n    // - 0: new Test\n    // - 1: addTest\n    // - 2: QUnit.test\n    // - 3: user file\n    //\n    // This needs is customised by test.each()\n    this.stackOffset = 3;\n    extend(this, settings);\n\n    // If a module is skipped, all its tests and the tests of the child suites\n    // should be treated as skipped even if they are defined as `only` or `todo`.\n    // As for `todo` module, all its tests will be treated as `todo` except for\n    // tests defined as `skip` which will be left intact.\n    //\n    // So, if a test is defined as `todo` and is inside a skipped module, we should\n    // then treat that test as if was defined as `skip`.\n    if (this.module.skip) {\n      this.skip = true;\n      this.todo = false;\n\n      // Skipped tests should be left intact\n    } else if (this.module.todo && !this.skip) {\n      this.todo = true;\n    }\n\n    // Queuing a late test after the run has ended is not allowed.\n    // This was once supported for internal use by QUnit.onError().\n    // Ref https://github.com/qunitjs/qunit/issues/1377\n    if (ProcessingQueue.finished) {\n      // Using this for anything other than onError(), such as testing in QUnit.done(),\n      // is unstable and will likely result in the added tests being ignored by CI.\n      // (Meaning the CI passes irregardless of the added tests).\n      //\n      // TODO: Make this an error in QUnit 3.0\n      // throw new Error( \"Unexpected test after runEnd\" );\n      Logger.warn('Unexpected test after runEnd. This is unstable and will fail in QUnit 3.0.');\n      return;\n    }\n    if (!this.skip && typeof this.callback !== 'function') {\n      var method = this.todo ? 'QUnit.todo' : 'QUnit.test';\n      throw new TypeError(\"You must provide a callback to \".concat(method, \"(\\\"\").concat(this.testName, \"\\\")\"));\n    }\n\n    // Register unique strings\n    for (var i = 0, l = this.module.tests; i < l.length; i++) {\n      if (this.module.tests[i].name === this.testName) {\n        this.testName += ' ';\n      }\n    }\n    this.testId = generateHash(this.module.name, this.testName);\n\n    // No validation after this. Beyond this point, failures must be recorded as\n    // a completed test with errors, instead of early bail out.\n    // Otherwise, internals may be left in an inconsistent state.\n    // Ref https://github.com/qunitjs/qunit/issues/1514\n\n    ++Test.count;\n    this.errorForStack = new Error();\n    if (this.callback && this.callback.validTest) {\n      // Omit the test-level trace for the internal \"No tests\" test failure,\n      // There is already an assertion-level trace, and that's noisy enough\n      // as it is.\n      this.errorForStack.stack = undefined;\n    }\n    this.testReport = new TestReport(this.testName, this.module.suiteReport, {\n      todo: this.todo,\n      skip: this.skip,\n      valid: this.valid()\n    });\n    this.module.tests.push({\n      name: this.testName,\n      testId: this.testId,\n      skip: !!this.skip\n    });\n    if (this.skip) {\n      // Skipped tests will fully ignore any sent callback\n      this.callback = function () {};\n      this.async = false;\n      this.expected = 0;\n    } else {\n      this.assert = new Assert(this);\n    }\n  }\n  Test.count = 0;\n  function getNotStartedModules(startModule) {\n    var module = startModule;\n    var modules = [];\n    while (module && module.testsRun === 0) {\n      modules.push(module);\n      module = module.parentModule;\n    }\n\n    // The above push modules from the child to the parent\n    // return a reversed order with the top being the top most parent module\n    return modules.reverse();\n  }\n  Test.prototype = {\n    // Use a getter to avoid computing a stack trace (which can be expensive),\n    // This is displayed by the HTML Reporter, but most other integrations do\n    // not access it.\n    get stack() {\n      return extractStacktrace(this.errorForStack, this.stackOffset);\n    },\n    before: function before() {\n      var _this = this;\n      var module = this.module;\n      var notStartedModules = getNotStartedModules(module);\n\n      // ensure the callbacks are executed serially for each module\n      var moduleStartChain = _Promise.resolve();\n      notStartedModules.forEach(function (startModule) {\n        moduleStartChain = moduleStartChain.then(function () {\n          startModule.stats = {\n            all: 0,\n            bad: 0,\n            started: performance.now()\n          };\n          emit('suiteStart', startModule.suiteReport.start(true));\n          return runLoggingCallbacks('moduleStart', {\n            name: startModule.name,\n            tests: startModule.tests\n          });\n        });\n      });\n      return moduleStartChain.then(function () {\n        config.current = _this;\n        _this.testEnvironment = extend({}, module.testEnvironment);\n        _this.started = performance.now();\n        emit('testStart', _this.testReport.start(true));\n        return runLoggingCallbacks('testStart', {\n          name: _this.testName,\n          module: module.name,\n          testId: _this.testId,\n          previousFailure: _this.previousFailure\n        }).then(function () {\n          if (!config.pollution) {\n            saveGlobal();\n          }\n        });\n      });\n    },\n    run: function run() {\n      config.current = this;\n      if (config.notrycatch) {\n        runTest(this);\n        return;\n      }\n      try {\n        runTest(this);\n      } catch (e) {\n        this.pushFailure('Died on test #' + (this.assertions.length + 1) + ': ' + (e.message || e) + '\\n' + this.stack, extractStacktrace(e, 0));\n\n        // Else next test will carry the responsibility\n        saveGlobal();\n\n        // Restart the tests if they're blocking\n        if (config.blocking) {\n          internalRecover(this);\n        }\n      }\n      function runTest(test) {\n        var promise;\n        if (test.withData) {\n          promise = test.callback.call(test.testEnvironment, test.assert, test.data);\n        } else {\n          promise = test.callback.call(test.testEnvironment, test.assert);\n        }\n        test.resolvePromise(promise);\n\n        // If the test has an async \"pause\" on it, but the timeout is 0, then we push a\n        // failure as the test should be synchronous.\n        if (test.timeout === 0 && test.pauses.size > 0) {\n          pushFailure('Test did not finish synchronously even though assert.timeout( 0 ) was used.', sourceFromStacktrace(2));\n        }\n      }\n    },\n    after: function after() {\n      checkPollution();\n    },\n    queueGlobalHook: function queueGlobalHook(hook, hookName) {\n      var _this2 = this;\n      var runHook = function runHook() {\n        config.current = _this2;\n        var promise;\n        if (config.notrycatch) {\n          promise = hook.call(_this2.testEnvironment, _this2.assert);\n        } else {\n          try {\n            promise = hook.call(_this2.testEnvironment, _this2.assert);\n          } catch (error) {\n            _this2.pushFailure('Global ' + hookName + ' failed on ' + _this2.testName + ': ' + errorString(error), extractStacktrace(error, 0));\n            return;\n          }\n        }\n        _this2.resolvePromise(promise, hookName);\n      };\n      return runHook;\n    },\n    queueHook: function queueHook(hook, hookName, hookOwner) {\n      var _this3 = this;\n      var callHook = function callHook() {\n        var promise = hook.call(_this3.testEnvironment, _this3.assert);\n        _this3.resolvePromise(promise, hookName);\n      };\n      var runHook = function runHook() {\n        if (hookName === 'before') {\n          if (hookOwner.testsRun !== 0) {\n            return;\n          }\n          _this3.preserveEnvironment = true;\n        }\n\n        // The 'after' hook should only execute when there are not tests left and\n        // when the 'after' and 'finish' tasks are the only tasks left to process\n        if (hookName === 'after' && !lastTestWithinModuleExecuted(hookOwner) && (config.queue.length > 0 || ProcessingQueue.taskCount() > 2)) {\n          return;\n        }\n        config.current = _this3;\n        if (config.notrycatch) {\n          callHook();\n          return;\n        }\n        try {\n          // This try-block includes the indirect call to resolvePromise, which shouldn't\n          // have to be inside try-catch. But, since we support any user-provided thenable\n          // object, the thenable might throw in some unexpected way.\n          // This subtle behaviour is undocumented. To avoid new failures in minor releases\n          // we will not change this until QUnit 3.\n          // TODO: In QUnit 3, reduce this try-block to just hook.call(), matching\n          // the simplicity of queueGlobalHook.\n          callHook();\n        } catch (error) {\n          _this3.pushFailure(hookName + ' failed on ' + _this3.testName + ': ' + (error.message || error), extractStacktrace(error, 0));\n        }\n      };\n      return runHook;\n    },\n    // Currently only used for module level hooks, can be used to add global level ones\n    hooks: function hooks(handler) {\n      var hooks = [];\n      function processGlobalhooks(test) {\n        if ((handler === 'beforeEach' || handler === 'afterEach') && config.globalHooks[handler]) {\n          for (var i = 0; i < config.globalHooks[handler].length; i++) {\n            hooks.push(test.queueGlobalHook(config.globalHooks[handler][i], handler));\n          }\n        }\n      }\n      function processHooks(test, module) {\n        if (module.parentModule) {\n          processHooks(test, module.parentModule);\n        }\n        if (module.hooks[handler].length) {\n          for (var i = 0; i < module.hooks[handler].length; i++) {\n            hooks.push(test.queueHook(module.hooks[handler][i], handler, module));\n          }\n        }\n      }\n\n      // Hooks are ignored on skipped tests\n      if (!this.skip) {\n        processGlobalhooks(this);\n        processHooks(this, this.module);\n      }\n      return hooks;\n    },\n    finish: function finish() {\n      config.current = this;\n\n      // Release the timeout and timeout callback references to be garbage collected.\n      // https://github.com/qunitjs/qunit/pull/1708\n      if (setTimeout$1) {\n        clearTimeout(this.timeout);\n        config.timeoutHandler = null;\n      }\n\n      // Release the test callback to ensure that anything referenced has been\n      // released to be garbage collected.\n      this.callback = undefined;\n      if (this.steps.length) {\n        var stepsList = this.steps.join(', ');\n        this.pushFailure('Expected assert.verifySteps() to be called before end of test ' + \"after using assert.step(). Unverified steps: \".concat(stepsList), this.stack);\n      }\n      if (config.requireExpects && this.expected === null) {\n        this.pushFailure('Expected number of assertions to be defined, but expect() was ' + 'not called.', this.stack);\n      } else if (this.expected !== null && this.expected !== this.assertions.length) {\n        this.pushFailure('Expected ' + this.expected + ' assertions, but ' + this.assertions.length + ' were run', this.stack);\n      } else if (this.expected === null && !this.assertions.length) {\n        this.pushFailure('Expected at least one assertion, but none were run - call ' + 'expect(0) to accept zero assertions.', this.stack);\n      }\n      var module = this.module;\n      var moduleName = module.name;\n      var testName = this.testName;\n      var skipped = !!this.skip;\n      var todo = !!this.todo;\n      var bad = 0;\n      var storage = config.storage;\n      this.runtime = Math.round(performance.now() - this.started);\n      config.stats.all += this.assertions.length;\n      config.stats.testCount += 1;\n      module.stats.all += this.assertions.length;\n      for (var i = 0; i < this.assertions.length; i++) {\n        // A failing assertion will counts toward the HTML Reporter's\n        // \"X assertions, Y failed\" line even if it was inside a todo.\n        // Inverting this would be similarly confusing since all but the last\n        // passing assertion inside a todo test should be considered as good.\n        // These stats don't decide the outcome of anything, so counting them\n        // as failing seems the most intuitive.\n        if (!this.assertions[i].result) {\n          bad++;\n          config.stats.bad++;\n          module.stats.bad++;\n        }\n      }\n      if (skipped) {\n        incrementTestsIgnored(module);\n      } else {\n        incrementTestsRun(module);\n      }\n\n      // Store result when possible.\n      // Note that this also marks todo tests as bad, thus they get hoisted,\n      // and always run first on refresh.\n      if (storage) {\n        if (bad) {\n          storage.setItem('qunit-test-' + moduleName + '-' + testName, bad);\n        } else {\n          storage.removeItem('qunit-test-' + moduleName + '-' + testName);\n        }\n      }\n\n      // After emitting the js-reporters event we cleanup the assertion data to\n      // avoid leaking it. It is not used by the legacy testDone callbacks.\n      emit('testEnd', this.testReport.end(true));\n      this.testReport.slimAssertions();\n      var test = this;\n      return runLoggingCallbacks('testDone', {\n        name: testName,\n        module: moduleName,\n        skipped: skipped,\n        todo: todo,\n        failed: bad,\n        passed: this.assertions.length - bad,\n        total: this.assertions.length,\n        runtime: skipped ? 0 : this.runtime,\n        // HTML Reporter use\n        assertions: this.assertions,\n        testId: this.testId,\n        // Source of Test\n        // generating stack trace is expensive, so using a getter will help defer this until we need it\n        get source() {\n          return test.stack;\n        }\n      }).then(function () {\n        if (allTestsExecuted(module)) {\n          var completedModules = [module];\n\n          // Check if the parent modules, iteratively, are done. If that the case,\n          // we emit the `suiteEnd` event and trigger `moduleDone` callback.\n          var parent = module.parentModule;\n          while (parent && allTestsExecuted(parent)) {\n            completedModules.push(parent);\n            parent = parent.parentModule;\n          }\n          var moduleDoneChain = _Promise.resolve();\n          completedModules.forEach(function (completedModule) {\n            moduleDoneChain = moduleDoneChain.then(function () {\n              return logSuiteEnd(completedModule);\n            });\n          });\n          return moduleDoneChain;\n        }\n      }).then(function () {\n        config.current = undefined;\n      });\n      function logSuiteEnd(module) {\n        // Reset `module.hooks` to ensure that anything referenced in these hooks\n        // has been released to be garbage collected. Descendant modules that were\n        // entirely skipped, e.g. due to filtering, will never have this method\n        // called for them, but might have hooks with references pinning data in\n        // memory (even if the hooks weren't actually executed), so we reset the\n        // hooks on all descendant modules here as well. This is safe because we\n        // will never call this as long as any descendant modules still have tests\n        // to run. This also means that in multi-tiered nesting scenarios we might\n        // reset the hooks multiple times on some modules, but that's harmless.\n        var modules = [module];\n        while (modules.length) {\n          var nextModule = modules.shift();\n          nextModule.hooks = {};\n          modules.push.apply(modules, _toConsumableArray(nextModule.childModules));\n        }\n        emit('suiteEnd', module.suiteReport.end(true));\n        return runLoggingCallbacks('moduleDone', {\n          name: module.name,\n          tests: module.tests,\n          failed: module.stats.bad,\n          passed: module.stats.all - module.stats.bad,\n          total: module.stats.all,\n          runtime: Math.round(performance.now() - module.stats.started)\n        });\n      }\n    },\n    preserveTestEnvironment: function preserveTestEnvironment() {\n      if (this.preserveEnvironment) {\n        this.module.testEnvironment = this.testEnvironment;\n        this.testEnvironment = extend({}, this.module.testEnvironment);\n      }\n    },\n    queue: function queue() {\n      var test = this;\n      if (!this.valid()) {\n        incrementTestsIgnored(this.module);\n        return;\n      }\n      function runTest() {\n        return [function () {\n          return test.before();\n        }].concat(_toConsumableArray(test.hooks('before')), [function () {\n          test.preserveTestEnvironment();\n        }], _toConsumableArray(test.hooks('beforeEach')), [function () {\n          test.run();\n        }], _toConsumableArray(test.hooks('afterEach').reverse()), _toConsumableArray(test.hooks('after').reverse()), [function () {\n          test.after();\n        }, function () {\n          return test.finish();\n        }]);\n      }\n      var previousFailCount = config.storage && +config.storage.getItem('qunit-test-' + this.module.name + '-' + this.testName);\n\n      // Prioritize previously failed tests, detected from storage\n      var prioritize = config.reorder && !!previousFailCount;\n      this.previousFailure = !!previousFailCount;\n      ProcessingQueue.add(runTest, prioritize, config.seed);\n    },\n    pushResult: function pushResult(resultInfo) {\n      if (this !== config.current) {\n        var message = resultInfo && resultInfo.message || '';\n        var testName = this && this.testName || '';\n        var error = 'Assertion occurred after test finished.\\n' + '> Test: ' + testName + '\\n' + '> Message: ' + message + '\\n';\n        throw new Error(error);\n      }\n\n      // Destructure of resultInfo = { result, actual, expected, message, negative }\n      var details = {\n        module: this.module.name,\n        name: this.testName,\n        result: resultInfo.result,\n        message: resultInfo.message,\n        actual: resultInfo.actual,\n        testId: this.testId,\n        negative: resultInfo.negative || false,\n        runtime: Math.round(performance.now() - this.started),\n        todo: !!this.todo\n      };\n      if (hasOwn$1.call(resultInfo, 'expected')) {\n        details.expected = resultInfo.expected;\n      }\n      if (!resultInfo.result) {\n        var source = resultInfo.source || sourceFromStacktrace();\n        if (source) {\n          details.source = source;\n        }\n      }\n      this.logAssertion(details);\n      this.assertions.push({\n        result: !!resultInfo.result,\n        message: resultInfo.message\n      });\n    },\n    pushFailure: function pushFailure(message, source, actual) {\n      if (!(this instanceof Test)) {\n        throw new Error('pushFailure() assertion outside test context, was ' + sourceFromStacktrace(2));\n      }\n      this.pushResult({\n        result: false,\n        message: message || 'error',\n        actual: actual || null,\n        source: source\n      });\n    },\n    /**\n     * Log assertion details using both the old QUnit.log interface and\n     * QUnit.on( \"assertion\" ) interface.\n     *\n     * @private\n     */\n    logAssertion: function logAssertion(details) {\n      runLoggingCallbacks('log', details);\n      var assertion = {\n        passed: details.result,\n        actual: details.actual,\n        expected: details.expected,\n        message: details.message,\n        stack: details.source,\n        todo: details.todo\n      };\n      this.testReport.pushAssertion(assertion);\n      emit('assertion', assertion);\n    },\n    /**\n     * Reset config.timeout with a new timeout duration.\n     *\n     * @param {number} timeoutDuration\n     */\n    internalResetTimeout: function internalResetTimeout(timeoutDuration) {\n      clearTimeout(config.timeout);\n      config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);\n    },\n    /**\n     * Create a new async pause and return a new function that can release the pause.\n     *\n     * This mechanism is internally used by:\n     *\n     * - explicit async pauses, created by calling `assert.async()`,\n     * - implicit async pauses, created when `QUnit.test()` or module hook callbacks\n     *   use async-await or otherwise return a Promise.\n     *\n     * Happy scenario:\n     *\n     * - Pause is created by calling internalStop().\n     *\n     *   Pause is released normally by invoking release() during the same test.\n     *\n     *   The release() callback lets internal processing resume.\n     *\n     * Failure scenarios:\n     *\n     * - The test fails due to an uncaught exception.\n     *\n     *   In this case, Test.run() will call internalRecover() which empties the clears all\n     *   async pauses and sets the cancelled flag, which means we silently ignore any\n     *   late calls to the resume() callback, as we will have moved on to a different\n     *   test by then, and we don't want to cause an extra \"release during a different test\"\n     *   errors that the developer isn't really responsible for. This can happen when a test\n     *   correctly schedules a call to release(), but also causes an uncaught error. The\n     *   uncaught error means we will no longer wait for the release (as it might not arrive).\n     *\n     * - Pause is never released, or called an insufficient number of times.\n     *\n     *   Our timeout handler will kill the pause and resume test processing, basically\n     *   like internalRecover(), but for one pause instead of any/all.\n     *\n     *   Here, too, any late calls to resume() will be silently ignored to avoid\n     *   extra errors. We tolerate this since the original test will have already been\n     *   marked as failure.\n     *\n     *   TODO: QUnit 3 will enable timeouts by default <https://github.com/qunitjs/qunit/issues/1483>,\n     *   but right now a test will hang indefinitely if async pauses are not released,\n     *   unless QUnit.config.testTimeout or assert.timeout() is used.\n     *\n     * - Pause is spontaneously released during a different test,\n     *   or when no test is currently running.\n     *\n     *   This is close to impossible because this error only happens if the original test\n     *   succesfully finished first (since other failure scenarios kill pauses and ignore\n     *   late calls). It can happen if a test ended exactly as expected, but has some\n     *   external or shared state continuing to hold a reference to the release callback,\n     *   and either the same test scheduled another call to it in the future, or a later test\n     *   causes it to be called through some shared state.\n     *\n     * - Pause release() is called too often, during the same test.\n     *\n     *   This simply throws an error, after which uncaught error handling picks it up\n     *   and processing resumes.\n     *\n     * @param {number} [requiredCalls=1]\n     */\n    internalStop: function internalStop() {\n      var requiredCalls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;\n      config.blocking = true;\n      var test = this;\n      var pauseId = this.nextPauseId++;\n      var pause = {\n        cancelled: false,\n        remaining: requiredCalls\n      };\n      test.pauses.set(pauseId, pause);\n      function release() {\n        if (pause.cancelled) {\n          return;\n        }\n        if (config.current === undefined) {\n          throw new Error('Unexpected release of async pause after tests finished.\\n' + \"> Test: \".concat(test.testName, \" [async #\").concat(pauseId, \"]\"));\n        }\n        if (config.current !== test) {\n          throw new Error('Unexpected release of async pause during a different test.\\n' + \"> Test: \".concat(test.testName, \" [async #\").concat(pauseId, \"]\"));\n        }\n        if (pause.remaining <= 0) {\n          throw new Error('Tried to release async pause that was already released.\\n' + \"> Test: \".concat(test.testName, \" [async #\").concat(pauseId, \"]\"));\n        }\n\n        // The `requiredCalls` parameter exists to support `assert.async(count)`\n        pause.remaining--;\n        if (pause.remaining === 0) {\n          test.pauses.delete(pauseId);\n        }\n        internalStart(test);\n      }\n\n      // Set a recovery timeout, if so configured.\n      if (setTimeout$1) {\n        var timeoutDuration;\n        if (typeof test.timeout === 'number') {\n          timeoutDuration = test.timeout;\n        } else if (typeof config.testTimeout === 'number') {\n          timeoutDuration = config.testTimeout;\n        }\n        if (typeof timeoutDuration === 'number' && timeoutDuration > 0) {\n          config.timeoutHandler = function (timeout) {\n            return function () {\n              config.timeout = null;\n              pause.cancelled = true;\n              test.pauses.delete(pauseId);\n              test.pushFailure(\"Test took longer than \".concat(timeout, \"ms; test timed out.\"), sourceFromStacktrace(2));\n              internalStart(test);\n            };\n          };\n          clearTimeout(config.timeout);\n          config.timeout = setTimeout$1(config.timeoutHandler(timeoutDuration), timeoutDuration);\n        }\n      }\n      return release;\n    },\n    resolvePromise: function resolvePromise(promise, phase) {\n      if (promise != null) {\n        var _test = this;\n        var then = promise.then;\n        if (typeof then === 'function') {\n          var resume = _test.internalStop();\n          var resolve = function resolve() {\n            resume();\n          };\n          if (config.notrycatch) {\n            then.call(promise, resolve);\n          } else {\n            var reject = function reject(error) {\n              var message = 'Promise rejected ' + (!phase ? 'during' : phase.replace(/Each$/, '')) + ' \"' + _test.testName + '\": ' + (error && error.message || error);\n              _test.pushFailure(message, extractStacktrace(error, 0));\n\n              // Else next test will carry the responsibility\n              saveGlobal();\n\n              // Unblock\n              internalRecover(_test);\n            };\n            then.call(promise, resolve, reject);\n          }\n        }\n      }\n    },\n    valid: function valid() {\n      // Internally-generated tests are always valid\n      if (this.callback && this.callback.validTest) {\n        return true;\n      }\n      function moduleChainIdMatch(testModule, selectedId) {\n        return (\n          // undefined or empty array\n          !selectedId || !selectedId.length || inArray(testModule.moduleId, selectedId) || testModule.parentModule && moduleChainIdMatch(testModule.parentModule, selectedId)\n        );\n      }\n      if (!moduleChainIdMatch(this.module, config.moduleId)) {\n        return false;\n      }\n      if (config.testId && config.testId.length && !inArray(this.testId, config.testId)) {\n        return false;\n      }\n      function moduleChainNameMatch(testModule, selectedModule) {\n        if (!selectedModule) {\n          // undefined or empty string\n          return true;\n        }\n        var testModuleName = testModule.name ? testModule.name.toLowerCase() : null;\n        if (testModuleName === selectedModule) {\n          return true;\n        } else if (testModule.parentModule) {\n          return moduleChainNameMatch(testModule.parentModule, selectedModule);\n        } else {\n          return false;\n        }\n      }\n      var selectedModule = config.module && config.module.toLowerCase();\n      if (!moduleChainNameMatch(this.module, selectedModule)) {\n        return false;\n      }\n      var filter = config.filter;\n      if (!filter) {\n        return true;\n      }\n      var regexFilter = /^(!?)\\/([\\w\\W]*)\\/(i?$)/.exec(filter);\n      var fullName = this.module.name + ': ' + this.testName;\n      return regexFilter ? this.regexFilter(!!regexFilter[1], regexFilter[2], regexFilter[3], fullName) : this.stringFilter(filter, fullName);\n    },\n    regexFilter: function regexFilter(exclude, pattern, flags, fullName) {\n      var regex = new RegExp(pattern, flags);\n      var match = regex.test(fullName);\n      return match !== exclude;\n    },\n    stringFilter: function stringFilter(filter, fullName) {\n      filter = filter.toLowerCase();\n      fullName = fullName.toLowerCase();\n      var include = filter.charAt(0) !== '!';\n      if (!include) {\n        filter = filter.slice(1);\n      }\n\n      // If the filter matches, we need to honour include\n      if (fullName.indexOf(filter) !== -1) {\n        return include;\n      }\n\n      // Otherwise, do the opposite\n      return !include;\n    }\n  };\n  function pushFailure() {\n    if (!config.current) {\n      throw new Error('pushFailure() assertion outside test context, in ' + sourceFromStacktrace(2));\n    }\n\n    // Gets current test obj\n    var currentTest = config.current;\n    return currentTest.pushFailure.apply(currentTest, arguments);\n  }\n  function saveGlobal() {\n    config.pollution = [];\n    if (config.noglobals) {\n      for (var key in g) {\n        if (hasOwn$1.call(g, key)) {\n          // In Opera sometimes DOM element ids show up here, ignore them\n          if (/^qunit-test-output/.test(key)) {\n            continue;\n          }\n          config.pollution.push(key);\n        }\n      }\n    }\n  }\n  function checkPollution() {\n    var old = config.pollution;\n    saveGlobal();\n    var newGlobals = diff(config.pollution, old);\n    if (newGlobals.length > 0) {\n      pushFailure('Introduced global variable(s): ' + newGlobals.join(', '));\n    }\n    var deletedGlobals = diff(old, config.pollution);\n    if (deletedGlobals.length > 0) {\n      pushFailure('Deleted global variable(s): ' + deletedGlobals.join(', '));\n    }\n  }\n  var focused = false; // indicates that the \"only\" filter was used\n\n  function addTest(settings) {\n    if (focused || config.currentModule.ignored) {\n      return;\n    }\n    var newTest = new Test(settings);\n    newTest.queue();\n  }\n  function addOnlyTest(settings) {\n    if (config.currentModule.ignored) {\n      return;\n    }\n    if (!focused) {\n      config.queue.length = 0;\n      focused = true;\n    }\n    var newTest = new Test(settings);\n    newTest.queue();\n  }\n\n  // Will be exposed as QUnit.test\n  function test(testName, callback) {\n    addTest({\n      testName: testName,\n      callback: callback\n    });\n  }\n  function makeEachTestName(testName, argument) {\n    return \"\".concat(testName, \" [\").concat(argument, \"]\");\n  }\n  function runEach(data, eachFn) {\n    if (Array.isArray(data)) {\n      for (var i = 0; i < data.length; i++) {\n        eachFn(data[i], i);\n      }\n    } else if (_typeof(data) === 'object' && data !== null) {\n      for (var key in data) {\n        eachFn(data[key], key);\n      }\n    } else {\n      throw new Error(\"test.each() expects an array or object as input, but\\nfound \".concat(_typeof(data), \" instead.\"));\n    }\n  }\n  extend(test, {\n    todo: function todo(testName, callback) {\n      addTest({\n        testName: testName,\n        callback: callback,\n        todo: true\n      });\n    },\n    skip: function skip(testName) {\n      addTest({\n        testName: testName,\n        skip: true\n      });\n    },\n    only: function only(testName, callback) {\n      addOnlyTest({\n        testName: testName,\n        callback: callback\n      });\n    },\n    each: function each(testName, dataset, callback) {\n      runEach(dataset, function (data, testKey) {\n        addTest({\n          testName: makeEachTestName(testName, testKey),\n          callback: callback,\n          withData: true,\n          stackOffset: 5,\n          data: data\n        });\n      });\n    }\n  });\n  test.todo.each = function (testName, dataset, callback) {\n    runEach(dataset, function (data, testKey) {\n      addTest({\n        testName: makeEachTestName(testName, testKey),\n        callback: callback,\n        todo: true,\n        withData: true,\n        stackOffset: 5,\n        data: data\n      });\n    });\n  };\n  test.skip.each = function (testName, dataset) {\n    runEach(dataset, function (_, testKey) {\n      addTest({\n        testName: makeEachTestName(testName, testKey),\n        stackOffset: 5,\n        skip: true\n      });\n    });\n  };\n  test.only.each = function (testName, dataset, callback) {\n    runEach(dataset, function (data, testKey) {\n      addOnlyTest({\n        testName: makeEachTestName(testName, testKey),\n        callback: callback,\n        withData: true,\n        stackOffset: 5,\n        data: data\n      });\n    });\n  };\n\n  // Forcefully release all processing holds.\n  function internalRecover(test) {\n    test.pauses.forEach(function (pause) {\n      pause.cancelled = true;\n    });\n    test.pauses.clear();\n    internalStart(test);\n  }\n\n  // Release a processing hold, scheduling a resumption attempt if no holds remain.\n  function internalStart(test) {\n    // Ignore if other async pauses still exist.\n    if (test.pauses.size > 0) {\n      return;\n    }\n\n    // Add a slight delay to allow more assertions etc.\n    if (setTimeout$1) {\n      clearTimeout(config.timeout);\n      config.timeout = setTimeout$1(function () {\n        if (test.pauses.size > 0) {\n          return;\n        }\n        clearTimeout(config.timeout);\n        config.timeout = null;\n        config.blocking = false;\n        ProcessingQueue.advance();\n      });\n    } else {\n      config.blocking = false;\n      ProcessingQueue.advance();\n    }\n  }\n  function collectTests(module) {\n    var tests = [].concat(module.tests);\n    var modules = _toConsumableArray(module.childModules);\n\n    // Do a breadth-first traversal of the child modules\n    while (modules.length) {\n      var nextModule = modules.shift();\n      tests.push.apply(tests, nextModule.tests);\n      modules.push.apply(modules, _toConsumableArray(nextModule.childModules));\n    }\n    return tests;\n  }\n\n  // This returns true after all executable and skippable tests\n  // in a module have been proccessed, and informs 'suiteEnd'\n  // and moduleDone().\n  function allTestsExecuted(module) {\n    return module.testsRun + module.testsIgnored === collectTests(module).length;\n  }\n\n  // This returns true during the last executable non-skipped test\n  // within a module, and informs the running of the 'after' hook\n  // for a given module. This runs only once for a given module,\n  // but must run during the last non-skipped test. When it runs,\n  // there may be non-zero skipped tests left.\n  function lastTestWithinModuleExecuted(module) {\n    return module.testsRun === collectTests(module).filter(function (test) {\n      return !test.skip;\n    }).length - 1;\n  }\n  function incrementTestsRun(module) {\n    module.testsRun++;\n    while (module = module.parentModule) {\n      module.testsRun++;\n    }\n  }\n  function incrementTestsIgnored(module) {\n    module.testsIgnored++;\n    while (module = module.parentModule) {\n      module.testsIgnored++;\n    }\n  }\n\n  /* global module, exports, define */\n  function exportQUnit(QUnit) {\n    var exportedModule = false;\n    if (window$1 && document) {\n      // QUnit may be defined when it is preconfigured but then only QUnit and QUnit.config may be defined.\n      if (window$1.QUnit && window$1.QUnit.version) {\n        throw new Error('QUnit has already been defined.');\n      }\n      window$1.QUnit = QUnit;\n      exportedModule = true;\n    }\n\n    // For Node.js\n    if ( true && module && module.exports) {\n      module.exports = QUnit;\n\n      // For consistency with CommonJS environments' exports\n      module.exports.QUnit = QUnit;\n      exportedModule = true;\n    }\n\n    // For CommonJS with exports, but without module.exports, like Rhino\n    if ( true && exports) {\n      exports.QUnit = QUnit;\n      exportedModule = true;\n    }\n\n    // For AMD\n    if (true) {\n      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () {\n        return QUnit;\n      }).call(exports, __webpack_require__, exports, module),\n\t\t\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n      QUnit.config.autostart = false;\n      exportedModule = true;\n    }\n\n    // For other environments, including Web Workers (globalThis === self),\n    // SpiderMonkey (mozjs), and other embedded JavaScript engines\n    if (!exportedModule) {\n      g.QUnit = QUnit;\n    }\n  }\n  var ConsoleReporter = /*#__PURE__*/function () {\n    function ConsoleReporter(runner) {\n      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n      _classCallCheck(this, ConsoleReporter);\n      // Cache references to console methods to ensure we can report failures\n      // from tests tests that mock the console object itself.\n      // https://github.com/qunitjs/qunit/issues/1340\n      // Support IE 9: Function#bind is supported, but no console.log.bind().\n      this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);\n      runner.on('error', this.onError.bind(this));\n      runner.on('runStart', this.onRunStart.bind(this));\n      runner.on('testStart', this.onTestStart.bind(this));\n      runner.on('testEnd', this.onTestEnd.bind(this));\n      runner.on('runEnd', this.onRunEnd.bind(this));\n    }\n    _createClass(ConsoleReporter, [{\n      key: \"onError\",\n      value: function onError(error) {\n        this.log('error', error);\n      }\n    }, {\n      key: \"onRunStart\",\n      value: function onRunStart(runStart) {\n        this.log('runStart', runStart);\n      }\n    }, {\n      key: \"onTestStart\",\n      value: function onTestStart(test) {\n        this.log('testStart', test);\n      }\n    }, {\n      key: \"onTestEnd\",\n      value: function onTestEnd(test) {\n        this.log('testEnd', test);\n      }\n    }, {\n      key: \"onRunEnd\",\n      value: function onRunEnd(runEnd) {\n        this.log('runEnd', runEnd);\n      }\n    }], [{\n      key: \"init\",\n      value: function init(runner, options) {\n        return new ConsoleReporter(runner, options);\n      }\n    }]);\n    return ConsoleReporter;\n  }();\n  var FORCE_COLOR,\n    NODE_DISABLE_COLORS,\n    NO_COLOR,\n    TERM,\n    isTTY = true;\n  if (typeof process !== 'undefined') {\n    var _ref = process.env || {};\n    FORCE_COLOR = _ref.FORCE_COLOR;\n    NODE_DISABLE_COLORS = _ref.NODE_DISABLE_COLORS;\n    NO_COLOR = _ref.NO_COLOR;\n    TERM = _ref.TERM;\n    isTTY = process.stdout && process.stdout.isTTY;\n  }\n  var $ = {\n    enabled: !NODE_DISABLE_COLORS && NO_COLOR == null && TERM !== 'dumb' && (FORCE_COLOR != null && FORCE_COLOR !== '0' || isTTY),\n    // modifiers\n    reset: init(0, 0),\n    bold: init(1, 22),\n    dim: init(2, 22),\n    italic: init(3, 23),\n    underline: init(4, 24),\n    inverse: init(7, 27),\n    hidden: init(8, 28),\n    strikethrough: init(9, 29),\n    // colors\n    black: init(30, 39),\n    red: init(31, 39),\n    green: init(32, 39),\n    yellow: init(33, 39),\n    blue: init(34, 39),\n    magenta: init(35, 39),\n    cyan: init(36, 39),\n    white: init(37, 39),\n    gray: init(90, 39),\n    grey: init(90, 39),\n    // background colors\n    bgBlack: init(40, 49),\n    bgRed: init(41, 49),\n    bgGreen: init(42, 49),\n    bgYellow: init(43, 49),\n    bgBlue: init(44, 49),\n    bgMagenta: init(45, 49),\n    bgCyan: init(46, 49),\n    bgWhite: init(47, 49)\n  };\n  function run(arr, str) {\n    var i = 0,\n      tmp,\n      beg = '',\n      end = '';\n    for (; i < arr.length; i++) {\n      tmp = arr[i];\n      beg += tmp.open;\n      end += tmp.close;\n      if (!!~str.indexOf(tmp.close)) {\n        str = str.replace(tmp.rgx, tmp.close + tmp.open);\n      }\n    }\n    return beg + str + end;\n  }\n  function chain(has, keys) {\n    var ctx = {\n      has: has,\n      keys: keys\n    };\n    ctx.reset = $.reset.bind(ctx);\n    ctx.bold = $.bold.bind(ctx);\n    ctx.dim = $.dim.bind(ctx);\n    ctx.italic = $.italic.bind(ctx);\n    ctx.underline = $.underline.bind(ctx);\n    ctx.inverse = $.inverse.bind(ctx);\n    ctx.hidden = $.hidden.bind(ctx);\n    ctx.strikethrough = $.strikethrough.bind(ctx);\n    ctx.black = $.black.bind(ctx);\n    ctx.red = $.red.bind(ctx);\n    ctx.green = $.green.bind(ctx);\n    ctx.yellow = $.yellow.bind(ctx);\n    ctx.blue = $.blue.bind(ctx);\n    ctx.magenta = $.magenta.bind(ctx);\n    ctx.cyan = $.cyan.bind(ctx);\n    ctx.white = $.white.bind(ctx);\n    ctx.gray = $.gray.bind(ctx);\n    ctx.grey = $.grey.bind(ctx);\n    ctx.bgBlack = $.bgBlack.bind(ctx);\n    ctx.bgRed = $.bgRed.bind(ctx);\n    ctx.bgGreen = $.bgGreen.bind(ctx);\n    ctx.bgYellow = $.bgYellow.bind(ctx);\n    ctx.bgBlue = $.bgBlue.bind(ctx);\n    ctx.bgMagenta = $.bgMagenta.bind(ctx);\n    ctx.bgCyan = $.bgCyan.bind(ctx);\n    ctx.bgWhite = $.bgWhite.bind(ctx);\n    return ctx;\n  }\n  function init(open, close) {\n    var blk = {\n      open: \"\\x1B[\".concat(open, \"m\"),\n      close: \"\\x1B[\".concat(close, \"m\"),\n      rgx: new RegExp(\"\\\\x1b\\\\[\".concat(close, \"m\"), 'g')\n    };\n    return function (txt) {\n      if (this !== void 0 && this.has !== void 0) {\n        !!~this.has.indexOf(open) || (this.has.push(open), this.keys.push(blk));\n        return txt === void 0 ? this : $.enabled ? run(this.keys, txt + '') : txt + '';\n      }\n      return txt === void 0 ? chain([open], [blk]) : $.enabled ? run([blk], txt + '') : txt + '';\n    };\n  }\n  var hasOwn = Object.prototype.hasOwnProperty;\n\n  /**\n   * Format a given value into YAML.\n   *\n   * YAML is a superset of JSON that supports all the same data\n   * types and syntax, and more. As such, it is always possible\n   * to fallback to JSON.stringfify, but we generally avoid\n   * that to make output easier to read for humans.\n   *\n   * Supported data types:\n   *\n   * - null\n   * - boolean\n   * - number\n   * - string\n   * - array\n   * - object\n   *\n   * Anything else (including NaN, Infinity, and undefined)\n   * must be described in strings, for display purposes.\n   *\n   * Note that quotes are optional in YAML strings if the\n   * strings are \"simple\", and as such we generally prefer\n   * that for improved readability. We output strings in\n   * one of three ways:\n   *\n   * - bare unquoted text, for simple one-line strings.\n   * - JSON (quoted text), for complex one-line strings.\n   * - YAML Block, for complex multi-line strings.\n   *\n   * Objects with cyclical references will be stringifed as\n   * \"[Circular]\" as they cannot otherwise be represented.\n   */\n  function prettyYamlValue(value) {\n    var indent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 4;\n    if (value === undefined) {\n      // Not supported in JSON/YAML, turn into string\n      // and let the below output it as bare string.\n      value = String(value);\n    }\n\n    // Support IE 9-11: Use isFinite instead of ES6 Number.isFinite\n    if (typeof value === 'number' && !isFinite(value)) {\n      // Turn NaN and Infinity into simple strings.\n      // Paranoia: Don't return directly just in case there's\n      // a way to add special characters here.\n      value = String(value);\n    }\n    if (typeof value === 'number') {\n      // Simple numbers\n      return JSON.stringify(value);\n    }\n    if (typeof value === 'string') {\n      // If any of these match, then we can't output it\n      // as bare unquoted text, because that would either\n      // cause data loss or invalid YAML syntax.\n      //\n      // - Quotes, escapes, line breaks, or JSON-like stuff.\n      var rSpecialJson = /['\"\\\\/[{}\\]\\r\\n]/;\n\n      // - Characters that are special at the start of a YAML value\n      var rSpecialYaml = /[-?:,[\\]{}#&*!|=>'\"%@`]/;\n\n      // - Leading or trailing whitespace.\n      var rUntrimmed = /(^\\s|\\s$)/;\n\n      // - Ambiguous as YAML number, e.g. '2', '-1.2', '.2', or '2_000'\n      var rNumerical = /^[\\d._-]+$/;\n\n      // - Ambiguous as YAML bool.\n      //   Use case-insensitive match, although technically only\n      //   fully-lower, fully-upper, or uppercase-first would be ambiguous.\n      //   e.g. true/True/TRUE, but not tRUe.\n      var rBool = /^(true|false|y|n|yes|no|on|off)$/i;\n\n      // Is this a complex string?\n      if (value === '' || rSpecialJson.test(value) || rSpecialYaml.test(value[0]) || rUntrimmed.test(value) || rNumerical.test(value) || rBool.test(value)) {\n        if (!/\\n/.test(value)) {\n          // Complex one-line string, use JSON (quoted string)\n          return JSON.stringify(value);\n        }\n\n        // See also <https://yaml-multiline.info/>\n        // Support IE 9-11: Avoid ES6 String#repeat\n        var prefix = new Array(indent + 1).join(' ');\n        var trailingLinebreakMatch = value.match(/\\n+$/);\n        var trailingLinebreaks = trailingLinebreakMatch ? trailingLinebreakMatch[0].length : 0;\n        if (trailingLinebreaks === 1) {\n          // Use the most straight-forward \"Block\" string in YAML\n          // without any \"Chomping\" indicators.\n          var lines = value\n\n          // Ignore the last new line, since we'll get that one for free\n          // with the straight-forward Block syntax.\n          .replace(/\\n$/, '').split('\\n').map(function (line) {\n            return prefix + line;\n          });\n          return '|\\n' + lines.join('\\n');\n        } else {\n          // This has either no trailing new lines, or more than 1.\n          // Use |+ so that YAML parsers will preserve it exactly.\n          var _lines = value.split('\\n').map(function (line) {\n            return prefix + line;\n          });\n          return '|+\\n' + _lines.join('\\n');\n        }\n      } else {\n        // Simple string, use bare unquoted text\n        return value;\n      }\n    }\n\n    // Handle null, boolean, array, and object\n    return JSON.stringify(decycledShallowClone(value), null, 2);\n  }\n\n  /**\n   * Creates a shallow clone of an object where cycles have\n   * been replaced with \"[Circular]\".\n   */\n  function decycledShallowClone(object) {\n    var ancestors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];\n    if (ancestors.indexOf(object) !== -1) {\n      return '[Circular]';\n    }\n    var type = Object.prototype.toString.call(object).replace(/^\\[.+\\s(.+?)]$/, '$1').toLowerCase();\n    var clone;\n    switch (type) {\n      case 'array':\n        ancestors.push(object);\n        clone = object.map(function (element) {\n          return decycledShallowClone(element, ancestors);\n        });\n        ancestors.pop();\n        break;\n      case 'object':\n        ancestors.push(object);\n        clone = {};\n        Object.keys(object).forEach(function (key) {\n          clone[key] = decycledShallowClone(object[key], ancestors);\n        });\n        ancestors.pop();\n        break;\n      default:\n        clone = object;\n    }\n    return clone;\n  }\n  var TapReporter = /*#__PURE__*/function () {\n    function TapReporter(runner) {\n      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};\n      _classCallCheck(this, TapReporter);\n      // Cache references to console methods to ensure we can report failures\n      // from tests tests that mock the console object itself.\n      // https://github.com/qunitjs/qunit/issues/1340\n      // Support IE 9: Function#bind is supported, but no console.log.bind().\n      this.log = options.log || Function.prototype.bind.call(console$1.log, console$1);\n      this.testCount = 0;\n      this.ended = false;\n      this.bailed = false;\n      runner.on('error', this.onError.bind(this));\n      runner.on('runStart', this.onRunStart.bind(this));\n      runner.on('testEnd', this.onTestEnd.bind(this));\n      runner.on('runEnd', this.onRunEnd.bind(this));\n    }\n    _createClass(TapReporter, [{\n      key: \"onRunStart\",\n      value: function onRunStart(_runSuite) {\n        this.log('TAP version 13');\n      }\n    }, {\n      key: \"onError\",\n      value: function onError(error) {\n        if (this.bailed) {\n          return;\n        }\n        this.bailed = true;\n\n        // Imitate onTestEnd\n        // Skip this if we're past \"runEnd\" as it would look odd\n        if (!this.ended) {\n          this.testCount = this.testCount + 1;\n          this.log($.red(\"not ok \".concat(this.testCount, \" global failure\")));\n          this.logError(error);\n        }\n        this.log('Bail out! ' + errorString(error).split('\\n')[0]);\n        if (this.ended) {\n          this.logError(error);\n        }\n      }\n    }, {\n      key: \"onTestEnd\",\n      value: function onTestEnd(test) {\n        var _this = this;\n        this.testCount = this.testCount + 1;\n        if (test.status === 'passed') {\n          this.log(\"ok \".concat(this.testCount, \" \").concat(test.fullName.join(' > ')));\n        } else if (test.status === 'skipped') {\n          this.log($.yellow(\"ok \".concat(this.testCount, \" # SKIP \").concat(test.fullName.join(' > '))));\n        } else if (test.status === 'todo') {\n          this.log($.cyan(\"not ok \".concat(this.testCount, \" # TODO \").concat(test.fullName.join(' > '))));\n          test.errors.forEach(function (error) {\n            return _this.logAssertion(error, 'todo');\n          });\n        } else {\n          this.log($.red(\"not ok \".concat(this.testCount, \" \").concat(test.fullName.join(' > '))));\n          test.errors.forEach(function (error) {\n            return _this.logAssertion(error);\n          });\n        }\n      }\n    }, {\n      key: \"onRunEnd\",\n      value: function onRunEnd(runSuite) {\n        this.ended = true;\n        this.log(\"1..\".concat(runSuite.testCounts.total));\n        this.log(\"# pass \".concat(runSuite.testCounts.passed));\n        this.log($.yellow(\"# skip \".concat(runSuite.testCounts.skipped)));\n        this.log($.cyan(\"# todo \".concat(runSuite.testCounts.todo)));\n        this.log($.red(\"# fail \".concat(runSuite.testCounts.failed)));\n      }\n    }, {\n      key: \"logAssertion\",\n      value: function logAssertion(error, severity) {\n        var out = '  ---';\n        out += \"\\n  message: \".concat(prettyYamlValue(error.message || 'failed'));\n        out += \"\\n  severity: \".concat(prettyYamlValue(severity || 'failed'));\n        if (hasOwn.call(error, 'actual')) {\n          out += \"\\n  actual  : \".concat(prettyYamlValue(error.actual));\n        }\n        if (hasOwn.call(error, 'expected')) {\n          out += \"\\n  expected: \".concat(prettyYamlValue(error.expected));\n        }\n        if (error.stack) {\n          // Since stacks aren't user generated, take a bit of liberty by\n          // adding a trailing new line to allow a straight-forward YAML Blocks.\n          out += \"\\n  stack: \".concat(prettyYamlValue(error.stack + '\\n'));\n        }\n        out += '\\n  ...';\n        this.log(out);\n      }\n    }, {\n      key: \"logError\",\n      value: function logError(error) {\n        var out = '  ---';\n        out += \"\\n  message: \".concat(prettyYamlValue(errorString(error)));\n        out += \"\\n  severity: \".concat(prettyYamlValue('failed'));\n        if (error && error.stack) {\n          out += \"\\n  stack: \".concat(prettyYamlValue(error.stack + '\\n'));\n        }\n        out += '\\n  ...';\n        this.log(out);\n      }\n    }], [{\n      key: \"init\",\n      value: function init(runner, options) {\n        return new TapReporter(runner, options);\n      }\n    }]);\n    return TapReporter;\n  }();\n  var reporters = {\n    console: ConsoleReporter,\n    tap: TapReporter\n  };\n  function makeAddGlobalHook(hookName) {\n    return function addGlobalHook(callback) {\n      if (!config.globalHooks[hookName]) {\n        config.globalHooks[hookName] = [];\n      }\n      config.globalHooks[hookName].push(callback);\n    };\n  }\n  var hooks = {\n    beforeEach: makeAddGlobalHook('beforeEach'),\n    afterEach: makeAddGlobalHook('afterEach')\n  };\n\n  /**\n   * Handle a global error that should result in a failed test run.\n   *\n   * Summary:\n   *\n   * - If we're strictly inside a test (or one if its module hooks), the exception\n   *   becomes a failed assertion.\n   *\n   *   This has the important side-effect that uncaught exceptions (such as\n   *   calling an undefined function) during a \"todo\" test do NOT result in\n   *   a failed test run.\n   *\n   * - If we're anywhere outside a test (be it in early event callbacks, or\n   *   internally between tests, or somewhere after \"runEnd\" if the process is\n   *   still alive for some reason), then send an \"error\" event to the reporters.\n   *\n   * @since 2.17.0\n   * @param {Error|any} error\n   */\n  function onUncaughtException(error) {\n    if (config.current) {\n      config.current.assert.pushResult({\n        result: false,\n        message: \"global failure: \".concat(errorString(error)),\n        // We could let callers specify an offset to subtract a number of frames via\n        // sourceFromStacktrace, in case they are a wrapper further away from the error\n        // handler, and thus reduce some noise in the stack trace. However, we're not\n        // doing this right now because it would almost never be used in practice given\n        // the vast majority of error values will be Error objects, and thus have their\n        // own stack trace already.\n        source: error && error.stack || sourceFromStacktrace(2)\n      });\n    } else {\n      // The \"error\" event was added in QUnit 2.17.\n      // Increase \"bad assertion\" stats despite no longer pushing an assertion in this case.\n      // This ensures \"runEnd\" and \"QUnit.done()\" handlers behave as expected, since the \"bad\"\n      // count is typically how reporters decide on the boolean outcome of the test run.\n      runSuite.globalFailureCount++;\n      config.stats.bad++;\n      config.stats.all++;\n      emit('error', error);\n    }\n  }\n\n  /**\n   * Handle a window.onerror error.\n   *\n   * If there is a current test that sets the internal `ignoreGlobalErrors` field\n   * (such as during `assert.throws()`), then the error is ignored and native\n   * error reporting is suppressed as well. This is because in browsers, an error\n   * can sometimes end up in `window.onerror` instead of in the local try/catch.\n   * This ignoring of errors does not apply to our general onUncaughtException\n   * method, nor to our `unhandledRejection` handlers, as those are not meant\n   * to receive an \"expected\" error during `assert.throws()`.\n   *\n   * @see <https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror>\n   * @deprecated since 2.17.0 Use QUnit.onUncaughtException instead.\n   * @param {Object} details\n   * @param {string} details.message\n   * @param {string} details.fileName\n   * @param {number} details.lineNumber\n   * @param {string|undefined} [details.stacktrace]\n   * @return {bool} True if native error reporting should be suppressed.\n   */\n  function onWindowError(details) {\n    Logger.warn('QUnit.onError is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');\n    if (config.current && config.current.ignoreGlobalErrors) {\n      return true;\n    }\n    var err = new Error(details.message);\n    err.stack = details.stacktrace || details.fileName + ':' + details.lineNumber;\n    onUncaughtException(err);\n    return false;\n  }\n  var QUnit = {};\n\n  // The \"currentModule\" object would ideally be defined using the createModule()\n  // function. Since it isn't, add the missing suiteReport property to it now that\n  // we have loaded all source code required to do so.\n  //\n  // TODO: Consider defining currentModule in core.js or module.js in its entirely\n  // rather than partly in config.js and partly here.\n  config.currentModule.suiteReport = runSuite;\n  var globalStartCalled = false;\n  var runStarted = false;\n\n  // Figure out if we're running the tests from a server or not\n  QUnit.isLocal = window$1 && window$1.location && window$1.location.protocol === 'file:';\n\n  // Expose the current QUnit version\n  QUnit.version = '2.19.4';\n  extend(QUnit, {\n    config: config,\n    dump: dump,\n    equiv: equiv,\n    reporters: reporters,\n    hooks: hooks,\n    is: is,\n    objectType: objectType,\n    on: on,\n    onError: onWindowError,\n    onUncaughtException: onUncaughtException,\n    pushFailure: pushFailure,\n    assert: Assert.prototype,\n    module: module$1,\n    test: test,\n    // alias other test flavors for easy access\n    todo: test.todo,\n    skip: test.skip,\n    only: test.only,\n    start: function start(count) {\n      if (config.current) {\n        throw new Error('QUnit.start cannot be called inside a test context.');\n      }\n      var globalStartAlreadyCalled = globalStartCalled;\n      globalStartCalled = true;\n      if (runStarted) {\n        throw new Error('Called start() while test already started running');\n      }\n      if (globalStartAlreadyCalled || count > 1) {\n        throw new Error('Called start() outside of a test context too many times');\n      }\n      if (config.autostart) {\n        throw new Error('Called start() outside of a test context when ' + 'QUnit.config.autostart was true');\n      }\n      if (!config.pageLoaded) {\n        // The page isn't completely loaded yet, so we set autostart and then\n        // load if we're in Node or wait for the browser's load event.\n        config.autostart = true;\n\n        // Starts from Node even if .load was not previously called. We still return\n        // early otherwise we'll wind up \"beginning\" twice.\n        if (!document) {\n          QUnit.load();\n        }\n        return;\n      }\n      scheduleBegin();\n    },\n    onUnhandledRejection: function onUnhandledRejection(reason) {\n      Logger.warn('QUnit.onUnhandledRejection is deprecated and will be removed in QUnit 3.0.' + ' Please use QUnit.onUncaughtException instead.');\n      onUncaughtException(reason);\n    },\n    extend: function extend$1() {\n      Logger.warn('QUnit.extend is deprecated and will be removed in QUnit 3.0.' + ' Please use Object.assign instead.');\n\n      // delegate to utility implementation, which does not warn and can be used elsewhere internally\n      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {\n        args[_key] = arguments[_key];\n      }\n      return extend.apply(this, args);\n    },\n    load: function load() {\n      config.pageLoaded = true;\n\n      // Initialize the configuration options\n      extend(config, {\n        started: 0,\n        updateRate: 1000,\n        autostart: true,\n        filter: ''\n      }, true);\n      if (!runStarted) {\n        config.blocking = false;\n        if (config.autostart) {\n          scheduleBegin();\n        }\n      }\n    },\n    stack: function stack(offset) {\n      offset = (offset || 0) + 2;\n      return sourceFromStacktrace(offset);\n    }\n  });\n  registerLoggingCallbacks(QUnit);\n  function scheduleBegin() {\n    runStarted = true;\n\n    // Add a slight delay to allow definition of more modules and tests.\n    if (setTimeout$1) {\n      setTimeout$1(function () {\n        begin();\n      });\n    } else {\n      begin();\n    }\n  }\n  function unblockAndAdvanceQueue() {\n    config.blocking = false;\n    ProcessingQueue.advance();\n  }\n  function begin() {\n    if (config.started) {\n      unblockAndAdvanceQueue();\n      return;\n    }\n\n    // The test run hasn't officially begun yet\n    // Record the time of the test run's beginning\n    config.started = performance.now();\n\n    // Delete the loose unnamed module if unused.\n    if (config.modules[0].name === '' && config.modules[0].tests.length === 0) {\n      config.modules.shift();\n    }\n    var modulesLog = [];\n    for (var i = 0; i < config.modules.length; i++) {\n      // Don't expose the unnamed global test module to plugins.\n      if (config.modules[i].name !== '') {\n        modulesLog.push({\n          name: config.modules[i].name,\n          moduleId: config.modules[i].moduleId,\n          // Added in QUnit 1.16.0 for internal use by html-reporter,\n          // but no longer used since QUnit 2.7.0.\n          // @deprecated Kept unofficially to be removed in QUnit 3.0.\n          tests: config.modules[i].tests\n        });\n      }\n    }\n\n    // The test run is officially beginning now\n    emit('runStart', runSuite.start(true));\n    runLoggingCallbacks('begin', {\n      totalTests: Test.count,\n      modules: modulesLog\n    }).then(unblockAndAdvanceQueue);\n  }\n  exportQUnit(QUnit);\n  (function () {\n    if (!window$1 || !document) {\n      return;\n    }\n    var config = QUnit.config;\n    var hasOwn = Object.prototype.hasOwnProperty;\n\n    // Stores fixture HTML for resetting later\n    function storeFixture() {\n      // Avoid overwriting user-defined values\n      if (hasOwn.call(config, 'fixture')) {\n        return;\n      }\n      var fixture = document.getElementById('qunit-fixture');\n      if (fixture) {\n        config.fixture = fixture.cloneNode(true);\n      }\n    }\n    QUnit.begin(storeFixture);\n\n    // Resets the fixture DOM element if available.\n    function resetFixture() {\n      if (config.fixture == null) {\n        return;\n      }\n      var fixture = document.getElementById('qunit-fixture');\n      var resetFixtureType = _typeof(config.fixture);\n      if (resetFixtureType === 'string') {\n        // support user defined values for `config.fixture`\n        var newFixture = document.createElement('div');\n        newFixture.setAttribute('id', 'qunit-fixture');\n        newFixture.innerHTML = config.fixture;\n        fixture.parentNode.replaceChild(newFixture, fixture);\n      } else {\n        var clonedFixture = config.fixture.cloneNode(true);\n        fixture.parentNode.replaceChild(clonedFixture, fixture);\n      }\n    }\n    QUnit.testStart(resetFixture);\n  })();\n  (function () {\n    // Only interact with URLs via window.location\n    var location = typeof window$1 !== 'undefined' && window$1.location;\n    if (!location) {\n      return;\n    }\n    var urlParams = getUrlParams();\n    QUnit.urlParams = urlParams;\n    QUnit.config.filter = urlParams.filter;\n    QUnit.config.module = urlParams.module;\n    QUnit.config.moduleId = [].concat(urlParams.moduleId || []);\n    QUnit.config.testId = [].concat(urlParams.testId || []);\n\n    // Test order randomization\n    if (urlParams.seed === true) {\n      // Generate a random seed if the option is specified without a value\n      QUnit.config.seed = Math.random().toString(36).slice(2);\n    } else if (urlParams.seed) {\n      QUnit.config.seed = urlParams.seed;\n    }\n\n    // Add URL-parameter-mapped config values with UI form rendering data\n    QUnit.config.urlConfig.push({\n      id: 'hidepassed',\n      label: 'Hide passed tests',\n      tooltip: 'Only show tests and assertions that fail. Stored as query-strings.'\n    }, {\n      id: 'noglobals',\n      label: 'Check for Globals',\n      tooltip: 'Enabling this will test if any test introduces new properties on the ' + 'global object (`window` in Browsers). Stored as query-strings.'\n    }, {\n      id: 'notrycatch',\n      label: 'No try-catch',\n      tooltip: 'Enabling this will run tests outside of a try-catch block. Makes debugging ' + 'exceptions in IE reasonable. Stored as query-strings.'\n    });\n    QUnit.begin(function () {\n      var urlConfig = QUnit.config.urlConfig;\n      for (var i = 0; i < urlConfig.length; i++) {\n        // Options can be either strings or objects with nonempty \"id\" properties\n        var option = QUnit.config.urlConfig[i];\n        if (typeof option !== 'string') {\n          option = option.id;\n        }\n        if (QUnit.config[option] === undefined) {\n          QUnit.config[option] = urlParams[option];\n        }\n      }\n    });\n    function getUrlParams() {\n      var urlParams = Object.create(null);\n      var params = location.search.slice(1).split('&');\n      var length = params.length;\n      for (var i = 0; i < length; i++) {\n        if (params[i]) {\n          var param = params[i].split('=');\n          var name = decodeQueryParam(param[0]);\n\n          // Allow just a key to turn on a flag, e.g., test.html?noglobals\n          var value = param.length === 1 || decodeQueryParam(param.slice(1).join('='));\n          if (name in urlParams) {\n            urlParams[name] = [].concat(urlParams[name], value);\n          } else {\n            urlParams[name] = value;\n          }\n        }\n      }\n      return urlParams;\n    }\n    function decodeQueryParam(param) {\n      return decodeURIComponent(param.replace(/\\+/g, '%20'));\n    }\n  })();\n  var fuzzysort$1 = {\n    exports: {}\n  };\n  (function (module) {\n    (function (root, UMD) {\n      if (module.exports) module.exports = UMD();else root.fuzzysort = UMD();\n    })(commonjsGlobal, function UMD() {\n      function fuzzysortNew(instanceOptions) {\n        var fuzzysort = {\n          single: function single(search, target, options) {\n            if (search == 'farzher') return {\n              target: \"farzher was here (^-^*)/\",\n              score: 0,\n              indexes: [0, 1, 2, 3, 4, 5, 6]\n            };\n            if (!search) return null;\n            if (!isObj(search)) search = fuzzysort.getPreparedSearch(search);\n            if (!target) return null;\n            if (!isObj(target)) target = fuzzysort.getPrepared(target);\n            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;\n            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;\n            return algorithm(search, target, search[0]);\n          },\n          go: function go(search, targets, options) {\n            if (search == 'farzher') return [{\n              target: \"farzher was here (^-^*)/\",\n              score: 0,\n              indexes: [0, 1, 2, 3, 4, 5, 6],\n              obj: targets ? targets[0] : null\n            }];\n            if (!search) return noResults;\n            search = fuzzysort.prepareSearch(search);\n            var searchLowerCode = search[0];\n            var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;\n            var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;\n            var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;\n            var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;\n            var resultsLen = 0;\n            var limitedCount = 0;\n            var targetsLen = targets.length;\n\n            // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]\n\n            // options.keys\n            if (options && options.keys) {\n              var scoreFn = options.scoreFn || defaultScoreFn;\n              var keys = options.keys;\n              var keysLen = keys.length;\n              for (var i = targetsLen - 1; i >= 0; --i) {\n                var obj = targets[i];\n                var objResults = new Array(keysLen);\n                for (var keyI = keysLen - 1; keyI >= 0; --keyI) {\n                  var key = keys[keyI];\n                  var target = getValue(obj, key);\n                  if (!target) {\n                    objResults[keyI] = null;\n                    continue;\n                  }\n                  if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                  objResults[keyI] = algorithm(search, target, searchLowerCode);\n                }\n                objResults.obj = obj; // before scoreFn so scoreFn can use it\n                var score = scoreFn(objResults);\n                if (score === null) continue;\n                if (score < threshold) continue;\n                objResults.score = score;\n                if (resultsLen < limit) {\n                  q.add(objResults);\n                  ++resultsLen;\n                } else {\n                  ++limitedCount;\n                  if (score > q.peek().score) q.replaceTop(objResults);\n                }\n              }\n\n              // options.key\n            } else if (options && options.key) {\n              var key = options.key;\n              for (var i = targetsLen - 1; i >= 0; --i) {\n                var obj = targets[i];\n                var target = getValue(obj, key);\n                if (!target) continue;\n                if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                var result = algorithm(search, target, searchLowerCode);\n                if (result === null) continue;\n                if (result.score < threshold) continue;\n\n                // have to clone result so duplicate targets from different obj can each reference the correct obj\n                result = {\n                  target: result.target,\n                  _targetLowerCodes: null,\n                  _nextBeginningIndexes: null,\n                  score: result.score,\n                  indexes: result.indexes,\n                  obj: obj\n                }; // hidden\n\n                if (resultsLen < limit) {\n                  q.add(result);\n                  ++resultsLen;\n                } else {\n                  ++limitedCount;\n                  if (result.score > q.peek().score) q.replaceTop(result);\n                }\n              }\n\n              // no keys\n            } else {\n              for (var i = targetsLen - 1; i >= 0; --i) {\n                var target = targets[i];\n                if (!target) continue;\n                if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                var result = algorithm(search, target, searchLowerCode);\n                if (result === null) continue;\n                if (result.score < threshold) continue;\n                if (resultsLen < limit) {\n                  q.add(result);\n                  ++resultsLen;\n                } else {\n                  ++limitedCount;\n                  if (result.score > q.peek().score) q.replaceTop(result);\n                }\n              }\n            }\n            if (resultsLen === 0) return noResults;\n            var results = new Array(resultsLen);\n            for (var i = resultsLen - 1; i >= 0; --i) {\n              results[i] = q.poll();\n            }\n            results.total = resultsLen + limitedCount;\n            return results;\n          },\n          goAsync: function goAsync(search, targets, options) {\n            var canceled = false;\n            var p = new Promise(function (resolve, reject) {\n              if (search == 'farzher') return resolve([{\n                target: \"farzher was here (^-^*)/\",\n                score: 0,\n                indexes: [0, 1, 2, 3, 4, 5, 6],\n                obj: targets ? targets[0] : null\n              }]);\n              if (!search) return resolve(noResults);\n              search = fuzzysort.prepareSearch(search);\n              var searchLowerCode = search[0];\n              var q = fastpriorityqueue();\n              var iCurrent = targets.length - 1;\n              var threshold = options && options.threshold || instanceOptions && instanceOptions.threshold || -9007199254740991;\n              var limit = options && options.limit || instanceOptions && instanceOptions.limit || 9007199254740991;\n              var allowTypo = options && options.allowTypo !== undefined ? options.allowTypo : instanceOptions && instanceOptions.allowTypo !== undefined ? instanceOptions.allowTypo : true;\n              var algorithm = allowTypo ? fuzzysort.algorithm : fuzzysort.algorithmNoTypo;\n              var resultsLen = 0;\n              var limitedCount = 0;\n              function step() {\n                if (canceled) return reject('canceled');\n                var startMs = Date.now();\n\n                // This code is copy/pasted 3 times for performance reasons [options.keys, options.key, no keys]\n\n                // options.keys\n                if (options && options.keys) {\n                  var scoreFn = options.scoreFn || defaultScoreFn;\n                  var keys = options.keys;\n                  var keysLen = keys.length;\n                  for (; iCurrent >= 0; --iCurrent) {\n                    if (iCurrent % 1000 /*itemsPerCheck*/ === 0) {\n                      if (Date.now() - startMs >= 10 /*asyncInterval*/) {\n                        isNode ? setImmediate(step) : setTimeout(step);\n                        return;\n                      }\n                    }\n                    var obj = targets[iCurrent];\n                    var objResults = new Array(keysLen);\n                    for (var keyI = keysLen - 1; keyI >= 0; --keyI) {\n                      var key = keys[keyI];\n                      var target = getValue(obj, key);\n                      if (!target) {\n                        objResults[keyI] = null;\n                        continue;\n                      }\n                      if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                      objResults[keyI] = algorithm(search, target, searchLowerCode);\n                    }\n                    objResults.obj = obj; // before scoreFn so scoreFn can use it\n                    var score = scoreFn(objResults);\n                    if (score === null) continue;\n                    if (score < threshold) continue;\n                    objResults.score = score;\n                    if (resultsLen < limit) {\n                      q.add(objResults);\n                      ++resultsLen;\n                    } else {\n                      ++limitedCount;\n                      if (score > q.peek().score) q.replaceTop(objResults);\n                    }\n                  }\n\n                  // options.key\n                } else if (options && options.key) {\n                  var key = options.key;\n                  for (; iCurrent >= 0; --iCurrent) {\n                    if (iCurrent % 1000 /*itemsPerCheck*/ === 0) {\n                      if (Date.now() - startMs >= 10 /*asyncInterval*/) {\n                        isNode ? setImmediate(step) : setTimeout(step);\n                        return;\n                      }\n                    }\n                    var obj = targets[iCurrent];\n                    var target = getValue(obj, key);\n                    if (!target) continue;\n                    if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                    var result = algorithm(search, target, searchLowerCode);\n                    if (result === null) continue;\n                    if (result.score < threshold) continue;\n\n                    // have to clone result so duplicate targets from different obj can each reference the correct obj\n                    result = {\n                      target: result.target,\n                      _targetLowerCodes: null,\n                      _nextBeginningIndexes: null,\n                      score: result.score,\n                      indexes: result.indexes,\n                      obj: obj\n                    }; // hidden\n\n                    if (resultsLen < limit) {\n                      q.add(result);\n                      ++resultsLen;\n                    } else {\n                      ++limitedCount;\n                      if (result.score > q.peek().score) q.replaceTop(result);\n                    }\n                  }\n\n                  // no keys\n                } else {\n                  for (; iCurrent >= 0; --iCurrent) {\n                    if (iCurrent % 1000 /*itemsPerCheck*/ === 0) {\n                      if (Date.now() - startMs >= 10 /*asyncInterval*/) {\n                        isNode ? setImmediate(step) : setTimeout(step);\n                        return;\n                      }\n                    }\n                    var target = targets[iCurrent];\n                    if (!target) continue;\n                    if (!isObj(target)) target = fuzzysort.getPrepared(target);\n                    var result = algorithm(search, target, searchLowerCode);\n                    if (result === null) continue;\n                    if (result.score < threshold) continue;\n                    if (resultsLen < limit) {\n                      q.add(result);\n                      ++resultsLen;\n                    } else {\n                      ++limitedCount;\n                      if (result.score > q.peek().score) q.replaceTop(result);\n                    }\n                  }\n                }\n                if (resultsLen === 0) return resolve(noResults);\n                var results = new Array(resultsLen);\n                for (var i = resultsLen - 1; i >= 0; --i) {\n                  results[i] = q.poll();\n                }\n                results.total = resultsLen + limitedCount;\n                resolve(results);\n              }\n              isNode ? setImmediate(step) : step(); //setTimeout here is too slow\n            });\n\n            p.cancel = function () {\n              canceled = true;\n            };\n            return p;\n          },\n          highlight: function highlight(result, hOpen, hClose) {\n            if (typeof hOpen == 'function') return fuzzysort.highlightCallback(result, hOpen);\n            if (result === null) return null;\n            if (hOpen === undefined) hOpen = '<b>';\n            if (hClose === undefined) hClose = '</b>';\n            var highlighted = '';\n            var matchesIndex = 0;\n            var opened = false;\n            var target = result.target;\n            var targetLen = target.length;\n            var matchesBest = result.indexes;\n            for (var i = 0; i < targetLen; ++i) {\n              var char = target[i];\n              if (matchesBest[matchesIndex] === i) {\n                ++matchesIndex;\n                if (!opened) {\n                  opened = true;\n                  highlighted += hOpen;\n                }\n                if (matchesIndex === matchesBest.length) {\n                  highlighted += char + hClose + target.substr(i + 1);\n                  break;\n                }\n              } else {\n                if (opened) {\n                  opened = false;\n                  highlighted += hClose;\n                }\n              }\n              highlighted += char;\n            }\n            return highlighted;\n          },\n          highlightCallback: function highlightCallback(result, cb) {\n            if (result === null) return null;\n            var target = result.target;\n            var targetLen = target.length;\n            var indexes = result.indexes;\n            var highlighted = '';\n            var matchI = 0;\n            var indexesI = 0;\n            var opened = false;\n            var result = [];\n            for (var i = 0; i < targetLen; ++i) {\n              var char = target[i];\n              if (indexes[indexesI] === i) {\n                ++indexesI;\n                if (!opened) {\n                  opened = true;\n                  result.push(highlighted);\n                  highlighted = '';\n                }\n                if (indexesI === indexes.length) {\n                  highlighted += char;\n                  result.push(cb(highlighted, matchI++));\n                  highlighted = '';\n                  result.push(target.substr(i + 1));\n                  break;\n                }\n              } else {\n                if (opened) {\n                  opened = false;\n                  result.push(cb(highlighted, matchI++));\n                  highlighted = '';\n                }\n              }\n              highlighted += char;\n            }\n            return result;\n          },\n          prepare: function prepare(target) {\n            if (!target) return {\n              target: '',\n              _targetLowerCodes: [0 /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/],\n              _nextBeginningIndexes: null,\n              score: null,\n              indexes: null,\n              obj: null\n            }; // hidden\n            return {\n              target: target,\n              _targetLowerCodes: fuzzysort.prepareLowerCodes(target),\n              _nextBeginningIndexes: null,\n              score: null,\n              indexes: null,\n              obj: null\n            }; // hidden\n          },\n\n          prepareSlow: function prepareSlow(target) {\n            if (!target) return {\n              target: '',\n              _targetLowerCodes: [0 /*this 0 doesn't make sense. here because an empty array causes the algorithm to deoptimize and run 50% slower!*/],\n              _nextBeginningIndexes: null,\n              score: null,\n              indexes: null,\n              obj: null\n            }; // hidden\n            return {\n              target: target,\n              _targetLowerCodes: fuzzysort.prepareLowerCodes(target),\n              _nextBeginningIndexes: fuzzysort.prepareNextBeginningIndexes(target),\n              score: null,\n              indexes: null,\n              obj: null\n            }; // hidden\n          },\n\n          prepareSearch: function prepareSearch(search) {\n            if (!search) search = '';\n            return fuzzysort.prepareLowerCodes(search);\n          },\n          // Below this point is only internal code\n          // Below this point is only internal code\n          // Below this point is only internal code\n          // Below this point is only internal code\n\n          getPrepared: function getPrepared(target) {\n            if (target.length > 999) return fuzzysort.prepare(target); // don't cache huge targets\n            var targetPrepared = preparedCache.get(target);\n            if (targetPrepared !== undefined) return targetPrepared;\n            targetPrepared = fuzzysort.prepare(target);\n            preparedCache.set(target, targetPrepared);\n            return targetPrepared;\n          },\n          getPreparedSearch: function getPreparedSearch(search) {\n            if (search.length > 999) return fuzzysort.prepareSearch(search); // don't cache huge searches\n            var searchPrepared = preparedSearchCache.get(search);\n            if (searchPrepared !== undefined) return searchPrepared;\n            searchPrepared = fuzzysort.prepareSearch(search);\n            preparedSearchCache.set(search, searchPrepared);\n            return searchPrepared;\n          },\n          algorithm: function algorithm(searchLowerCodes, prepared, searchLowerCode) {\n            var targetLowerCodes = prepared._targetLowerCodes;\n            var searchLen = searchLowerCodes.length;\n            var targetLen = targetLowerCodes.length;\n            var searchI = 0; // where we at\n            var targetI = 0; // where you at\n            var typoSimpleI = 0;\n            var matchesSimpleLen = 0;\n\n            // very basic fuzzy match; to remove non-matching targets ASAP!\n            // walk through target. find sequential matches.\n            // if all chars aren't found then exit\n            for (;;) {\n              var isMatch = searchLowerCode === targetLowerCodes[targetI];\n              if (isMatch) {\n                matchesSimple[matchesSimpleLen++] = targetI;\n                ++searchI;\n                if (searchI === searchLen) break;\n                searchLowerCode = searchLowerCodes[typoSimpleI === 0 ? searchI : typoSimpleI === searchI ? searchI + 1 : typoSimpleI === searchI - 1 ? searchI - 1 : searchI];\n              }\n              ++targetI;\n              if (targetI >= targetLen) {\n                // Failed to find searchI\n                // Check for typo or exit\n                // we go as far as possible before trying to transpose\n                // then we transpose backwards until we reach the beginning\n                for (;;) {\n                  if (searchI <= 1) return null; // not allowed to transpose first char\n                  if (typoSimpleI === 0) {\n                    // we haven't tried to transpose yet\n                    --searchI;\n                    var searchLowerCodeNew = searchLowerCodes[searchI];\n                    if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char\n                    typoSimpleI = searchI;\n                  } else {\n                    if (typoSimpleI === 1) return null; // reached the end of the line for transposing\n                    --typoSimpleI;\n                    searchI = typoSimpleI;\n                    searchLowerCode = searchLowerCodes[searchI + 1];\n                    var searchLowerCodeNew = searchLowerCodes[searchI];\n                    if (searchLowerCode === searchLowerCodeNew) continue; // doesn't make sense to transpose a repeat char\n                  }\n\n                  matchesSimpleLen = searchI;\n                  targetI = matchesSimple[matchesSimpleLen - 1] + 1;\n                  break;\n                }\n              }\n            }\n            var searchI = 0;\n            var typoStrictI = 0;\n            var successStrict = false;\n            var matchesStrictLen = 0;\n            var nextBeginningIndexes = prepared._nextBeginningIndexes;\n            if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);\n            var firstPossibleI = targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];\n\n            // Our target string successfully matched all characters in sequence!\n            // Let's try a more advanced and strict test to improve the score\n            // only count it as a match if it's consecutive or a beginning character!\n            if (targetI !== targetLen) for (;;) {\n              if (targetI >= targetLen) {\n                // We failed to find a good spot for this search char, go back to the previous search char and force it forward\n                if (searchI <= 0) {\n                  // We failed to push chars forward for a better match\n                  // transpose, starting from the beginning\n                  ++typoStrictI;\n                  if (typoStrictI > searchLen - 2) break;\n                  if (searchLowerCodes[typoStrictI] === searchLowerCodes[typoStrictI + 1]) continue; // doesn't make sense to transpose a repeat char\n                  targetI = firstPossibleI;\n                  continue;\n                }\n                --searchI;\n                var lastMatch = matchesStrict[--matchesStrictLen];\n                targetI = nextBeginningIndexes[lastMatch];\n              } else {\n                var isMatch = searchLowerCodes[typoStrictI === 0 ? searchI : typoStrictI === searchI ? searchI + 1 : typoStrictI === searchI - 1 ? searchI - 1 : searchI] === targetLowerCodes[targetI];\n                if (isMatch) {\n                  matchesStrict[matchesStrictLen++] = targetI;\n                  ++searchI;\n                  if (searchI === searchLen) {\n                    successStrict = true;\n                    break;\n                  }\n                  ++targetI;\n                } else {\n                  targetI = nextBeginningIndexes[targetI];\n                }\n              }\n            }\n            {\n              // tally up the score & keep track of matches for highlighting later\n              if (successStrict) {\n                var matchesBest = matchesStrict;\n                var matchesBestLen = matchesStrictLen;\n              } else {\n                var matchesBest = matchesSimple;\n                var matchesBestLen = matchesSimpleLen;\n              }\n              var score = 0;\n              var lastTargetI = -1;\n              for (var i = 0; i < searchLen; ++i) {\n                var targetI = matchesBest[i];\n                // score only goes down if they're not consecutive\n                if (lastTargetI !== targetI - 1) score -= targetI;\n                lastTargetI = targetI;\n              }\n              if (!successStrict) {\n                score *= 1000;\n                if (typoSimpleI !== 0) score += -20; /*typoPenalty*/\n              } else {\n                if (typoStrictI !== 0) score += -20; /*typoPenalty*/\n              }\n\n              score -= targetLen - searchLen;\n              prepared.score = score;\n              prepared.indexes = new Array(matchesBestLen);\n              for (var i = matchesBestLen - 1; i >= 0; --i) {\n                prepared.indexes[i] = matchesBest[i];\n              }\n              return prepared;\n            }\n          },\n          algorithmNoTypo: function algorithmNoTypo(searchLowerCodes, prepared, searchLowerCode) {\n            var targetLowerCodes = prepared._targetLowerCodes;\n            var searchLen = searchLowerCodes.length;\n            var targetLen = targetLowerCodes.length;\n            var searchI = 0; // where we at\n            var targetI = 0; // where you at\n            var matchesSimpleLen = 0;\n\n            // very basic fuzzy match; to remove non-matching targets ASAP!\n            // walk through target. find sequential matches.\n            // if all chars aren't found then exit\n            for (;;) {\n              var isMatch = searchLowerCode === targetLowerCodes[targetI];\n              if (isMatch) {\n                matchesSimple[matchesSimpleLen++] = targetI;\n                ++searchI;\n                if (searchI === searchLen) break;\n                searchLowerCode = searchLowerCodes[searchI];\n              }\n              ++targetI;\n              if (targetI >= targetLen) return null; // Failed to find searchI\n            }\n\n            var searchI = 0;\n            var successStrict = false;\n            var matchesStrictLen = 0;\n            var nextBeginningIndexes = prepared._nextBeginningIndexes;\n            if (nextBeginningIndexes === null) nextBeginningIndexes = prepared._nextBeginningIndexes = fuzzysort.prepareNextBeginningIndexes(prepared.target);\n            targetI = matchesSimple[0] === 0 ? 0 : nextBeginningIndexes[matchesSimple[0] - 1];\n\n            // Our target string successfully matched all characters in sequence!\n            // Let's try a more advanced and strict test to improve the score\n            // only count it as a match if it's consecutive or a beginning character!\n            if (targetI !== targetLen) for (;;) {\n              if (targetI >= targetLen) {\n                // We failed to find a good spot for this search char, go back to the previous search char and force it forward\n                if (searchI <= 0) break; // We failed to push chars forward for a better match\n\n                --searchI;\n                var lastMatch = matchesStrict[--matchesStrictLen];\n                targetI = nextBeginningIndexes[lastMatch];\n              } else {\n                var isMatch = searchLowerCodes[searchI] === targetLowerCodes[targetI];\n                if (isMatch) {\n                  matchesStrict[matchesStrictLen++] = targetI;\n                  ++searchI;\n                  if (searchI === searchLen) {\n                    successStrict = true;\n                    break;\n                  }\n                  ++targetI;\n                } else {\n                  targetI = nextBeginningIndexes[targetI];\n                }\n              }\n            }\n            {\n              // tally up the score & keep track of matches for highlighting later\n              if (successStrict) {\n                var matchesBest = matchesStrict;\n                var matchesBestLen = matchesStrictLen;\n              } else {\n                var matchesBest = matchesSimple;\n                var matchesBestLen = matchesSimpleLen;\n              }\n              var score = 0;\n              var lastTargetI = -1;\n              for (var i = 0; i < searchLen; ++i) {\n                var targetI = matchesBest[i];\n                // score only goes down if they're not consecutive\n                if (lastTargetI !== targetI - 1) score -= targetI;\n                lastTargetI = targetI;\n              }\n              if (!successStrict) score *= 1000;\n              score -= targetLen - searchLen;\n              prepared.score = score;\n              prepared.indexes = new Array(matchesBestLen);\n              for (var i = matchesBestLen - 1; i >= 0; --i) {\n                prepared.indexes[i] = matchesBest[i];\n              }\n              return prepared;\n            }\n          },\n          prepareLowerCodes: function prepareLowerCodes(str) {\n            var strLen = str.length;\n            var lowerCodes = []; // new Array(strLen)    sparse array is too slow\n            var lower = str.toLowerCase();\n            for (var i = 0; i < strLen; ++i) {\n              lowerCodes[i] = lower.charCodeAt(i);\n            }\n            return lowerCodes;\n          },\n          prepareBeginningIndexes: function prepareBeginningIndexes(target) {\n            var targetLen = target.length;\n            var beginningIndexes = [];\n            var beginningIndexesLen = 0;\n            var wasUpper = false;\n            var wasAlphanum = false;\n            for (var i = 0; i < targetLen; ++i) {\n              var targetCode = target.charCodeAt(i);\n              var isUpper = targetCode >= 65 && targetCode <= 90;\n              var isAlphanum = isUpper || targetCode >= 97 && targetCode <= 122 || targetCode >= 48 && targetCode <= 57;\n              var isBeginning = isUpper && !wasUpper || !wasAlphanum || !isAlphanum;\n              wasUpper = isUpper;\n              wasAlphanum = isAlphanum;\n              if (isBeginning) beginningIndexes[beginningIndexesLen++] = i;\n            }\n            return beginningIndexes;\n          },\n          prepareNextBeginningIndexes: function prepareNextBeginningIndexes(target) {\n            var targetLen = target.length;\n            var beginningIndexes = fuzzysort.prepareBeginningIndexes(target);\n            var nextBeginningIndexes = []; // new Array(targetLen)     sparse array is too slow\n            var lastIsBeginning = beginningIndexes[0];\n            var lastIsBeginningI = 0;\n            for (var i = 0; i < targetLen; ++i) {\n              if (lastIsBeginning > i) {\n                nextBeginningIndexes[i] = lastIsBeginning;\n              } else {\n                lastIsBeginning = beginningIndexes[++lastIsBeginningI];\n                nextBeginningIndexes[i] = lastIsBeginning === undefined ? targetLen : lastIsBeginning;\n              }\n            }\n            return nextBeginningIndexes;\n          },\n          cleanup: cleanup,\n          new: fuzzysortNew\n        };\n        return fuzzysort;\n      } // fuzzysortNew\n\n      // This stuff is outside fuzzysortNew, because it's shared with instances of fuzzysort.new()\n      var isNode = typeof commonjsRequire !== 'undefined' && typeof window === 'undefined';\n      var MyMap = typeof Map === 'function' ? Map : function () {\n        var s = Object.create(null);\n        this.get = function (k) {\n          return s[k];\n        };\n        this.set = function (k, val) {\n          s[k] = val;\n          return this;\n        };\n        this.clear = function () {\n          s = Object.create(null);\n        };\n      };\n      var preparedCache = new MyMap();\n      var preparedSearchCache = new MyMap();\n      var noResults = [];\n      noResults.total = 0;\n      var matchesSimple = [];\n      var matchesStrict = [];\n      function cleanup() {\n        preparedCache.clear();\n        preparedSearchCache.clear();\n        matchesSimple = [];\n        matchesStrict = [];\n      }\n      function defaultScoreFn(a) {\n        var max = -9007199254740991;\n        for (var i = a.length - 1; i >= 0; --i) {\n          var result = a[i];\n          if (result === null) continue;\n          var score = result.score;\n          if (score > max) max = score;\n        }\n        if (max === -9007199254740991) return null;\n        return max;\n      }\n\n      // prop = 'key'              2.5ms optimized for this case, seems to be about as fast as direct obj[prop]\n      // prop = 'key1.key2'        10ms\n      // prop = ['key1', 'key2']   27ms\n      function getValue(obj, prop) {\n        var tmp = obj[prop];\n        if (tmp !== undefined) return tmp;\n        var segs = prop;\n        if (!Array.isArray(prop)) segs = prop.split('.');\n        var len = segs.length;\n        var i = -1;\n        while (obj && ++i < len) {\n          obj = obj[segs[i]];\n        }\n        return obj;\n      }\n      function isObj(x) {\n        return _typeof(x) === 'object';\n      } // faster as a function\n\n      // Hacked version of https://github.com/lemire/FastPriorityQueue.js\n      var fastpriorityqueue = function fastpriorityqueue() {\n        var r = [],\n          o = 0,\n          e = {};\n        function n() {\n          for (var e = 0, n = r[e], c = 1; c < o;) {\n            var f = c + 1;\n            e = c, f < o && r[f].score < r[c].score && (e = f), r[e - 1 >> 1] = r[e], c = 1 + (e << 1);\n          }\n          for (var a = e - 1 >> 1; e > 0 && n.score < r[a].score; a = (e = a) - 1 >> 1) {\n            r[e] = r[a];\n          }\n          r[e] = n;\n        }\n        return e.add = function (e) {\n          var n = o;\n          r[o++] = e;\n          for (var c = n - 1 >> 1; n > 0 && e.score < r[c].score; c = (n = c) - 1 >> 1) {\n            r[n] = r[c];\n          }\n          r[n] = e;\n        }, e.poll = function () {\n          if (0 !== o) {\n            var e = r[0];\n            return r[0] = r[--o], n(), e;\n          }\n        }, e.peek = function (e) {\n          if (0 !== o) return r[0];\n        }, e.replaceTop = function (o) {\n          r[0] = o, n();\n        }, e;\n      };\n      var q = fastpriorityqueue(); // reuse this, except for async, it needs to make its own\n\n      return fuzzysortNew();\n    }); // UMD\n\n    // TODO: (performance) wasm version!?\n    // TODO: (performance) threads?\n    // TODO: (performance) avoid cache misses\n    // TODO: (performance) preparedCache is a memory leak\n    // TODO: (like sublime) backslash === forwardslash\n    // TODO: (like sublime) spaces: \"a b\" should do 2 searches 1 for a and 1 for b\n    // TODO: (scoring) garbage in targets that allows most searches to strict match need a penality\n    // TODO: (performance) idk if allowTypo is optimized\n  })(fuzzysort$1);\n  var fuzzysort = fuzzysort$1.exports;\n  var stats = {\n    failedTests: [],\n    defined: 0,\n    completed: 0\n  };\n\n  // Escape text for attribute or text content.\n  function escapeText(str) {\n    if (!str) {\n      return '';\n    }\n\n    // Both single quotes and double quotes (for attributes)\n    return ('' + str).replace(/['\"<>&]/g, function (s) {\n      switch (s) {\n        case \"'\":\n          return '&#039;';\n        case '\"':\n          return '&quot;';\n        case '<':\n          return '&lt;';\n        case '>':\n          return '&gt;';\n        case '&':\n          return '&amp;';\n      }\n    });\n  }\n  (function () {\n    // Don't load the HTML Reporter on non-browser environments\n    if (!window$1 || !document) {\n      return;\n    }\n    var config = QUnit.config;\n    var hiddenTests = [];\n    var collapseNext = false;\n    var hasOwn = Object.prototype.hasOwnProperty;\n    var unfilteredUrl = setUrl({\n      filter: undefined,\n      module: undefined,\n      moduleId: undefined,\n      testId: undefined\n    });\n    var dropdownData = null;\n    function trim(string) {\n      if (typeof string.trim === 'function') {\n        return string.trim();\n      } else {\n        return string.replace(/^\\s+|\\s+$/g, '');\n      }\n    }\n    function addEvent(elem, type, fn) {\n      elem.addEventListener(type, fn, false);\n    }\n    function removeEvent(elem, type, fn) {\n      elem.removeEventListener(type, fn, false);\n    }\n    function addEvents(elems, type, fn) {\n      var i = elems.length;\n      while (i--) {\n        addEvent(elems[i], type, fn);\n      }\n    }\n    function hasClass(elem, name) {\n      return (' ' + elem.className + ' ').indexOf(' ' + name + ' ') >= 0;\n    }\n    function addClass(elem, name) {\n      if (!hasClass(elem, name)) {\n        elem.className += (elem.className ? ' ' : '') + name;\n      }\n    }\n    function toggleClass(elem, name, force) {\n      if (force || typeof force === 'undefined' && !hasClass(elem, name)) {\n        addClass(elem, name);\n      } else {\n        removeClass(elem, name);\n      }\n    }\n    function removeClass(elem, name) {\n      var set = ' ' + elem.className + ' ';\n\n      // Class name may appear multiple times\n      while (set.indexOf(' ' + name + ' ') >= 0) {\n        set = set.replace(' ' + name + ' ', ' ');\n      }\n\n      // Trim for prettiness\n      elem.className = trim(set);\n    }\n    function id(name) {\n      return document.getElementById && document.getElementById(name);\n    }\n    function abortTests() {\n      var abortButton = id('qunit-abort-tests-button');\n      if (abortButton) {\n        abortButton.disabled = true;\n        abortButton.innerHTML = 'Aborting...';\n      }\n      QUnit.config.queue.length = 0;\n      return false;\n    }\n    function interceptNavigation(ev) {\n      // Trim potential accidental whitespace so that QUnit doesn't throw an error about no tests matching the filter.\n      var filterInputElem = id('qunit-filter-input');\n      filterInputElem.value = trim(filterInputElem.value);\n      applyUrlParams();\n      if (ev && ev.preventDefault) {\n        ev.preventDefault();\n      }\n      return false;\n    }\n    function getUrlConfigHtml() {\n      var selection = false;\n      var urlConfig = config.urlConfig;\n      var urlConfigHtml = '';\n      for (var i = 0; i < urlConfig.length; i++) {\n        // Options can be either strings or objects with nonempty \"id\" properties\n        var val = config.urlConfig[i];\n        if (typeof val === 'string') {\n          val = {\n            id: val,\n            label: val\n          };\n        }\n        var escaped = escapeText(val.id);\n        var escapedTooltip = escapeText(val.tooltip);\n        if (!val.value || typeof val.value === 'string') {\n          urlConfigHtml += \"<label for='qunit-urlconfig-\" + escaped + \"' title='\" + escapedTooltip + \"'><input id='qunit-urlconfig-\" + escaped + \"' name='\" + escaped + \"' type='checkbox'\" + (val.value ? \" value='\" + escapeText(val.value) + \"'\" : '') + (config[val.id] ? \" checked='checked'\" : '') + \" title='\" + escapedTooltip + \"' />\" + escapeText(val.label) + '</label>';\n        } else {\n          urlConfigHtml += \"<label for='qunit-urlconfig-\" + escaped + \"' title='\" + escapedTooltip + \"'>\" + val.label + \": </label><select id='qunit-urlconfig-\" + escaped + \"' name='\" + escaped + \"' title='\" + escapedTooltip + \"'><option></option>\";\n          if (Array.isArray(val.value)) {\n            for (var j = 0; j < val.value.length; j++) {\n              escaped = escapeText(val.value[j]);\n              urlConfigHtml += \"<option value='\" + escaped + \"'\" + (config[val.id] === val.value[j] ? (selection = true) && \" selected='selected'\" : '') + '>' + escaped + '</option>';\n            }\n          } else {\n            for (var _j in val.value) {\n              if (hasOwn.call(val.value, _j)) {\n                urlConfigHtml += \"<option value='\" + escapeText(_j) + \"'\" + (config[val.id] === _j ? (selection = true) && \" selected='selected'\" : '') + '>' + escapeText(val.value[_j]) + '</option>';\n              }\n            }\n          }\n          if (config[val.id] && !selection) {\n            escaped = escapeText(config[val.id]);\n            urlConfigHtml += \"<option value='\" + escaped + \"' selected='selected' disabled='disabled'>\" + escaped + '</option>';\n          }\n          urlConfigHtml += '</select>';\n        }\n      }\n      return urlConfigHtml;\n    }\n\n    // Handle \"click\" events on toolbar checkboxes and \"change\" for select menus.\n    // Updates the URL with the new state of `config.urlConfig` values.\n    function toolbarChanged() {\n      var field = this;\n      var params = {};\n\n      // Detect if field is a select menu or a checkbox\n      var value;\n      if ('selectedIndex' in field) {\n        value = field.options[field.selectedIndex].value || undefined;\n      } else {\n        value = field.checked ? field.defaultValue || true : undefined;\n      }\n      params[field.name] = value;\n      var updatedUrl = setUrl(params);\n\n      // Check if we can apply the change without a page refresh\n      if (field.name === 'hidepassed' && 'replaceState' in window$1.history) {\n        QUnit.urlParams[field.name] = value;\n        config[field.name] = value || false;\n        var tests = id('qunit-tests');\n        if (tests) {\n          var length = tests.children.length;\n          var children = tests.children;\n          if (field.checked) {\n            for (var i = 0; i < length; i++) {\n              var test = children[i];\n              var className = test ? test.className : '';\n              var classNameHasPass = className.indexOf('pass') > -1;\n              var classNameHasSkipped = className.indexOf('skipped') > -1;\n              if (classNameHasPass || classNameHasSkipped) {\n                hiddenTests.push(test);\n              }\n            }\n            var _iterator = _createForOfIteratorHelper(hiddenTests),\n              _step;\n            try {\n              for (_iterator.s(); !(_step = _iterator.n()).done;) {\n                var hiddenTest = _step.value;\n                tests.removeChild(hiddenTest);\n              }\n            } catch (err) {\n              _iterator.e(err);\n            } finally {\n              _iterator.f();\n            }\n          } else {\n            var _test;\n            while ((_test = hiddenTests.pop()) != null) {\n              tests.appendChild(_test);\n            }\n          }\n        }\n        window$1.history.replaceState(null, '', updatedUrl);\n      } else {\n        window$1.location = updatedUrl;\n      }\n    }\n    function setUrl(params) {\n      var querystring = '?';\n      var location = window$1.location;\n      params = extend(extend({}, QUnit.urlParams), params);\n      for (var key in params) {\n        // Skip inherited or undefined properties\n        if (hasOwn.call(params, key) && params[key] !== undefined) {\n          // Output a parameter for each value of this key\n          // (but usually just one)\n          var arrValue = [].concat(params[key]);\n          for (var i = 0; i < arrValue.length; i++) {\n            querystring += encodeURIComponent(key);\n            if (arrValue[i] !== true) {\n              querystring += '=' + encodeURIComponent(arrValue[i]);\n            }\n            querystring += '&';\n          }\n        }\n      }\n      return location.protocol + '//' + location.host + location.pathname + querystring.slice(0, -1);\n    }\n    function applyUrlParams() {\n      var filter = id('qunit-filter-input').value;\n      window$1.location = setUrl({\n        filter: filter === '' ? undefined : filter,\n        moduleId: _toConsumableArray(dropdownData.selectedMap.keys()),\n        // Remove module and testId filter\n        module: undefined,\n        testId: undefined\n      });\n    }\n    function toolbarUrlConfigContainer() {\n      var urlConfigContainer = document.createElement('span');\n      urlConfigContainer.innerHTML = getUrlConfigHtml();\n      addClass(urlConfigContainer, 'qunit-url-config');\n      addEvents(urlConfigContainer.getElementsByTagName('input'), 'change', toolbarChanged);\n      addEvents(urlConfigContainer.getElementsByTagName('select'), 'change', toolbarChanged);\n      return urlConfigContainer;\n    }\n    function abortTestsButton() {\n      var button = document.createElement('button');\n      button.id = 'qunit-abort-tests-button';\n      button.innerHTML = 'Abort';\n      addEvent(button, 'click', abortTests);\n      return button;\n    }\n    function toolbarLooseFilter() {\n      var filter = document.createElement('form');\n      var label = document.createElement('label');\n      var input = document.createElement('input');\n      var button = document.createElement('button');\n      addClass(filter, 'qunit-filter');\n      label.innerHTML = 'Filter: ';\n      input.type = 'text';\n      input.value = config.filter || '';\n      input.name = 'filter';\n      input.id = 'qunit-filter-input';\n      button.innerHTML = 'Go';\n      label.appendChild(input);\n      filter.appendChild(label);\n      filter.appendChild(document.createTextNode(' '));\n      filter.appendChild(button);\n      addEvent(filter, 'submit', interceptNavigation);\n      return filter;\n    }\n    function createModuleListItem(moduleId, name, checked) {\n      return '<li><label class=\"clickable' + (checked ? ' checked' : '') + '\"><input type=\"checkbox\" ' + 'value=\"' + escapeText(moduleId) + '\"' + (checked ? ' checked=\"checked\"' : '') + ' />' + escapeText(name) + '</label></li>';\n    }\n\n    /**\n     * @param {Array} Results from fuzzysort\n     * @return {string} HTML\n     */\n    function moduleListHtml(results) {\n      var html = '';\n\n      // Hoist the already selected items, and show them always\n      // even if not matched by the current search.\n      dropdownData.selectedMap.forEach(function (name, moduleId) {\n        html += createModuleListItem(moduleId, name, true);\n      });\n      for (var i = 0; i < results.length; i++) {\n        var mod = results[i].obj;\n        if (!dropdownData.selectedMap.has(mod.moduleId)) {\n          html += createModuleListItem(mod.moduleId, mod.name, false);\n        }\n      }\n      return html;\n    }\n    function toolbarModuleFilter(beginDetails) {\n      var initialSelected = null;\n      dropdownData = {\n        options: beginDetails.modules.slice(),\n        selectedMap: new StringMap(),\n        isDirty: function isDirty() {\n          return _toConsumableArray(dropdownData.selectedMap.keys()).sort().join(',') !== _toConsumableArray(initialSelected.keys()).sort().join(',');\n        }\n      };\n      if (config.moduleId.length) {\n        // The module dropdown is seeded with the runtime configuration of the last run.\n        //\n        // We don't reference `config.moduleId` directly after this and keep our own\n        // copy because:\n        // 1. This naturally filters out unknown moduleIds.\n        // 2. Gives us a place to manage and remember unsubmitted checkbox changes.\n        // 3. Gives us an efficient way to map a selected moduleId to module name\n        //    during rendering.\n        for (var i = 0; i < beginDetails.modules.length; i++) {\n          var mod = beginDetails.modules[i];\n          if (config.moduleId.indexOf(mod.moduleId) !== -1) {\n            dropdownData.selectedMap.set(mod.moduleId, mod.name);\n          }\n        }\n      }\n      initialSelected = new StringMap(dropdownData.selectedMap);\n      var moduleSearch = document.createElement('input');\n      moduleSearch.id = 'qunit-modulefilter-search';\n      moduleSearch.autocomplete = 'off';\n      addEvent(moduleSearch, 'input', searchInput);\n      addEvent(moduleSearch, 'input', searchFocus);\n      addEvent(moduleSearch, 'focus', searchFocus);\n      addEvent(moduleSearch, 'click', searchFocus);\n      var label = document.createElement('label');\n      label.htmlFor = 'qunit-modulefilter-search';\n      label.textContent = 'Module:';\n      var searchContainer = document.createElement('span');\n      searchContainer.id = 'qunit-modulefilter-search-container';\n      searchContainer.appendChild(moduleSearch);\n      var applyButton = document.createElement('button');\n      applyButton.textContent = 'Apply';\n      applyButton.title = 'Re-run the selected test modules';\n      addEvent(applyButton, 'click', applyUrlParams);\n      var resetButton = document.createElement('button');\n      resetButton.textContent = 'Reset';\n      resetButton.type = 'reset';\n      resetButton.title = 'Restore the previous module selection';\n      var clearButton = document.createElement('button');\n      clearButton.textContent = 'Select none';\n      clearButton.type = 'button';\n      clearButton.title = 'Clear the current module selection';\n      addEvent(clearButton, 'click', function () {\n        dropdownData.selectedMap.clear();\n        selectionChange();\n        searchInput();\n      });\n      var actions = document.createElement('span');\n      actions.id = 'qunit-modulefilter-actions';\n      actions.appendChild(applyButton);\n      actions.appendChild(resetButton);\n      if (initialSelected.size) {\n        // Only show clear button if functionally different from reset\n        actions.appendChild(clearButton);\n      }\n      var dropDownList = document.createElement('ul');\n      dropDownList.id = 'qunit-modulefilter-dropdown-list';\n      var dropDown = document.createElement('div');\n      dropDown.id = 'qunit-modulefilter-dropdown';\n      dropDown.style.display = 'none';\n      dropDown.appendChild(actions);\n      dropDown.appendChild(dropDownList);\n      addEvent(dropDown, 'change', selectionChange);\n      searchContainer.appendChild(dropDown);\n      // Set initial moduleSearch.placeholder and clearButton/resetButton.\n      selectionChange();\n      var moduleFilter = document.createElement('form');\n      moduleFilter.id = 'qunit-modulefilter';\n      moduleFilter.appendChild(label);\n      moduleFilter.appendChild(document.createTextNode(' '));\n      moduleFilter.appendChild(searchContainer);\n      addEvent(moduleFilter, 'submit', interceptNavigation);\n      addEvent(moduleFilter, 'reset', function () {\n        dropdownData.selectedMap = new StringMap(initialSelected);\n        // Set moduleSearch.placeholder and reflect non-dirty state\n        selectionChange();\n        searchInput();\n      });\n\n      // Enables show/hide for the dropdown\n      function searchFocus() {\n        if (dropDown.style.display !== 'none') {\n          return;\n        }\n\n        // Optimization: Defer rendering options until focussed.\n        // https://github.com/qunitjs/qunit/issues/1664\n        searchInput();\n        dropDown.style.display = 'block';\n\n        // Hide on Escape keydown or on click outside the container\n        addEvent(document, 'click', hideHandler);\n        addEvent(document, 'keydown', hideHandler);\n        function hideHandler(e) {\n          var inContainer = moduleFilter.contains(e.target);\n          if (e.keyCode === 27 || !inContainer) {\n            if (e.keyCode === 27 && inContainer) {\n              moduleSearch.focus();\n            }\n            dropDown.style.display = 'none';\n            removeEvent(document, 'click', hideHandler);\n            removeEvent(document, 'keydown', hideHandler);\n            moduleSearch.value = '';\n            searchInput();\n          }\n        }\n      }\n\n      /**\n       * @param {string} searchText\n       * @return {string} HTML\n       */\n      function filterModules(searchText) {\n        var results;\n        if (searchText === '') {\n          // Improve on-boarding experience by having an immediate display of\n          // module names, indicating how the interface works. This also makes\n          // for a quicker interaction in the common case of small projects.\n          // Don't mandate typing just to get the menu.\n          results = dropdownData.options.slice(0, 20).map(function (obj) {\n            // Fake empty results. https://github.com/farzher/fuzzysort/issues/41\n            return {\n              obj: obj\n            };\n          });\n        } else {\n          results = fuzzysort.go(searchText, dropdownData.options, {\n            limit: 20,\n            key: 'name',\n            allowTypo: true\n          });\n        }\n        return moduleListHtml(results);\n      }\n\n      // Processes module search box input\n      var searchInputTimeout;\n      function searchInput() {\n        // Use a debounce with a ~0ms timeout. This is effectively instantaneous,\n        // but is better than undebounced because it avoids an ever-growing\n        // backlog of unprocessed now-outdated input events if fuzzysearch or\n        // drodown DOM is slow (e.g. very large test suite).\n        window$1.clearTimeout(searchInputTimeout);\n        searchInputTimeout = window$1.setTimeout(function () {\n          dropDownList.innerHTML = filterModules(moduleSearch.value);\n        });\n      }\n\n      // Processes checkbox change, or a generic render (initial render, or after reset event)\n      // Avoid any dropdown rendering here as this is used by toolbarModuleFilter()\n      // during the initial render, which should not delay test execution.\n      function selectionChange(evt) {\n        var checkbox = evt && evt.target || null;\n        if (checkbox) {\n          // Update internal state\n          if (checkbox.checked) {\n            dropdownData.selectedMap.set(checkbox.value, checkbox.parentNode.textContent);\n          } else {\n            dropdownData.selectedMap.delete(checkbox.value);\n          }\n\n          // Update UI state\n          toggleClass(checkbox.parentNode, 'checked', checkbox.checked);\n        }\n        var textForm = dropdownData.selectedMap.size ? dropdownData.selectedMap.size + ' ' + (dropdownData.selectedMap.size === 1 ? 'module' : 'modules') : 'All modules';\n        moduleSearch.placeholder = textForm;\n        moduleSearch.title = 'Type to search through and reduce the list.';\n        resetButton.disabled = !dropdownData.isDirty();\n        clearButton.style.display = dropdownData.selectedMap.size ? '' : 'none';\n      }\n      return moduleFilter;\n    }\n    function appendToolbar(beginDetails) {\n      var toolbar = id('qunit-testrunner-toolbar');\n      if (toolbar) {\n        toolbar.appendChild(toolbarUrlConfigContainer());\n        var toolbarFilters = document.createElement('span');\n        toolbarFilters.id = 'qunit-toolbar-filters';\n        toolbarFilters.appendChild(toolbarLooseFilter());\n        toolbarFilters.appendChild(toolbarModuleFilter(beginDetails));\n        var clearfix = document.createElement('div');\n        clearfix.className = 'clearfix';\n        toolbar.appendChild(toolbarFilters);\n        toolbar.appendChild(clearfix);\n      }\n    }\n    function appendHeader() {\n      var header = id('qunit-header');\n      if (header) {\n        header.innerHTML = \"<a href='\" + escapeText(unfilteredUrl) + \"'>\" + header.innerHTML + '</a> ';\n      }\n    }\n    function appendBanner() {\n      var banner = id('qunit-banner');\n      if (banner) {\n        banner.className = '';\n      }\n    }\n    function appendTestResults() {\n      var tests = id('qunit-tests');\n      var result = id('qunit-testresult');\n      var controls;\n      if (result) {\n        result.parentNode.removeChild(result);\n      }\n      if (tests) {\n        tests.innerHTML = '';\n        result = document.createElement('p');\n        result.id = 'qunit-testresult';\n        result.className = 'result';\n        tests.parentNode.insertBefore(result, tests);\n        result.innerHTML = '<div id=\"qunit-testresult-display\">Running...<br />&#160;</div>' + '<div id=\"qunit-testresult-controls\"></div>' + '<div class=\"clearfix\"></div>';\n        controls = id('qunit-testresult-controls');\n      }\n      if (controls) {\n        controls.appendChild(abortTestsButton());\n      }\n    }\n    function appendFilteredTest() {\n      var testId = QUnit.config.testId;\n      if (!testId || testId.length <= 0) {\n        return '';\n      }\n      return \"<div id='qunit-filteredTest'>Rerunning selected tests: \" + escapeText(testId.join(', ')) + \" <a id='qunit-clearFilter' href='\" + escapeText(unfilteredUrl) + \"'>Run all tests</a></div>\";\n    }\n    function appendUserAgent() {\n      var userAgent = id('qunit-userAgent');\n      if (userAgent) {\n        userAgent.innerHTML = '';\n        userAgent.appendChild(document.createTextNode('QUnit ' + QUnit.version + '; ' + navigator.userAgent));\n      }\n    }\n    function appendInterface(beginDetails) {\n      var qunit = id('qunit');\n\n      // For compat with QUnit 1.2, and to support fully custom theme HTML,\n      // we will use any existing elements if no id=\"qunit\" element exists.\n      //\n      // Note that we don't fail or fallback to creating it ourselves,\n      // because not having id=\"qunit\" (and not having the below elements)\n      // simply means QUnit acts headless, allowing users to use their own\n      // reporters, or for a test runner to listen for events directly without\n      // having the HTML reporter actively render anything.\n      if (qunit) {\n        qunit.setAttribute('role', 'main');\n\n        // Since QUnit 1.3, these are created automatically if the page\n        // contains id=\"qunit\".\n        qunit.innerHTML = \"<h1 id='qunit-header'>\" + escapeText(document.title) + '</h1>' + \"<h2 id='qunit-banner'></h2>\" + \"<div id='qunit-testrunner-toolbar' role='navigation'></div>\" + appendFilteredTest() + \"<h2 id='qunit-userAgent'></h2>\" + \"<ol id='qunit-tests'></ol>\";\n      }\n      appendHeader();\n      appendBanner();\n      appendTestResults();\n      appendUserAgent();\n      appendToolbar(beginDetails);\n    }\n    function appendTest(name, testId, moduleName) {\n      var tests = id('qunit-tests');\n      if (!tests) {\n        return;\n      }\n      var title = document.createElement('strong');\n      title.innerHTML = getNameHtml(name, moduleName);\n      var testBlock = document.createElement('li');\n      testBlock.appendChild(title);\n\n      // No ID or rerun link for \"global failure\" blocks\n      if (testId !== undefined) {\n        var rerunTrigger = document.createElement('a');\n        rerunTrigger.innerHTML = 'Rerun';\n        rerunTrigger.href = setUrl({\n          testId: testId\n        });\n        testBlock.id = 'qunit-test-output-' + testId;\n        testBlock.appendChild(rerunTrigger);\n      }\n      var assertList = document.createElement('ol');\n      assertList.className = 'qunit-assert-list';\n      testBlock.appendChild(assertList);\n      tests.appendChild(testBlock);\n      return testBlock;\n    }\n\n    // HTML Reporter initialization and load\n    QUnit.on('runStart', function (runStart) {\n      stats.defined = runStart.testCounts.total;\n    });\n    QUnit.begin(function (beginDetails) {\n      // Initialize QUnit elements\n      // This is done from begin() instead of runStart, because\n      // urlparams.js uses begin(), which we need to wait for.\n      // urlparams.js in turn uses begin() to allow plugins to\n      // add entries to QUnit.config.urlConfig, which may be done\n      // asynchronously.\n      // <https://github.com/qunitjs/qunit/issues/1657>\n      appendInterface(beginDetails);\n    });\n    function getRerunFailedHtml(failedTests) {\n      if (failedTests.length === 0) {\n        return '';\n      }\n      var href = setUrl({\n        testId: failedTests\n      });\n      return [\"<br /><a href='\" + escapeText(href) + \"'>\", failedTests.length === 1 ? 'Rerun 1 failed test' : 'Rerun ' + failedTests.length + ' failed tests', '</a>'].join('');\n    }\n    QUnit.on('runEnd', function (runEnd) {\n      var banner = id('qunit-banner');\n      var tests = id('qunit-tests');\n      var abortButton = id('qunit-abort-tests-button');\n      var assertPassed = config.stats.all - config.stats.bad;\n      var html = [runEnd.testCounts.total, ' tests completed in ', runEnd.runtime, ' milliseconds, with ', runEnd.testCounts.failed, ' failed, ', runEnd.testCounts.skipped, ' skipped, and ', runEnd.testCounts.todo, ' todo.<br />', \"<span class='passed'>\", assertPassed, \"</span> assertions of <span class='total'>\", config.stats.all, \"</span> passed, <span class='failed'>\", config.stats.bad, '</span> failed.', getRerunFailedHtml(stats.failedTests)].join('');\n      var test;\n      var assertLi;\n      var assertList;\n\n      // Update remaining tests to aborted\n      if (abortButton && abortButton.disabled) {\n        html = 'Tests aborted after ' + runEnd.runtime + ' milliseconds.';\n        for (var i = 0; i < tests.children.length; i++) {\n          test = tests.children[i];\n          if (test.className === '' || test.className === 'running') {\n            test.className = 'aborted';\n            assertList = test.getElementsByTagName('ol')[0];\n            assertLi = document.createElement('li');\n            assertLi.className = 'fail';\n            assertLi.innerHTML = 'Test aborted.';\n            assertList.appendChild(assertLi);\n          }\n        }\n      }\n      if (banner && (!abortButton || abortButton.disabled === false)) {\n        banner.className = runEnd.status === 'failed' ? 'qunit-fail' : 'qunit-pass';\n      }\n      if (abortButton) {\n        abortButton.parentNode.removeChild(abortButton);\n      }\n      if (tests) {\n        id('qunit-testresult-display').innerHTML = html;\n      }\n      if (config.altertitle && document.title) {\n        // Show ✖ for good, ✔ for bad suite result in title\n        // use escape sequences in case file gets loaded with non-utf-8\n        // charset\n        document.title = [runEnd.status === 'failed' ? \"\\u2716\" : \"\\u2714\", document.title.replace(/^[\\u2714\\u2716] /i, '')].join(' ');\n      }\n\n      // Scroll back to top to show results\n      if (config.scrolltop && window$1.scrollTo) {\n        window$1.scrollTo(0, 0);\n      }\n    });\n    function getNameHtml(name, module) {\n      var nameHtml = '';\n      if (module) {\n        nameHtml = \"<span class='module-name'>\" + escapeText(module) + '</span>: ';\n      }\n      nameHtml += \"<span class='test-name'>\" + escapeText(name) + '</span>';\n      return nameHtml;\n    }\n    function getProgressHtml(stats) {\n      return [stats.completed, ' / ', stats.defined, ' tests completed.<br />'].join('');\n    }\n    QUnit.testStart(function (details) {\n      var running, bad;\n      appendTest(details.name, details.testId, details.module);\n      running = id('qunit-testresult-display');\n      if (running) {\n        addClass(running, 'running');\n        bad = QUnit.config.reorder && details.previousFailure;\n        running.innerHTML = [getProgressHtml(stats), bad ? 'Rerunning previously failed test: <br />' : 'Running: ', getNameHtml(details.name, details.module), getRerunFailedHtml(stats.failedTests)].join('');\n      }\n    });\n    function stripHtml(string) {\n      // Strip tags, html entity and whitespaces\n      return string.replace(/<\\/?[^>]+(>|$)/g, '').replace(/&quot;/g, '').replace(/\\s+/g, '');\n    }\n    QUnit.log(function (details) {\n      var testItem = id('qunit-test-output-' + details.testId);\n      if (!testItem) {\n        return;\n      }\n      var message = escapeText(details.message) || (details.result ? 'okay' : 'failed');\n      message = \"<span class='test-message'>\" + message + '</span>';\n      message += \"<span class='runtime'>@ \" + details.runtime + ' ms</span>';\n      var expected;\n      var actual;\n      var diff;\n      var showDiff = false;\n\n      // The pushFailure doesn't provide details.expected\n      // when it calls, it's implicit to also not show expected and diff stuff\n      // Also, we need to check details.expected existence, as it can exist and be undefined\n      if (!details.result && hasOwn.call(details, 'expected')) {\n        if (details.negative) {\n          expected = 'NOT ' + QUnit.dump.parse(details.expected);\n        } else {\n          expected = QUnit.dump.parse(details.expected);\n        }\n        actual = QUnit.dump.parse(details.actual);\n        message += \"<table><tr class='test-expected'><th>Expected: </th><td><pre>\" + escapeText(expected) + '</pre></td></tr>';\n        if (actual !== expected) {\n          message += \"<tr class='test-actual'><th>Result: </th><td><pre>\" + escapeText(actual) + '</pre></td></tr>';\n          if (typeof details.actual === 'number' && typeof details.expected === 'number') {\n            if (!isNaN(details.actual) && !isNaN(details.expected)) {\n              showDiff = true;\n              diff = details.actual - details.expected;\n              diff = (diff > 0 ? '+' : '') + diff;\n            }\n          } else if (typeof details.actual !== 'boolean' && typeof details.expected !== 'boolean') {\n            diff = QUnit.diff(expected, actual);\n\n            // don't show diff if there is zero overlap\n            showDiff = stripHtml(diff).length !== stripHtml(expected).length + stripHtml(actual).length;\n          }\n          if (showDiff) {\n            message += \"<tr class='test-diff'><th>Diff: </th><td><pre>\" + diff + '</pre></td></tr>';\n          }\n        } else if (expected.indexOf('[object Array]') !== -1 || expected.indexOf('[object Object]') !== -1) {\n          message += \"<tr class='test-message'><th>Message: </th><td>\" + 'Diff suppressed as the depth of object is more than current max depth (' + QUnit.config.maxDepth + ').<p>Hint: Use <code>QUnit.dump.maxDepth</code> to ' + \" run with a higher max depth or <a href='\" + escapeText(setUrl({\n            maxDepth: -1\n          })) + \"'>\" + 'Rerun</a> without max depth.</p></td></tr>';\n        } else {\n          message += \"<tr class='test-message'><th>Message: </th><td>\" + 'Diff suppressed as the expected and actual results have an equivalent' + ' serialization</td></tr>';\n        }\n        if (details.source) {\n          message += \"<tr class='test-source'><th>Source: </th><td><pre>\" + escapeText(details.source) + '</pre></td></tr>';\n        }\n        message += '</table>';\n\n        // This occurs when pushFailure is set and we have an extracted stack trace\n      } else if (!details.result && details.source) {\n        message += '<table>' + \"<tr class='test-source'><th>Source: </th><td><pre>\" + escapeText(details.source) + '</pre></td></tr>' + '</table>';\n      }\n      var assertList = testItem.getElementsByTagName('ol')[0];\n      var assertLi = document.createElement('li');\n      assertLi.className = details.result ? 'pass' : 'fail';\n      assertLi.innerHTML = message;\n      assertList.appendChild(assertLi);\n    });\n    QUnit.testDone(function (details) {\n      var tests = id('qunit-tests');\n      var testItem = id('qunit-test-output-' + details.testId);\n      if (!tests || !testItem) {\n        return;\n      }\n      removeClass(testItem, 'running');\n      var status;\n      if (details.failed > 0) {\n        status = 'failed';\n      } else if (details.todo) {\n        status = 'todo';\n      } else {\n        status = details.skipped ? 'skipped' : 'passed';\n      }\n      var assertList = testItem.getElementsByTagName('ol')[0];\n      var good = details.passed;\n      var bad = details.failed;\n\n      // This test passed if it has no unexpected failed assertions\n      var testPassed = details.failed > 0 ? details.todo : !details.todo;\n      if (testPassed) {\n        // Collapse the passing tests\n        addClass(assertList, 'qunit-collapsed');\n      } else {\n        stats.failedTests.push(details.testId);\n        if (config.collapse) {\n          if (!collapseNext) {\n            // Skip collapsing the first failing test\n            collapseNext = true;\n          } else {\n            // Collapse remaining tests\n            addClass(assertList, 'qunit-collapsed');\n          }\n        }\n      }\n\n      // The testItem.firstChild is the test name\n      var testTitle = testItem.firstChild;\n      var testCounts = bad ? \"<b class='failed'>\" + bad + '</b>, ' + \"<b class='passed'>\" + good + '</b>, ' : '';\n      testTitle.innerHTML += \" <b class='counts'>(\" + testCounts + details.assertions.length + ')</b>';\n      stats.completed++;\n      if (details.skipped) {\n        testItem.className = 'skipped';\n        var skipped = document.createElement('em');\n        skipped.className = 'qunit-skipped-label';\n        skipped.innerHTML = 'skipped';\n        testItem.insertBefore(skipped, testTitle);\n      } else {\n        addEvent(testTitle, 'click', function () {\n          toggleClass(assertList, 'qunit-collapsed');\n        });\n        testItem.className = testPassed ? 'pass' : 'fail';\n        if (details.todo) {\n          var todoLabel = document.createElement('em');\n          todoLabel.className = 'qunit-todo-label';\n          todoLabel.innerHTML = 'todo';\n          testItem.className += ' todo';\n          testItem.insertBefore(todoLabel, testTitle);\n        }\n        var time = document.createElement('span');\n        time.className = 'runtime';\n        time.innerHTML = details.runtime + ' ms';\n        testItem.insertBefore(time, assertList);\n      }\n\n      // Show the source of the test when showing assertions\n      if (details.source) {\n        var sourceName = document.createElement('p');\n        sourceName.innerHTML = '<strong>Source: </strong>' + escapeText(details.source);\n        addClass(sourceName, 'qunit-source');\n        if (testPassed) {\n          addClass(sourceName, 'qunit-collapsed');\n        }\n        addEvent(testTitle, 'click', function () {\n          toggleClass(sourceName, 'qunit-collapsed');\n        });\n        testItem.appendChild(sourceName);\n      }\n      if (config.hidepassed && (status === 'passed' || details.skipped)) {\n        // use removeChild instead of remove because of support\n        hiddenTests.push(testItem);\n        tests.removeChild(testItem);\n      }\n    });\n    QUnit.on('error', function (error) {\n      var testItem = appendTest('global failure');\n      if (!testItem) {\n        // HTML Reporter is probably disabled or not yet initialized.\n        return;\n      }\n\n      // Render similar to a failed assertion (see above QUnit.log callback)\n      var message = escapeText(errorString(error));\n      message = \"<span class='test-message'>\" + message + '</span>';\n      if (error && error.stack) {\n        message += '<table>' + \"<tr class='test-source'><th>Source: </th><td><pre>\" + escapeText(error.stack) + '</pre></td></tr>' + '</table>';\n      }\n      var assertList = testItem.getElementsByTagName('ol')[0];\n      var assertLi = document.createElement('li');\n      assertLi.className = 'fail';\n      assertLi.innerHTML = message;\n      assertList.appendChild(assertLi);\n\n      // Make it visible\n      testItem.className = 'fail';\n    });\n\n    // Avoid readyState issue with phantomjs\n    // Ref: #818\n    var usingPhantom = function (p) {\n      return p && p.version && p.version.major > 0;\n    }(window$1.phantom);\n    if (usingPhantom) {\n      console$1.warn('Support for PhantomJS is deprecated and will be removed in QUnit 3.0.');\n    }\n    if (!usingPhantom && document.readyState === 'complete') {\n      QUnit.load();\n    } else {\n      addEvent(window$1, 'load', QUnit.load);\n    }\n\n    // Wrap window.onerror. We will call the original window.onerror to see if\n    // the existing handler fully handles the error; if not, we will call the\n    // QUnit.onError function.\n    var originalWindowOnError = window$1.onerror;\n\n    // Cover uncaught exceptions\n    // Returning true will suppress the default browser handler,\n    // returning false will let it run.\n    window$1.onerror = function (message, fileName, lineNumber, columnNumber, errorObj) {\n      var ret = false;\n      if (originalWindowOnError) {\n        for (var _len = arguments.length, args = new Array(_len > 5 ? _len - 5 : 0), _key = 5; _key < _len; _key++) {\n          args[_key - 5] = arguments[_key];\n        }\n        ret = originalWindowOnError.call.apply(originalWindowOnError, [this, message, fileName, lineNumber, columnNumber, errorObj].concat(args));\n      }\n\n      // Treat return value as window.onerror itself does,\n      // Only do our handling if not suppressed.\n      if (ret !== true) {\n        // If there is a current test that sets the internal `ignoreGlobalErrors` field\n        // (such as during `assert.throws()`), then the error is ignored and native\n        // error reporting is suppressed as well. This is because in browsers, an error\n        // can sometimes end up in `window.onerror` instead of in the local try/catch.\n        // This ignoring of errors does not apply to our general onUncaughtException\n        // method, nor to our `unhandledRejection` handlers, as those are not meant\n        // to receive an \"expected\" error during `assert.throws()`.\n        if (config.current && config.current.ignoreGlobalErrors) {\n          return true;\n        }\n\n        // According to\n        // https://blog.sentry.io/2016/01/04/client-javascript-reporting-window-onerror,\n        // most modern browsers support an errorObj argument; use that to\n        // get a full stack trace if it's available.\n        var error = errorObj || new Error(message);\n        if (!error.stack && fileName && lineNumber) {\n          error.stack = \"\".concat(fileName, \":\").concat(lineNumber);\n        }\n        QUnit.onUncaughtException(error);\n      }\n      return ret;\n    };\n    window$1.addEventListener('unhandledrejection', function (event) {\n      QUnit.onUncaughtException(event.reason);\n    });\n  })();\n\n  /*\n   * This file is a modified version of google-diff-match-patch's JavaScript implementation\n   * (https://code.google.com/p/google-diff-match-patch/source/browse/trunk/javascript/diff_match_patch_uncompressed.js),\n   * modifications are licensed as more fully set forth in LICENSE.txt.\n   *\n   * The original source of google-diff-match-patch is attributable and licensed as follows:\n   *\n   * Copyright 2006 Google Inc.\n   * https://code.google.com/p/google-diff-match-patch/\n   *\n   * Licensed under the Apache License, Version 2.0 (the \"License\");\n   * you may not use this file except in compliance with the License.\n   * You may obtain a copy of the License at\n   *\n   * https://www.apache.org/licenses/LICENSE-2.0\n   *\n   * Unless required by applicable law or agreed to in writing, software\n   * distributed under the License is distributed on an \"AS IS\" BASIS,\n   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n   * See the License for the specific language governing permissions and\n   * limitations under the License.\n   *\n   * More Info:\n   *  https://code.google.com/p/google-diff-match-patch/\n   *\n   * Usage: QUnit.diff(expected, actual)\n   *\n   */\n  QUnit.diff = function () {\n    function DiffMatchPatch() {}\n\n    //  DIFF FUNCTIONS\n\n    /**\n     * The data structure representing a diff is an array of tuples:\n     * [[DIFF_DELETE, 'Hello'], [DIFF_INSERT, 'Goodbye'], [DIFF_EQUAL, ' world.']]\n     * which means: delete 'Hello', add 'Goodbye' and keep ' world.'\n     */\n    var DIFF_DELETE = -1;\n    var DIFF_INSERT = 1;\n    var DIFF_EQUAL = 0;\n    var hasOwn = Object.prototype.hasOwnProperty;\n\n    /**\n     * Find the differences between two texts.  Simplifies the problem by stripping\n     * any common prefix or suffix off the texts before diffing.\n     * @param {string} text1 Old string to be diffed.\n     * @param {string} text2 New string to be diffed.\n     * @param {boolean=} optChecklines Optional speedup flag. If present and false,\n     *     then don't run a line-level diff first to identify the changed areas.\n     *     Defaults to true, which does a faster, slightly less optimal diff.\n     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.\n     */\n    DiffMatchPatch.prototype.DiffMain = function (text1, text2, optChecklines) {\n      // The diff must be complete in up to 1 second.\n      var deadline = Date.now() + 1000;\n\n      // Check for null inputs.\n      if (text1 === null || text2 === null) {\n        throw new Error('Cannot diff null input.');\n      }\n\n      // Check for equality (speedup).\n      if (text1 === text2) {\n        if (text1) {\n          return [[DIFF_EQUAL, text1]];\n        }\n        return [];\n      }\n      if (typeof optChecklines === 'undefined') {\n        optChecklines = true;\n      }\n\n      // Trim off common prefix (speedup).\n      var commonlength = this.diffCommonPrefix(text1, text2);\n      var commonprefix = text1.substring(0, commonlength);\n      text1 = text1.substring(commonlength);\n      text2 = text2.substring(commonlength);\n\n      // Trim off common suffix (speedup).\n      commonlength = this.diffCommonSuffix(text1, text2);\n      var commonsuffix = text1.substring(text1.length - commonlength);\n      text1 = text1.substring(0, text1.length - commonlength);\n      text2 = text2.substring(0, text2.length - commonlength);\n\n      // Compute the diff on the middle block.\n      var diffs = this.diffCompute(text1, text2, optChecklines, deadline);\n\n      // Restore the prefix and suffix.\n      if (commonprefix) {\n        diffs.unshift([DIFF_EQUAL, commonprefix]);\n      }\n      if (commonsuffix) {\n        diffs.push([DIFF_EQUAL, commonsuffix]);\n      }\n      this.diffCleanupMerge(diffs);\n      return diffs;\n    };\n\n    /**\n     * Reduce the number of edits by eliminating operationally trivial equalities.\n     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.\n     */\n    DiffMatchPatch.prototype.diffCleanupEfficiency = function (diffs) {\n      var changes, equalities, equalitiesLength, lastequality, pointer, preIns, preDel, postIns, postDel;\n      changes = false;\n      equalities = []; // Stack of indices where equalities are found.\n      equalitiesLength = 0; // Keeping our own length var is faster in JS.\n      /** @type {?string} */\n      lastequality = null;\n\n      // Always equal to diffs[equalities[equalitiesLength - 1]][1]\n      pointer = 0; // Index of current position.\n\n      // Is there an insertion operation before the last equality.\n      preIns = false;\n\n      // Is there a deletion operation before the last equality.\n      preDel = false;\n\n      // Is there an insertion operation after the last equality.\n      postIns = false;\n\n      // Is there a deletion operation after the last equality.\n      postDel = false;\n      while (pointer < diffs.length) {\n        // Equality found.\n        if (diffs[pointer][0] === DIFF_EQUAL) {\n          if (diffs[pointer][1].length < 4 && (postIns || postDel)) {\n            // Candidate found.\n            equalities[equalitiesLength++] = pointer;\n            preIns = postIns;\n            preDel = postDel;\n            lastequality = diffs[pointer][1];\n          } else {\n            // Not a candidate, and can never become one.\n            equalitiesLength = 0;\n            lastequality = null;\n          }\n          postIns = postDel = false;\n\n          // An insertion or deletion.\n        } else {\n          if (diffs[pointer][0] === DIFF_DELETE) {\n            postDel = true;\n          } else {\n            postIns = true;\n          }\n\n          /*\n           * Five types to be split:\n           * <ins>A</ins><del>B</del>XY<ins>C</ins><del>D</del>\n           * <ins>A</ins>X<ins>C</ins><del>D</del>\n           * <ins>A</ins><del>B</del>X<ins>C</ins>\n           * <ins>A</del>X<ins>C</ins><del>D</del>\n           * <ins>A</ins><del>B</del>X<del>C</del>\n           */\n          if (lastequality && (preIns && preDel && postIns && postDel || lastequality.length < 2 && preIns + preDel + postIns + postDel === 3)) {\n            // Duplicate record.\n            diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);\n\n            // Change second copy to insert.\n            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;\n            equalitiesLength--; // Throw away the equality we just deleted;\n            lastequality = null;\n            if (preIns && preDel) {\n              // No changes made which could affect previous entry, keep going.\n              postIns = postDel = true;\n              equalitiesLength = 0;\n            } else {\n              equalitiesLength--; // Throw away the previous equality.\n              pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;\n              postIns = postDel = false;\n            }\n            changes = true;\n          }\n        }\n        pointer++;\n      }\n      if (changes) {\n        this.diffCleanupMerge(diffs);\n      }\n    };\n\n    /**\n     * Convert a diff array into a pretty HTML report.\n     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.\n     * @param {integer} string to be beautified.\n     * @return {string} HTML representation.\n     */\n    DiffMatchPatch.prototype.diffPrettyHtml = function (diffs) {\n      var html = [];\n      for (var x = 0; x < diffs.length; x++) {\n        var op = diffs[x][0]; // Operation (insert, delete, equal)\n        var data = diffs[x][1]; // Text of change.\n        switch (op) {\n          case DIFF_INSERT:\n            html[x] = '<ins>' + escapeText(data) + '</ins>';\n            break;\n          case DIFF_DELETE:\n            html[x] = '<del>' + escapeText(data) + '</del>';\n            break;\n          case DIFF_EQUAL:\n            html[x] = '<span>' + escapeText(data) + '</span>';\n            break;\n        }\n      }\n      return html.join('');\n    };\n\n    /**\n     * Determine the common prefix of two strings.\n     * @param {string} text1 First string.\n     * @param {string} text2 Second string.\n     * @return {number} The number of characters common to the start of each\n     *     string.\n     */\n    DiffMatchPatch.prototype.diffCommonPrefix = function (text1, text2) {\n      var pointermid, pointermax, pointermin, pointerstart;\n\n      // Quick check for common null cases.\n      if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {\n        return 0;\n      }\n\n      // Binary search.\n      // Performance analysis: https://neil.fraser.name/news/2007/10/09/\n      pointermin = 0;\n      pointermax = Math.min(text1.length, text2.length);\n      pointermid = pointermax;\n      pointerstart = 0;\n      while (pointermin < pointermid) {\n        if (text1.substring(pointerstart, pointermid) === text2.substring(pointerstart, pointermid)) {\n          pointermin = pointermid;\n          pointerstart = pointermin;\n        } else {\n          pointermax = pointermid;\n        }\n        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);\n      }\n      return pointermid;\n    };\n\n    /**\n     * Determine the common suffix of two strings.\n     * @param {string} text1 First string.\n     * @param {string} text2 Second string.\n     * @return {number} The number of characters common to the end of each string.\n     */\n    DiffMatchPatch.prototype.diffCommonSuffix = function (text1, text2) {\n      var pointermid, pointermax, pointermin, pointerend;\n\n      // Quick check for common null cases.\n      if (!text1 || !text2 || text1.charAt(text1.length - 1) !== text2.charAt(text2.length - 1)) {\n        return 0;\n      }\n\n      // Binary search.\n      // Performance analysis: https://neil.fraser.name/news/2007/10/09/\n      pointermin = 0;\n      pointermax = Math.min(text1.length, text2.length);\n      pointermid = pointermax;\n      pointerend = 0;\n      while (pointermin < pointermid) {\n        if (text1.substring(text1.length - pointermid, text1.length - pointerend) === text2.substring(text2.length - pointermid, text2.length - pointerend)) {\n          pointermin = pointermid;\n          pointerend = pointermin;\n        } else {\n          pointermax = pointermid;\n        }\n        pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);\n      }\n      return pointermid;\n    };\n\n    /**\n     * Find the differences between two texts.  Assumes that the texts do not\n     * have any common prefix or suffix.\n     * @param {string} text1 Old string to be diffed.\n     * @param {string} text2 New string to be diffed.\n     * @param {boolean} checklines Speedup flag.  If false, then don't run a\n     *     line-level diff first to identify the changed areas.\n     *     If true, then run a faster, slightly less optimal diff.\n     * @param {number} deadline Time when the diff should be complete by.\n     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffCompute = function (text1, text2, checklines, deadline) {\n      var diffs, longtext, shorttext, i, hm, text1A, text2A, text1B, text2B, midCommon, diffsA, diffsB;\n      if (!text1) {\n        // Just add some text (speedup).\n        return [[DIFF_INSERT, text2]];\n      }\n      if (!text2) {\n        // Just delete some text (speedup).\n        return [[DIFF_DELETE, text1]];\n      }\n      longtext = text1.length > text2.length ? text1 : text2;\n      shorttext = text1.length > text2.length ? text2 : text1;\n      i = longtext.indexOf(shorttext);\n      if (i !== -1) {\n        // Shorter text is inside the longer text (speedup).\n        diffs = [[DIFF_INSERT, longtext.substring(0, i)], [DIFF_EQUAL, shorttext], [DIFF_INSERT, longtext.substring(i + shorttext.length)]];\n\n        // Swap insertions for deletions if diff is reversed.\n        if (text1.length > text2.length) {\n          diffs[0][0] = diffs[2][0] = DIFF_DELETE;\n        }\n        return diffs;\n      }\n      if (shorttext.length === 1) {\n        // Single character string.\n        // After the previous speedup, the character can't be an equality.\n        return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];\n      }\n\n      // Check to see if the problem can be split in two.\n      hm = this.diffHalfMatch(text1, text2);\n      if (hm) {\n        // A half-match was found, sort out the return data.\n        text1A = hm[0];\n        text1B = hm[1];\n        text2A = hm[2];\n        text2B = hm[3];\n        midCommon = hm[4];\n\n        // Send both pairs off for separate processing.\n        diffsA = this.DiffMain(text1A, text2A, checklines, deadline);\n        diffsB = this.DiffMain(text1B, text2B, checklines, deadline);\n\n        // Merge the results.\n        return diffsA.concat([[DIFF_EQUAL, midCommon]], diffsB);\n      }\n      if (checklines && text1.length > 100 && text2.length > 100) {\n        return this.diffLineMode(text1, text2, deadline);\n      }\n      return this.diffBisect(text1, text2, deadline);\n    };\n\n    /**\n     * Do the two texts share a substring which is at least half the length of the\n     * longer text?\n     * This speedup can produce non-minimal diffs.\n     * @param {string} text1 First string.\n     * @param {string} text2 Second string.\n     * @return {Array.<string>} Five element Array, containing the prefix of\n     *     text1, the suffix of text1, the prefix of text2, the suffix of\n     *     text2 and the common middle.  Or null if there was no match.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffHalfMatch = function (text1, text2) {\n      var longtext, shorttext, dmp, text1A, text2B, text2A, text1B, midCommon, hm1, hm2, hm;\n      longtext = text1.length > text2.length ? text1 : text2;\n      shorttext = text1.length > text2.length ? text2 : text1;\n      if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {\n        return null; // Pointless.\n      }\n\n      dmp = this; // 'this' becomes 'window' in a closure.\n\n      /**\n       * Does a substring of shorttext exist within longtext such that the substring\n       * is at least half the length of longtext?\n       * Closure, but does not reference any external variables.\n       * @param {string} longtext Longer string.\n       * @param {string} shorttext Shorter string.\n       * @param {number} i Start index of quarter length substring within longtext.\n       * @return {Array.<string>} Five element Array, containing the prefix of\n       *     longtext, the suffix of longtext, the prefix of shorttext, the suffix\n       *     of shorttext and the common middle.  Or null if there was no match.\n       * @private\n       */\n      function diffHalfMatchI(longtext, shorttext, i) {\n        var seed, j, bestCommon, prefixLength, suffixLength, bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB;\n\n        // Start with a 1/4 length substring at position i as a seed.\n        seed = longtext.substring(i, i + Math.floor(longtext.length / 4));\n        j = -1;\n        bestCommon = '';\n        while ((j = shorttext.indexOf(seed, j + 1)) !== -1) {\n          prefixLength = dmp.diffCommonPrefix(longtext.substring(i), shorttext.substring(j));\n          suffixLength = dmp.diffCommonSuffix(longtext.substring(0, i), shorttext.substring(0, j));\n          if (bestCommon.length < suffixLength + prefixLength) {\n            bestCommon = shorttext.substring(j - suffixLength, j) + shorttext.substring(j, j + prefixLength);\n            bestLongtextA = longtext.substring(0, i - suffixLength);\n            bestLongtextB = longtext.substring(i + prefixLength);\n            bestShorttextA = shorttext.substring(0, j - suffixLength);\n            bestShorttextB = shorttext.substring(j + prefixLength);\n          }\n        }\n        if (bestCommon.length * 2 >= longtext.length) {\n          return [bestLongtextA, bestLongtextB, bestShorttextA, bestShorttextB, bestCommon];\n        } else {\n          return null;\n        }\n      }\n\n      // First check if the second quarter is the seed for a half-match.\n      hm1 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 4));\n\n      // Check again based on the third quarter.\n      hm2 = diffHalfMatchI(longtext, shorttext, Math.ceil(longtext.length / 2));\n      if (!hm1 && !hm2) {\n        return null;\n      } else if (!hm2) {\n        hm = hm1;\n      } else if (!hm1) {\n        hm = hm2;\n      } else {\n        // Both matched.  Select the longest.\n        hm = hm1[4].length > hm2[4].length ? hm1 : hm2;\n      }\n\n      // A half-match was found, sort out the return data.\n      if (text1.length > text2.length) {\n        text1A = hm[0];\n        text1B = hm[1];\n        text2A = hm[2];\n        text2B = hm[3];\n      } else {\n        text2A = hm[0];\n        text2B = hm[1];\n        text1A = hm[2];\n        text1B = hm[3];\n      }\n      midCommon = hm[4];\n      return [text1A, text1B, text2A, text2B, midCommon];\n    };\n\n    /**\n     * Do a quick line-level diff on both strings, then rediff the parts for\n     * greater accuracy.\n     * This speedup can produce non-minimal diffs.\n     * @param {string} text1 Old string to be diffed.\n     * @param {string} text2 New string to be diffed.\n     * @param {number} deadline Time when the diff should be complete by.\n     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffLineMode = function (text1, text2, deadline) {\n      var a, diffs, linearray, pointer, countInsert, countDelete, textInsert, textDelete, j;\n\n      // Scan the text on a line-by-line basis first.\n      a = this.diffLinesToChars(text1, text2);\n      text1 = a.chars1;\n      text2 = a.chars2;\n      linearray = a.lineArray;\n      diffs = this.DiffMain(text1, text2, false, deadline);\n\n      // Convert the diff back to original text.\n      this.diffCharsToLines(diffs, linearray);\n\n      // Eliminate freak matches (e.g. blank lines)\n      this.diffCleanupSemantic(diffs);\n\n      // Rediff any replacement blocks, this time character-by-character.\n      // Add a dummy entry at the end.\n      diffs.push([DIFF_EQUAL, '']);\n      pointer = 0;\n      countDelete = 0;\n      countInsert = 0;\n      textDelete = '';\n      textInsert = '';\n      while (pointer < diffs.length) {\n        switch (diffs[pointer][0]) {\n          case DIFF_INSERT:\n            countInsert++;\n            textInsert += diffs[pointer][1];\n            break;\n          case DIFF_DELETE:\n            countDelete++;\n            textDelete += diffs[pointer][1];\n            break;\n          case DIFF_EQUAL:\n            // Upon reaching an equality, check for prior redundancies.\n            if (countDelete >= 1 && countInsert >= 1) {\n              // Delete the offending records and add the merged ones.\n              diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert);\n              pointer = pointer - countDelete - countInsert;\n              a = this.DiffMain(textDelete, textInsert, false, deadline);\n              for (j = a.length - 1; j >= 0; j--) {\n                diffs.splice(pointer, 0, a[j]);\n              }\n              pointer = pointer + a.length;\n            }\n            countInsert = 0;\n            countDelete = 0;\n            textDelete = '';\n            textInsert = '';\n            break;\n        }\n        pointer++;\n      }\n      diffs.pop(); // Remove the dummy entry at the end.\n\n      return diffs;\n    };\n\n    /**\n     * Find the 'middle snake' of a diff, split the problem in two\n     * and return the recursively constructed diff.\n     * See Myers 1986 paper: An O(ND) Difference Algorithm and Its Variations.\n     * @param {string} text1 Old string to be diffed.\n     * @param {string} text2 New string to be diffed.\n     * @param {number} deadline Time at which to bail if not yet complete.\n     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffBisect = function (text1, text2, deadline) {\n      var text1Length, text2Length, maxD, vOffset, vLength, v1, v2, x, delta, front, k1start, k1end, k2start, k2end, k2Offset, k1Offset, x1, x2, y1, y2, d, k1, k2;\n\n      // Cache the text lengths to prevent multiple calls.\n      text1Length = text1.length;\n      text2Length = text2.length;\n      maxD = Math.ceil((text1Length + text2Length) / 2);\n      vOffset = maxD;\n      vLength = 2 * maxD;\n      v1 = new Array(vLength);\n      v2 = new Array(vLength);\n\n      // Setting all elements to -1 is faster in Chrome & Firefox than mixing\n      // integers and undefined.\n      for (x = 0; x < vLength; x++) {\n        v1[x] = -1;\n        v2[x] = -1;\n      }\n      v1[vOffset + 1] = 0;\n      v2[vOffset + 1] = 0;\n      delta = text1Length - text2Length;\n\n      // If the total number of characters is odd, then the front path will collide\n      // with the reverse path.\n      front = delta % 2 !== 0;\n\n      // Offsets for start and end of k loop.\n      // Prevents mapping of space beyond the grid.\n      k1start = 0;\n      k1end = 0;\n      k2start = 0;\n      k2end = 0;\n      for (d = 0; d < maxD; d++) {\n        // Bail out if deadline is reached.\n        if (Date.now() > deadline) {\n          break;\n        }\n\n        // Walk the front path one step.\n        for (k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {\n          k1Offset = vOffset + k1;\n          if (k1 === -d || k1 !== d && v1[k1Offset - 1] < v1[k1Offset + 1]) {\n            x1 = v1[k1Offset + 1];\n          } else {\n            x1 = v1[k1Offset - 1] + 1;\n          }\n          y1 = x1 - k1;\n          while (x1 < text1Length && y1 < text2Length && text1.charAt(x1) === text2.charAt(y1)) {\n            x1++;\n            y1++;\n          }\n          v1[k1Offset] = x1;\n          if (x1 > text1Length) {\n            // Ran off the right of the graph.\n            k1end += 2;\n          } else if (y1 > text2Length) {\n            // Ran off the bottom of the graph.\n            k1start += 2;\n          } else if (front) {\n            k2Offset = vOffset + delta - k1;\n            if (k2Offset >= 0 && k2Offset < vLength && v2[k2Offset] !== -1) {\n              // Mirror x2 onto top-left coordinate system.\n              x2 = text1Length - v2[k2Offset];\n              if (x1 >= x2) {\n                // Overlap detected.\n                return this.diffBisectSplit(text1, text2, x1, y1, deadline);\n              }\n            }\n          }\n        }\n\n        // Walk the reverse path one step.\n        for (k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {\n          k2Offset = vOffset + k2;\n          if (k2 === -d || k2 !== d && v2[k2Offset - 1] < v2[k2Offset + 1]) {\n            x2 = v2[k2Offset + 1];\n          } else {\n            x2 = v2[k2Offset - 1] + 1;\n          }\n          y2 = x2 - k2;\n          while (x2 < text1Length && y2 < text2Length && text1.charAt(text1Length - x2 - 1) === text2.charAt(text2Length - y2 - 1)) {\n            x2++;\n            y2++;\n          }\n          v2[k2Offset] = x2;\n          if (x2 > text1Length) {\n            // Ran off the left of the graph.\n            k2end += 2;\n          } else if (y2 > text2Length) {\n            // Ran off the top of the graph.\n            k2start += 2;\n          } else if (!front) {\n            k1Offset = vOffset + delta - k2;\n            if (k1Offset >= 0 && k1Offset < vLength && v1[k1Offset] !== -1) {\n              x1 = v1[k1Offset];\n              y1 = vOffset + x1 - k1Offset;\n\n              // Mirror x2 onto top-left coordinate system.\n              x2 = text1Length - x2;\n              if (x1 >= x2) {\n                // Overlap detected.\n                return this.diffBisectSplit(text1, text2, x1, y1, deadline);\n              }\n            }\n          }\n        }\n      }\n\n      // Diff took too long and hit the deadline or\n      // number of diffs equals number of characters, no commonality at all.\n      return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];\n    };\n\n    /**\n     * Given the location of the 'middle snake', split the diff in two parts\n     * and recurse.\n     * @param {string} text1 Old string to be diffed.\n     * @param {string} text2 New string to be diffed.\n     * @param {number} x Index of split point in text1.\n     * @param {number} y Index of split point in text2.\n     * @param {number} deadline Time at which to bail if not yet complete.\n     * @return {!Array.<!DiffMatchPatch.Diff>} Array of diff tuples.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffBisectSplit = function (text1, text2, x, y, deadline) {\n      var text1a, text1b, text2a, text2b, diffs, diffsb;\n      text1a = text1.substring(0, x);\n      text2a = text2.substring(0, y);\n      text1b = text1.substring(x);\n      text2b = text2.substring(y);\n\n      // Compute both diffs serially.\n      diffs = this.DiffMain(text1a, text2a, false, deadline);\n      diffsb = this.DiffMain(text1b, text2b, false, deadline);\n      return diffs.concat(diffsb);\n    };\n\n    /**\n     * Reduce the number of edits by eliminating semantically trivial equalities.\n     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.\n     */\n    DiffMatchPatch.prototype.diffCleanupSemantic = function (diffs) {\n      var changes = false;\n      var equalities = []; // Stack of indices where equalities are found.\n      var equalitiesLength = 0; // Keeping our own length var is faster in JS.\n      /** @type {?string} */\n      var lastequality = null;\n\n      // Always equal to diffs[equalities[equalitiesLength - 1]][1]\n      var pointer = 0; // Index of current position.\n\n      // Number of characters that changed prior to the equality.\n      var lengthInsertions1 = 0;\n      var lengthDeletions1 = 0;\n\n      // Number of characters that changed after the equality.\n      var lengthInsertions2 = 0;\n      var lengthDeletions2 = 0;\n      while (pointer < diffs.length) {\n        if (diffs[pointer][0] === DIFF_EQUAL) {\n          // Equality found.\n          equalities[equalitiesLength++] = pointer;\n          lengthInsertions1 = lengthInsertions2;\n          lengthDeletions1 = lengthDeletions2;\n          lengthInsertions2 = 0;\n          lengthDeletions2 = 0;\n          lastequality = diffs[pointer][1];\n        } else {\n          // An insertion or deletion.\n          if (diffs[pointer][0] === DIFF_INSERT) {\n            lengthInsertions2 += diffs[pointer][1].length;\n          } else {\n            lengthDeletions2 += diffs[pointer][1].length;\n          }\n\n          // Eliminate an equality that is smaller or equal to the edits on both\n          // sides of it.\n          if (lastequality && lastequality.length <= Math.max(lengthInsertions1, lengthDeletions1) && lastequality.length <= Math.max(lengthInsertions2, lengthDeletions2)) {\n            // Duplicate record.\n            diffs.splice(equalities[equalitiesLength - 1], 0, [DIFF_DELETE, lastequality]);\n\n            // Change second copy to insert.\n            diffs[equalities[equalitiesLength - 1] + 1][0] = DIFF_INSERT;\n\n            // Throw away the equality we just deleted.\n            equalitiesLength--;\n\n            // Throw away the previous equality (it needs to be reevaluated).\n            equalitiesLength--;\n            pointer = equalitiesLength > 0 ? equalities[equalitiesLength - 1] : -1;\n\n            // Reset the counters.\n            lengthInsertions1 = 0;\n            lengthDeletions1 = 0;\n            lengthInsertions2 = 0;\n            lengthDeletions2 = 0;\n            lastequality = null;\n            changes = true;\n          }\n        }\n        pointer++;\n      }\n\n      // Normalize the diff.\n      if (changes) {\n        this.diffCleanupMerge(diffs);\n      }\n      var deletion, insertion, overlapLength1, overlapLength2;\n\n      // Find any overlaps between deletions and insertions.\n      // e.g: <del>abcxxx</del><ins>xxxdef</ins>\n      //   -> <del>abc</del>xxx<ins>def</ins>\n      // e.g: <del>xxxabc</del><ins>defxxx</ins>\n      //   -> <ins>def</ins>xxx<del>abc</del>\n      // Only extract an overlap if it is as big as the edit ahead or behind it.\n      pointer = 1;\n      while (pointer < diffs.length) {\n        if (diffs[pointer - 1][0] === DIFF_DELETE && diffs[pointer][0] === DIFF_INSERT) {\n          deletion = diffs[pointer - 1][1];\n          insertion = diffs[pointer][1];\n          overlapLength1 = this.diffCommonOverlap(deletion, insertion);\n          overlapLength2 = this.diffCommonOverlap(insertion, deletion);\n          if (overlapLength1 >= overlapLength2) {\n            if (overlapLength1 >= deletion.length / 2 || overlapLength1 >= insertion.length / 2) {\n              // Overlap found.  Insert an equality and trim the surrounding edits.\n              diffs.splice(pointer, 0, [DIFF_EQUAL, insertion.substring(0, overlapLength1)]);\n              diffs[pointer - 1][1] = deletion.substring(0, deletion.length - overlapLength1);\n              diffs[pointer + 1][1] = insertion.substring(overlapLength1);\n              pointer++;\n            }\n          } else {\n            if (overlapLength2 >= deletion.length / 2 || overlapLength2 >= insertion.length / 2) {\n              // Reverse overlap found.\n              // Insert an equality and swap and trim the surrounding edits.\n              diffs.splice(pointer, 0, [DIFF_EQUAL, deletion.substring(0, overlapLength2)]);\n              diffs[pointer - 1][0] = DIFF_INSERT;\n              diffs[pointer - 1][1] = insertion.substring(0, insertion.length - overlapLength2);\n              diffs[pointer + 1][0] = DIFF_DELETE;\n              diffs[pointer + 1][1] = deletion.substring(overlapLength2);\n              pointer++;\n            }\n          }\n          pointer++;\n        }\n        pointer++;\n      }\n    };\n\n    /**\n     * Determine if the suffix of one string is the prefix of another.\n     * @param {string} text1 First string.\n     * @param {string} text2 Second string.\n     * @return {number} The number of characters common to the end of the first\n     *     string and the start of the second string.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffCommonOverlap = function (text1, text2) {\n      // Cache the text lengths to prevent multiple calls.\n      var text1Length = text1.length;\n      var text2Length = text2.length;\n\n      // Eliminate the null case.\n      if (text1Length === 0 || text2Length === 0) {\n        return 0;\n      }\n\n      // Truncate the longer string.\n      if (text1Length > text2Length) {\n        text1 = text1.substring(text1Length - text2Length);\n      } else if (text1Length < text2Length) {\n        text2 = text2.substring(0, text1Length);\n      }\n      var textLength = Math.min(text1Length, text2Length);\n\n      // Quick check for the worst case.\n      if (text1 === text2) {\n        return textLength;\n      }\n\n      // Start by looking for a single character match\n      // and increase length until no match is found.\n      // Performance analysis: https://neil.fraser.name/news/2010/11/04/\n      var best = 0;\n      var length = 1;\n      while (true) {\n        var pattern = text1.substring(textLength - length);\n        var found = text2.indexOf(pattern);\n        if (found === -1) {\n          return best;\n        }\n        length += found;\n        if (found === 0 || text1.substring(textLength - length) === text2.substring(0, length)) {\n          best = length;\n          length++;\n        }\n      }\n    };\n\n    /**\n     * Split two texts into an array of strings.  Reduce the texts to a string of\n     * hashes where each Unicode character represents one line.\n     * @param {string} text1 First string.\n     * @param {string} text2 Second string.\n     * @return {{chars1: string, chars2: string, lineArray: !Array.<string>}}\n     *     An object containing the encoded text1, the encoded text2 and\n     *     the array of unique strings.\n     *     The zeroth element of the array of unique strings is intentionally blank.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffLinesToChars = function (text1, text2) {\n      var lineArray = []; // E.g. lineArray[4] === 'Hello\\n'\n      var lineHash = {}; // E.g. lineHash['Hello\\n'] === 4\n\n      // '\\x00' is a valid character, but various debuggers don't like it.\n      // So we'll insert a junk entry to avoid generating a null character.\n      lineArray[0] = '';\n\n      /**\n       * Split a text into an array of strings.  Reduce the texts to a string of\n       * hashes where each Unicode character represents one line.\n       * Modifies linearray and linehash through being a closure.\n       * @param {string} text String to encode.\n       * @return {string} Encoded string.\n       * @private\n       */\n      function diffLinesToCharsMunge(text) {\n        var chars = '';\n\n        // Walk the text, pulling out a substring for each line.\n        // text.split('\\n') would would temporarily double our memory footprint.\n        // Modifying text would create many large strings to garbage collect.\n        var lineStart = 0;\n        var lineEnd = -1;\n\n        // Keeping our own length variable is faster than looking it up.\n        var lineArrayLength = lineArray.length;\n        while (lineEnd < text.length - 1) {\n          lineEnd = text.indexOf('\\n', lineStart);\n          if (lineEnd === -1) {\n            lineEnd = text.length - 1;\n          }\n          var line = text.substring(lineStart, lineEnd + 1);\n          lineStart = lineEnd + 1;\n          if (hasOwn.call(lineHash, line)) {\n            chars += String.fromCharCode(lineHash[line]);\n          } else {\n            chars += String.fromCharCode(lineArrayLength);\n            lineHash[line] = lineArrayLength;\n            lineArray[lineArrayLength++] = line;\n          }\n        }\n        return chars;\n      }\n      var chars1 = diffLinesToCharsMunge(text1);\n      var chars2 = diffLinesToCharsMunge(text2);\n      return {\n        chars1: chars1,\n        chars2: chars2,\n        lineArray: lineArray\n      };\n    };\n\n    /**\n     * Rehydrate the text in a diff from a string of line hashes to real lines of\n     * text.\n     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.\n     * @param {!Array.<string>} lineArray Array of unique strings.\n     * @private\n     */\n    DiffMatchPatch.prototype.diffCharsToLines = function (diffs, lineArray) {\n      for (var x = 0; x < diffs.length; x++) {\n        var chars = diffs[x][1];\n        var text = [];\n        for (var y = 0; y < chars.length; y++) {\n          text[y] = lineArray[chars.charCodeAt(y)];\n        }\n        diffs[x][1] = text.join('');\n      }\n    };\n\n    /**\n     * Reorder and merge like edit sections.  Merge equalities.\n     * Any edit section can move as long as it doesn't cross an equality.\n     * @param {!Array.<!DiffMatchPatch.Diff>} diffs Array of diff tuples.\n     */\n    DiffMatchPatch.prototype.diffCleanupMerge = function (diffs) {\n      diffs.push([DIFF_EQUAL, '']); // Add a dummy entry at the end.\n      var pointer = 0;\n      var countDelete = 0;\n      var countInsert = 0;\n      var textDelete = '';\n      var textInsert = '';\n      while (pointer < diffs.length) {\n        switch (diffs[pointer][0]) {\n          case DIFF_INSERT:\n            countInsert++;\n            textInsert += diffs[pointer][1];\n            pointer++;\n            break;\n          case DIFF_DELETE:\n            countDelete++;\n            textDelete += diffs[pointer][1];\n            pointer++;\n            break;\n          case DIFF_EQUAL:\n            // Upon reaching an equality, check for prior redundancies.\n            if (countDelete + countInsert > 1) {\n              if (countDelete !== 0 && countInsert !== 0) {\n                // Factor out any common prefixes.\n                var commonlength = this.diffCommonPrefix(textInsert, textDelete);\n                if (commonlength !== 0) {\n                  if (pointer - countDelete - countInsert > 0 && diffs[pointer - countDelete - countInsert - 1][0] === DIFF_EQUAL) {\n                    diffs[pointer - countDelete - countInsert - 1][1] += textInsert.substring(0, commonlength);\n                  } else {\n                    diffs.splice(0, 0, [DIFF_EQUAL, textInsert.substring(0, commonlength)]);\n                    pointer++;\n                  }\n                  textInsert = textInsert.substring(commonlength);\n                  textDelete = textDelete.substring(commonlength);\n                }\n\n                // Factor out any common suffixies.\n                commonlength = this.diffCommonSuffix(textInsert, textDelete);\n                if (commonlength !== 0) {\n                  diffs[pointer][1] = textInsert.substring(textInsert.length - commonlength) + diffs[pointer][1];\n                  textInsert = textInsert.substring(0, textInsert.length - commonlength);\n                  textDelete = textDelete.substring(0, textDelete.length - commonlength);\n                }\n              }\n\n              // Delete the offending records and add the merged ones.\n              if (countDelete === 0) {\n                diffs.splice(pointer - countInsert, countDelete + countInsert, [DIFF_INSERT, textInsert]);\n              } else if (countInsert === 0) {\n                diffs.splice(pointer - countDelete, countDelete + countInsert, [DIFF_DELETE, textDelete]);\n              } else {\n                diffs.splice(pointer - countDelete - countInsert, countDelete + countInsert, [DIFF_DELETE, textDelete], [DIFF_INSERT, textInsert]);\n              }\n              pointer = pointer - countDelete - countInsert + (countDelete ? 1 : 0) + (countInsert ? 1 : 0) + 1;\n            } else if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {\n              // Merge this equality with the previous one.\n              diffs[pointer - 1][1] += diffs[pointer][1];\n              diffs.splice(pointer, 1);\n            } else {\n              pointer++;\n            }\n            countInsert = 0;\n            countDelete = 0;\n            textDelete = '';\n            textInsert = '';\n            break;\n        }\n      }\n      if (diffs[diffs.length - 1][1] === '') {\n        diffs.pop(); // Remove the dummy entry at the end.\n      }\n\n      // Second pass: look for single edits surrounded on both sides by equalities\n      // which can be shifted sideways to eliminate an equality.\n      // e.g: A<ins>BA</ins>C -> <ins>AB</ins>AC\n      var changes = false;\n      pointer = 1;\n\n      // Intentionally ignore the first and last element (don't need checking).\n      while (pointer < diffs.length - 1) {\n        if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {\n          var diffPointer = diffs[pointer][1];\n          var position = diffPointer.substring(diffPointer.length - diffs[pointer - 1][1].length);\n\n          // This is a single edit surrounded by equalities.\n          if (position === diffs[pointer - 1][1]) {\n            // Shift the edit over the previous equality.\n            diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);\n            diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];\n            diffs.splice(pointer - 1, 1);\n            changes = true;\n          } else if (diffPointer.substring(0, diffs[pointer + 1][1].length) === diffs[pointer + 1][1]) {\n            // Shift the edit over the next equality.\n            diffs[pointer - 1][1] += diffs[pointer + 1][1];\n            diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];\n            diffs.splice(pointer + 1, 1);\n            changes = true;\n          }\n        }\n        pointer++;\n      }\n\n      // If shifts were made, the diff needs reordering and another shift sweep.\n      if (changes) {\n        this.diffCleanupMerge(diffs);\n      }\n    };\n    return function (o, n) {\n      var diff, output, text;\n      diff = new DiffMatchPatch();\n      output = diff.DiffMain(o, n);\n      diff.diffCleanupEfficiency(output);\n      text = diff.diffPrettyHtml(output);\n      return text;\n    };\n  }();\n})();\n/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(/*! ./../../webpack/buildin/module.js */ \"./node_modules/webpack/buildin/module.js\")(module)))\n\n//# sourceURL=webpack://__ember_auto_import__/./node_modules/qunit/qunit/qunit.js?");

/***/ }),

/***/ "./node_modules/webpack/buildin/module.js":
/*!***********************************!*\
  !*** (webpack)/buildin/module.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = function (module) {\n  if (!module.webpackPolyfill) {\n    module.deprecate = function () {};\n    module.paths = [];\n    // module.parent = undefined by default\n    if (!module.children) module.children = [];\n    Object.defineProperty(module, \"loaded\", {\n      enumerable: true,\n      get: function () {\n        return module.l;\n      }\n    });\n    Object.defineProperty(module, \"id\", {\n      enumerable: true,\n      get: function () {\n        return module.i;\n      }\n    });\n    module.webpackPolyfill = 1;\n  }\n  return module;\n};\n\n//# sourceURL=webpack://__ember_auto_import__/(webpack)/buildin/module.js?");

/***/ })

}]);//# sourceMappingURL=test-support.map
