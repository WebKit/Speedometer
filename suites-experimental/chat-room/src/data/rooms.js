// Deterministic, server-free chat fixtures. Generated once at module load from an
// integer hash, with no Math.random() or Date.now(), so every run renders identical
// content -- entirely original, with no third-party assets.
//
// Message bodies are structured blocks rather than plain strings, the way a real
// client keeps them once markdown has been parsed: paragraphs, fenced code,
// blockquotes and bullet lists, with inline runs for code, links, @mentions and
// #room pills. The point is non-uniform row heights, which is what a windowing
// timeline has to cope with.

const ROOM_COUNT = 40;
const MESSAGES_PER_ROOM = 150;

const ROOM_NAMES = [
    "General",
    "Random",
    "Announcements",
    "Engineering",
    "Design",
    "Product",
    "Support",
    "Off Topic",
    "Releases",
    "Incidents",
    "Frontend",
    "Backend",
    "Infra",
    "Mobile",
    "Performance",
    "Security",
    "Docs",
    "Hiring",
    "Watercooler",
    "Standup",
];

const SENDERS = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Linus Pauling", "Marie Curie", "Nikola Tesla", "Rosalind Franklin", "Carl Sagan", "Katherine Johnson", "Tim Berners-Lee"];

export const AVATAR_COLORS = ["#368bd6", "#ac3ba8", "#03b381", "#e64f7a", "#ff812d", "#2dc2c5", "#5c56f5", "#74d12c"];

const AVATAR_COLOR_COUNT = AVATAR_COLORS.length;

const WORDS = [
    "the",
    "benchmark",
    "switching",
    "between",
    "rooms",
    "should",
    "feel",
    "instant",
    "even",
    "when",
    "the",
    "timeline",
    "is",
    "long",
    "and",
    "full",
    "of",
    "rich",
    "messages",
    "with",
    "avatars",
    "and",
    "timestamps",
    "rendering",
    "performance",
    "matters",
    "a",
    "lot",
    "here",
    "lets",
    "measure",
    "it",
    "carefully",
    "and",
    "compare",
    "across",
    "browsers",
    "over",
    "time",
];

// Emoji are everywhere in a real chat. The pool mixes plain codepoints with
// variation selectors, skin tone modifiers and ZWJ sequences, so the workload
// exercises grapheme clustering as well as color-font rendering.
const INLINE_EMOJIS = ["😀", "😂", "🎉", "🔥", "❤️", "🙏", "👀", "🚀", "😅", "🤔", "💯", "✨", "🙌🏽", "👍🏻", "😍", "🥳", "😭", "🤯", "👏", "💪🏾", "🧠", "☕", "🐛", "📈", "👩‍💻", "🧑‍🚀", "👨‍👩‍👧‍👦", "🏳️‍🌈", "🤷‍♀️", "🙋‍♂️", "🫠", "🫶"];

const REACTION_EMOJIS = ["👍", "❤️", "😂", "🎉", "🔥", "✅", "👀", "🙏", "💯", "🚀", "😅", "🤯"];

// One handle per sender, so a mention always points at somebody in the room.
const MENTION_HANDLES = SENDERS.map((name) => name.split(" ")[0].toLowerCase());

const CODE_TOKENS = [
    "scrollTop",
    "scrollHeight",
    "flushSync",
    "requestAnimationFrame",
    "IntersectionObserver",
    "overflow-anchor",
    "content-visibility",
    "useLayoutEffect",
    "getBoundingClientRect",
    "will-change",
    "ResizeObserver",
    "queueMicrotask",
    "clientHeight",
    "offsetHeight",
];

const LINK_LABELS = ["the trace", "last night's run", "this regression", "the profile", "the spec text", "my notes", "the dashboard", "that comparison"];

const LINK_PATHS = ["traces/2f9c", "runs/nightly", "profiles/hot-path", "spec/scroll-anchoring", "notes/timeline", "dashboards/perf", "reports/42", "compare/main"];

