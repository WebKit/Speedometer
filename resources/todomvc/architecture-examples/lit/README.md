# Lit TodoMVC Example

> Lit is a simple library for building fast, lightweight web components.

See [lit.dev](https://lit.dev) for more information

## Implementation

The Lit example uses [web components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) to create new HTML elements that are interoperable and encapsulated. This means that the DOM is slightly different from other implementations as it contains custom elements like `<todo-list>`, and component DOM is isolated inside shadow roots. The Lit implementation also uses shadow DOM's style scoping, so it has divided us the CSS into separate modules containing only whats needed for each component (TODO).

### State management

This implementation doesn't use a state management library. It models the Todo data as a class that extends EventTarget. As that class is passed to components, they listen for changes via the `'change'` event.

Many other state management solutions are possible with Lit, including Redux, MobX, various signals libraries, etc. Using a plain class is just one of the simplest options, that's as vanilla as possible.

Mutations are made centrally by the app component. Other components fire events to notify the app of change requests.

### Shadow DOM and Speedometer

The speedometer TodoMVC tests typically interact directly with DOM elements, emulating typing into the `<input>` and clicking on buttons and checkboxes, etc. Because Lit uses the Shadow DOM, this code lives in this app and the benchmark code simply dispatches `speedometer-*` events on the `<todo-app>` element, which then calls the same APIs that speedometer usually would to emulate the requested user input.

## Building and running this example

1. `npm ci`
2. `npm run serve --watch`
3. Navigate your browser to http://localhost:8000/ for the debug build or http://localhost:8000/dist/ for the optimized build.

If you just want to rebuild the code, simply run `npm run build`. This is automatically run as needed when running `npm run serve --watch`.
