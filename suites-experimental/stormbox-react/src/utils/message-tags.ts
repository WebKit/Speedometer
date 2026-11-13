/**
 * Tag model over JMAP keywords (specs/011-message-keywords/spec.md §6).
 *
 * A tag is any keyword the client does not manage itself. A tag may have
 * a definition (name, color, order) in the `messageTags` setting; a
 * keyword without one still renders, named from the keyword (MK-6.5).
 * Keywords are compared lowercase (MK-1.5).
 */

export interface MessageTagDefinition {
  /** JMAP keyword, lowercase. Immutable once created (MK-6.3). */
  keyword: string;
  name: string;
  /** `#rrggbb`. */
  color: string;
  /** Position in the picker and on the `1`–`9` shortcuts (MK-4.2). */
  order: number;
}

/**
 * Keywords the client reads or writes itself — read, star and its
 * RFC 9979 §3 color bits, draft, replied, forwarded, junk — and the
 * remaining IMAP system flags. Never tags, even with a definition.
 */
export const RESERVED_KEYWORDS: ReadonlySet<string> = new Set([
  '$seen',
  '$flagged',
  '$mailflagbit0',
  '$mailflagbit1',
  '$mailflagbit2',
  '$draft',
  '$answered',
  '$forwarded',
  '$junk',
  '$notjunk',
  '$recent',
  '$deleted',
]);

/**
 * Keywords hidden from the tag UI: the reserved set, every other keyword
 * in the IANA "IMAP and JMAP Keywords" registry (which Stalwart models
 * as its built-in keywords), and the status markers other clients and
 * servers write to shared accounts. Snappymail's `ignoredKeywords` and
 * Claws Mail's reserved tags hide the same client markers. Outside the
 * reserved set, a keyword the user defines a tag over is a tag.
 */
export const SYSTEM_KEYWORDS: ReadonlySet<string> = new Set([
  ...RESERVED_KEYWORDS,
  // RFC 3503, RFC 5550
  '$mdnsent',
  '$submitpending',
  '$submitted',
  // IANA registrations without an RFC, and RFC 8457
  '$phishing',
  '$important',
  // RFC 9979 §3
  '$autosent',
  '$canunsubscribe',
  '$followed',
  '$hasattachment',
  '$hasmemo',
  '$hasnoattachment',
  '$imported',
  '$istrusted',
  '$maskedemail',
  '$memo',
  '$muted',
  '$new',
  '$notify',
  '$unsubscribed',
  // Junk and phishing classifiers: Thunderbird, Roundcube, Claws, Apple Mail, Gmail
  'junk',
  'nonjunk',
  'notjunk',
  'nojunk',
  'junkrecorded',
  '$notphishing',
  // Evolution
  '$has_cal',
  '$has_note',
  // KMail
  '$attachment',
  '$encrypted',
  '$error',
  '$ignored',
  '$invitation',
  '$queued',
  '$replied',
  '$sent',
  '$signed',
  '$todo',
  '$watched',
  // Bulwark
  '$pinned',
  // Delivery and receipt state
  '$readreceipt',
  '$notdelivered',
  // Cyrus: backup restore, JMAP snooze, failed Sieve delivery
  '$restored',
  '$snoozed',
  '$sievefailed',
]);

/** Thunderbird's default tags: keywords, names and colors (MK-6.1). */
export const DEFAULT_MESSAGE_TAGS: ReadonlyArray<MessageTagDefinition> = [
  { keyword: '$label1', name: 'Important', color: '#FF0000', order: 0 },
  { keyword: '$label2', name: 'Work', color: '#FF9900', order: 1 },
  { keyword: '$label3', name: 'Personal', color: '#009900', order: 2 },
  { keyword: '$label4', name: 'To Do', color: '#3333FF', order: 3 },
  { keyword: '$label5', name: 'Later', color: '#993399', order: 4 },
];

/**
 * Colors offered to new tags, in the order they are handed out. The
 * first five are Thunderbird's defaults so a re-created default keeps
 * its color.
 */
