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
-   Generated UI. Every streamed reply, and about a third of the others,
    contains a ` ```ui ` block: an indented tree of rows, columns, cards,
    titles, text, captions, badges, buttons and dividers, the way chat
    replies lay out options. Typically a row of option cards, each with a
    header row, a details section hidden until its Details button opens it,
    and a row of buttons. The block is parsed as it streams, so cards appear
    piece by piece, and unchanged subtrees keep their identity across
    parses.
-   Context reads in memoized components, of the kinds the reply renderer of
    a large chat service's web app reads (from its production bundle,
    November 2026):
    -   Layout flow. The reply and every container of a ` ```ui ` block
        provide their children a new flow value every time they render: the
        direction, whether children are spaced automatically, whether
        controls are disabled, the nodes hidden below, and each visible
        child's previous sibling. Every block component and every node reads
        it and computes its spacing with that renderer's rules for the reply,
        a column and a row. So every block component and every node of a
        growing ` ```ui ` block re-renders on every chunk, while `memo` skips
        the content of all but the blocks that grew. A reply's buttons are
        disabled through the flow while it streams, and opening a card's
        details changes which sibling the nodes after them are spaced from.
    -   List layout. A list provides its items' layout (the marker kind),
        a new value on every render. Its items read it and the reply's
        flow, in which they have no previous sibling and so no spacing.
    -   The colour scheme, which paragraphs, headings and bold and italic
        runs resolve their text colour against, and code reads for its
        highlighting.
    -   Streamed words. Text inside a text component of a reply that is
        streaming renders one memoized span per word. Each word reads four
        animation contexts (whether the reply is eligible, whether animation
        is enabled, the animation mode, and a delay scheduler) and starts
        its fade-in from a layout effect with the delay the scheduler gives
        it, the way that renderer staggers words. Replies that are complete
        when they mount render their text as is.
-   Code blocks highlighted into one span per token, the way chat UIs' regex
    highlighters produce them.
-   Scroll pinning with CSS scroll anchoring: an anchor element after the
    messages (the list's only `overflow-anchor: auto` candidate) keeps the
    newest text in view as replies grow and conversations switch. The browser
    adjusts the scroll position during its own layout, so no script reads
    layout after a commit.
-   Mounting and unmounting whole conversations, up to 70 messages.
-   A controlled composer updated on every keystroke, built the way the
    reference chat app's is (measured on its live site, November 2026):
    -   It owns the draft, so a keystroke re-renders only the composer, not
        the app and its transcript.
    -   The textarea sizes itself to its content in CSS (`field-sizing:
        content`, one row of 24 px up to eight), so no script reads layout
        while typing. The send button shows once the draft has text.
    -   ResizeObservers do the rest: once the text wraps, the composer
        expands (the textarea over a row of actions), its frame animates to
        the content's height, and the composer's height is published to the
        app as `--composer-height`, which the transcript, overlaid by the
        composer, pads its end by.
    -   The draft is saved to `localStorage` 250 ms after the last change and
        at least once a second while it changes, and restored on load.
    -   Its state is one signal scope (`octane/composer-state.tsrx`), as the
        reference's composer controller is: the draft, focus, the streaming
        state and what the ResizeObservers measure, and, derived from them,
        the layout, the presentation controls, the submit inputs, whether
        the draft can be submitted and what the actions show, under the
        reference's names. The textarea's value is bound to the draft
        signal, and each of the composer's parts (`octane/Composer.tsrx`)
        reads the signals it shows as it renders, so a keystroke re-renders
        the parts whose state it changes. Since a component reads signals,
        Octane tracks the signal reads of every component's render, in the
        transcript too, as on the reference.

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
started it and none of it lands in a later step. For the same reason, a step
that types ends by settling the composer's pending draft save and height
transition through `window.flushComposer()`. The suite's `prepare` empties the
composer and the draft an earlier iteration saved
(`window.resetComposer()`), so every iteration starts from the same state.

The app commits the way the Octane fixture of the chat-stream benchmark in the
Octane repository does. Its event handlers only set state, and the steps commit
it through `window.__benchFlush` after every interaction, as that benchmark's
`run.mjs` does. Each chunk renders with `flushSync`, since a chunk arrives
outside any event. So each send, chunk, conversation click and keystroke is on
screen before the step's next interaction. A step stops delivering chunks once
the reply loses its `streaming` class (see `chatStreamTests` in
`suites-experimental/suites.mjs`). No step yields to the event loop before it
ends, so every browser paints once per step.

-   `StreamReplies`: sends two prompts in turn in the first conversation,
    streaming each reply to completion before sending the next.
-   `SwitchConversations`: clicks every conversation in the sidebar, then returns
    to the first.
-   `StreamIntoLongConversation`: streams one reply at the end of the
    70-message conversation.
-   `ExpandCards`: opens the details of every card in the 70-message
    conversation, one at a time.
-   `TypePrompt`: focuses the composer and types a 163-character prompt into
    it one character at a time, each with the events a keyboard produces
    (keydown, keypress, beforeinput, the edit, input, keyup), laying out each
    keystroke, as each gets its own frame when a person types. The prompt wraps, so the composer expands; its
    ResizeObservers report that once, when the step's frame is rendered.

The composer uses `onInput`, which fires for every input event, including the
ones the benchmark dispatches after setting the value from script.

## Developer Documentation

The app is built with Vite. It can be previewed during development with
`npm run dev`. To update the files run in the harness, run `npm run build`,
which regenerates the committed `dist/octane` directory and its
`resources.txt`.

The built workload can be loaded within the harness at e.g.
`http://localhost:8080/?developerMode&suites=ChatStream-Octane`.
