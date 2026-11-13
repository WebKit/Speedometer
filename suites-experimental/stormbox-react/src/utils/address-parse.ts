/**
 * RFC 5322 §§3.4–3.4.1 address-list parsing, widened to the
 * internationalised forms of RFC 6532 §§3.1–3.2.
 *
 * The grammar exists because a comma is not a separator in an address
 * list; it is a separator *between* addresses, and it also appears inside
 * quoted display names, comments, and domain literals, where it means
 * nothing. Splitting on it first — which is what this replaces — turns
 * `"Smith, Alice" <a@example.com>` into two fragments, neither an address.
 *
 * Whether such an address can be *delivered* is a separate question this
 * does not answer: RFC 6532 addresses need SMTPUTF8 (RFC 6531) on the
 * server, and a syntactically perfect address can still bounce.
 *
 * postal-mime was read as a reference implementation rather than taken as
 * a dependency, per the product decision recorded in CS-2.3.
 *
 * The subset implemented:
 *
 *   address-list  = address *("," address)
 *   address       = mailbox / group
 *   mailbox       = name-addr / addr-spec
 *   name-addr     = [display-name] angle-addr
 *   angle-addr    = [CFWS] "<" addr-spec ">" [CFWS]
 *   group         = display-name ":" [group-list] ";" [CFWS]
 *   display-name  = phrase                 (obs-phrase, so bare dots are
 *                                           allowed: `Alice B. Smith`)
 *   addr-spec     = local-part "@" domain
 *   local-part    = dot-atom / quoted-string
 *   domain        = dot-atom / domain-literal
 *
 * Not implemented, deliberately: the obsolete routing forms of RFC 5322
 * §4.4 (`<@relay:user@host>`), which no mail submitted today uses, and
 * folding, which arrives already unfolded here because this parses user
 * input and cached header text rather than wire format.
 *
 * A fragment that does not parse is returned verbatim as a rejection
 * rather than dropped or passed through as an address (CS-2.4): dropping
 * loses a recipient the user typed, and passing it through sends a
 * malformed address to the server.
 */

export interface ParsedAddress {
  name?: string;
  email: string;
}

export interface AddressListParse {
  /** Addresses in the order they appeared, groups flattened into members. */
  addresses: ParsedAddress[];
  /** Verbatim fragments that are not addresses, in the order they appeared. */
  rejected: string[];
}

/** One thing a list held: an address, or text that is not one. */
export type ParsedElement = { address: ParsedAddress } | { rejected: string };

interface Cursor {
  src: string;
  i: number;
  /**
   * Set once a group-shaped element has scanned to the end without finding
   * a semicolon that could terminate it. Later elements can trust it rather
   * than rescanning: an element only ever begins outside a quoted string
   * and a comment, so the scan that reached the end passed every later
   * element's starting point in that same state and read the same text the
   * same way. See `skipToElementEnd`.
   */
  noGroupTerminator?: boolean;
  /** Where the last `>` in the text is, computed at most once per parse. */
  lastAngle?: number;
}

/**
 * One phrase word, with whether whitespace or a comment preceded it. The
 * flag is what lets `Alice B. Smith` come back with its spacing intact:
 * the `.` follows `B` with no space, and the display name has to say so.
 */
interface Word {
  text: string;
  spaced: boolean;
}

function isWsp(ch: string | undefined): boolean {
  return ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n';
}

/**
 * atext per RFC 5322 §3.2.3. RFC 6532 §3.2 adds every non-ASCII scalar,
 * which is why anything above the ASCII range passes: the display name and
 * both halves of the address may be UTF-8.
 */
function isAtext(ch: string | undefined): boolean {
  if (ch === undefined) return false;
  if (ch.codePointAt(0)! > 0x7f) return true;
  return /[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]/.test(ch);
}

/**
 * Skip folding whitespace and comments, including nested ones (§3.2.2).
 *
 * False means a comment was opened and never closed, and the cursor is left
 * at the end. That has to be a failure rather than the end of valid CFWS:
 * `alice@example.com (Bob <bob@example.com>` would otherwise parse as Alice
 * alone with nothing rejected, and send to a smaller audience than the one
 * the user typed, silently.
 */