const QUOTE_LINES = [
    "can we get a number on how bad the jank is before we start moving code around",
    "the window only recycles about twenty rows, so the mount cost should be flat",
    "every row height changes when the panel opens, which invalidates the cache",
    "please do not use smooth scrolling anywhere inside a timed step",
    "prepending history without pinning the anchor makes the viewport jump",
];

const LIST_ITEMS = [
    "estimate the row height first, then correct after measuring",
    "cache measured heights per message id",
    "keep the mounted window small and bounded",
    "assign scroll offsets explicitly instead of animating",
    "recycle rows rather than remounting them",
    "break the group when a reply quote is present",
    "re-measure only the rows the resize actually touched",
];

const CODE_SNIPPETS = [
    { lang: "js", lines: ["const scroller = scrollerRef.current;", "scroller.scrollTop = scroller.scrollHeight;"] },
    {
        lang: "js",
        lines: ["requestAnimationFrame(() => {", "    for (const row of mounted)", "        heights.set(row.id, row.offsetHeight);", "});"],
    },
    { lang: "css", lines: [".timeline {", "    overflow-anchor: none;", "    content-visibility: auto;", "}"] },
    { lang: "sh", lines: ["npm run build", "node debugging/e2e-chatroom.mjs --browser chrome"] },
    { lang: "json", lines: ["{", '    "iterationCount": 10,', '    "suites": ["ChatRoom-React"]', "}"] },
    { lang: "js", lines: ["for (const row of rows) {", "    if (!heights.has(row.id))", "        heights.set(row.id, estimate);", "}"] },
    { lang: "diff", lines: ['-    scroller.scrollTo({ top, behavior: "smooth" });', "+    scroller.scrollTop = top;"] },
    { lang: "js", lines: ["export function anchorToBottom(node) {", "    node.scrollTop = node.scrollHeight;", "}"] },
];

// An integer hash rather than a PRNG, so every field can be derived independently
// from a message seed and still be stable across runs and across engines.
// Math.imul keeps the multiplies exactly 32-bit.
function hash(seed, salt) {
    let h = Math.imul(seed + 1, 2654435761) ^ Math.imul(salt + 1, 40503);
    h ^= h >>> 15;
    h = Math.imul(h, 2246822519);
    h ^= h >>> 13;
    h = Math.imul(h, 3266489917);
    h ^= h >>> 16;
    return h >>> 0;
}

function pick(list, seed, salt) {
    return list[hash(seed, salt) % list.length];
}

function initials(name) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

// Derived from the index alone, so a #room pill can be pointed at a real room
// while messages are still being generated.
function roomNameFor(index) {
    const baseName = ROOM_NAMES[index % ROOM_NAMES.length];
    if (index < ROOM_NAMES.length)
        return baseName;
    return `${baseName} ${Math.floor(index / ROOM_NAMES.length) + 1}`;
}

function roomSlugFor(index) {
    return roomNameFor(index).toLowerCase().replace(/ /g, "-");
}

// Strided by the seed, so neighbouring messages don't get the same run.
function pickEmojis(seed, count) {
    const picked = [];
    for (let i = 0; i < count; i++)
        picked.push(INLINE_EMOJIS[(seed * 7 + i * 13) % INLINE_EMOJIS.length]);
    return picked;
}

// Turn a token list into inline spans. Words get coalesced into text spans
// carrying the whitespace around their neighbours, which is what a markdown
// renderer ends up emitting.
function tokensToSpans(tokens) {
    const spans = [];
    let words = [];
    let afterInline = false;
    const flush = (trailingSpace) => {
        if (!words.length)
            return;
        const leading = afterInline ? " " : "";
        const trailing = trailingSpace ? " " : "";
        spans.push({ type: "text", text: `${leading}${words.join(" ")}${trailing}` });
        words = [];
        afterInline = false;
    };
    for (const token of tokens) {
        if (typeof token === "string") {
            words.push(token);
            continue;
        }
        flush(true);
        spans.push(token);
        afterInline = true;
    }
    flush(false);
    return spans;
}

