// The deterministic chat corpus both builds render. Everything derives from
// one fixed mulberry32 seed at module load: no fixture JSON, no network, no
// Math.random or Date.now, so every run renders identical conversations and
// streams identical replies in identical chunks.
//
// Assistant replies are Markdown (paragraphs with inline emphasis and code,
// headings, bullet and numbered lists, fenced code blocks), the shape LLM chat
// replies take. Messages are { id, role: "user" | "assistant", text }.

function mulberry32(seed) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rand = mulberry32(20261104);
const pick = (arr) => arr[(rand() * arr.length) | 0];
const between = (lo, hi) => lo + ((rand() * (hi - lo + 1)) | 0);

const WORDS = (
    "the a this each every that state render update component list stream token "
    + "browser layout frame request response cache value event handler queue "
    + "scheduler commit result effect boundary model reply message server client "
    + "keeps reads writes returns sends receives renders updates batches schedules "
    + "measures avoids reuses stores tracks applies resolves compares merges splits "
    + "quickly safely only always usually first later again once directly "
    + "with from into before after during between without across through "
    + "small large stable expensive cheap separate shared current previous next "
    + "and or but so because when while if then"
).split(" ");

const IDENTIFIERS = [
    "useState",
    "fetch",
    "requestAnimationFrame",
    "AbortController",
    "ReadableStream",
    "TextDecoder",
    "Map",
    "WeakMap",
    "Promise.all",
    "structuredClone",
    "key",
    "props",
    "onInput",
    "aria-live",
    "flex",
    "grid",
    "position: sticky",
    "overflow-anchor",
    "content-visibility",
];

const HEADINGS = ["How it works", "Why this happens", "A simpler approach", "Putting it together", "Things to watch for", "Performance notes", "Example", "Next steps", "Trade-offs", "Testing it"];

const USER_PROMPTS = [
    "How do I stream a response from fetch and render it as it arrives?",
    "Why does my list re-render every item when only the last one changes?",
    "Can you explain how the event loop orders microtasks and tasks?",
    "What is the best way to debounce a search input?",
    "Show me how to cancel an in-flight request when the user navigates away.",
    "How should I structure state for a chat application?",
    "Why is my layout thrashing when I read offsetHeight in a loop?",
    "What does content-visibility do and when should I use it?",
    "How do I keep the scroll position pinned to the bottom while messages stream in?",
    "Write a small tokenizer that splits text on whitespace but keeps the separators.",
    "Compare a Map and a plain object for a cache keyed by id.",
    "How can I make syntax highlighting cheaper for long code blocks?",
    "Summarize the trade-offs between virtualizing a list and rendering it all.",
    "What is a good way to memoize parsed Markdown per message?",
    "Explain structural sharing in immutable updates.",
    "How do I test a component that renders streamed text?",
];

const JS_LINES = [
    "const response = await fetch(url, { signal: controller.signal });",
    "const reader = response.body.getReader();",
    "const decoder = new TextDecoder();",
    "let buffer = '';",
    "while (true) {",
    "  const { done, value } = await reader.read();",
    "  if (done) break;",
    "  buffer += decoder.decode(value, { stream: true });",
    "  onChunk(buffer);",
    "}",
    "export function tokenize(text) {",
    "  return text.match(/\\s*\\S+/g) ?? [];",
    "}",
    "const cache = new Map();",
    "function getParsed(id, source) {",
    "  const hit = cache.get(id);",
    "  if (hit && hit.source === source) return hit.blocks;",
    "  const blocks = parse(source);",
    "  cache.set(id, { source, blocks });",
    "  return blocks;",
    "}",
    "// Keep the newest message in view while it grows.",
    "list.scrollTop = list.scrollHeight - list.clientHeight;",
    "const timeout = setTimeout(() => controller.abort(), 30000);",
    "const items = messages.filter((m) => m.role === 'assistant');",
    "return { ...state, messages: [...state.messages, reply] };",
];

const PY_LINES = [
    "import asyncio",
    "from dataclasses import dataclass",
    "@dataclass",
    "class Message:",
    "    role: str",
    "    text: str",
    "async def stream_reply(client, prompt):",
    "    async for chunk in client.stream(prompt):",
    "        yield chunk.delta",
    "def tokenize(text):",
    "    # Split on whitespace but keep the separators.",
    "    return re.findall(r'\\s*\\S+', text)",
    "cache = {}",
    "if key in cache:",
    "    return cache[key]",
    "result = await asyncio.gather(*tasks)",
    "for index, item in enumerate(items):",
    "    print(f'{index}: {item}')",
];