function skipCfws(cur: Cursor): boolean {
  for (;;) {
    while (isWsp(cur.src[cur.i])) cur.i += 1;
    if (cur.src[cur.i] !== '(') return true;
    let depth = 0;
    do {
      const ch = cur.src[cur.i];
      if (ch === undefined) return false;
      if (ch === '\\') {
        cur.i += 2;
        continue;
      }
      if (ch === '(') depth += 1;
      else if (ch === ')') depth -= 1;
      cur.i += 1;
    } while (depth > 0);
  }
}

/**
 * Whether a code unit at `i` may appear inside a quoted-string. qtext
 * (§3.2.4) excludes controls other than the FWS whitespace, and RFC 6532
 * §3.2 adds only valid UTF-8 — so an unpaired UTF-16 surrogate, which no
 * scalar value encodes, is out too.
 */
function isQuotableAt(src: string, i: number): boolean {
  const code = src.charCodeAt(i);
  if (code < 0x20) return code === 0x09; // tab is FWS; other controls are not
  if (code === 0x7f) return false;
  if (code >= 0xd800 && code <= 0xdbff) {
    const next = src.charCodeAt(i + 1);
    return next >= 0xdc00 && next <= 0xdfff;
  }
  if (code >= 0xdc00 && code <= 0xdfff) {
    const prev = src.charCodeAt(i - 1);
    return prev >= 0xd800 && prev <= 0xdbff;
  }
  return true;
}

/**
 * Read a quoted-string (§3.2.4) from the opening quote, returning its
 * decoded content and its raw text. Null if the closing quote is missing
 * or the content is not quotable, which makes the whole fragment a
 * rejection rather than letting the rest of the list be swallowed by the
 * unterminated quote.
 */
function readQuotedString(cur: Cursor): { value: string; raw: string } | null {
  const start = cur.i;
  cur.i += 1;
  let value = '';
  for (;;) {
    const ch = cur.src[cur.i];
    if (ch === undefined) {
      cur.i = start;
      return null;
    }
    if (ch === '\\') {
      const next = cur.src[cur.i + 1];
      if (next === undefined || !isQuotableAt(cur.src, cur.i + 1)) {
        cur.i = start;
        return null;
      }
      value += next;
      cur.i += 2;
      continue;
    }
    if (ch === '"') {
      cur.i += 1;
      return { value, raw: cur.src.slice(start, cur.i) };
    }
    if (!isQuotableAt(cur.src, cur.i)) {
      cur.i = start;
      return null;
    }
    value += ch;
    cur.i += 1;
  }
}

/** Read 1*atext. Empty means there was no atom here. */
function readAtom(cur: Cursor): string {
  const start = cur.i;
  while (isAtext(cur.src[cur.i])) cur.i += 1;
  return cur.src.slice(start, cur.i);
}

/** Read dot-atom (§3.2.3): atoms joined by dots, no whitespace between. */
function readDotAtom(cur: Cursor): string {
  const start = cur.i;
  if (!isAtext(cur.src[cur.i])) return '';
  for (;;) {
    readAtom(cur);
    if (cur.src[cur.i] === '.' && isAtext(cur.src[cur.i + 1])) {
      cur.i += 1;
      continue;
    }
    return cur.src.slice(start, cur.i);
  }
}

type DomainLiteralResult =
  | { kind: 'valid'; value: string }
  | { kind: 'closed-invalid' }
  | { kind: 'unterminated' };

/**
 * Find the `]` that bounds an already-invalid domain-shaped construct.
 * Quoted strings belong to the address text after the invalid content, so
 * a `]` inside one cannot close the bracket recovery is scanning.
 */
function invalidDomainLiteralCloseAhead(cur: Cursor): number {
  const scratch: Cursor = { src: cur.src, i: cur.i };
  while (scratch.i < scratch.src.length) {
    const ch = scratch.src[scratch.i];
    if (ch === ']') return scratch.i;
    if (ch === '[') return -1;
    if (ch === '\\') {
      scratch.i += 2;
      continue;
    }
    if (ch === '"') {
      if (!readQuotedString(scratch)) return -1;
      continue;
    }
    scratch.i += 1;
  }
  return -1;
}

/**
 * Read domain-literal (§3.4.1): `[192.0.2.1]`, kept verbatim. A closed
 * invalid literal leaves the cursor after its `]`; an unterminated one
 * restores it to `[`, because only the latter owns every comma that follows.
 */
