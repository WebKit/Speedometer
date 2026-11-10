import { memo, useMemo } from "react";
import { navigate } from "../router.jsx";
import { guarded } from "../analytics/guard.js";

// Server ranges mark mentions; hashtags, links and emoji are found on the client.
const INLINE = /(#[\p{L}\p{N}_]+)|(https?:\/\/[^\s]+)|(\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic})*)/gu;

function tokenizePlain(text, tokens) {
    let last = 0;
    for (const match of text.matchAll(INLINE)) {
        if (match.index > last)
            tokens.push({ type: "text", value: text.slice(last, match.index) });
        if (match[1])
            tokens.push({ type: "hashtag", value: match[1] });
        else if (match[2])
            tokens.push({ type: "link", value: match[2] });
        else
            tokens.push({ type: "emoji", value: match[3] });
        last = match.index + match[0].length;
    }
    if (last < text.length)
        tokens.push({ type: "text", value: text.slice(last) });
}

export function tokenize(text, ranges = []) {
    const tokens = [];
    let cursor = 0;
    const sorted = ranges.slice().sort((a, b) => a.offset - b.offset);
    for (const range of sorted) {
        if (range.offset < cursor)
            continue;
        tokenizePlain(text.slice(cursor, range.offset), tokens);
        tokens.push({ type: "mention", value: text.slice(range.offset, range.offset + range.length), id: range.entity.id });
        cursor = range.offset + range.length;
    }
    tokenizePlain(text.slice(cursor), tokens);
    return tokens;
}

// Truncates on a word boundary and drops ranges that would be cut in half.
export function truncate(text, ranges, limit) {
    if (text.length <= limit)
        return null;
    let end = text.lastIndexOf(" ", limit);
    if (end < limit * 0.6)
        end = limit;
    return { text: text.slice(0, end).trimEnd(), ranges: (ranges ?? []).filter((range) => range.offset + range.length <= end) };
}

const openProfile = guarded("richtext.mention", (event, id) => {
    event.preventDefault();
    navigate(`/profile/${id}`);
});

function Token({ token }) {
    switch (token.type) {
        case "mention":
            return (
                <a className="text-link font-semibold hover:underline" href={`#/profile/${token.id}`} data-log="mention" onClick={(event) => openProfile(event, token.id)}>
                    {token.value}
                </a>
            );
        case "hashtag":
            return (
                <a className="text-link font-semibold hover:underline" href={`#/hashtag/${token.value.slice(1)}`} data-log="hashtag">
                    {token.value}
                </a>
            );
        case "link":
            return (
                <a className="text-link underline decoration-1 underline-offset-2" href={token.value} target="_blank" rel="noreferrer" data-log="outbound_link">
                    {token.value}
                </a>
            );
        case "emoji":
            return (
                <span className="emoji inline-block align-[-0.15em] text-[1.15em] leading-none" role="img" aria-label="emoji">
                    {token.value}
                </span>
            );
        default:
            return token.value;
    }
}

function RichText({ text, ranges, className = "" }) {
    const paragraphs = useMemo(() => {
        const result = [];
        let offset = 0;
        for (const block of text.split("\n\n")) {
            const start = offset;
            const end = start + block.length;
            const local = (ranges ?? []).filter((range) => range.offset >= start && range.offset + range.length <= end).map((range) => ({ ...range, offset: range.offset - start }));
            result.push(tokenize(block, local));
            offset = end + 2;
        }
        return result;
    }, [text, ranges]);

    return (
        <div className={`break-words ${className}`} dir="auto">
            {paragraphs.map((tokens, index) =>
                <p key={index} className={index ? "mt-3" : ""}>
                    {tokens.map((token, tokenIndex) =>
                        <Token key={tokenIndex} token={token} />
                    )}
                </p>
            )}
        </div>
    );
}

export default memo(RichText);
