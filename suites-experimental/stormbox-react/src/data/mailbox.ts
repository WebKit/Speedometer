import type { Address, BodyKind, Folder, MailboxRole, Message } from '../types';
import {
  COMPANIES, FIRST_NAMES, FREEMAIL, LAST_NAMES, NEWSLETTERS, NEWSLETTER_HEADLINES,
  NOTIFICATION_SUBJECTS, NOTIFIERS, SUBJECT_TOPICS,
} from './corpus';
import { chance, createRng, hashSeed, int, pick, type Rng } from './random';
import { introParagraph, previewOf } from './text';
import { NOW } from '../clock';

export { NOW } from '../clock';

export const ACCOUNT: Address & { name: string } = {
  name: 'Alex Morgan',
  email: 'alex.morgan@example.org',
};

export interface Identity {
  id: number;
  name: string;
  email: string;
}

export const IDENTITIES: Identity[] = [
  { id: 1, name: 'Alex Morgan', email: 'alex.morgan@example.org' },
  { id: 2, name: 'Alex Morgan', email: 'alex@morgan.example' },
  { id: 3, name: '', email: 'support@northwind.example' },
];

export interface Contact {
  name: string;
  email: string;
  organization?: string;
  send_count: number;
  last_sent_at: number;
}

type FolderKind =
  | 'inbox' | 'work' | 'newsletter' | 'feed' | 'receipt' | 'personal'
  | 'notification' | 'sent' | 'draft' | 'scheduled' | 'junk' | 'mixed';

interface FolderSpec {
  id: number;
  name: string;
  role: MailboxRole | null;
  parent?: number;
  starred?: boolean;
  count: number;
  kind: FolderKind;
  /** Days back the oldest message reaches. */
  span: number;
}

const FOLDER_SPECS: FolderSpec[] = [
  { id: 1, name: 'Inbox', role: 'inbox', count: 1200, kind: 'inbox', span: 540 },
  { id: 2, name: 'Drafts', role: 'drafts', count: 6, kind: 'draft', span: 30 },
  { id: 3, name: 'Scheduled', role: 'scheduled', count: 2, kind: 'scheduled', span: 0 },
  { id: 4, name: 'Sent', role: 'sent', count: 350, kind: 'sent', span: 700 },
  { id: 5, name: 'Archive', role: 'archive', count: 2500, kind: 'mixed', span: 1500 },
  { id: 6, name: 'Junk', role: 'junk', count: 45, kind: 'junk', span: 30 },
  { id: 7, name: 'Trash', role: 'trash', count: 120, kind: 'mixed', span: 30 },
  { id: 10, name: 'Projects', role: null, count: 40, kind: 'work', span: 900 },
  { id: 11, name: 'Atlas', role: null, parent: 10, count: 220, kind: 'notification', span: 400 },
  { id: 12, name: 'Borealis', role: null, parent: 10, count: 140, kind: 'work', span: 600 },
  { id: 13, name: 'Design reviews', role: null, parent: 11, count: 60, kind: 'work', span: 300 },
  { id: 20, name: 'Newsletters', role: null, count: 400, kind: 'newsletter', span: 400 },
  { id: 21, name: 'Feeds', role: null, count: 300, kind: 'feed', span: 200 },
  { id: 22, name: 'Receipts', role: null, count: 160, kind: 'receipt', span: 800 },
  { id: 23, name: 'Travel', role: null, starred: true, count: 70, kind: 'personal', span: 900 },
  { id: 24, name: 'Family', role: null, starred: true, count: 110, kind: 'personal', span: 1200 },
  { id: 25, name: 'Conferences', role: null, count: 50, kind: 'work', span: 700 },
  { id: 26, name: 'Open source', role: null, count: 30, kind: 'notification', span: 500 },
  { id: 27, name: 'mozilla-central', role: null, parent: 26, count: 500, kind: 'notification', span: 300 },
  { id: 28, name: 'servo', role: null, parent: 26, count: 250, kind: 'notification', span: 300 },
];

const TAG_KEYWORDS = ['$label1', '$label2', '$label3', '$label4', '$label5'];
const DAY = 86_400_000;

function formatAddress(address: Address): string {
  return address.name ? `${address.name} <${address.email}>` : address.email;
}

function slug(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[^a-z]/g, '');
}

function buildContacts(rng: Rng): Contact[] {
  const contacts: Contact[] = [];
  const seen = new Set<string>();
  while (contacts.length < 400) {
    const first = pick(rng, FIRST_NAMES);
    const last = pick(rng, LAST_NAMES);
    const company = chance(rng, 0.7) ? pick(rng, COMPANIES) : null;
    const domain = company ? company.domain : pick(rng, FREEMAIL);
    const local = chance(rng, 0.5) ? `${slug(first)}.${slug(last)}` : `${slug(first).charAt(0)}${slug(last)}`;
    const email = `${local}@${domain}`;
    if (seen.has(email)) continue;
    seen.add(email);
    contacts.push({
      name: `${first} ${last}`,
      email,
      organization: company?.name,
      send_count: 0,
      last_sent_at: 0,
    });
  }
  return contacts;
}

