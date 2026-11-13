# Stormbox-React

A React clone of the Stormbox webmail front end (Vue 3, Thunderbird) and no
server: the mailbox is generated in the page from a fixed seed, so every
run renders the same folders, messages and dates.

    npm install
    npm run dev        # development React
    npm run build      # production build into dist/, plus dist/resources.txt
    npm run preview    # serve dist/ (use this for timing outside Speedometer)
    npm run typecheck

The committed `dist/` is what the suite runs; rebuild and commit it after
changing `src/`. Run it with `/?developerMode&suites=Stormbox-React`.

The suite loads `dist/index.html?animations=off`, which removes CSS
transitions and the reading pane's 310ms wait for the folder list, so the
800px viewport's responsive layout (opening a message hides the folder list)
happens within the interaction that triggers it.

Steps, each interaction followed by a task yield:

- `SwitchFolders`: large folders, nested subfolders and the Starred tag view.
- `ScrollMessageList`: the virtualized Inbox, a viewport at a time, then in
  strides.
- `ReadMessages`: opens a message, then the next 15 with J. HTML bodies go
  through DOMPurify, dark-mode adaptation and a sandboxed srcdoc iframe.
- `StarAndTagMessages`: the row overlay's star, and its tag popover.
- `BulkActions`: select all 1,200 Inbox messages, mark read, star, tag.
- `QuickFilter`: types and erases a filter over the Inbox.
- `ArchiveAndDelete`: checkbox selections archived and deleted, then Trash
  emptied.
- `ComposeAndSend`: replies (Squire with the quoted message) and new
  messages with a recipient pill, all sent.
- `ToggleTheme`: light and dark with an HTML newsletter open.

## Scope

The Mail space is cloned:

- Top bar (quick filter, theme toggle, app drawer, account menu), spaces
  rail and the folder list with nested and starred folders, the Tags
  section and storage bar.
- The virtualized message list (`@tanstack/react-virtual`, 64px rows,
  96px card rows under 480px) with Stormbox's header tiers, Unread and
  Starred filters, the Quick Filter, anchored multi-select (checkbox,
  Shift/Cmd-click, Shift+Arrow, Cmd+A), bulk actions with overflow, the
  row hover overlay (tag, star, archive, delete), the tag menu as dropdown
  and popover, drag and drop onto folders and tags, and keyboard
  navigation.
- The reading pane: HTML bodies through DOMPurify, Stormbox's dark-mode
  adaptation and a sandboxed `srcdoc` iframe with fit-to-width zoom;
  plain-text bodies linkified with nested quote bars; attachments bar,
  tag chips, scheduled-send banner, maximize.
- The composer: From picker, recipient pills with autocomplete over a
  400-contact address book, Cc/Bcc, the Squire rich text editor with its
  toolbar overflow, Send and Send Later, minimize-to-dock, the close
  prompt, reply / reply all / forward, and opening drafts.
- Stormbox's responsive layout: below 1024px an open message hides the
  folder list, below 640px a single column.
- The web shortcut scheme (C, R, Shift+R, F, A, M, S, T, 0–9, Delete,
  J/K/N/P, `/`, Ctrl/Cmd+K, Escape).

Not cloned: Contacts (the rail button shows a placeholder), settings, the
folder and tag managers, onboarding, multiple message columns, sender
favicons (they come from a server-side proxy) and file attachments.

## What is shared with Stormbox

- `src/utils/` holds Stormbox's framework-independent modules copied
  verbatim: HTML sanitizing and srcdoc building, dark-mode email
  adaptation, address parsing, tag model, folder presentation, sender
  avatars. Beyond import paths, `message-row-presentation.ts` and
  `compose-quote.ts` changed to format dates against the fixed clock in
  `src/clock.ts`, and `folder-presentation.ts` maps roles to SVG
  components instead of SVG strings. Stormbox's `plaintext-html.ts` is
  replaced by `plaintext-body.tsx` (see below).
- `src/styles/styles.css` and `app.css` are Stormbox's global and shell
  stylesheets. `components.css` is generated from the components' Vue
  `<style>` blocks by `scripts/port-vue-styles.mjs`, which reproduces the
  specificity Vue's scoped attribute adds (`:is([class],:not([class]))`).
  `services-ui.css` holds the design tokens and button rules from
  `@thunderbirdops/services-ui`.
- The same library versions where Stormbox uses one: DOMPurify 3.4.7,
  Squire 2.4.6, TanStack Virtual 3.13.26, linkifyjs 4.3.3, Vite 8.0.16.
- Icons, fonts and the component markup and class names.

## What is different

- React 19 and Zustand stores instead of Vue 3 and Pinia. There is no
  SQLite worker, JMAP sync or outbox: mutations apply to the in-memory
  store at once.
- Message bodies are generated on first open (`src/data/bodies.ts`):
  plain text with nested quotes, simple HTML, full HTML newsletters with
  `<style>` blocks and table layouts, notifications and junk. No body
  loads anything from the network.
- Dates format in `en-US` and UTC against a fixed clock.
- Icons and plain-text bodies are built as React elements, not injected
  as HTML. Icons are imported with `vite-plugin-svgr` (`*.svg?react`,
  without SVGO) and rendered by `SvgIcon`. Plain-text bodies come from
  `plaintext-body.tsx`, which returns nested `<blockquote>`s and `<a>`s
  from linkifyjs's tokenizer, so they skip the DOMPurify pass. The markup
  is the same as Stormbox's. HTML bodies still go through DOMPurify and
  `srcdoc`.
- Stormbox and Stormbox-Vue still inject icons as `?raw` strings with
  `v-html`, and still build plain-text bodies as an HTML string run
  through DOMPurify. The two workloads render the same DOM but do
  different work for icons and plain-text bodies, so a React-vs-Vue
  comparison includes that difference. Stormbox-React results from builds
  that still used `?raw` icons and `plaintext-html.ts` (before November
  2026) are not comparable with later ones.

## URL parameters

- `scale=<n>` multiplies the generated folder sizes (default 1, about
  6,500 messages; Inbox 1,200, Archive 2,500).
- `theme=light` starts in the light theme (default dark).
- `animations=off` drops CSS transitions and the reading pane's 310ms wait
  for the folder list to slide away. The Speedometer suite uses it so no
  timer or transition spills into a later measurement.

## License

MPL-2.0, as Stormbox (see `LICENSE`). Inter and Metropolis are under the
SIL Open Font License.