function buildInlineSpan(seed, index, roll) {
    if (roll === 0)
        return { type: "code", text: pick(CODE_TOKENS, seed, index + 11) };
    if (roll === 1)
        return { type: "link", text: pick(LINK_LABELS, seed, index + 12), href: `https://example.com/${pick(LINK_PATHS, seed, index + 13)}` };
    if (roll === 2)
        return { type: "mention", name: pick(MENTION_HANDLES, seed, index + 14) };
    const roomIndex = hash(seed, index + 15) % ROOM_COUNT;
    return { type: "room", name: roomSlugFor(roomIndex), roomId: `room-${roomIndex}` };
}

// A sentence from the word pool, with inline code, links, mention and room pills
// spliced between words, plus the occasional emoji.
function buildParagraph(seed, salt) {
    const wordCount = 6 + (hash(seed, salt) % 22);
    const start = hash(seed, salt + 1) % WORDS.length;
    const tokens = [];
    let lastWasInline = false;
    for (let i = 0; i < wordCount; i++) {
        tokens.push(WORDS[(start + i) % WORDS.length]);
        const interior = i > 0 && i < wordCount - 1;
        if (!interior || lastWasInline) {
            lastWasInline = false;
            continue;
        }
        const roll = hash(seed, salt * 31 + i) % 22;
        if (roll < 4) {
            tokens.push(buildInlineSpan(seed, i, roll));
            lastWasInline = true;
            continue;
        }
        lastWasInline = false;
        if (roll === 4)
            tokens.push(INLINE_EMOJIS[hash(seed, salt + i) % INLINE_EMOJIS.length]);
    }

    const spans = tokensToSpans(tokens);
    const first = spans[0];
    if (first.type === "text")
        first.text = first.text.charAt(0).toUpperCase() + first.text.slice(1);

    // Terminal punctuation, and a trailing emoji run on some messages.
    const tail = hash(seed, salt + 7) % 4 === 0 ? `. ${pickEmojis(seed, 1 + (hash(seed, salt + 8) % 3)).join("")}` : ".";
    const last = spans[spans.length - 1];
    if (last.type === "text")
        last.text += tail;
    else
        spans.push({ type: "text", text: tail });
    return spans;
}

function buildCodeBlock(seed) {
    const snippet = pick(CODE_SNIPPETS, seed, 401);
    return { type: "code", lang: snippet.lang, lines: snippet.lines };
}

function buildList(seed) {
    const count = 2 + (hash(seed, 402) % 3);
    const items = [];
    for (let i = 0; i < count; i++) {
        const tokens = [pick(LIST_ITEMS, seed, 403 + i)];
        if (hash(seed, 413 + i) % 3 === 0)
            tokens.push({ type: "code", text: pick(CODE_TOKENS, seed, 423 + i) });
        items.push(tokensToSpans(tokens));
    }
    return { type: "list", items };
}

// Compose a message body out of blocks. The shape distribution is what drives
// the row height spread: emoji-only one-liners at one end, a paragraph plus a
// fenced code block at the other.
function buildBlocks(seed) {
    const shape = hash(seed, 101) % 100;

    if (shape < 8)
        return [{ type: "p", spans: [{ type: "text", text: pickEmojis(seed, 2 + (hash(seed, 102) % 4)).join(" ") }] }];

    const blocks = [{ type: "p", spans: buildParagraph(seed, 1) }];

    if (shape < 20) {
        blocks.push(buildCodeBlock(seed));
        if (shape < 13)
            blocks.push({ type: "p", spans: buildParagraph(seed, 2) });
    } else if (shape < 30) {
        blocks.push(buildList(seed));
    } else if (shape < 38) {
        blocks.push({ type: "quote", spans: [{ type: "text", text: pick(QUOTE_LINES, seed, 103) }] });
        blocks.push({ type: "p", spans: buildParagraph(seed, 3) });
    } else if (shape < 48) {
        blocks.push({ type: "p", spans: buildParagraph(seed, 4) });
    }
    return blocks;
}