export const TAG_COLOR_PALETTE: ReadonlyArray<string> = [
  '#FF0000', '#FF9900', '#009900', '#3333FF', '#993399',
  '#0099CC', '#CC6600', '#666699', '#339966', '#CC3366',
  '#996633', '#3399CC',
];

/** RFC 8621 §4.1.1 upper bound on a keyword. */
const RFC_MAX_KEYWORD_LENGTH = 255;
/** Stalwart truncates longer custom keywords silently (MK-6.3). */
export const MAX_KEYWORD_LENGTH = 128;
/**
 * Stalwart's per-account keyword cache holds 99 distinct custom
 * keywords; past that, reads and keyword filters degrade. Definitions
 * stop well short so keywords set by other clients still fit.
 */
export const MAX_TAG_DEFINITIONS = 64;
/** Display-name limit in Unicode code points, independent of the wire keyword. */
export const MAX_TAG_NAME_LENGTH = 100;

export function tagNameError(name: string): string | null {
  if (name.trim().length === 0) return 'Enter a tag name.';
  if (/[\p{Cc}\p{Cs}\u2028\u2029]/u.test(name)) return 'Tag names cannot contain control characters or line breaks.';
  if ([...name.trim()].length > MAX_TAG_NAME_LENGTH) return `Use ${MAX_TAG_NAME_LENGTH} characters or fewer.`;
  return null;
}

/** RFC 8621 §4.1.1: printable ASCII minus these. */
const FORBIDDEN_KEYWORD_CHARS = new Set(['(', ')', '{', ']', '%', '*', '"', '\\']);
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

function isKeywordChar(ch: string): boolean {
  const code = ch.charCodeAt(0);
  return code >= 0x21 && code <= 0x7e && !FORBIDDEN_KEYWORD_CHARS.has(ch);
}

export function normalizeKeyword(keyword: string): string {
  return keyword.toLowerCase();
}

export function isValidKeyword(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  if (value.length === 0 || value.length > RFC_MAX_KEYWORD_LENGTH) return false;
  for (const ch of value) {
    if (!isKeywordChar(ch)) return false;
  }
  return true;
}

export function isSystemKeyword(keyword: string): boolean {
  return SYSTEM_KEYWORDS.has(normalizeKeyword(keyword));
}

export function isReservedKeyword(keyword: string): boolean {
  return RESERVED_KEYWORDS.has(normalizeKeyword(keyword));
}

/** Tests a lowercase keyword: outside the system set, or defined and not reserved. */
function tagKeywordTest(definitions: ReadonlyArray<MessageTagDefinition>): (keyword: string) => boolean {
  const defined = new Set(definitions.map((d) => normalizeKeyword(d.keyword)));
  return (keyword) => !SYSTEM_KEYWORDS.has(keyword) || (defined.has(keyword) && !RESERVED_KEYWORDS.has(keyword));
}

/** Whether `keyword` is shown and applied as a tag under `definitions`. */
export function isTagKeyword(
  keyword: string,
  definitions: ReadonlyArray<MessageTagDefinition> = [],
): boolean {
  return tagKeywordTest(definitions)(normalizeKeyword(keyword));
}

/**
 * MK-6.3: UTF-8 hex escapes keep Unicode names independent of ASCII
 * keyword restrictions. '=' escapes itself; lowercase hex survives
 * case-insensitive keyword comparison (Thunderbird bug 650623). As in
 * Thunderbird's `nsMsgTagService::AddTag`, only ASCII is lowercased and
 * non-ASCII is escaped from the name's own bytes, so both clients derive
 * the same keyword from the same name.
 */
