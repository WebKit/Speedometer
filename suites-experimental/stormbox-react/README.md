# Stormbox-React

A React clone of the Stormbox webmail front end (Vue 3, Thunderbird) with a
generated, deterministic mailbox and no server. `dist/` is built from the
`stormbox-react` project, whose README lists what matches Stormbox and what
does not; `npm run speedometer` there rebuilds and copies it here, including
`resources.txt`.

The suite loads `dist/index.html?animations=off`, which removes CSS
transitions and the reading pane's 310ms wait for the folder list, so the
800px viewport's responsive layout (opening a message hides the folder list)
happens within the interaction that triggers it.

Steps, each interaction followed by a task yield and a forced layout:

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