function receivedTimes(rng: Rng, spec: FolderSpec, count: number): number[] {
  const times: number[] = [];
  const spanMs = Math.max(spec.span, 1) * DAY;
  for (let i = 0; i < count; i += 1) {
    const position = (i + rng() * 0.8) / Math.max(count, 1);
    const offset = spanMs * position ** 1.7 + int(rng, 2, 50) * 60_000;
    times.push(NOW - Math.round(offset));
  }
  times.sort((a, b) => b - a);
  return times;
}

function keywordsFor(rng: Rng): string {
  const keywords: Record<string, true> = {};
  if (chance(rng, 0.11)) {
    keywords[pick(rng, TAG_KEYWORDS)] = true;
    if (chance(rng, 0.3)) keywords[pick(rng, TAG_KEYWORDS)] = true;
  }
  return JSON.stringify(keywords);
}

interface Draft {
  from: Address;
  to: Address[];
  cc: Address[];
  subject: string;
  kind: BodyKind;
  attachment: boolean;
  preview?: string;
}

function personFrom(contacts: Contact[], rng: Rng): Address {
  const contact = pick(rng, contacts);
  return { name: contact.name, email: contact.email };
}

function workSubject(rng: Rng): string {
  const topic = pick(rng, SUBJECT_TOPICS);
  const r = rng();
  if (r < 0.35) return `Re: ${topic}`;
  if (r < 0.42) return `Fwd: ${topic}`;
  if (r < 0.5) return `Re: Re: ${topic}`;
  return topic.charAt(0).toUpperCase() + topic.slice(1);
}

function draftFor(kind: FolderKind, rng: Rng, contacts: Contact[]): Draft {
  const me: Address = { name: ACCOUNT.name, email: ACCOUNT.email };
  const others = () => {
    const extra: Address[] = [];
    const n = chance(rng, 0.35) ? int(rng, 1, 4) : 0;
    for (let i = 0; i < n; i += 1) extra.push(personFrom(contacts, rng));
    return extra;
  };
  switch (kind) {
    case 'inbox': {
      const r = rng();
      if (r < 0.55) return draftFor('work', rng, contacts);
      if (r < 0.7) return draftFor('newsletter', rng, contacts);
      if (r < 0.85) return draftFor('notification', rng, contacts);
      if (r < 0.93) return draftFor('personal', rng, contacts);
      return draftFor('receipt', rng, contacts);
    }
    case 'mixed': {
      const r = rng();
      if (r < 0.5) return draftFor('work', rng, contacts);
      if (r < 0.7) return draftFor('notification', rng, contacts);
      if (r < 0.85) return draftFor('newsletter', rng, contacts);
      return draftFor('personal', rng, contacts);
    }
    case 'work':
      return {
        from: personFrom(contacts, rng),
        to: [me, ...others()],
        cc: chance(rng, 0.3) ? [personFrom(contacts, rng)] : [],
        subject: workSubject(rng),
        kind: chance(rng, 0.7) ? 'text' : 'html',
        attachment: chance(rng, 0.15),
      };
    case 'personal':
      return {
        from: personFrom(contacts, rng),
        to: [me],
        cc: [],
        subject: workSubject(rng),
        kind: chance(rng, 0.6) ? 'text' : 'html',
        attachment: chance(rng, 0.25),
      };
    case 'newsletter':
    case 'feed': {
      const sender = pick(rng, NEWSLETTERS);
      const headline = pick(rng, NEWSLETTER_HEADLINES);
      return {
        from: { name: sender.name, email: sender.email },
        to: [me],
        cc: [],
        subject: kind === 'feed' ? `${sender.name}: ${headline}` : headline,
        kind: 'newsletter',
        attachment: false,
      };
    }
    case 'receipt': {
      const company = pick(rng, COMPANIES);
      const order = int(rng, 10000, 99999);
      return {
        from: { name: company.name, email: `orders@${company.domain}` },
        to: [me],
        cc: [],
        subject: `Your ${company.name} receipt for order #${order}`,
        kind: 'html',
        attachment: chance(rng, 0.4),
      };
    }
    case 'notification': {
      const notifier = pick(rng, NOTIFIERS);
      return {
        from: { name: notifier.name, email: notifier.email },
        to: [me],
        cc: [],
        subject: pick(rng, NOTIFICATION_SUBJECTS)(int(rng, 1000, 99999)),
        kind: 'notification',
        attachment: false,
      };
    }
    case 'sent':
    case 'scheduled':
      return {
        from: me,
        to: [personFrom(contacts, rng), ...others()],
        cc: chance(rng, 0.2) ? [personFrom(contacts, rng)] : [],
        subject: workSubject(rng),
        kind: 'text',
        attachment: chance(rng, 0.1),
      };
    case 'draft':
      return {
        from: me,
        to: chance(rng, 0.7) ? [personFrom(contacts, rng)] : [],
        cc: [],
        subject: chance(rng, 0.8) ? workSubject(rng) : '',
        kind: 'draft',
        attachment: false,
      };
    case 'junk': {
      const lures = [
        'You have (1) pending reward — claim now', 'Final notice: your mailbox is almost full',
        'Congratulations! You were selected', 'Re: invoice overdue — action required',
        'Exclusive offer just for you', 'Verify your account within 24 hours',
      ];
      const domain = `${pick(rng, ['promo', 'secure', 'win', 'rewards'])}${int(rng, 10, 999)}.example`;
      return {
        from: { name: pick(rng, ['Customer Service', 'Rewards Team', 'Admin', 'Security Alert']), email: `noreply@${domain}` },
        to: [me],
        cc: [],
        subject: pick(rng, lures),
        kind: 'junk',
        attachment: chance(rng, 0.2),
      };
    }
    default:
      throw new Error(`Unhandled folder kind ${String(kind)}`);
  }
}