function readDomainLiteral(cur: Cursor): DomainLiteralResult {
  const start = cur.i;
  cur.i += 1;
  for (;;) {
    const ch = cur.src[cur.i];
    if (ch === undefined || ch === '[') {
      cur.i = start;
      return { kind: 'unterminated' };
    }
    if (ch === '\\') {
      cur.i += 2;
      continue;
    }
    // §3.4.1 dtext excludes space and control characters, and an address
    // holding one is not an address: without this it reaches the server,
    // which rejects the whole submission long after the field could have
    // said so.
    if (ch !== ']' && (ch === ' ' || ch === '\t' || ch < '\u0021' || ch === '\u007f')) {
      const close = invalidDomainLiteralCloseAhead(cur);
      if (close < 0) {
        cur.i = start;
        return { kind: 'unterminated' };
      }
      cur.i = close + 1;
      return { kind: 'closed-invalid' };
    }
    cur.i += 1;
    if (ch === ']') return { kind: 'valid', value: cur.src.slice(start, cur.i) };
  }
}

/**
 * Read a phrase (§3.2.5) as the words that compose it. Stops at the first
 * character that cannot continue one, leaving the cursor there so the
 * caller can see whether an address, a group, or nothing follows.
 */
function readPhraseWords(cur: Cursor): Word[] | null {
  const words: Word[] = [];
  for (;;) {
    const before = cur.i;
    if (!skipCfws(cur)) return null;
    const spaced = cur.i > before || words.length === 0;
    const ch = cur.src[cur.i];
    if (ch === '"') {
      const quoted = readQuotedString(cur);
      if (!quoted) return null;
      words.push({ text: quoted.value, spaced });
      continue;
    }
    // A bare dot is obs-phrase, not dot-atom: `Alice B. Smith` is a
    // display name a great deal of real mail carries.
    if (ch === '.') {
      cur.i += 1;
      words.push({ text: '.', spaced });
      continue;
    }
    if (isAtext(ch)) {
      words.push({ text: readAtom(cur), spaced });
      continue;
    }
    return words;
  }
}

function joinWords(words: Word[]): string {
  // NFC per RFC 6532 §3.1: an accepted name is content headed for the
  // wire, so a decomposed spelling is normalized here. Rejected fragments
  // stay byte-exact — an invalid pill reopens as typed (CS-3.16).
  return words
    .map((word, idx) => (idx > 0 && word.spaced ? ` ${word.text}` : word.text))
    .join('')
    .trim()
    .normalize('NFC');
}

/**
 * Read addr-spec (§3.4.1). The local part keeps the form it was written
 * in, quotes included: `"a b"@example.com` is only a valid address while
 * it stays quoted, so decoding it here would produce one that is not.
 */
function readAddrSpec(cur: Cursor): string | null {
  if (!skipCfws(cur)) return null;
  let local: string;
  if (cur.src[cur.i] === '"') {
    const quoted = readQuotedString(cur);
    if (!quoted) return null;
    local = quoted.raw;
  } else {
    local = readDotAtom(cur);
  }
  if (!local) return null;
  if (!skipCfws(cur)) return null;
  if (cur.src[cur.i] !== '@') return null;
  cur.i += 1;
  if (!skipCfws(cur)) return null;
  let domain: string;
  if (cur.src[cur.i] === '[') {
    const literal = readDomainLiteral(cur);
    if (literal.kind !== 'valid') return null;
    domain = literal.value;
  } else {
    domain = readDotAtom(cur);
  }
  if (!domain) return null;
  // NFC per RFC 6532 §3.1: the accepted address is what goes on the wire,
  // and canonically equivalent spellings must leave here as one form.
  return `${local}@${domain}`.normalize('NFC');
}

/**
 * Index of the top-level `>` closing an angle section that opens here, or -1
 * when none belongs to this element. Quoted strings hide their contents
 * from every scan. Outside a group, comments and domain literals do too,
 * and the scan stops at the list's comma. A group's commas separate members,
 * so its recovery scan continues through them to the semicolon.
 */
