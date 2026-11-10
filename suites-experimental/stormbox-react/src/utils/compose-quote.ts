import { LOCALE, TIME_ZONE } from '../clock';

/**
 * Subject prefixing and body quoting for reply and forward prefills.
 *
 * Who a reply is addressed to is decided in `reply.ts` from the parent's
 * structured addresses. It used to be decided here, from the rendered
 * header text split on commas, which could neither recognise the user's
 * own addresses nor see the Cc that was never rendered into a column.
 */

export function makeReplySubject(subject?: string | null): string {
  const s = (subject ?? '').trim();
  if (/^re:/i.test(s)) return s;
  return s ? `Re: ${s}` : 'Re: (no subject)';
}

export function makeForwardSubject(subject?: string | null): string {
  const s = (subject ?? '').trim();
  if (/^fwd:/i.test(s)) return s;
  return s ? `Fwd: ${s}` : 'Fwd: (no subject)';
}

export function formatQuotedHeader({
  from,
  date,
  subject,
}: {
  from?: string | null;
  date?: number | null;
  subject?: string | null;
}): string {
  const when = date
    ? new Date(Number(date)).toLocaleString(LOCALE, { timeZone: TIME_ZONE })
    : '';
  const lines = [
    from ? `From: ${from}` : null,
    when ? `Date: ${when}` : null,
    subject ? `Subject: ${subject}` : null,
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildQuotedText({
  from,
  date,
  subject,
  text,
}: {
  from?: string | null;
  date?: number | null;
  subject?: string | null;
  text?: string | null;
}): string {
  const header = formatQuotedHeader({ from, date, subject });
  const body = (text ?? '').trim();
  if (!header && !body) return '';
  if (!body) return `\n\n${header}\n`;
  const quoted = body.split('\n').map((line) => `> ${line}`).join('\n');
  return `\n\n${header}\n\n${quoted}\n`;
}

export function buildQuotedHtml({
  from,
  date,
  subject,
  html,
  text,
}: {
  from?: string | null;
  date?: number | null;
  subject?: string | null;
  html?: string | null;
  text?: string | null;
}): string {
  const header = formatQuotedHeader({ from, date, subject });
  const inner = (html ?? '').trim() || escapeHtml(text ?? '').replace(/\n/g, '<br>');
  if (!header && !inner) return '';
  const headerHtml = header.split('\n').map((line) => escapeHtml(line)).join('<br>');
  return `<br><br><div class="moz-cite-prefix">${headerHtml}<br></div>`
    + `<blockquote type="cite">${inner}</blockquote>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
