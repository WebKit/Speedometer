// Deterministic, server-free chat fixtures. Generated once at module load from an
// integer hash, with no Math.random() or Date.now(), so every run renders identical
// content -- entirely original, with no third-party assets.
//
// Bodies are structured blocks rather than plain strings, the way a client keeps
// them once markdown has been parsed. The point is non-uniform row heights.

import { generatedImage } from "./graphics.js";

const ROOM_COUNT = 40;

// Real channels hold years of history. Generation is eager at module load, so this
// trades against load time rather than against the measured steps.
const MESSAGES_PER_ROOM = 1500;

// How many messages land on one day, as a range because a real channel does not turn
// over the same number every day. The run lengths set how often a row carries a date
// separator, and how short the newest day is decides whether a room opens on one.
const MIN_MESSAGES_PER_DAY = 8;
const MAX_MESSAGES_PER_DAY = 56;

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

const UNFURL_LINKS = [
    { site: "example.com", title: "Scroll anchoring, and why feeds jump", description: "How browsers pin a scroll position while content is inserted above the viewport, and where it gives up." },
    { site: "perf.example.com", title: "Nightly run 482 vs 481", description: "Geomean moved 1.8% on the chat suites. Row measurement dominates the profile." },
    { site: "docs.example.com", title: "Windowing a variable-height list", description: "Estimate, measure, cache, correct. The four steps every hand-rolled virtualizer ends up with." },
    { site: "bugs.example.com", title: "Timeline jumps when the panel opens", description: "Narrowing the scroller re-wraps every row, so the cached heights are all stale at once." },
];

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
    // Walk the pool from a seeded offset, so a list never repeats a line.
    const start = hash(seed, 403) % LIST_ITEMS.length;
    const items = [];
    for (let i = 0; i < count; i++) {
        const tokens = [LIST_ITEMS[(start + i) % LIST_ITEMS.length]];
        if (hash(seed, 413 + i) % 3 === 0)
            tokens.push({ type: "code", text: pick(CODE_TOKENS, seed, 423 + i) });
        items.push(tokensToSpans(tokens));
    }
    return { type: "list", items };
}

// A few different aspect ratios, so attachments widen the row height spread
// rather than all adding the same block.
const IMAGE_SIZES = [
    { width: 260, height: 146 },
    { width: 220, height: 165 },
    { width: 180, height: 180 },
];

const IMAGE_ALTS = ["a flame chart of the room switch", "the timeline mid-scroll", "row heights before and after windowing", "a screenshot of the composer", "the scroll anchoring repro"];

function buildImage(seed) {
    const size = IMAGE_SIZES[hash(seed, 501) % IMAGE_SIZES.length];
    return {
        type: "image",
        src: generatedImage(hash(seed, 502), hash(seed, 503), size.width, size.height),
        width: size.width,
        height: size.height,
        alt: pick(IMAGE_ALTS, seed, 504),
    };
}

// Link previews, the card a client renders after unfurling a URL.
function buildUnfurl(seed) {
    const link = pick(UNFURL_LINKS, seed, 601);
    return {
        type: "unfurl",
        href: `https://example.com/${pick(LINK_PATHS, seed, 602)}`,
        site: link.site,
        title: link.title,
        description: link.description,
        thumbSrc: generatedImage(hash(seed, 603), hash(seed, 604), 72, 72),
        thumbWidth: 72,
        thumbHeight: 72,
    };
}

// The shape distribution is what drives the row height spread: emoji-only
// one-liners at one end, a paragraph plus an attachment or fenced code block at
// the other.
function buildBlocks(seed) {
    const shape = hash(seed, 101) % 100;

    if (shape < 8)
        return [{ type: "p", spans: [{ type: "text", text: pickEmojis(seed, 2 + (hash(seed, 102) % 4)).join(" ") }] }];

    const blocks = [{ type: "p", spans: buildParagraph(seed, 1) }];

    if (shape < 20) {
        blocks.push(buildCodeBlock(seed));
        if (shape < 13)
            blocks.push({ type: "p", spans: buildParagraph(seed, 2) });
    } else if (shape < 28) {
        blocks.push(buildList(seed));
    } else if (shape < 35) {
        blocks.push({ type: "quote", spans: [{ type: "text", text: pick(QUOTE_LINES, seed, 103) }] });
        blocks.push({ type: "p", spans: buildParagraph(seed, 3) });
    } else if (shape < 41) {
        blocks.push(buildImage(seed));
    } else if (shape < 46) {
        blocks.push(buildUnfurl(seed));
    } else if (shape < 54) {
        blocks.push({ type: "p", spans: buildParagraph(seed, 4) });
    }
    return blocks;
}