const CSS_LINES = [
    ".messages {",
    "  display: flex;",
    "  flex-direction: column;",
    "  overflow-y: auto;",
    "  overflow-anchor: none;",
    "}",
    ".message {",
    "  content-visibility: auto;",
    "  contain-intrinsic-size: auto 120px;",
    "  padding: 12px 16px;",
    "  border-radius: 8px;",
    "}",
    "pre code {",
    "  font-family: ui-monospace, monospace;",
    "  white-space: pre;",
    "}",
];

const CODE_LANGUAGES = [
    ["javascript", JS_LINES],
    ["javascript", JS_LINES],
    ["python", PY_LINES],
    ["css", CSS_LINES],
];

function word() {
    const r = rand();
    if (r < 0.06)
        return `\`${ pick(IDENTIFIERS) }\``;
    if (r < 0.1)
        return `**${ pick(WORDS) } ${ pick(WORDS) }**`;
    if (r < 0.12)
        return `*${ pick(WORDS) }*`;
    return pick(WORDS);
}

function sentence() {
    const n = between(7, 18);
    const words = [];
    for (let i = 0; i < n; i++)
        words.push(word());
    const first = words[0];
    if (/^[a-z]/.test(first))
        words[0] = first[0].toUpperCase() + first.slice(1);
    return `${words.join(" ") }.`;
}

function paragraph(lo, hi) {
    const n = between(lo, hi);
    const sentences = [];
    for (let i = 0; i < n; i++)
        sentences.push(sentence());
    return sentences.join(" ");
}

function list(ordered) {
    const n = between(3, 5);
    const items = [];
    for (let i = 0; i < n; i++) {
        const marker = ordered ? `${i + 1}. ` : "- ";
        items.push(marker + sentence());
    }
    return items.join("\n");
}

function codeBlock() {
    const [lang, lines] = pick(CODE_LANGUAGES);
    const n = between(5, 12);
    const start = between(0, lines.length - 1);
    const body = [];
    for (let i = 0; i < n; i++)
        body.push(lines[(start + i) % lines.length]);
    return `\`\`\`${ lang }\n${ body.join("\n") }\n\`\`\``;
}

// A long reply: the shape of a typical answer to a technical question.
function longReply() {
    const blocks = [paragraph(2, 3)];
    if (rand() < 0.6)
        blocks.push(`### ${ pick(HEADINGS)}`);
    blocks.push(list(rand() < 0.4));
    blocks.push(paragraph(1, 2));
    blocks.push(codeBlock());
    if (rand() < 0.5)
        blocks.push(paragraph(1, 3));
    if (rand() < 0.4)
        blocks.push(codeBlock());
    blocks.push(paragraph(1, 2));
    return blocks.join("\n\n");
}

function shortReply() {
    const blocks = [paragraph(1, 3)];
    if (rand() < 0.3)
        blocks.push(list(false));
    if (rand() < 0.15)
        blocks.push(codeBlock());
    return blocks.join("\n\n");
}

let nextMessageId = 1;

function message(role, text) {
    return { id: nextMessageId++, role, text };
}

const CONVERSATIONS = [
    ["Streaming fetch responses", 10, longReply],
    ["List keys and re-renders", 14, longReply],
    ["Event loop ordering", 6, longReply],
    ["Support chat export", 200, shortReply],
    ["Debouncing search input", 20, shortReply],
    ["Cancelling requests", 8, longReply],
    ["Chat state structure", 4, longReply],
    ["Layout thrashing", 30, shortReply],
    ["content-visibility", 12, longReply],
    ["Pinned scroll position", 6, longReply],
    ["Tokenizer", 16, shortReply],
    ["Map vs object caches", 8, longReply],
];

const PRISTINE = CONVERSATIONS.map(([title, count, reply], id) => {
    const messages = [];
    for (let i = 0; i < count; i += 2) {
        messages.push(message("user", pick(USER_PROMPTS)));
        messages.push(message("assistant", reply()));
    }
    return { id, title, messages };
});

// The replies streamed in response to sends, cycled in order.
const STREAMED_REPLIES = Array.from({ length: 6 }, longReply);
let replyCursor = 0;

export function initialConversations() {
    return PRISTINE.map((conversation) => ({ ...conversation, messages: conversation.messages.slice() }));
}

export function userMessage(text) {
    return message("user", text);
}

// The empty assistant message a reply streams into, and the text it streams.
export function nextReply() {
    const text = STREAMED_REPLIES[replyCursor++ % STREAMED_REPLIES.length];
    return { message: message("assistant", ""), text };
}
