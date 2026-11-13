import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { ClipboardEvent, KeyboardEvent } from 'react';

import type { AutocompleteCandidate } from '../store/contacts';
import type { RecipientEntry } from '../store/compose-store';
import { NOW } from '../clock';
import { addressKey } from '../utils/address-key';
import {
  endsInsideAddress, formatAddress, parseAddressEntries, type ParsedAddress,
} from '../utils/address-parse';
import { isComposingKeyEvent } from '../utils/keyboard';
import { senderAvatarStyle, senderInitials } from '../utils/sender-avatar';

const SUGGESTION_LIMIT = 10;
const DEBOUNCE_MS = 120;

type Query = (prefix: string, limit: number, exclude: string[]) => Promise<AutocompleteCandidate[]>;

function entryText(entry: RecipientEntry): string {
  return 'invalid' in entry ? entry.text : formatAddress(entry);
}

function entryLabel(entry: RecipientEntry): string {
  return 'invalid' in entry ? entry.text : (entry.name?.trim() || entry.email);
}

function entryDescription(entry: RecipientEntry): string {
  if ('invalid' in entry) return `${entry.text} — not a valid address`;
  const name = entry.name?.trim();
  return name ? `${name} <${entry.email}>` : entry.email;
}

function usageMeta(candidate: AutocompleteCandidate): string | null {
  const parts: string[] = [];
  const at = Number(candidate.last_sent_at);
  if (Number.isFinite(at) && at > 0) {
    const days = Math.floor((NOW - at) / 86_400_000);
    if (days < 1) parts.push('today');
    else if (days < 7) parts.push(`${days}d ago`);
    else if (days < 30) parts.push(`${Math.floor(days / 7)}w ago`);
    else if (days < 365) parts.push(`${Math.floor(days / 30)}mo ago`);
    else parts.push(`${Math.floor(days / 365)}y ago`);
  }
  const sends = Number(candidate.send_count);
  if (Number.isFinite(sends) && sends > 1) parts.push(`${sends} sends`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

function Highlighted({ text, typed }: { text: string; typed: string }) {
  const needle = typed.trim().toLowerCase();
  const idx = needle ? text.toLowerCase().indexOf(needle) : -1;
  if (idx < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="ac-match">{text.slice(idx, idx + needle.length)}</span>
      {text.slice(idx + needle.length)}
    </>
  );
}

/**
 * One recipient field: committed recipients as pills, a text input for the
 * next one, and a suggestion list over the two.
 */
export function RecipientInput({
  label, inputId, entries, taken, query, browseAll, onEntriesChange,
}: {
  label: string;
  inputId: string;
  entries: readonly RecipientEntry[];
  taken: readonly string[];
  query: Query;
  browseAll: () => Promise<AutocompleteCandidate[]>;
  onEntriesChange: (entries: RecipientEntry[]) => void;
}) {
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState<AutocompleteCandidate[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [noMatches, setNoMatches] = useState<string | null>(null);
  const [foundNothing, setFoundNothing] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tokenRef = useRef(0);
  const textRef = useRef(text);
  textRef.current = text;
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const focusAfterRemoval = useRef<number | null>(null);

  const takenEmails = useMemo(() => new Set([
    ...entries.filter((entry): entry is ParsedAddress => !('invalid' in entry)).map((entry) => addressKey(entry.email)),
    ...taken.map((email) => addressKey(email)),
  ]), [entries, taken]);
  const takenRef = useRef(takenEmails);
  takenRef.current = takenEmails;

  const isListOpen = expanded && suggestions.length > 0;
  const isPanelOpen = isListOpen || noMatches !== null;
  const listboxId = `${inputId}-listbox`;
  const optionId = (idx: number) => `${inputId}-option-${idx}`;
  const countLabel = browsing
    ? (suggestions.length === 1 ? '1 contact' : `${suggestions.length} contacts`)
    : (suggestions.length === 1 ? '1 suggestion' : `${suggestions.length} suggestions`);
  const resultSummary = !isListOpen
    ? (foundNothing ?? '')
    : browsing ? `Showing ${suggestions.length} contacts`
      : suggestions.length === 1 ? '1 suggestion available' : `${suggestions.length} suggestions available`;

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  useEffect(() => {
    if (focusAfterRemoval.current == null) return;
    const index = focusAfterRemoval.current;
    focusAfterRemoval.current = null;
    const buttons = pillsRef.current?.querySelectorAll<HTMLButtonElement>('.pill__remove');
    const target = buttons?.[Math.min(index, (buttons?.length ?? 0) - 1)];
    if (target) target.focus();
    else inputRef.current?.focus();
  }, [entries]);

  const closeList = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    tokenRef.current += 1;
    setExpanded(false);
    setActiveIndex(-1);
    setSuggestions([]);
    setBrowsing(false);
    setFoundNothing(null);
    setNoMatches(null);
  }, []);

  const notTaken = (found: readonly AutocompleteCandidate[]) => found.filter((candidate) => !takenRef.current.has(addressKey(candidate.email)));

  const runQuery = useCallback(async (prefix: string) => {
    const token = (tokenRef.current += 1);
    let found: AutocompleteCandidate[] = [];
    let answered = true;
    try {
      found = await query(prefix, SUGGESTION_LIMIT, [...takenRef.current]);
    } catch {
      answered = false;
    }
    if (token !== tokenRef.current) return;
    const next = notTaken(found).slice(0, SUGGESTION_LIMIT);
    setSuggestions(next);
    setActiveIndex(next.length > 0 ? 0 : -1);
    setBrowsing(false);
    setNoMatches(next.length === 0 && answered ? prefix : null);
    setExpanded(next.length > 0);
    setFoundNothing(next.length > 0 ? null : (answered ? `No suggestions for ${prefix}` : 'Suggestions are unavailable'));
  }, [query]);

  const browseContacts = useCallback(async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const token = (tokenRef.current += 1);
    let found: AutocompleteCandidate[] = [];
    let answered = true;
    try {
      found = await browseAll();
    } catch {
      answered = false;
    }
    if (token !== tokenRef.current) return false;
    const next = notTaken(found);
    setSuggestions(next);
    setActiveIndex(next.length > 0 ? 0 : -1);
    setBrowsing(true);
    setNoMatches(null);
    setFoundNothing(next.length > 0 ? null : (answered ? 'No contacts to show' : 'Contacts are unavailable'));
    setExpanded(next.length > 0);
    return true;
  }, [browseAll]);

  const scheduleQuery = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const prefix = value.trim();
    if (prefix.length < 1) {
      closeList();
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      void runQuery(prefix);
    }, DEBOUNCE_MS);
  }, [closeList, runQuery]);

  const commitText = useCallback((value = textRef.current): boolean => {
    const trimmed = value.trim();
    if (!trimmed) return false;
    const current = entriesRef.current;
    const parsed = parseAddressEntries(trimmed);
    if (parsed.length === 0) {
      setText('');
      if (!/^[\s,;]+$/.test(trimmed)) {
        closeList();
        onEntriesChange([...current, { text: trimmed, invalid: true }]);
        return true;
      }
      return false;
    }
    const next = [...current];
    for (const element of parsed) {
      if ('rejected' in element) {
        next.push({ text: element.rejected, invalid: true });
        continue;
      }
      const key = addressKey(element.address.email);
      const already = takenRef.current.has(key) || next.some((entry) => !('invalid' in entry) && addressKey(entry.email) === key);
      if (!already) next.push(element.address);
    }
    setText('');
    closeList();
    onEntriesChange(next);
    return true;
  }, [closeList, onEntriesChange]);

  function acceptSuggestion(candidate: AutocompleteCandidate) {
    const name = candidate.name?.trim();
    commitText(formatAddress({ ...(name ? { name } : {}), email: candidate.email }));
    inputRef.current?.focus();
  }

  function editEntry(index: number) {
    const entry = entries[index];
    if (!entry) return;
    const reopened = entryText(entry);
    const pending = text.trim();
    const value = pending ? `${reopened}, ${pending}` : reopened;
    setText(value);
    onEntriesChange(entries.filter((_, idx) => idx !== index));
    inputRef.current?.focus();
    scheduleQuery(value);
  }

  function removeEntry(index: number) {
    focusAfterRemoval.current = index;
    onEntriesChange(entries.filter((_, idx) => idx !== index));
  }

  function scrollActiveIntoView(index: number) {
    requestAnimationFrame(() => document.getElementById(optionId(index))?.scrollIntoView({ block: 'nearest' }));
  }

  // Native `input` as well as React's onChange: a value written through the
  // property setter (scripted input) never reaches onChange.
  function onTextInput(value: string) {
    if (value === textRef.current) return;
    textRef.current = value;
    setText(value);
    scheduleQuery(value);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (isComposingKeyEvent(event.nativeEvent)) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (suggestions.length === 0) {
          if (event.key !== 'ArrowDown') return;
          event.preventDefault();
          const prefix = text.trim();
          if (prefix.length >= 1) void runQuery(prefix);
          else void browseContacts().then((ok) => { if (ok) inputRef.current?.focus(); });
          return;
        }
        event.preventDefault();
        setExpanded(true);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        const count = suggestions.length;
        const next = activeIndex < 0 ? (step === 1 ? 0 : count - 1) : (activeIndex + step + count) % count;
        setActiveIndex(next);
        scrollActiveIntoView(next);
        return;
      }
      case 'Enter': {
        if (event.ctrlKey || event.metaKey) return;
        event.preventDefault();
        const candidate = suggestions[activeIndex] ?? suggestions[0];
        if (candidate) acceptSuggestion(candidate);
        else commitText();
        return;
      }
      case 'Tab': {
        const candidate = suggestions[activeIndex] ?? suggestions[0];
        if (candidate) acceptSuggestion(candidate);
        else commitText();
        return;
      }
      case ',':
      case ';': {
        const caret = inputRef.current?.selectionStart;
        const before = typeof caret === 'number' ? text.slice(0, caret) : text;
        if (endsInsideAddress(before)) return;
        event.preventDefault();
        commitText();
        return;
      }
      case 'Escape':
        if (isPanelOpen) {
          event.stopPropagation();
          event.preventDefault();
          closeList();
        }
        return;
      case 'Backspace':
        if (text.length > 0 || entries.length === 0) return;
        event.preventDefault();
        editEntry(entries.length - 1);
        return;
      default:
    }
  }

  function onPaste(event: ClipboardEvent<HTMLInputElement>) {
    const pasted = event.clipboardData?.getData('text/plain');
    if (!pasted) return;
    event.preventDefault();
    const combined = text.trim() ? `${text.trim()}, ${pasted}` : pasted;
    commitText(combined.replace(/[\r\n]+/g, ', '));
  }

  return (
    <div className={`recipient-input${isPanelOpen ? ' recipient-input--focused' : ''}`}>
      <div ref={pillsRef} className="recipient-input__field" onClick={() => inputRef.current?.focus()}>
        {entries.length > 0 ? (
          <ul className="pills" role="list">
            {entries.map((entry, idx) => {
              const invalid = 'invalid' in entry;
              return (
                <li key={`${entryText(entry)}-${idx}`} className={`pill${invalid ? ' pill--invalid' : ''}`} role="listitem">
                  <button
                    type="button"
                    className="pill__label"
                    aria-invalid={invalid ? 'true' : undefined}
                    aria-label={`${entryDescription(entry)}. Activate to edit.`}
                    title={entryDescription(entry)}
                    onClick={(event) => { event.stopPropagation(); editEntry(idx); }}
                  >
                    {invalid
                      ? <span className="pill__warning" aria-hidden="true">&#9888;</span>
                      : <span className="pill__avatar" aria-hidden="true" style={senderAvatarStyle(entry.email)}>{senderInitials(entry.name?.trim() || entry.email)}</span>}
                    <span className="pill__text">{entryLabel(entry)}</span>
                  </button>
                  <button
                    type="button"
                    className="pill__remove"
                    aria-label={`Remove ${entryDescription(entry)}`}
                    onClick={(event) => { event.stopPropagation(); removeEntry(idx); }}
                  >
                    &times;
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        <input
          id={inputId}
          ref={inputRef}
          value={text}
          type="text"
          className="recipient-input__text"
          role="combobox"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isPanelOpen}
          aria-controls={listboxId}
          aria-activedescendant={activeIndex >= 0 ? optionId(activeIndex) : undefined}
          onInput={(event) => onTextInput(event.currentTarget.value)}
          onChange={(event) => onTextInput(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => {
            commitText();
            closeList();
          }}
          onPaste={onPaste}
        />
      </div>

      <div className="autocomplete" style={isPanelOpen ? undefined : { display: 'none' }}>
        <ul id={listboxId} className="autocomplete__options" role="listbox" aria-label={`${label} suggestions`}>
          {suggestions.map((candidate, idx) => {
            const name = candidate.name?.trim();
            const meta = usageMeta(candidate);
            return (
              <li
                key={`${candidate.email}-${candidate.source}`}
                id={optionId(idx)}
                className={`autocomplete__option${idx === activeIndex ? ' autocomplete__option--active' : ''}`}
                role="option"
                aria-selected={idx === activeIndex}
                aria-label={name ? `${name} <${candidate.email}>` : candidate.email}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => acceptSuggestion(candidate)}
              >
                <span className="ac-avatar" aria-hidden="true" style={senderAvatarStyle(candidate.email)}>{senderInitials(name || candidate.email)}</span>
                <span className="ac-lines">
                  {name ? <span className="ac-name"><Highlighted text={name} typed={text} /></span> : null}
                  <span className={`ac-email${name ? '' : ' ac-email--primary'}`}><Highlighted text={candidate.email} typed={text} /></span>
                </span>
                {meta ? <span className="ac-meta" aria-hidden="true">{meta}</span> : null}
              </li>
            );
          })}
        </ul>
        {noMatches !== null ? (
          <div className="autocomplete__empty" aria-hidden="true">
            <span className="autocomplete__empty-text">No matches for “{noMatches}”</span>
            <span className="ac-key-hint"><kbd>↵</kbd> add it as typed</span>
          </div>
        ) : null}
        {!browsing ? (
          <p className="autocomplete__browse">
            <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { void browseContacts().then((ok) => { if (ok) inputRef.current?.focus(); }); }}>
              Browse all contacts
            </button>
          </p>
        ) : null}
        {suggestions.length > 0 ? (
          <div className="autocomplete__keys" aria-hidden="true">
            <span className="ac-key-hint"><kbd>↑↓</kbd> navigate</span>
            <span className="ac-key-hint"><kbd>↵</kbd> add</span>
            <span className="autocomplete__count">{countLabel}</span>
          </div>
        ) : null}
      </div>
      <p id={`${inputId}-status`} className="sr-only" role="status">{resultSummary}</p>
    </div>
  );
}