// Bodies are shared rather than generated one per message: a body is immutable and
// only read during render, so two messages can point at the same one. Generating
// 60,000 instead dominated this module's load time. Pool size trades load time
// against how often two rows on screen show the same body.
const BODY_POOL_SIZE = 2048;

const BODY_POOL = [];
for (let i = 0; i < BODY_POOL_SIZE; i++)
    BODY_POOL.push(buildBlocks(i));

// Reaction pills are all over a busy chat, so roughly two messages in three have
// at least one and popular ones collect a whole row.
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

// Every term above reduces modulo 3, 4 or 12, and REACTION_EMOJIS has twelve
// entries, so a row repeats every twelve seeds and nine distinct rows cover the
// whole corpus. Anyone changing REACTION_EMOJIS has to revisit this cycle.
const REACTION_CYCLE = 12;

const REACTION_POOL = [];
for (let i = 0; i < REACTION_CYCLE; i++)
    REACTION_POOL.push(buildReactions(i));

// Format a deterministic HH:MM timestamp without touching the real clock.
function formatTime(minutesInDay) {
    const hours = Math.floor(minutesInDay / 60);
    const minutes = minutesInDay % 60;
    const pad = (value) => String(value).padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}`;
}

// Every timestamp is one of the minutes in a day, so the 1440 strings are built
// once and shared rather than formatted per message.
const MINUTES_IN_DAY = 24 * 60;

const TIME_STRINGS = [];
for (let minutes = 0; minutes < MINUTES_IN_DAY; minutes++)
    TIME_STRINGS.push(formatTime(minutes));

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// A synthetic calendar rather than the real one, so the workload stays
// deterministic. Sized for the shortest day a room can have, so no two days in one
// room ever share a label.
const DATE_LABELS = [];
for (let day = 0; day < Math.ceil(MESSAGES_PER_ROOM / MIN_MESSAGES_PER_DAY) + 1; day++)
    DATE_LABELS.push(`${WEEKDAYS[day % WEEKDAYS.length]}, ${1 + (day % 28)} ${MONTHS[Math.floor(day / 28) % MONTHS.length]}`);

// Real clients name the last two days rather than dating them, which is a branch
// per separator and a different string length where a room opens.
export function dateLabelFor(dayIndex, lastDayIndex) {
    if (dayIndex === lastDayIndex)
        return "Today";
    if (dayIndex === lastDayIndex - 1)
        return "Yesterday";
    return DATE_LABELS[dayIndex % DATE_LABELS.length];
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
        else if (block.type === "image")
            parts.push(block.alt);
        else if (block.type === "unfurl")
            parts.push(`${block.title} ${block.site}`);
        else
            parts.push(spansToText(block.spans));
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
}

function excerpt(text, limit) {
    return text.length <= limit ? text : `${text.slice(0, limit).trimEnd()}…`;
}

const REPLY_EXCERPT_LIMIT = 80;

// Bodies are shared, so the flattened form is cached against the body rather than
// recomputed and stored for every message that might be quoted.
const BODY_EXCERPTS = new Map();

function bodyExcerpt(blocks) {
    let text = BODY_EXCERPTS.get(blocks);
    if (text === undefined) {
        text = excerpt(blocksToText(blocks), REPLY_EXCERPT_LIMIT);
        BODY_EXCERPTS.set(blocks, text);
    }
    return text;
}

// Real conversations arrive in bursts from the same person, which is what makes
// message grouping worth rendering. Runs of one to three, always advancing to a
// different sender between runs.
function buildSenderSequence(roomIndex, count) {
    const senders = [];
    let index = hash(roomIndex, 301) % SENDERS.length;
    while (senders.length < count) {
        // Same construction as a message seed, so one room's run lengths stay
        // independent of every other room's.
        const seed = roomIndex * count + senders.length;
        const runLength = 1 + (hash(seed, 302) % 3);
        for (let i = 0; i < runLength && senders.length < count; i++)
            senders.push(SENDERS[index]);
        index = (index + 1 + (hash(roomIndex * count + senders.length, 303) % (SENDERS.length - 1))) % SENDERS.length;
    }
    return senders;
}

const SENDER_COLOR_INDEX = new Map(SENDERS.map((name, index) => [name, index % AVATAR_COLOR_COUNT]));

// Ten senders, so the initials are derived once rather than per message.
const SENDER_INITIALS = new Map(SENDERS.map((name) => [name, initials(name)]));

// Which day each message falls on, as runs of varying length. Same construction as
// the sender sequence, and precomputed so a row's day never depends on what is
// mounted.
function buildDaySequence(roomIndex, count) {
    const days = [];
    let day = 0;
    while (days.length < count) {
        const span = MAX_MESSAGES_PER_DAY - MIN_MESSAGES_PER_DAY + 1;
        const length = MIN_MESSAGES_PER_DAY + (hash(roomIndex * count + day, 901) % span);
        for (let i = 0; i < length && days.length < count; i++)
            days.push(day);
        day++;
    }
    return days;
}

function buildMessages(roomIndex) {
    const senders = buildSenderSequence(roomIndex, MESSAGES_PER_ROOM);
    const days = buildDaySequence(roomIndex, MESSAGES_PER_ROOM);
    const messages = [];
    for (let i = 0; i < MESSAGES_PER_ROOM; i++) {
        const seed = roomIndex * MESSAGES_PER_ROOM + i;
        const sender = senders[i];
        const blocks = BODY_POOL[hash(seed, 105) % BODY_POOL_SIZE];

        // A reply quote embeds its parent in the child and breaks the sender group.
        // Most answer something just said, but one in four reaches back into the
        // history, where the quoted row is nowhere in the DOM and clicking the quote
        // has to scroll to a height that has never been measured.
        let replyTo = null;
        if (i > 0 && hash(seed, 201) % 100 < 18) {
            const distance = hash(seed, 203) % 4 === 0 ? 1 + (hash(seed, 204) % Math.min(i, 400)) : 1 + (hash(seed, 202) % 6);
            const parent = messages[Math.max(0, i - distance)];
            replyTo = { id: parent.id, sender: parent.sender, excerpt: bodyExcerpt(parent.blocks) };
        }

        messages.push({
            id: `room-${roomIndex}-msg-${i}`,
            sender,
            senderInitials: SENDER_INITIALS.get(sender),
            colorIndex: SENDER_COLOR_INDEX.get(sender),
            time: TIME_STRINGS[seed % MINUTES_IN_DAY],
            // The timeline compares this against the row above to decide whether to
            // draw a date separator.
            dayIndex: days[i],
            blocks,
            replyTo,
            grouped: i > 0 && senders[i - 1] === sender && !replyTo,
            reactions: REACTION_POOL[seed % REACTION_CYCLE],
        });
    }
    return messages;
}

// How far back the unread divider sits when the room opens. At least one message
// back, so it is always a row that exists, and never further than a viewport, so
// every room switch lays one out -- which is also the common case in a real client.
const UNREAD_DEPTH = 12;

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
            lastMessage: blocksToText(messages[messages.length - 1].blocks),
            // The last message this user has read. The row after it carries the
            // unread divider.
            readUpToIndex: Math.max(0, messages.length - 1 - (1 + (hash(i, 701) % (UNREAD_DEPTH - 1)))),
            messages,
        });
    }
    return rooms;
}

export const rooms = buildRooms();

const LOCAL_USER_NAME = "You";

export const LOCAL_USER = {
    name: LOCAL_USER_NAME,
    initials: initials(LOCAL_USER_NAME),
    colorIndex: SENDERS.length % AVATAR_COLOR_COUNT,
};

// Same shape as the generated fixtures, so the timeline renders it through the same
// path. The timestamp continues from the room's last message instead of reading the
// clock, keeping the workload deterministic.
export function createOutgoingMessage(room, sequence, text) {
    const newest = room.messages[room.messages.length - 1];
    const previous = newest.time.split(":").map(Number);
    const sentAt = (previous[0] * 60 + previous[1] + 1 + sequence) % MINUTES_IN_DAY;
    return {
        id: `${room.id}-sent-${sequence}`,
        sender: LOCAL_USER.name,
        senderInitials: LOCAL_USER.initials,
        colorIndex: LOCAL_USER.colorIndex,
        time: TIME_STRINGS[sentAt],
        // Same day as the message it follows, so sending does not put a date
        // separator in the middle of the burst.
        dayIndex: newest.dayIndex,
        blocks: [{ type: "p", spans: [{ type: "text", text }] }],
        replyTo: null,
        grouped: sequence > 0,
        reactions: [],
    };
}
