## Description

A Svelte 5 port of the [ChatRoom-React](../chat-room/README.md) workload: the same
two-pane chat app, the same deterministic fixtures, the same windowed timeline,
and the same measured steps, so the two can be compared directly.

`src/data/`, `src/row-heights.js` and `src/styles.css` are copies of the React
workload's files and should be kept in sync with them. The components are
rewritten with runes, and render the same DOM as the React version, row for row
and pixel for pixel.

## What are we testing

The same interactions as ChatRoom-React (see its README), through Svelte's
fine-grained reactivity instead of React's reconciliation:

-   Mounting and destroying a large keyed timeline (`{#key}` on the room id)
-   Keyed `{#each}` updates as the timeline window moves
-   An `$effect` that measures the mounted rows after each update and corrects the
    scroll position, rerunning until the measurements settle, in place of
    React's `useLayoutEffect` loop

## How are we testing

The suite shares its steps (`ScrollTimeline`, `SwitchRooms`,
`LoadOlderMessages`) with ChatRoom-React, see `suites-experimental/suites.mjs`.

## Developer Documentation

The app was created with Vite + Svelte. It can be previewed during development
with `npm run dev`. To update the files run in the harness you have to run
`npm run build`, which regenerates the committed `dist/` directory.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatRoom-Svelte`, or directly at
`http://localhost:8080/suites-experimental/chat-room-svelte/dist/index.html`.
