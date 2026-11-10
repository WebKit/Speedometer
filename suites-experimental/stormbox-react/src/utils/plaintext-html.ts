/**
 * Render a text/plain message body as display HTML, mirroring how
 * Thunderbird Desktop presents plaintext mail.
 *
 * Thunderbird (mailnews mime + mozITXTToHTMLConv) escapes the text,
 * linkifies URLs / mail addresses, preserves the original line breaks
 * and whitespace, and — by default (`mail.quoted_graphical=true`) —
 * turns `>`-prefixed quotes into nested `<blockquote type="cite">`
 * elements, dropping the literal `>` markers in favour of a coloured
 * left bar per nesting level (see comm-central messageQuotes.css).
 *
 * We reproduce that:
 *   - line breaks / blank lines / indentation are preserved because the
 *     host element uses `white-space: pre-wrap` (so the `\n` separators
 *     below render as breaks);
 *   - link detection is delegated to `linkify-string` (linkifyjs), which
 *     is more robust than a hand-rolled regex and escapes HTML itself,
 *     so its output is safe to inject (the caller still runs DOMPurify
 *     for defence in depth);
 *   - consecutive quoted lines are grouped into nested
 *     `<blockquote class="pt-quote pt-quote--lN">` with the `>` markers
 *     stripped; the bar colour per level is styled by the viewer.
 *
 * We intentionally do NOT reflow format=flowed content: JMAP exposes the
 * decoded value without the `format`/`delsp` parameters, and issue #25
 * asks for the line breaks of the MIME content to stay visible.
 */

import linkifyStr from 'linkify-string';

// Bare hosts (www.example.com) and schemeless domains resolve to https;
// every generated link opens in a new tab without leaking the opener.
const LINKIFY_OPTIONS = {
  defaultProtocol: 'https',
  target: '_blank',
  rel: 'noopener noreferrer',
  // Keep newlines as-is; the host renders with white-space: pre-wrap, so
  // converting them to <br> would double the line breaks.
  nl2br: false,
} as const;

// One quote marker: optional leading whitespace, a single '>', then an
// optional single space-stuffing character. Applied repeatedly to count
// nesting depth and strip the prefix, matching RFC 3676 space-stuffing.
const QUOTE_MARKER_RE = /^[ \t]*>[ \t]?/;

interface ParsedLine {
  depth: number;
  content: string;
}

function parseLine(line: string): ParsedLine {
  let depth = 0;
  let rest = line;
  let match = QUOTE_MARKER_RE.exec(rest);
  while (match !== null) {
    depth += 1;
    rest = rest.slice(match[0].length);
    match = QUOTE_MARKER_RE.exec(rest);
  }
  return { depth, content: rest };
}

// Thunderbird cycles its citation bar colours every five nesting levels.
function quoteClass(depth: number): string {
  const level = ((depth - 1) % 5) + 1;
  return `pt-quote pt-quote--l${level}`;
}

/**
 * Render the lines at `level` (0 = unquoted). Consecutive deeper lines
 * are wrapped in a nested blockquote. Returns the HTML for this level
 * and the index of the first line that belongs to an ancestor level.
 */
function renderLevel(lines: ParsedLine[], start: number, level: number): [string, number] {
  let html = '';
  let buffer: string[] = [];
  let i = start;

  const flush = () => {
    if (buffer.length) {
      html += buffer.join('\n');
      buffer = [];
    }
  };

  while (i < lines.length) {
    const { depth } = lines[i];
    if (depth < level) break;
    if (depth === level) {
      buffer.push(linkifyStr(lines[i].content, LINKIFY_OPTIONS));
      i += 1;
    } else {
      flush();
      const [inner, next] = renderLevel(lines, i, level + 1);
      html += `<blockquote class="${quoteClass(level + 1)}">${inner}</blockquote>`;
      i = next;
    }
  }
  flush();
  return [html, i];
}

/**
 * Convert a decoded text/plain body into display HTML. Intended to be
 * placed inside an element styled with `white-space: pre-wrap`.
 */
export function plaintextToHtml(text: string | null | undefined): string {
  if (!text) return '';
  const normalized = String(text).replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n').map(parseLine);
  return renderLevel(lines, 0, 0)[0];
}
