import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { gate } from "../analytics/experiments.js";
import { guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import { tokenize } from "./rich-text.jsx";

const MAX_HEIGHT = 140;
const MAX_SUGGESTIONS = 6;
const MENTION_QUERY = /(?:^|\s)@([\p{L}]{1,24})$/u;
const EMOTICONS = [
    [":)", "🙂"],
    [":D", "😄"],
    ["<3", "❤️"],
    [";)", "😉"],
    [":(", "🙁"],
];

const drafts = new Map();

function replaceEmoticons(value) {
    let next = value;
    for (const [text, emoji] of EMOTICONS) {
        if (next.endsWith(`${text} `))
            next = `${next.slice(0, -text.length - 1)}${emoji} `;
    }

    return next;
}

// Mentions resolve against the people already in the conversation, ranked by how early
// the query matches their name.
function suggestionsFor(people, query) {
    if (query === null)
        return [];
    const needle = query.toLowerCase();
    const matches = [];
    for (const person of people) {
        const words = person.name.toLowerCase().split(" ");
        const index = words.findIndex((word) => word.startsWith(needle));
        if (index !== -1)
            matches.push({ person, rank: index * 100 + person.name.length });
    }
    matches.sort((a, b) => a.rank - b.rank);
    return matches.slice(0, MAX_SUGGESTIONS).map((match) => match.person);
}

function highlightRanges(value, mentions) {
    const ranges = [];
    for (const mention of mentions) {
        let from = 0;
        let at;
        while ((at = value.indexOf(mention.name, from)) !== -1) {
            ranges.push({ offset: at, length: mention.name.length, entity: { id: mention.id } });
            from = at + mention.name.length;
        }
    }
    return ranges;
}

export default function CommentComposer({ storyId, viewer, people, inputRef }) {
    const [value, setValue] = useState(() => drafts.get(storyId) ?? "");
    const [mentionQuery, setMentionQuery] = useState(null);
    const [activeSuggestion, setActiveSuggestion] = useState(0);
    const [mentions, setMentions] = useState([]);
    const overlayRef = useRef(null);
    const typeahead = gate("comments_mentions_typeahead");

    const suggestions = useMemo(() => typeahead ? suggestionsFor(people, mentionQuery) : [], [typeahead, people, mentionQuery]);
    const tokens = useMemo(() => tokenize(value, highlightRanges(value, mentions)), [value, mentions]);

    // Grow with the text: collapse to measure the content, then size to it.
    useLayoutEffect(() => {
        const textarea = inputRef.current;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT)}px`;
        overlayRef.current.scrollTop = textarea.scrollTop;
    }, [value, inputRef]);

    const onInput = guarded("composer.input", (event) => {
        const textarea = event.target;
        let next = textarea.value;
        const converted = replaceEmoticons(next);
        if (converted !== next) {
            textarea.value = converted;
            next = converted;
        }
        const beforeCaret = next.slice(0, textarea.selectionStart ?? next.length);
        const match = MENTION_QUERY.exec(beforeCaret);
        setMentionQuery(match ? match[1] : null);
        setActiveSuggestion(0);
        if (!value && next)
            log("composer_start", { story: storyId });
        drafts.set(storyId, next);
        setValue(next);
    });

    const chooseMention = guarded("composer.mention", (person) => {
        const textarea = inputRef.current;
        const next = textarea.value.replace(MENTION_QUERY, (whole) => `${whole.startsWith(" ") ? " " : ""}${person.name} `);
        textarea.value = next;
        setMentions((list) => list.some((item) => item.id === person.id) ? list : [...list, person]);
        setMentionQuery(null);
        drafts.set(storyId, next);
        setValue(next);
        log("composer_mention", { story: storyId, position: suggestions.indexOf(person) });
    });

    const onKeyDown = guarded("composer.keys", (event) => {
        if (suggestions.length) {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const delta = event.key === "ArrowDown" ? 1 : -1;
                setActiveSuggestion((index) => (index + delta + suggestions.length) % suggestions.length);
                return;
            }
            if (event.key === "Enter" || event.key === "Tab") {
                event.preventDefault();
                chooseMention(suggestions[activeSuggestion]);
                return;
            }
            if (event.key === "Escape") {
                event.preventDefault();
                setMentionQuery(null);
                return;
            }
        }
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (value.trim())
                log("composer_submit_attempt", { story: storyId, length: value.length, mentions: mentions.length });
        }
    });

    return (
        <div className="border-divider bg-surface relative flex gap-2 border-t px-4 py-3" data-log-scope="comment_composer">
            {viewer && <Avatar seed={viewer.avatar_seed} size={32} label="" />}
            <div className="bg-surface-alt relative flex-1 rounded-2xl">
                {suggestions.length > 0
                    && <ul className="bg-surface shadow-popover absolute bottom-full left-0 z-10 mb-1 w-[280px] rounded-lg p-1" role="listbox" aria-label="Mention suggestions">
                        {suggestions.map((person, index) =>
                            <li key={person.id} role="option" aria-selected={index === activeSuggestion}>
                                <button type="button" className={`flex w-full items-center gap-2 rounded-md p-1.5 text-left ${index === activeSuggestion ? "bg-hover" : ""}`} onClick={() => chooseMention(person)}>
                                    <Avatar seed={person.avatar_seed} size={28} label="" />
                                    <span className="text-primary text-[15px]">{person.name}</span>
                                </button>
                            </li>
                        )}
                    </ul>
                }
                <div className="relative">
                    <div ref={overlayRef} className="text-primary pointer-events-none absolute inset-0 overflow-hidden whitespace-pre-wrap break-words px-3 py-2 text-[15px] leading-5" aria-hidden="true">
                        {tokens.map((token, index) =>
                            <span key={index} className={token.type === "text" ? "" : "bg-accent-soft text-link rounded"}>
                                {token.value}
                            </span>
                        )}
                        {value.endsWith("\n") ? " " : ""}
                    </div>
                    <textarea
                        ref={inputRef}
                        id="comment-composer"
                        className="caret-primary placeholder:text-secondary relative block max-h-[140px] w-full resize-none overflow-y-auto bg-transparent px-3 py-2 text-[15px] leading-5 text-transparent outline-none"
                        rows={1}
                        defaultValue={value}
                        placeholder="Add to the discussion…"
                        aria-label="Add to the discussion…"
                        onInput={onInput}
                        onKeyDown={onKeyDown}
                        onScroll={(event) => {
                            overlayRef.current.scrollTop = event.target.scrollTop;
                        }}
                        data-log="comment_composer"
                    />
                </div>
                <div className="text-secondary flex items-center justify-between px-2 pb-1.5">
                    <div className="flex gap-1">
                        {[
                            ["smile", "Insert an emoji"],
                            ["camera", "Attach a photo or video"],
                            ["gif", "Comment with a GIF"],
                            ["sticker", "Comment with a sticker"],
                        ].map(([icon, label]) =>
                            <button key={icon} type="button" className="hover:bg-hover rounded-full p-1.5" aria-label={label}>
                                <Icon name={icon} size={16} />
                            </button>
                        )}
                    </div>
                    <button type="button" className={`rounded-full p-1.5 ${value.trim() ? "text-accent hover:bg-hover" : "opacity-40"}`} aria-label="Post comment" disabled={!value.trim()}>
                        <Icon name="send" size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
