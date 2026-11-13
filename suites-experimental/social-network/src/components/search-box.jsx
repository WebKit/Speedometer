import { memo, useEffect, useMemo, useRef, useState } from "react";
import { fetchQuery, loadQuery, queryKey, queryStatusId } from "../store/network.js";
import { fragment, useFragment, useRetain } from "../store/fragment.js";
import { gate } from "../analytics/experiments.js";
import { guard, guarded } from "../analytics/guard.js";
import { log } from "../analytics/logger.js";
import { beginInteraction } from "../analytics/perf.js";
import { signal } from "../signals.js";
import Avatar from "./avatar.jsx";
import Icon from "./icon.jsx";
import Popover from "./popover.jsx";
import { buildSearchIndex, normalizeText, searchIndex } from "../search-index.js";

const MAX_LOCAL = 8;
const NO_RANGES = [];
const SearchBootstrapQuery = fragment("SearchBootstrapQuery", { status: true, root: { search_bootstrap: true } });

// Remote results arrive without match ranges, so they highlight every occurrence of the
// query's words in the name.
function rangesFor(text, query) {
    const lower = normalizeText(text);
    const ranges = [];
    for (const word of normalizeText(query).split(/\s+/).filter(Boolean)) {
        let from = 0;
        let at;
        while ((at = lower.indexOf(word, from)) !== -1) {
            ranges.push([at, at + word.length]);
            from = at + word.length;
        }
    }
    return ranges;
}

function Highlight({ text, ranges }) {
    const marks = new Array(text.length).fill(false);
    for (const [from, to] of ranges) {
        for (let i = from; i < to && i < text.length; i++)
            marks[i] = true;
    }

    const parts = [];
    let start = 0;
    for (let i = 1; i <= text.length; i++) {
        if (i === text.length || marks[i] !== marks[start]) {
            const chunk = text.slice(start, i);
            parts.push(marks[start] ? <strong key={start}>{chunk}</strong> : <span key={start}>{chunk}</span>);
            start = i;
        }
    }
    return parts;
}

const ResultRow = memo(function ResultRow({ entry, ranges, active }) {
    const icon = entry.type === "keyword" || entry.type === "post";
    return (
        <li role="option" aria-selected={active}>
            <a className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${active ? "bg-hover" : "hover:bg-hover"}`} href={`#/search/${encodeURIComponent(entry.name)}`} data-log="search_result" onClick={(event) => event.preventDefault()}>
                {icon
                    ? <span className="bg-surface-alt text-secondary flex h-9 w-9 items-center justify-center rounded-full">
                        <Icon name="search" size={16} />
                    </span>
                    : <Avatar seed={entry.avatar_seed} size={36} square={entry.type !== "user" && entry.type !== "person"} label="" />
                }
                <span className="min-w-0">
                    <span className="text-primary block truncate text-[15px]">
                        <Highlight text={entry.name} ranges={ranges} />
                    </span>
                    {entry.subtitle && <span className="text-secondary block truncate text-[13px]">{entry.subtitle}</span>}
                </span>
            </a>
        </li>
    );
});