export function deriveTagKeyword(name: string, existing: Iterable<string> = []): string | null {
  if (tagNameError(name)) return null;
  let base = '';
  const chunks: string[] = [];
  for (const ch of name.trim()) {
    const encoded = isKeywordChar(ch) && !'=[]{}<>;&'.includes(ch)
      ? ch.toLowerCase()
      : Array.from(new TextEncoder().encode(ch), (byte) => `=${byte.toString(16).padStart(2, '0')}`).join('');
    if (base.length + encoded.length > MAX_KEYWORD_LENGTH) break;
    base += encoded;
    chunks.push(encoded);
  }
  // A tag never owns a reserved keyword: one named "$seen" gets "$seen2".
  const taken = new Set<string>(RESERVED_KEYWORDS);
  for (const keyword of existing) taken.add(normalizeKeyword(keyword));
  if (!taken.has(base)) return base;
  for (let n = 2; ; n += 1) {
    const suffix = String(n);
    while (base.length + suffix.length > MAX_KEYWORD_LENGTH) {
      base = base.slice(0, -chunks.pop()!.length);
    }
    const candidate = base + suffix;
    if (!taken.has(candidate)) return candidate;
  }
}

/**
 * The tag keywords present on a message, lowercased and deduplicated,
 * in the order the server listed them. A system keyword counts only
 * when `definitions` names it and it is not reserved. Tolerates a
 * malformed `keywords_json`.
 */
export function tagKeywordsOf(
  keywordsJson: string | null | undefined,
  definitions: ReadonlyArray<MessageTagDefinition> = [],
): string[] {
  if (!keywordsJson) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(keywordsJson);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return [];
  const isTag = tagKeywordTest(definitions);
  const out: string[] = [];
  const seen = new Set<string>();
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (value !== true) continue;
    const keyword = normalizeKeyword(key);
    if (!isTag(keyword) || seen.has(keyword)) continue;
    seen.add(keyword);
    out.push(keyword);
  }
  return out;
}

export function sortTagDefinitions(
  definitions: ReadonlyArray<MessageTagDefinition>,
): MessageTagDefinition[] {
  return [...definitions].sort(
    (a, b) => a.order - b.order || a.name.localeCompare(b.name) || a.keyword.localeCompare(b.keyword),
  );
}

/**
 * The definitions the UI offers, in display order. A stored definition
 * over a reserved keyword is valid setting data but is never a tag.
 */
export function visibleTagDefinitions(
  definitions: ReadonlyArray<MessageTagDefinition>,
): MessageTagDefinition[] {
  return sortTagDefinitions(definitions.filter((definition) => !isReservedKeyword(definition.keyword)));
}

export interface ResolvedTag {
  keyword: string;
  name: string;
  /** null for a keyword without a definition (neutral chip, MK-6.5). */
  color: string | null;
  defined: boolean;
}

/**
 * Presentation for one keyword: its definition when there is one, else
 * a neutral tag named from the keyword.
 */
export function resolveTag(
  keyword: string,
  definitions: ReadonlyArray<MessageTagDefinition>,
): ResolvedTag {
  const normalized = normalizeKeyword(keyword);
  const definition = definitions.find((d) => normalizeKeyword(d.keyword) === normalized);
  if (definition) {
    return { keyword: normalized, name: definition.name, color: definition.color, defined: true };
  }
  return { keyword: normalized, name: normalized, color: null, defined: false };
}

/**
 * Resolved tags for a message, defined ones first in definition order,
 * then undefined keywords in server order.
 */
export function resolveMessageTags(
  keywordsJson: string | null | undefined,
  definitions: ReadonlyArray<MessageTagDefinition>,
): ResolvedTag[] {
  const present = new Set(tagKeywordsOf(keywordsJson, definitions));
  if (present.size === 0) return [];
  const out: ResolvedTag[] = [];
  for (const definition of sortTagDefinitions(definitions)) {
    const keyword = normalizeKeyword(definition.keyword);
    if (!present.has(keyword)) continue;
    present.delete(keyword);
    out.push({ keyword, name: definition.name, color: definition.color, defined: true });
  }
  for (const keyword of present) {
    out.push({ keyword, name: keyword, color: null, defined: false });
  }
  return out;
}

