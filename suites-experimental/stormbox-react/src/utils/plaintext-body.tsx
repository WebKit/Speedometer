/**
 * Render a text/plain message body as a React tree, mirroring how
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
 *   - link detection is delegated to linkifyjs's tokenizer; link tokens
 *     become `<a>` elements and everything else stays a plain string,
 *     so React's own escaping makes the output safe without an HTML
 *     sanitizer. Hrefs are still checked against the same scheme
 *     allowlist the HTML path uses;
 *   - consecutive quoted lines are grouped into nested
 *     `<blockquote class="pt-quote pt-quote--lN">` with the `>` markers
 *     stripped; the bar colour per level is styled by the viewer.
 *
 * We intentionally do NOT reflow format=flowed content: JMAP exposes the
 * decoded value without the `format`/`delsp` parameters, and issue #25
 * asks for the line breaks of the MIME content to stay visible.
 */

import type { ReactNode } from 'react';
import { tokenize } from 'linkifyjs';

import { ALLOWED_URI_REGEXP } from './message-html';

// Bare hosts (www.example.com) and schemeless domains resolve to https.
const DEFAULT_PROTOCOL = 'https';

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

/** Append one line's text and links to `out`; every link opens in a new tab without leaking the opener. */
function renderLine(content: string, lineIndex: number, out: ReactNode[]): void {
  const tokens = tokenize(content);
  for (let t = 0; t < tokens.length; t += 1) {
    const token = tokens[t];
    const text = token.toString();
    if (token.isLink) {
      const href = token.toHref(DEFAULT_PROTOCOL);
      if (ALLOWED_URI_REGEXP.test(href)) {
        out.push(
          <a key={`${lineIndex}.${t}`} href={href} target="_blank" rel="noopener noreferrer">{text}</a>,
        );
        continue;
      }
    }
    out.push(text);
  }
}

/**
 * Render the lines at `level` (0 = unquoted). Consecutive deeper lines
 * are wrapped in a nested blockquote. Returns the nodes for this level
 * and the index of the first line that belongs to an ancestor level.
 */
function renderLevel(lines: ParsedLine[], start: number, level: number): [ReactNode[], number] {
  const out: ReactNode[] = [];
  // Lines at the same level are separated by '\n'; a blockquote breaks the run.
  let inRun = false;
  let i = start;

  while (i < lines.length) {
    const { depth, content } = lines[i];
    if (depth < level) break;
    if (depth === level) {
      if (inRun) out.push('\n');
      renderLine(content, i, out);
      inRun = true;
      i += 1;
    } else {
      const [inner, next] = renderLevel(lines, i, level + 1);
      out.push(<blockquote key={`q${i}`} className={quoteClass(level + 1)}>{inner}</blockquote>);
      inRun = false;
      i = next;
    }
  }
  return [out, i];
}

/**
 * Convert a decoded text/plain body into display nodes, or null when there
 * is no text. Intended to be placed inside an element styled with
 * `white-space: pre-wrap`.
 */
export function renderPlaintextBody(text: string | null | undefined): ReactNode[] | null {
  if (!text) return null;
  const normalized = String(text).replace(/\r\n?/g, '\n');
  const lines = normalized.split('\n').map(parseLine);
  return renderLevel(lines, 0, 0)[0];
}
