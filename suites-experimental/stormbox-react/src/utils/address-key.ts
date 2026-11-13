/**
 * The comparison key for an email address (CS-3.5).
 *
 * Two addresses are "the same suggestion" when their keys match. The key is
 * for comparison only — never store it in place of the address, and never
 * send it. What goes on the wire is what the user or the server gave us.
 *
 * The rules, and why each is what it is:
 *
 * - **NFC, never NFKC** (RFC 6532 §3.1). NFKC is a *compatibility* mapping:
 *   it folds ﬁ to fi, ① to 1, and full-width to ASCII. Those are different
 *   characters that happen to look related, and treating them as equal would
 *   merge addresses belonging to different people.
 * - **The domain is case-insensitive**, so it lower-cases, and it is
 *   IDNA-normalized so a Unicode domain and its punycode spelling agree.
 * - **The local part is case-SENSITIVE to the receiving server**
 *   (RFC 5321 §2.4), so nothing may rewrite it in transit. Folding its
 *   case *here* is a deliberate trade-off, on the ground that two addresses
 *   differing only by local-part case are effectively never two people.
 * - **No provider-specific canonicalization.** No dot-stripping, no
 *   plus-tag removal. `a.b@gmail.com` and `ab@gmail.com` reach the same
 *   inbox today, at Google's discretion, and `a+x@` is how people filter
 *   their own mail. Encoding either as identity would silently drop
 *   addresses the user deliberately kept apart.
 */
export function addressKey(email: string | null | undefined): string {
  const raw = String(email ?? '').trim().normalize('NFC');
  if (!raw) return '';
  const at = raw.lastIndexOf('@');
  // No domain to normalize. Folding the whole thing keeps the key total, so
  // an unparseable entry still compares equal to itself.
  if (at <= 0 || at === raw.length - 1) return raw.toLowerCase();
  return `${raw.slice(0, at).toLowerCase()}@${normalizeAddressDomain(raw.slice(at + 1))}`;
}

/**
 * A domain lower-cased and put into its IDNA (punycode) form.
 *
 * `URL` is what does the IDNA work; it is the only IDNA implementation
 * available without a dependency. It rejects some strings a mail domain may
 * legitimately be — a bracketed address literal, most obviously — so a
 * refusal falls back to the lower-cased input rather than to nothing. An
 * empty key would make every unparseable domain compare equal to every
 * other, which is the one outcome worse than not normalizing.
 */
function normalizeAddressDomain(domain: string): string {
  const lowered = domain.trim().toLowerCase();
  if (!lowered || lowered.startsWith('[')) return lowered;
  // The URL parser truncates the authority at these characters instead of
  // refusing, which would collapse distinct malformed domains onto one key.
  if (/[/?#:@\\]/.test(lowered)) return lowered;
  try {
    const { hostname } = new URL(`https://${lowered}`);
    return hostname || lowered;
  } catch {
    return lowered;
  }
}

/**
 * The lower-cased word tokens of a name, for unordered prefix matching
 * (CS-3.2), so that "jane smi" finds "Smith, Jane".
 *
 * Punctuation separates rather than sticks: "Smith, Jane" has to yield
 * `smith` and not `smith,`, or a comma in a stored name would make the token
 * unreachable by anything the user could type. Hyphens and apostrophes are
 * kept inside a word, because "Anne-Marie" and "O'Neill" are one word each
 * and splitting them would offer tokens nobody types on their own.
 */
export function nameTokens(...values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const value of values) {
    const text = String(value ?? '').normalize('NFC').toLowerCase();
    for (const token of text.split(/[^\p{L}\p{N}'’-]+/u)) {
      const trimmed = token.replace(/^['’-]+|['’-]+$/g, '');
      if (trimmed) seen.add(trimmed);
    }
  }
  return [...seen];
}