export default function SearchBox() {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [remote, setRemote] = useState({ query: "", results: [] });
    const [active, setActive] = useState(-1);
    const inputRef = useRef(null);
    const anchorRef = useRef(null);
    const pending = useRef(null);
    const bootstrap = useFragment(SearchBootstrapQuery, queryStatusId(queryKey("SearchBootstrap")));
    useRetain(open ? queryStatusId(queryKey("SearchBootstrap")) : null);
    const ready = bootstrap && bootstrap.status === "ready";
    const index = useMemo(() => ready ? buildSearchIndex(bootstrap.root.search_bootstrap.entries) : null, [ready, bootstrap]);
    const local = useMemo(() => index ? searchIndex(index, query, MAX_LOCAL) : [], [index, query]);

    useEffect(() => {
        if (open && ready)
            signal("search-ready");
    }, [open, ready]);

    useEffect(() => {
        if (remote.query && remote.query === query)
            signal("search-results");
    }, [remote, query]);

    const onFocus = guarded("search.focus", () => {
        if (!open) {
            beginInteraction("search-ready");
            loadQuery("SearchBootstrap");
            setOpen(true);
            log("search_open", {});
        }
    });

    const close = guarded("search.close", (reason) => {
        setOpen(false);
        setQuery("");
        setActive(-1);
        if (inputRef.current)
            inputRef.current.value = "";
        if (pending.current)
            pending.current.cancel();
        log("search_close", { reason });
    });

    const onInput = guarded("search.input", (event) => {
        const text = event.target.value;
        setQuery(text);
        setActive(-1);
        if (pending.current)
            pending.current.cancel();
        pending.current = null;
        if (!text.trim() || !gate("search_remote_typeahead"))
            return;
        // Every keystroke asks the server; stale answers are dropped, not awaited.
        const request = fetchQuery("Search", { text }, { key: `Search:${text}` });
        pending.current = request;
        request.promise.then((root) =>
            guard("search.remote", () => {
                if (pending.current === request)
                    setRemote({ query: text, results: root.search.results });
            })
        );
    });

    const onKeyDown = guarded("search.keys", (event) => {
        const count = local.length + (remote.query === query ? remote.results.length : 0);
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((value) => Math.min(count - 1, value + 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((value) => Math.max(-1, value - 1));
        } else if (event.key === "Escape") {
            close("escape");
            inputRef.current.blur();
        } else if (event.key === "Enter" && query.trim()) {
            log("search_submit", { length: query.length, results: count });
        }
    });

    const remoteResults = remote.query === query ? remote.results.filter((result) => !local.some((match) => match.entry.name === result.name)) : [];
    const recent = ready ? bootstrap.root.search_bootstrap.recent : [];

    return (
        <div ref={anchorRef} className="relative">
            <label className="bg-surface-alt text-secondary flex h-10 w-[200px] items-center gap-2 rounded-xl px-3">
                <Icon name="search" size={16} />
                <input
                    ref={inputRef}
                    id="search-input"
                    className="text-primary placeholder:text-secondary w-full bg-transparent text-[15px] outline-none"
                    placeholder="Search Commons"
                    aria-label="Search Commons"
                    role="combobox"
                    aria-expanded={open}
                    aria-controls="search-results"
                    aria-autocomplete="list"
                    autoComplete="off"
                    onFocus={onFocus}
                    onClick={onFocus}
                    onInput={onInput}
                    onKeyDown={onKeyDown}
                    data-log="search_input"
                />
            </label>
            {open
                && <Popover label="Search" anchorRef={anchorRef} onClose={close} className="left-0 top-12 w-[320px] p-2" role="presentation" autoFocus={false}>
                    <ul id="search-results" role="listbox" aria-label="Search results" className="max-h-[440px] overflow-y-auto">
                        {!query
                            && <>
                                <li className="flex items-center justify-between px-2 py-1">
                                    <span className="text-primary text-[17px] font-semibold">Recent</span>
                                    <button type="button" className="text-accent hover:bg-hover rounded-md px-2 py-1 text-[15px]">
                                        Edit
                                    </button>
                                </li>
                                {recent.map((entry, i) =>
                                    <ResultRow key={entry.id} entry={entry} ranges={NO_RANGES} active={i === active} />
                                )}
                            </>
                        }
                        {local.map((match, i) =>
                            <ResultRow key={match.entry.id} entry={match.entry} ranges={match.highlights} active={i === active} />
                        )}
                        {remoteResults.map((entry, i) =>
                            <ResultRow key={entry.id} entry={entry} ranges={rangesFor(entry.name, query)} active={local.length + i === active} />
                        )}
                        {query
                            && <li>
                                <a className="text-accent hover:bg-hover flex items-center gap-3 rounded-md px-2 py-2 text-[15px]" href={`#/search/${encodeURIComponent(query)}`} onClick={(event) => event.preventDefault()}>
                                    <span className="bg-accent flex h-9 w-9 items-center justify-center rounded-full text-white">
                                        <Icon name="search" size={16} />
                                    </span>
                                    Search for {query}
                                </a>
                            </li>
                        }
                    </ul>
                </Popover>
            }
        </div>
    );
}