function angleCloseAhead(cur: Cursor, mayCrossComma: boolean): number {
  if (cur.lastAngle === undefined) cur.lastAngle = cur.src.lastIndexOf('>');
  if (cur.lastAngle <= cur.i) return -1;

  const scratch: Cursor = { src: cur.src, i: cur.i + 1 };
  while (scratch.i < scratch.src.length) {
    const ch = scratch.src[scratch.i];
    if (ch === '>') return scratch.i;
    if (ch === ',' && !mayCrossComma) return -1;
    if (ch === '"') {
      if (!readQuotedString(scratch)) return -1;
      continue;
    }
    if (ch === '(' && !mayCrossComma) {
      if (!skipCfws(scratch)) return -1;
      continue;
    }
    if (ch === '[' && !mayCrossComma) {
      const literal = readDomainLiteral(scratch);
      if (literal.kind === 'unterminated') return -1;
      continue;
    }
    scratch.i += 1;
  }
  return -1;
}

/**
 * Advance to the end of the element starting here, so a fragment that
 * failed to parse costs one address rather than the rest of the list.
 * Commas inside quotes, comments, angle brackets, and domain literals are
 * not separators, which is the whole reason this parser exists.
 *
 * A group ends at its semicolon and its commas separate members, so a
 * failed group is scanned through them — but only as far as a semicolon
 * that exists. Without that limit, text the grammar cannot distinguish
 * from a group would take the rest of the list with it: `https://host` and
 * `mailto:a@b` are both a phrase followed by a colon, and a user who
 * pasted one alongside real addresses must not lose them.
 */
function skipToElementEnd(cur: Cursor, wasGroup: boolean): void {
  let firstComma = -1;
  for (;;) {
    const ch = cur.src[cur.i];
    if (ch === undefined) {
      // An unterminated group is the whole remaining text; anything else
      // ended at the separator passed on the way here.
      if (wasGroup) {
        cur.noGroupTerminator = true;
        if (firstComma >= 0) cur.i = firstComma;
      }
      return;
    }
    if (ch === ',') {
      // Once the text is known to hold no semicolon that could end a group,
      // the comma is the only boundary this element can have, so the scan
      // stops here rather than running to the end again for an answer it
      // already has. Pasting 8,000 `mailto:` links — each one a phrase and a
      // colon, each one an unterminated group — cost 2.7s a keystroke
      // without this, because every element rescanned the whole list.
      if (!wasGroup || cur.noGroupTerminator) return;
      if (firstComma < 0) firstComma = cur.i;
    }
    if (ch === ';') {
      if (wasGroup) cur.i += 1;
      return;
    }
    if (ch === '"') {
      if (!readQuotedString(cur)) {
        // Unterminated: everything left belongs to this fragment.
        cur.i = cur.src.length;
        return;
      }
      continue;
    }
    if (ch === '(') {
      // Unterminated, so the rest of the text is inside the comment and
      // belongs to this fragment. skipCfws leaves the cursor at the end
      // either way, which is what keeps this loop advancing.
      if (!skipCfws(cur)) return;
      continue;
    }
    if (ch === '[') {
      const literal = readDomainLiteral(cur);
      if (literal.kind === 'unterminated') {
        // An unterminated domain literal owns the remaining text. RFC 5322
        // §3.4.1 dtext includes comma, so none inside it is a list separator.
        cur.i = cur.src.length;
        return;
      }
      continue;
    }
    if (ch === '<') {
      const close = angleCloseAhead(cur, wasGroup);
      if (close >= 0) {
        cur.i = close + 1;
        continue;
      }
      // No `>` in this element closes the `<`, so it is one ordinary
      // character of a broken fragment and falls through to the plain
      // advance below.
    }
    cur.i += 1;
  }
}

interface MailboxResult {
  /** The mailbox's addresses, or null when the text here is not one. */
  addresses: ParsedAddress[] | null;
  /** Whether it was read as a group, which is where the element ends. */
  wasGroup: boolean;
}

const FAILED: MailboxResult = { addresses: null, wasGroup: false };
const FAILED_GROUP: MailboxResult = { addresses: null, wasGroup: true };

function succeeded(addresses: ParsedAddress[]): MailboxResult {
  return { addresses, wasGroup: false };
}

/**
 * Read one mailbox: `Name <addr>`, a bare `addr`, or a group whose members
 * are returned flattened. A failure means the text here is not a mailbox,
 * and the caller turns it into a rejection.
 *
 * The display name is read first because that is the only way to tell the
 * three apart: what follows it decides. `<` makes it a name-addr, `:` a
 * group, and anything else means the phrase was itself an address.
 */