/** First palette color no definition uses; cycles once all are taken. */
export function nextTagColor(definitions: ReadonlyArray<MessageTagDefinition>): string {
  const used = new Set(definitions.map((d) => d.color.toUpperCase()));
  return TAG_COLOR_PALETTE.find((color) => !used.has(color))
    ?? TAG_COLOR_PALETTE[definitions.length % TAG_COLOR_PALETTE.length];
}

/**
 * A random palette color for a new tag, drawn from the colors no tag uses
 * yet, or from the whole palette once every color is taken.
 */
export function randomTagColor(
  definitions: ReadonlyArray<MessageTagDefinition>,
  random: () => number = Math.random,
): string {
  const used = new Set(definitions.map((d) => d.color.toUpperCase()));
  const unused = TAG_COLOR_PALETTE.filter((color) => !used.has(color));
  const pool = unused.length > 0 ? unused : TAG_COLOR_PALETTE;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}

export type TagPresence = 'all' | 'some' | 'none';

/**
 * Whether every, some or none of the rows carry `keyword`; drives the
 * picker's tri-state checkboxes. Unloaded (null) rows are not counted
 * either way; no loaded rows means 'none'.
 */
export function tagPresence(
  rows: ReadonlyArray<{ keywords_json?: string | null } | null | undefined>,
  keyword: string,
  definitions: ReadonlyArray<MessageTagDefinition> = [],
): TagPresence {
  return tagPresenceIndex(rows, definitions).presence(keyword);
}

function presenceOf(inspected: number, carrying: number): TagPresence {
  if (carrying === 0) return 'none';
  return carrying === inspected ? 'all' : 'some';
}

/**
 * Presence of every keyword across the rows in one pass: each row's
 * `keywords_json` is parsed once. Feeds a picker listing many tags over
 * a large selection.
 */
export function tagPresenceIndex(
  rows: ReadonlyArray<{ keywords_json?: string | null } | null | undefined>,
  definitions: ReadonlyArray<MessageTagDefinition> = [],
): { inspected: number; presence: (keyword: string) => TagPresence; keywords: string[] } {
  const counts = new Map<string, number>();
  let inspected = 0;
  for (const row of rows) {
    if (row == null) continue;
    inspected += 1;
    for (const keyword of tagKeywordsOf(row.keywords_json, definitions)) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }
  return {
    inspected,
    keywords: [...counts.keys()],
    presence: (keyword) => presenceOf(inspected, counts.get(normalizeKeyword(keyword)) ?? 0),
  };
}

/** Tag keywords on the rows that have no definition, in first-seen order. */
export function undefinedKeywordsOf(
  rows: ReadonlyArray<{ keywords_json?: string | null } | null | undefined>,
  definitions: ReadonlyArray<MessageTagDefinition>,
): string[] {
  const defined = new Set(definitions.map((d) => normalizeKeyword(d.keyword)));
  const out: string[] = [];
  for (const row of rows) {
    for (const keyword of tagKeywordsOf(row?.keywords_json)) {
      if (!defined.has(keyword) && !out.includes(keyword)) out.push(keyword);
    }
  }
  return out;
}

function isMessageTagDefinition(value: unknown): value is MessageTagDefinition {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isValidKeyword(candidate.keyword)
    && typeof candidate.name === 'string'
    && tagNameError(candidate.name) === null
    && typeof candidate.color === 'string'
    && HEX_COLOR.test(candidate.color)
    && typeof candidate.order === 'number'
    && Number.isFinite(candidate.order)
  );
}

/**
 * Validator for the `messageTags` setting: a list of well-formed
 * definitions with case-insensitively unique keywords, within the cap.
 */
export function isMessageTagDefinitionList(value: unknown): value is MessageTagDefinition[] {
  if (!Array.isArray(value) || value.length > MAX_TAG_DEFINITIONS) return false;
  const keywords = new Set<string>();
  for (const item of value) {
    if (!isMessageTagDefinition(item)) return false;
    const keyword = normalizeKeyword(item.keyword);
    if (keywords.has(keyword)) return false;
    keywords.add(keyword);
  }
  return true;
}
