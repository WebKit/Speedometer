## Description

Chat applications are an extremely common class of web app, and switching
between rooms/channels is one of their most frequent and performance-sensitive
interactions: the previous conversation's timeline is torn down and a new,
often long, timeline of rich messages is rendered in its place.

This workload is an original, self-contained React app that reproduces that
interaction. It is **not** derived from any existing chat product's source code
and ships no third-party assets, so it is free of licensing and trademark
concerns.

## What are we testing

-   React reconciliation cost of repeatedly mounting/unmounting a large timeline
-   DOM churn and layout when switching between rooms
-   Flex/grid layout of a typical two-pane chat UI with many small components
    (avatars, sender names, timestamps, message bodies)

## How are we testing

The app renders a sidebar of rooms and, for the selected room, a timeline of
messages. All content is generated deterministically at load time (no network,
no backend, no `Math.random`/`Date.now`), so every run renders identical data.

The timed step (`SwitchRooms`) clicks through the rooms in the sidebar in turn.
Each room's timeline is keyed by room id, so a switch fully unmounts the old
timeline and mounts the new one.

## Developer Documentation

The app was created with Vite + React. It can be previewed during development
with `npm run dev`. To update the files run in the harness you have to run
`npm run build`, which regenerates the committed `dist/` directory.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatRoom-React`, or directly at
`http://localhost:8080/experimental/chat-room/dist/index.html`.