export interface Mailbox {
  folders: Folder[];
  messages: Message[];
  contacts: Contact[];
}

/**
 * Builds the whole mailbox from a fixed seed. `scale` multiplies the
 * per-folder message counts (Drafts and Scheduled stay as they are).
 */
export function generateMailbox(scale = 1): Mailbox {
  const rng = createRng(0x5704b0);
  const contacts = buildContacts(rng);
  const folders: Folder[] = FOLDER_SPECS.map((spec) => ({
    id: spec.id,
    name: spec.name,
    role: spec.role,
    parent_id: spec.parent ?? null,
    is_starred: spec.starred ? 1 : 0,
  }));

  const messages: Message[] = [];
  let nextId = 1;
  for (const spec of FOLDER_SPECS) {
    const count = spec.kind === 'draft' || spec.kind === 'scheduled'
      ? spec.count
      : Math.max(1, Math.round(spec.count * scale));
    const times = receivedTimes(rng, spec, count);
    for (let i = 0; i < count; i += 1) {
      const draft = draftFor(spec.kind, rng, contacts);
      const id = nextId;
      nextId += 1;
      const bodySeed = hashSeed(id, 0x9e37);
      const unreadOdds = spec.kind === 'inbox'
        ? (i < 15 ? 0.6 : 0.06)
        : (spec.kind === 'newsletter' || spec.kind === 'feed' ? 0.3 : (spec.kind === 'junk' ? 0.8 : 0.02));
      const neverUnread = spec.kind === 'sent' || spec.kind === 'draft' || spec.kind === 'scheduled';
      const seen = neverUnread || !chance(rng, unreadOdds);
      const receivedAt = spec.kind === 'scheduled' ? NOW - (i + 1) * 3_600_000 : times[i];
      const sentAt = spec.kind === 'scheduled'
        ? NOW + (i + 1) * 19 * 3_600_000
        : receivedAt - int(rng, 5, 600) * 1000;
      const preview = draft.kind === 'newsletter'
        ? previewOf(`${draft.subject} — ${introParagraph(bodySeed)}`)
        : previewOf(introParagraph(bodySeed));
      messages.push({
        id,
        folder_id: spec.id,
        from_text: formatAddress(draft.from),
        to_text: draft.to.map(formatAddress).join(', '),
        cc: draft.cc,
        subject: draft.subject,
        preview,
        received_at: receivedAt,
        sent_at: sentAt,
        is_seen: seen ? 1 : 0,
        is_flagged: chance(rng, 0.06) ? 1 : 0,
        is_draft: spec.kind === 'draft' ? 1 : 0,
        has_attachment: draft.attachment ? 1 : 0,
        keywords_json: keywordsFor(rng),
        scheduled_undo_status: spec.kind === 'scheduled' ? 'pending' : null,
        body_kind: draft.kind,
        body_seed: bodySeed,
      });
      if (spec.kind === 'sent') {
        for (const recipient of draft.to) {
          const contact = contacts.find((candidate) => candidate.email === recipient.email);
          if (!contact) continue;
          contact.send_count += 1;
          contact.last_sent_at = Math.max(contact.last_sent_at, sentAt);
        }
      }
    }
  }
  return { folders, messages, contacts };
}
