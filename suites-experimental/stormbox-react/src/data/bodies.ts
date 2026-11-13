import type { Attachment, Message, MessageBody } from '../types';
import { shortFrom } from '../utils/sender-avatar';
import { ATTACHMENT_NAMES, NEWSLETTERS, NEWSLETTER_HEADLINES } from './corpus';
import { chance, createRng, hashSeed, int, pick, type Rng } from './random';
import { introParagraph, paragraph, sentence } from './text';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function quoteLines(text: string, depth: number): string {
  const prefix = '> '.repeat(depth);
  return text.split('\n').map((line) => `${prefix}${line}`.trimEnd()).join('\n');
}

function wrap(text: string, width = 72): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    if (line && line.length + word.length + 1 > width) {
      lines.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

function quoteDate(ms: number): string {
  return new Date(ms).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' });
}

function attachmentsFor(message: Message, rng: Rng): Attachment[] {
  if (message.has_attachment !== 1) return [];
  const count = int(rng, 1, 3);
  const out: Attachment[] = [];
  for (let i = 0; i < count; i += 1) {
    const [name, mime] = pick(rng, ATTACHMENT_NAMES);
    out.push({ name, mime_type: mime, size: int(rng, 8, 9000) * 1024 + int(rng, 0, 1023) });
  }
  return out;
}

function textBody(message: Message, rng: Rng): string {
  const sender = shortFrom(message.from_text);
  const parts = [`Hi ${message.to_text ? shortFrom(message.to_text.split(',')[0]).split(' ')[0] : 'all'},`, wrap(introParagraph(message.body_seed))];
  const extra = int(rng, 1, 3);
  for (let i = 0; i < extra; i += 1) parts.push(wrap(paragraph(rng)));
  if (chance(rng, 0.3)) {
    const items = int(rng, 3, 5);
    const list: string[] = [];
    for (let i = 0; i < items; i += 1) list.push(`- ${sentence(rng)}`);
    parts.push(list.join('\n'));
  }
  if (chance(rng, 0.25)) parts.push(`Details are on https://wiki.northwind.example/${int(rng, 100, 999)} if you need them.`);
  parts.push(`Thanks,\n${sender.split(' ')[0]}`);
  let text = parts.join('\n\n');
  if (/^(re|fwd):/i.test(message.subject)) {
    const depth = /^re: re:/i.test(message.subject) ? 2 : 1;
    let quoted = '';
    for (let level = depth; level >= 1; level -= 1) {
      const when = quoteDate(message.received_at - level * int(rng, 2, 30) * 3_600_000);
      const who = level === 1 ? 'Alex Morgan <alex.morgan@example.org>' : message.from_text;
      const inner = `On ${when}, ${who} wrote:\n${wrap(paragraph(rng, 2, 4))}\n\n${wrap(paragraph(rng, 1, 3))}`;
      quoted = quoted ? `${inner}\n\n${quoteLines(quoted, 1)}` : inner;
    }
    text += `\n\n${quoteLines(quoted, 1)}`;
  }
  return `${text}\n\n-- \n${sender}\n${pick(rng, ['Senior Engineer', 'Product Manager', 'Design Lead', 'Director of Operations', 'Support'])}`;
}

function simpleHtmlBody(message: Message, rng: Rng): string {
  const sender = escapeHtml(shortFrom(message.from_text));
  const paras = [introParagraph(message.body_seed)];
  const extra = int(rng, 1, 3);
  for (let i = 0; i < extra; i += 1) paras.push(paragraph(rng));
  const blocks = paras.map((p, index) => {
    const html = escapeHtml(p);
    if (index === 1 && chance(rng, 0.5)) {
      return `<p>${html.replace(/^(\S+ \S+ \S+)/, '<b>$1</b>')}</p>`;
    }
    return `<p>${html}</p>`;
  });
  if (chance(rng, 0.4)) {
    const items = int(rng, 2, 5);
    const lis: string[] = [];
    for (let i = 0; i < items; i += 1) lis.push(`<li>${escapeHtml(sentence(rng))}</li>`);
    blocks.splice(1, 0, `<ul>${lis.join('')}</ul>`);
  }
  if (chance(rng, 0.35)) {
    blocks.push(`<p>See <a href="https://docs.northwind.example/${int(rng, 1000, 9999)}">the shared document</a> for the full write-up.</p>`);
  }
  const quote = /^(re|fwd):/i.test(message.subject)
    ? `<div class="moz-cite-prefix">On ${escapeHtml(quoteDate(message.received_at - 7_200_000))}, Alex Morgan wrote:<br></div>`
      + `<blockquote type="cite" style="margin:0 0 0 .8ex;border-left:1px solid #cccccc;padding-left:1ex;color:#555555">`
      + `<p>${escapeHtml(paragraph(rng, 2, 4))}</p></blockquote>`
    : '';
  return `<div dir="ltr" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#222222">`
    + `<p>Hi Alex,</p>${blocks.join('')}<p>Best,<br>${sender}</p>`
    + `<div style="color:#888888;font-size:12px;border-top:1px solid #e5e5e5;padding-top:8px;margin-top:16px">${sender} · ${escapeHtml(pick(rng, ['Northwind', 'Contoso', 'Fabrikam', 'Adatum']))}</div>`
    + `${quote}</div>`;
}

/** A half-written message in the markup Squire produces: one div per line. */
function draftBody(message: Message, rng: Rng): string {
  const first = message.to_text ? shortFrom(message.to_text.split(',')[0]).split(' ')[0] : '';
  const lines = [first ? `Hi ${first},` : 'Hi,', '', introParagraph(message.body_seed)];
  const extra = int(rng, 0, 2);
  for (let i = 0; i < extra; i += 1) lines.push('', paragraph(rng, 1, 3));
  return lines.map((line) => (line ? `<div>${escapeHtml(line)}</div>` : '<div><br></div>')).join('');
}

function newsletterBody(message: Message, rng: Rng): string {
  const brand = NEWSLETTERS.find((n) => message.from_text.includes(n.email)) ?? pick(rng, NEWSLETTERS);
  const color = brand.color;
  const articles = int(rng, 3, 6);
  const rows: string[] = [];
  for (let i = 0; i < articles; i += 1) {
    const headline = escapeHtml(pick(rng, NEWSLETTER_HEADLINES));
    const tint = pick(rng, ['#eef2f7', '#f6efe9', '#eaf5ef', '#f3eefa', '#fdf6e3']);
    rows.push(`<tr><td style="padding:0 28px 24px"><table width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr>`
      + `<td class="col" width="170" valign="top" style="background-color:${tint};height:110px;border-radius:8px">&nbsp;</td>`
      + `<td class="col" valign="top" style="padding-left:18px">`
      + `<h2 style="margin:0 0 6px;color:#1d1d1f;font:600 18px/1.3 Helvetica,Arial,sans-serif">${headline}</h2>`
      + `<p style="margin:0 0 8px;color:#555555;font:14px/1.55 Helvetica,Arial,sans-serif">${escapeHtml(paragraph(rng, 2, 3))}</p>`
      + `<a href="https://${brand.email.split('@')[1]}/a/${int(rng, 1000, 9999)}" style="color:${color};font:600 14px Helvetica,Arial,sans-serif;text-decoration:none">Continue reading &rarr;</a>`
      + `</td></tr></table></td></tr>`);
  }
  const unsubscribe = `https://${brand.email.split('@')[1]}/unsubscribe?u=${message.id}`;
  return `<html><head><meta name="viewport" content="width=device-width"><style>
body { margin: 0; background: #f4f4f7; }
.wrapper { width: 100%; background-color: #f4f4f7; }
.content { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
h1 { font-family: Georgia, 'Times New Roman', serif; color: #1d1d1f; font-size: 26px; line-height: 1.25; margin: 0 0 12px; }
p { color: #333333; }
.btn { display: inline-block; padding: 12px 22px; border-radius: 6px; background-color: ${color}; color: #ffffff !important; text-decoration: none; font-weight: bold; font-family: Helvetica, Arial, sans-serif; }
.footer a { color: #8a8a8a; }
@media (max-width: 620px) {
  .content { width: 100% !important; }
  .col { display: block !important; width: 100% !important; padding-left: 0 !important; }
}
</style></head><body bgcolor="#f4f4f7">
<table class="wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation"><tr><td align="center" style="padding:24px 0">
<table class="content" width="600" cellpadding="0" cellspacing="0" role="presentation">
<tr><td style="background-color:${color};padding:20px 28px;color:#ffffff;font:bold 20px Helvetica,Arial,sans-serif">${escapeHtml(brand.name)}</td></tr>
<tr><td style="padding:28px">
<h1>${escapeHtml(message.subject.replace(/^.*?: /, ''))}</h1>
<p style="font:15px/1.6 Helvetica,Arial,sans-serif;color:#333333">${escapeHtml(introParagraph(message.body_seed))}</p>
<p style="font:15px/1.6 Helvetica,Arial,sans-serif;color:#333333">${escapeHtml(paragraph(rng, 2, 4))}</p>
<a class="btn" href="https://${brand.email.split('@')[1]}/read/${message.id}">Read the full issue</a>
</td></tr>
${rows.join('\n')}
<tr><td class="footer" style="background-color:#fafafa;padding:20px 28px;color:#8a8a8a;font:12px/1.5 Helvetica,Arial,sans-serif">
You are receiving this email because you subscribed to ${escapeHtml(brand.name)}.<br>
${escapeHtml(brand.name)} · 100 Example Street · Springfield<br>
<a href="${unsubscribe}">Unsubscribe</a> · <a href="https://${brand.email.split('@')[1]}/preferences">Email preferences</a>
</td></tr>
</table></td></tr></table></body></html>`;
}

function notificationBody(message: Message, rng: Rng): string {
  const lines: string[] = [];
  const number = message.subject.match(/\d+/)?.[0] ?? String(message.id);
  lines.push(`<p style="color:#24292f;font:14px/1.5 -apple-system,Segoe UI,sans-serif">${escapeHtml(introParagraph(message.body_seed))}</p>`);
  if (chance(rng, 0.6)) {
    const code: string[] = [];
    const n = int(rng, 4, 12);
    for (let i = 0; i < n; i += 1) {
      code.push(`${pick(rng, ['  ', '    ', ''])}${pick(rng, ['let', 'const', 'if', 'return', 'await', 'fn', 'match'])} ${escapeHtml(sentence(rng).toLowerCase().replace(/[.?!]$/, ''))}${pick(rng, [';', ' {', ' }', ''])}`);
    }
    lines.push(`<pre style="background-color:#f6f8fa;color:#24292f;padding:12px;border-radius:6px;font:12px/1.45 ui-monospace,Menlo,monospace;overflow:auto">${code.join('\n')}</pre>`);
  }
  lines.push(`<p style="color:#24292f;font:14px/1.5 -apple-system,Segoe UI,sans-serif">${escapeHtml(paragraph(rng, 1, 3))}</p>`);
  lines.push(`<p style="color:#57606a;font:12px/1.5 -apple-system,Segoe UI,sans-serif;border-top:1px solid #d0d7de;padding-top:8px">`
    + `Reply to this email directly, <a href="https://forge.example/t/${number}" style="color:#0969da">view it on Forge</a>, or `
    + `<a href="https://forge.example/unsubscribe/${number}" style="color:#0969da">unsubscribe</a>.</p>`);
  return lines.join('\n');
}

function junkBody(message: Message, rng: Rng): string {
  return `<div style="background-color:#fff3cd;border:2px dashed #ff0000;padding:20px;font-family:Arial,sans-serif;text-align:center">`
    + `<h1 style="color:#ff0000;font-size:30px">${escapeHtml(message.subject)}</h1>`
    + `<p style="color:#000000;font-size:16px">${escapeHtml(introParagraph(message.body_seed))}</p>`
    + `<p><a href="https://claim.example/${int(rng, 1, 99999)}" style="background-color:#ff0000;color:#ffff00;padding:14px 30px;font-size:20px;text-decoration:none;font-weight:bold">CLAIM NOW</a></p>`
    + `<p style="color:#999999;font-size:10px">${escapeHtml(paragraph(rng, 3, 5))}</p></div>`;
}

const bodyCache = new Map<number, MessageBody>();

/** The body of a message: inline for composed mail, else generated from its seed (memoized). */
export function bodyFor(message: Message): MessageBody {
  if (message.body) return message.body;
  const cached = bodyCache.get(message.id);
  if (cached) return cached;
  const rng = createRng(hashSeed(message.body_seed, 2));
  let body: MessageBody;
  switch (message.body_kind) {
    case 'text':
      body = { text: textBody(message, rng), attachments: [] };
      break;
    case 'html':
      body = { html: simpleHtmlBody(message, rng), attachments: [] };
      break;
    case 'newsletter':
      body = { html: newsletterBody(message, rng), attachments: [] };
      break;
    case 'notification':
      body = { html: notificationBody(message, rng), attachments: [] };
      break;
    case 'junk':
      body = { html: junkBody(message, rng), attachments: [] };
      break;
    case 'draft':
      body = { html: draftBody(message, rng), attachments: [] };
      break;
    default:
      body = { text: '', attachments: [] };
  }
  body.attachments = attachmentsFor(message, rng);
  bodyCache.set(message.id, body);
  return body;
}

