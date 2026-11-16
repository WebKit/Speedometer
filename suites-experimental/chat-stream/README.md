# ChatStream

An LLM chat client: a sidebar of conversations, a message list, and a
composer, with assistant replies streamed in a few tokens at a time and
rendered as Markdown. It is written in Octane (`octane/App.tsrx`,
ChatStream-Octane). The corpus, Markdown parser, network stub and stylesheet
are in `shared/`.

It is an original app and ships no third-party assets. It is adapted from the
`chat-stream` benchmark in the Octane repository, with Markdown replies, code
highlighting and scroll pinning added.

## What are we testing

-   Streaming: chunks append to the reply's text, and rendering re-parses the
    reply's Markdown. Unchanged blocks keep their identity across parses (the
    memoized-Markdown pattern streaming chat UIs use), so `memo` skips all but
    the blocks that grew.
-   Context reads in memoized components, of the kinds the reply renderer of
    a large chat service's web app reads (from its production bundle,
    November 2026):
    -   Layout flow. A reply and each list provide a new flow value every
        time they render, with each child's previous sibling; each block's
        wrapper and each list item read it and compute their spacing with
        that renderer's spacing rules. So on every chunk every block's
        wrapper re-renders, while `memo` skips the content of all but the
        blocks that grew.
    -   The colour scheme, read by code blocks and inline code.
    -   Streamed words. Text in a reply that streams in renders one memoized
        span per word. Each word reads four animation contexts (whether to
        animate, whether the reply is eligible, the animation mode, and a
        delay scheduler) and starts its fade-in from a layout effect with
        the delay the scheduler gives it, the way that renderer staggers
        words. Replies that are complete when they mount render their text
        as is.
-   Code blocks highlighted into one span per token, the way chat UIs' regex
    highlighters produce them.
-   Scroll pinning with CSS scroll anchoring: an anchor element after the
    messages (the list's only `overflow-anchor: auto` candidate) keeps the
    newest text in view as replies grow and conversations switch. The browser
    adjusts the scroll position during its own layout, so no script reads
    layout after a commit.
-   Mounting and unmounting whole conversations, up to 200 messages.
-   A controlled composer updated on every keystroke.

## How are we testing

All content comes from one fixed seed in `shared/corpus.js`. There is no network,
storage, `Math.random` or `Date.now`, so every run renders the same
conversations and streams the same replies.

`shared/network.js` stands in for a streaming fetch. Each `window.deliverChunk()`
call hands the open reply its next four tokens, so chunk arrival is
deterministic and needs no timers. It also keeps the stream's virtual clock,
80 ms per chunk, which the word scheduler reads in place of `performance.now()`.

Each streamed word's fade-in would end with its `animationend` event, after
the step. Instead, once a reply is complete the steps end them all through
`window.finishWordAnimations()`, so that work is measured in the step that
started it and none of it lands in a later step.

The app commits the way the Octane fixture of the chat-stream benchmark in the
Octane repository does. Its event handlers only set state, and the steps commit
it through `window.__benchFlush` after every interaction, as that benchmark's
`run.mjs` does. Each chunk renders with `flushSync`, since a chunk arrives
outside any event. So each send, chunk, conversation click and keystroke is on
screen before the step's next interaction. A step stops delivering chunks once
the reply loses its `streaming` class (see `chatStreamTests` in
`suites-experimental/suites.mjs`). No step yields to the event loop before it
ends, so every browser paints once per step.

-   `StreamReplies`: sends three prompts in turn in the first conversation,
    streaming each reply to completion before sending the next.
-   `SwitchConversations`: clicks every conversation in the sidebar, then returns
    to the first.
-   `StreamIntoLongConversation`: streams one reply at the end of the
    200-message conversation.
-   `TypePrompt`: types a 163-character prompt into the composer one character
    at a time.

The composer uses `onInput`, which fires for every input event, including the
ones the benchmark dispatches after setting the value from script.

## Developer Documentation

The app is built with Vite. It can be previewed during development with
`npm run dev`. To update the files run in the harness, run `npm run build`,
which regenerates the committed `dist/octane` directory and its
`resources.txt`.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatStream-Octane`.