function readMailbox(cur: Cursor, depth: number): MailboxResult {
  const start = cur.i;
  const words = readPhraseWords(cur);
  if (words === null) return FAILED;
  if (!skipCfws(cur)) return FAILED;
  const ch = cur.src[cur.i];

  if (ch === '<') {
    cur.i += 1;
    const email = readAddrSpec(cur);
    if (email === null) return FAILED;
    if (!skipCfws(cur)) return FAILED;
    if (cur.src[cur.i] !== '>') return FAILED;
    cur.i += 1;
    if (!skipCfws(cur)) return FAILED;
    const name = joinWords(words);
    return succeeded([{ ...(name ? { name } : {}), email }]);
  }

  // A group nested in a group is not in the grammar (§3.4), and treating
  // one as a member would let a malformed list recurse without bound.
  if (ch === ':' && depth === 0) {
    cur.i += 1;
    const members = readGroupMembers(cur);
    return members === null ? FAILED_GROUP : { addresses: members, wasGroup: true };
  }

  if (words.length === 0) return FAILED;
  // No angle brackets and no colon, so the phrase has to have been an
  // address all along. Re-read it as one rather than guessing from the
  // words, which have already lost their punctuation.
  cur.i = start;
  const email = readAddrSpec(cur);
  if (email === null) return FAILED;
  if (!skipCfws(cur)) return FAILED;
  return succeeded([{ email }]);
}

/**
 * Read a group's members up to its terminating semicolon. A group with no
 * members is legal and contributes nothing.
 *
 * One unreadable member rejects the group whole rather than sending to the
 * rest: a group names an audience, and delivering to some of it while
 * silently dropping the remainder is the worse of the two failures.
 */
function readGroupMembers(cur: Cursor): ParsedAddress[] | null {
  const addresses: ParsedAddress[] = [];
  for (;;) {
    if (!skipCfws(cur)) return null;
    const ch = cur.src[cur.i];
    if (ch === undefined) return null;
    if (ch === ';') {
      cur.i += 1;
      if (!skipCfws(cur)) return null;
      return addresses;
    }
    if (ch === ',') {
      cur.i += 1;
      continue;
    }
    const member = readMailbox(cur, 1);
    if (member.addresses === null) return null;
    // group-list is a mailbox-list (§3.4), so a member is followed by a
    // comma or by the group's semicolon. Reading two members with nothing
    // between them would accept `Team: alice@a bob@b;`, where a comma
    // dropped while editing quietly changes who is addressed — and the same
    // text outside a group is already rejected.
    if (!skipCfws(cur)) return null;
    const after = cur.src[cur.i];
    if (after !== ',' && after !== ';') return null;
    addresses.push(...member.addresses);
  }
}

/**
 * Parse an address list into what it holds, in the order it was written.
 *
 * A control that shows each recipient separately needs the order the two
 * kinds arrived in, which `parseAddressList` flattens away: pasting
 * `a@x, rubbish, b@y` puts the fragment between the two addresses, not
 * after them.
 *
 * Never throws: this runs on whatever a user has typed so far.
 */
export function parseAddressEntries(input: string | null | undefined): ParsedElement[] {
  const entries: ParsedElement[] = [];
  if (!input) return entries;
  const cur: Cursor = { src: input, i: 0 };

  while (cur.i < cur.src.length) {
    const before = cur.i;
    if (!skipCfws(cur)) {
      // A comment that never closes. Everything from where it opened is
      // one unreadable fragment, not the whitespace it resembles.
      const fragment = cur.src.slice(before).trim();
      if (fragment) entries.push({ rejected: fragment });
      break;
    }
    const ch = cur.src[cur.i];
    if (ch === undefined) break;
    // A stray separator is not a fragment a user needs told about; the
    // old parser dropped these silently and nothing has asked for them.
    if (ch === ',' || ch === ';') {
      cur.i += 1;
      continue;
    }
    const start = cur.i;
    const parsed = readMailbox(cur, 0);
    const next = cur.src[cur.i];
    const trailing = !(next === undefined || next === ',' || next === ';');
    if (parsed.addresses === null || trailing) {
      // Either it did not parse, or it parsed and left trailing text that
      // belongs to no address — `alice@example.com nonsense`, which is one
      // malformed entry rather than an address plus rubbish.
      cur.i = start;
      skipToElementEnd(cur, parsed.wasGroup);
      const fragment = cur.src.slice(start, cur.i).trim();
      if (fragment) entries.push({ rejected: fragment });
      continue;
    }
    for (const address of parsed.addresses) entries.push({ address });
  }

  return entries;
}