// Build a deterministic reactions row. Reaction pills are all over a busy chat,
// so roughly two messages in three have at least one and popular ones collect a
// whole row of them.
function buildReactions(seed) {
    if (seed % 3 === 2)
        return [];
    const count = 1 + (seed % 4);
    const reactions = [];
    for (let i = 0; i < count; i++) {
        reactions.push({
            emoji: REACTION_EMOJIS[(seed + i * 5) % REACTION_EMOJIS.length],
            count: 1 + ((seed + i) % 12),
        });
    }
    return reactions;
}

// Format a deterministic HH:MM timestamp without touching the real clock.
function buildTime(seed) {
    const minutesInDay = seed % (24 * 60);
    const hours = Math.floor(minutesInDay / 60);
    const minutes = minutesInDay % 60;
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
}

function spansToText(spans) {
    let text = "";
    for (const span of spans) {
        if (span.type === "mention")
            text += `@${span.name}`;
        else if (span.type === "room")
            text += `#${span.name}`;
        else
            text += span.text;
    }
    return text;
}

// Flatten a body to plain text for the sidebar preview and reply excerpts.
function blocksToText(blocks) {
    const parts = [];
    for (const block of blocks) {
        if (block.type === "code")
            parts.push(block.lines.join(" "));
        else if (block.type === "list")
            parts.push(block.items.map(spansToText).join(" "));
        else
            parts.push(spansToText(block.spans));
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
}

function excerpt(text, limit) {
    return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

// Real conversations arrive in bursts from the same person, which is what makes
// message grouping worth rendering. Emit runs of one to three messages per
// sender, always advancing to a different sender between runs.
function buildSenderSequence(roomIndex, count) {
    const senders = [];
    let index = hash(roomIndex, 301) % SENDERS.length;
    while (senders.length < count) {
        const runLength = 1 + (hash(roomIndex * 1000 + senders.length, 302) % 3);
        for (let i = 0; i < runLength && senders.length < count; i++)
            senders.push(SENDERS[index]);
        index = (index + 1 + (hash(roomIndex * 1000 + senders.length, 303) % (SENDERS.length - 1))) % SENDERS.length;
    }
    return senders;
}

const SENDER_COLOR_INDEX = new Map(SENDERS.map((name, index) => [name, index % AVATAR_COLOR_COUNT]));

function buildMessages(roomIndex) {
    const senders = buildSenderSequence(roomIndex, MESSAGES_PER_ROOM);
    const messages = [];
    for (let i = 0; i < MESSAGES_PER_ROOM; i++) {
        const seed = roomIndex * MESSAGES_PER_ROOM + i;
        const sender = senders[i];
        const blocks = buildBlocks(seed);

        // Inline reply quotes embed a parent message in the child, and always
        // break the sender group above them.
        let replyTo = null;
        if (i > 0 && hash(seed, 201) % 100 < 18) {
            const parent = messages[Math.max(0, i - 1 - (hash(seed, 202) % 6))];
            replyTo = { id: parent.id, sender: parent.sender, excerpt: excerpt(parent.preview, 80) };
        }

        messages.push({
            id: `room-${roomIndex}-msg-${i}`,
            sender,
            senderInitials: initials(sender),
            colorIndex: SENDER_COLOR_INDEX.get(sender),
            time: buildTime(seed),
            blocks,
            preview: blocksToText(blocks),
            replyTo,
            grouped: i > 0 && senders[i - 1] === sender && !replyTo,
            reactions: buildReactions(seed),
        });
    }
    return messages;
}

function buildRooms() {
    const rooms = [];
    for (let i = 0; i < ROOM_COUNT; i++) {
        const name = roomNameFor(i);
        const messages = buildMessages(i);
        rooms.push({
            id: `room-${i}`,
            name,
            colorIndex: i % AVATAR_COLOR_COUNT,
            initials: initials(name),
            topic: `Discussion about ${name.toLowerCase()}`,
            lastMessage: messages[messages.length - 1].preview,
            messages,
        });
    }
    return rooms;
}

export const rooms = buildRooms();
