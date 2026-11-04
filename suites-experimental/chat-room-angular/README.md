## Description

An Angular port of the [ChatRoom-React](../chat-room/README.md) workload: the same
two-pane chat app, the same deterministic fixtures, the same windowed timeline,
and the same measured steps, so the three ports can be compared directly.

`src/data/`, `src/row-heights.js` and `src/styles.css` are copies of the React
workload's files and should be kept in sync with them. `src/types.ts` describes
the shapes `src/data/rooms.js` builds. The components are standalone, OnPush,
signal-based components that render the same DOM as the React version, row for
row and pixel for pixel. Every component uses an attribute selector
(`li[chat-message]`, `ol[chat-timeline]`, ...) so that its host element _is_ the
element the other ports render, rather than a wrapper around it.

## What are we testing

The same interactions as ChatRoom-React (see its README), through Angular's
change detection instead of React's reconciliation:

-   Creating and destroying a large timeline view: a one-item `@for` tracked by
    room id stands in for React's `key`
-   `@for` diffing as the timeline window moves, with signal inputs on every row
-   An `afterRenderEffect` that measures the mounted rows after each render and
    corrects the scroll position, rerunning within the same tick until the
    measurements settle, in place of React's `useLayoutEffect` loop

## How are we testing

The suite shares its steps (`ScrollTimeline`, `SwitchRooms`,
`LoadOlderMessages`) with ChatRoom-React, see `suites-experimental/suites.mjs`.

The app uses zone.js rather than zoneless change detection. The steps yield a
MessageChannel task between interactions and expect each update to have rendered
by then, which holds for React and Svelte. Zoneless Angular renders in a
setTimeout/requestAnimationFrame race instead, and in Firefox that regularly
lands after the yield, so consecutive interactions coalesce and the suite would
measure less work than the other ports. With zone.js, and without event
coalescing, Angular renders synchronously once the event handler returns.

## Developer Documentation

The app was created with the Angular CLI. It can be previewed during development
with `npm run dev`. To update the files run in the harness you have to run
`npm run build`, which regenerates the committed `dist/` directory and its
`resources.txt`.

The repository's Prettier predates Angular's control flow syntax and would
mangle the inline templates, so `.prettierrc` turns off embedded formatting for
this workload's TypeScript files.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatRoom-Angular`, or directly at
`http://localhost:8080/suites-experimental/chat-room-angular/dist/index.html`.
