## Description

Social feeds are among the most used pages on the web. A reader scrolls a long,
virtualized list of rich stories, opens one to read its comments, types a reply,
visits a profile and goes back, and searches, all on a page that also runs a
lot of instrumentation: every callback is wrapped, every interaction is timed,
and a steady stream of analytics events is batched, compressed and sent.

This workload is an original, self-contained React 19 app built to reproduce
that mix. It was modeled on the kind of work a large production feed does,
measured from the outside with performance traces, and is **not** derived from
any existing product's source code. It ships no third-party assets: all names,
text and pictures are generated or written for it.

## What are we testing

-   React reconciliation of deep, many-component stories, mounting and
    unmounting as a virtualized feed scrolls, with layout effects that measure
    each unit
-   A normalized client cache fed by streamed, chunked responses with deferred
    fragments, and per-record subscriptions through `useSyncExternalStore`
-   Transitions for page navigation, and synchronous scroll-driven updates
    (`flushSync`) for the feed window
-   Forced layout from viewability checks (`getBoundingClientRect`,
    `elementFromPoint`), auto-growing text areas and scroll-depth tracking
-   Analytics work: error-guard wrappers, event enrichment, sampling, batching,
    LZW compression and checksums, User Timing marks and feature-gate exposures
-   Many small atomic CSS classes per element (Tailwind), masked SVG avatars
    and generated SVG photos

## How are we testing

All content is generated deterministically at load time from fixed seeds (no
`Math.random`, no `Date.now`). An in-page server answers each query with
GraphQL-shaped JSON split into chunks, delivered one task apiece through a
`MessageChannel`, so every iteration renders identical data without a network.

The app fires a window event when the result of an interaction has committed
(`feed-page-loaded`, `post-dialog-ready`, `search-results`, …), and the steps
wait on those instead of on timers.

-   `RefreshHomeFeed`: clicks Home while on the home page, which fetches a new
    ranking and remounts the feed.
-   `LoadMoreStories`: reads down the feed one story at a time, loading the next
    page whenever the end comes into range.
-   `ExpandStoryTexts`: scrolls back to the top, expanding every truncated story.
-   `OpenPostDialog`: opens a busy thread in the post dialog.
-   `ExpandCommentReplies`: expands every reply thread on the first page.
-   `ChangeCommentOrder`: switches the comment order to "All comments".
-   `LoadMoreComments`: scrolls the dialog to load more pages of comments.
-   `TypeComment`: types a comment key by key, with a mention typeahead,
    emoticon replacement and highlighting.
-   `ClosePostDialog`: closes the dialog and restores focus.
-   `OpenOwnProfile`: navigates to the viewer's profile and scrolls through it.
-   `BackToHomeFeed`: returns to the cached home feed at its old position.
-   `SearchTypeahead`: types a name into search; each key filters the local
    index and asks the server.
-   `OpenHeaderMenus`: opens and closes the menu, chats, notifications and
    account popovers.

## Developer Documentation

The app was created with Vite + React 19 and Tailwind CSS. It can be previewed
during development with `npm run dev`. To update the files run in the harness
you have to run `npm run build`, which regenerates the committed `dist/`
directory.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=SocialNetwork-React`, or directly at
`http://localhost:8080/suites-experimental/social-network/dist/index.html`.