/**
 * Parse an address list, reporting both what parsed and what did not.
 *
 * Never throws: this runs on whatever a user has typed so far.
 */
export function parseAddressList(input: string | null | undefined): AddressListParse {
  const addresses: ParsedAddress[] = [];
  const rejected: string[] = [];
  for (const entry of parseAddressEntries(input)) {
    if ('address' in entry) addresses.push(entry.address);
    else rejected.push(entry.rejected);
  }
  return { addresses, rejected };
}

/**
 * Render one address back into the form a user reads and this parser
 * accepts. `parseAddressList(formatAddress(a)).addresses[0]` is `a`.
 *
 * A display name is quoted when it holds a character that would otherwise
 * change the structure of the list — a comma above all, which is what made
 * `Smith, Alice` unusable before.
 */
export function formatAddress(address: ParsedAddress): string {
  // A quoted string can carry any whitespace but a line break, and controls
  // and lone surrogates are not quotable at all (§3.2.4); fold what cannot
  // survive the wire to a space, which is what header folding reads back as.
  const name = address.name
    ?.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, (m) => (m.length === 2 ? m : ' '))
    // eslint-disable-next-line no-control-regex -- folding controls is the point
    .replace(/[\u0000-\u0008\u000A-\u001F\u007F]/g, ' ')
    .trim();
  if (!name) return address.email;
  // Structural characters, and any whitespace that is not a single space:
  // an unquoted phrase is a list of words, so a run of spaces or a tab
  // between two of them is not part of either and does not survive. Inside
  // quotes it is content, and comes back as it went in.
  const needsQuotes = /[",;:<>()[\]\\@]|\s\s|[^\S ]/.test(name);
  const display = needsQuotes
    ? `"${name.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
    : name;
  return `${display} <${address.email}>`;
}

/** Render an address list for display in a recipient field. */
export function formatAddressList(addresses: readonly ParsedAddress[]): string {
  return addresses.map(formatAddress).join(', ');
}

/**
 * Whether `text` breaks off part-way through a single address.
 *
 * A recipient field treats a typed comma as "that one is finished", which is
 * wrong while the address being written is still open: the comma in
 * `"Smith, Alice"` belongs to the display name, and committing there cuts a
 * recipient in half. Quoted strings, comments, angle brackets and domain
 * literals are all places a separator separates nothing.
 */
export function endsInsideAddress(text: string): boolean {
  const cur: Cursor = { src: text, i: 0 };
  while (cur.i < text.length) {
    const ch = text[cur.i];
    if (ch === '"') {
      if (!readQuotedString(cur)) return true;
      continue;
    }
    if (ch === '(') {
      if (!skipCfws(cur)) return true;
      continue;
    }
    if (ch === '<') {
      if (!skipAngleAddr(cur)) return true;
      continue;
    }
    if (ch === '[') {
      // A bracket that is not a domain literal is only a character — a
      // display name may hold one, and reading `Alice [Work Group]` as an
      // unfinished address would suppress every comma after it. Genuinely
      // unclosed is the case that means "still being written".
      if (readDomainLiteral(cur).kind === 'unterminated') return true;
      continue;
    }
    cur.i += 1;
  }
  return false;
}

/**
 * Step over `<…>`, or report that it never closes.
 *
 * The closing bracket is the first one *outside* a quoted string: a local
 * part may hold the character, as `<"a>b"@example.com>` does, and stopping
 * at that one reads the rest of a finished address as unfinished.
 */
function skipAngleAddr(cur: Cursor): boolean {
  cur.i += 1;
  while (cur.i < cur.src.length) {
    const ch = cur.src[cur.i];
    if (ch === '"') {
      if (!readQuotedString(cur)) return false;
      continue;
    }
    cur.i += 1;
    if (ch === '>') return true;
  }
  return false;
}
