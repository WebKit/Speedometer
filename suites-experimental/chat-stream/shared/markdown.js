// The Markdown subset LLM replies use, parsed into plain objects both builds
// render with their own components:
//
//   { id, type: "paragraph", raw, inlines }
//   { id, type: "heading", raw, level, inlines }
//   { id, type: "list", raw, ordered, items: [{ id, inlines }] }
//   { id, type: "code", raw, lang, lines: [{ id, tokens: [{ id, kind, text }] }] }
//
// where inlines are [{ id, kind: "text" | "strong" | "em" | "code", text }].
// Ids are positions, which stay stable because a streamed reply only grows.
//
// A streaming reply is re-parsed on every chunk, as chat clients do. Passing
// the previous parse reuses every block whose source is unchanged, object
// identity included, so the views can skip all but the growing last block:
// the memoized-Markdown pattern streaming chat UIs use. Unterminated syntax
// (an open code fence, a lone "**") renders as what it is so far.

const EMPTY = [];
const HEADING = /^(#{1,3}) (.*)$/;
const LIST_ITEM = /^(?:[-*]|\d+\.) /;
const ORDERED_ITEM = /^\d+\. /;

export function parseMarkdown(text, previous = EMPTY) {
    const lines = text.split("\n");
    const blocks = [];

    const emit = (type, raw, build) => {
        const index = blocks.length;
        const reusable = previous[index];
        if (reusable !== undefined && reusable.type === type && reusable.raw === raw)
            blocks.push(reusable);
        else
            blocks.push({ id: index, type, raw, ...build() });
    };

    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.startsWith("```")) {
            const start = i++;
            const lang = line.slice(3).trim();
            while (i < lines.length && !lines[i].startsWith("```"))
                i++;
            const bodyEnd = i;
            if (i < lines.length)
                i++; // The closing fence.
            emit("code", lines.slice(start, i).join("\n"), () => ({
                lang,
                lines: lines.slice(start + 1, bodyEnd).map((source, id) => ({ id, tokens: highlight(source) })),
            }));
            continue;
        }
        if (line.trim() === "") {
            i++;
            continue;
        }
        const heading = HEADING.exec(line);
        if (heading !== null) {
            emit("heading", line, () => ({ level: heading[1].length, inlines: parseInline(heading[2]) }));
            i++;
            continue;
        }
        if (LIST_ITEM.test(line)) {
            const ordered = ORDERED_ITEM.test(line);
            const start = i;
            while (i < lines.length && LIST_ITEM.test(lines[i]) && ORDERED_ITEM.test(lines[i]) === ordered)
                i++;
            const itemLines = lines.slice(start, i);
            emit("list", itemLines.join("\n"), () => ({
                ordered,
                items: itemLines.map((source, id) => ({ id, inlines: parseInline(source.slice(source.indexOf(" ") + 1)) })),
            }));
            continue;
        }
        const start = i;
        while (i < lines.length && lines[i].trim() !== "" && !lines[i].startsWith("```") && !HEADING.test(lines[i]) && !LIST_ITEM.test(lines[i]))
            i++;
        const paragraphLines = lines.slice(start, i);
        emit("paragraph", paragraphLines.join("\n"), () => ({ inlines: parseInline(paragraphLines.join(" ")) }));
    }
    return blocks;
}

function parseInline(source) {
    const inlines = [];
    let textStart = 0;
    const push = (kind, text) => inlines.push({ id: inlines.length, kind, text });
    const span = (kind, at, open, close) => {
        const end = source.indexOf(close, at + open);
        if (end <= at + open)
            return at + 1; // Unterminated or empty: stays literal text.
        if (at > textStart)
            push("text", source.slice(textStart, at));
        push(kind, source.slice(at + open, end));
        textStart = end + close.length;
        return textStart;
    };

    let i = 0;
    while (i < source.length) {
        const c = source.charCodeAt(i);
        if (c === 96 /* ` */)
            i = span("code", i, 1, "`");
        else if (c === 42 /* * */ && source.charCodeAt(i + 1) === 42)
            i = span("strong", i, 2, "**");
        else if (c === 42)
            i = span("em", i, 1, "*");
        else
            i++;
    }
    if (textStart < source.length)
        push("text", source.slice(textStart));
    return inlines;
}

const KEYWORDS = new Set(
    (
        "const let var function return if else while for of in break continue new await async "
        + "export import from class extends true false null undefined this typeof yield def "
        + "elif None True False and or not with as try except finally raise lambda pass print"
    ).split(" ")
);

const CODE_TOKEN = /(\s+)|(\/\/.*|#.*)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`(?:[^`\\]|\\.)*`?)|(\d+(?:\.\d+)?)|([A-Za-z_$][\w$-]*)|([^\s\w$"'`]+)/y;

// A small regex highlighter in the style of the ones chat UIs ship: one span
// per token, adjacent plain text merged.
function highlight(source) {
    const tokens = [];
    const push = (kind, text) => {
        const last = tokens[tokens.length - 1];
        if (kind === "plain" && last !== undefined && last.kind === "plain")
            last.text += text;
        else
            tokens.push({ id: tokens.length, kind, text });
    };
    CODE_TOKEN.lastIndex = 0;
    let match;
    while (CODE_TOKEN.lastIndex < source.length && (match = CODE_TOKEN.exec(source)) !== null) {
        const [text, space, comment, string, number, identifier] = match;
        if (space !== undefined) {
            push("plain", text);
        } else if (comment !== undefined) {
            push("comment", text);
        } else if (string !== undefined) {
            push("string", text);
        } else if (number !== undefined) {
            push("number", text);
        } else if (identifier !== undefined) {
            if (KEYWORDS.has(identifier))
                push("keyword", text);
            else if (source.charCodeAt(CODE_TOKEN.lastIndex) === 40 /* ( */)
                push("function", text);
            else
                push("plain", text);
        } else {
            push("punctuation", text);
        }
    }
    return tokens;
}
