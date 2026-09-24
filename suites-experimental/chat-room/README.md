## Description

Chat applications are an extremely common class of web app, and switching
between rooms/channels is one of their most frequent and performance-sensitive
interactions: the previous conversation's timeline is torn down and a new,
often long, timeline of rich messages is rendered in its place.

Reading back through a conversation is the other one, and on a room this long it
is not a plain scroll: the timeline is windowed, so every offset mounts rows
whose height is not known until they have been laid out.

This workload is an original, self-contained React app that reproduces those
interactions. It is **not** derived from any existing chat product's source code
and ships no third-party assets, so it is free of licensing and trademark
concerns.

## What are we testing

-   React reconciliation cost of repeatedly mounting/unmounting a large timeline
-   DOM churn and layout when switching between rooms
-   Windowed scrolling that measures rows only after mounting them, and corrects
    the scroll position against what they measured
-   Anchoring the viewport when a page of older messages is inserted above it
-   Flex/grid layout of a typical two-pane chat UI with many small components
    (avatars, sender names, timestamps, message bodies)

## How are we testing

The app renders a sidebar of rooms and, for the selected room, a windowed
timeline of its 1500 messages. A room opens on its newest page and loads older
ones as the reader goes back, the way a real client does. All content is
generated deterministically at load time (no network, no backend, no
`Math.random`/`Date.now`), so every run renders identical data.

`ScrollTimeline` reads back through a room's history, first a viewport at a time
and then in the long strides that dragging the scrollbar produces. The two cover
opposite halves of the height model: the short steps land on rows that have
already been measured and are being recycled, the strides on rows that have only
ever been estimated.

`SwitchRooms` clicks through the rooms in the sidebar in turn. Each room's
timeline is keyed by room id, so a switch fully unmounts the old timeline and
mounts the new one.

`LoadOlderMessages` reads back past the start of the loaded history, which
fetches the next page and inserts it above the viewport. The timeline anchors
itself, correcting its own offset once the new rows have been measured, so
`overflow-anchor` is off and the work is the workload's own rather than the
browser's.

## Developer Documentation

The app was created with Vite + React. It can be previewed during development
with `npm run dev`. To update the files run in the harness you have to run
`npm run build`, which regenerates the committed `dist/` directory.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatRoom-React`, or directly at
`http://localhost:8080/experimental/chat-room/dist/index.html`.
