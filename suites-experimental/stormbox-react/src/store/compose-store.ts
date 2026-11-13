import { create } from 'zustand';

import { NOW } from '../clock';
import { bodyFor } from '../data/bodies';
import { IDENTITIES, type Identity } from '../data/mailbox';
import type { Address, Message } from '../types';
import { addressKey } from '../utils/address-key';
import { formatAddress, parseAddressList, type ParsedAddress } from '../utils/address-parse';
import { buildQuotedHtml, makeForwardSubject, makeReplySubject } from '../utils/compose-quote';
import { DRAFTS_FOLDER_ID, SENT_FOLDER_ID, useMailStore } from './mail-store';

export interface InvalidRecipient {
  text: string;
  invalid: true;
}

export type RecipientEntry = ParsedAddress | InvalidRecipient;
export type RecipientField = 'to' | 'cc' | 'bcc';
export const RECIPIENT_FIELDS: readonly RecipientField[] = ['to', 'cc', 'bcc'];
export type ComposePresentation = 'expanded' | 'minimized';

export interface ComposeDraft {
  fromIdx: number;
  to: RecipientEntry[];
  cc: RecipientEntry[];
  bcc: RecipientEntry[];
  subject: string;
  html: string;
  text: string;
}

export interface ComposeSession {
  id: string;
  presentation: ComposePresentation;
  draft: ComposeDraft;
  /** Bumped when the draft is replaced wholesale; remounts the recipient fields. */
  draftEpoch: number;
  /** HTML the editor starts from. */
  editorHtmlBody: string;
  closePromptOpen: boolean;
  /** The Drafts message this session edits, replaced on save and removed on send. */
  sourceDraftId: number | null;
}

interface Prefill {
  to?: RecipientEntry[];
  cc?: RecipientEntry[];
  subject?: string;
  html?: string;
  sourceDraftId?: number | null;
}

interface ComposeState {
  sessions: ComposeSession[];
  identities: Identity[];
  open: (prefill?: Prefill) => string;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  close: (id: string) => void;
  requestClose: (id: string) => void;
  cancelClose: (id: string) => void;
  closeWithoutSaving: (id: string) => void;
  saveAndClose: (id: string) => void;
  discardDraft: (id: string) => void;
  updateDraft: (id: string, patch: Partial<ComposeDraft>) => void;
  send: (id: string, schedule?: { targetAt: number; label: string } | null) => void;
  prepareReply: (message: Message, all: boolean) => void;
  prepareForward: (message: Message) => void;
  openDraft: (message: Message) => void;
}

let sessionCounter = 0;
/** Composed mail is stamped after the fixed clock so it sorts above generated mail. */
let composeClock = NOW;

function nextTimestamp(): number {
  composeClock += 60_000;
  return composeClock;
}

export function isValidRecipient(entry: RecipientEntry): entry is ParsedAddress {
  return !('invalid' in entry);
}

export function sessionLabel(session: ComposeSession): string {
  const subject = session.draft.subject.trim();
  if (subject) return subject;
  const recipient = [...session.draft.to, ...session.draft.cc, ...session.draft.bcc].find(isValidRecipient);
  return recipient?.name?.trim() || recipient?.email || 'New message';
}

/** Whether closing would lose anything: a recipient, a subject or body text. */
export function isSessionMeaningfullyNonEmpty(session: ComposeSession): boolean {
  const { draft } = session;
  return draft.to.length + draft.cc.length + draft.bcc.length > 0
    || draft.subject.trim() !== ''
    || draft.text.replace(/\u00a0/g, ' ').trim() !== '';
}

/** Plain text as editor markup: escaped, with line breaks kept as <br>. */
function textToEditorHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function addressesOf(text: string): ParsedAddress[] {
  return parseAddressList(text).addresses;
}

function emptyDraft(): ComposeDraft {
  return { fromIdx: 0, to: [], cc: [], bcc: [], subject: '', html: '', text: '' };
}

function messageFromDraft(draft: ComposeDraft, identities: Identity[], folderId: number, extra: Partial<Message> = {}): Omit<Message, 'id'> {
  const identity = identities[draft.fromIdx] ?? identities[0];
  const from: Address = identity.name ? { name: identity.name, email: identity.email } : { email: identity.email };
  const to = draft.to.filter(isValidRecipient);
  const cc = draft.cc.filter(isValidRecipient);
  const at = nextTimestamp();
  return {
    folder_id: folderId,
    from_text: formatAddress(from),
    to_text: to.map(formatAddress).join(', '),
    cc,
    subject: draft.subject,
    preview: draft.text.replace(/\s+/g, ' ').trim().slice(0, 180),
    received_at: at,
    sent_at: at,
    is_seen: 1,
    is_flagged: 0,
    is_draft: folderId === DRAFTS_FOLDER_ID ? 1 : 0,
    has_attachment: 0,
    keywords_json: '{}',
    scheduled_undo_status: null,
    body_kind: 'html',
    body_seed: 0,
    body: { html: draft.html || '<p><br></p>', text: draft.text, attachments: [] },
    ...extra,
  };
}

export const useComposeStore = create<ComposeState>((set, get) => {
  function update(id: string, change: (session: ComposeSession) => ComposeSession) {
    set({ sessions: get().sessions.map((session) => (session.id === id ? change(session) : session)) });
  }

  function remove(id: string) {
    set({ sessions: get().sessions.filter((session) => session.id !== id) });
  }

  function find(id: string): ComposeSession | undefined {
    return get().sessions.find((session) => session.id === id);
  }

  function saveDraft(session: ComposeSession) {
    const mail = useMailStore.getState();
    if (session.sourceDraftId != null) mail.removeMessage(session.sourceDraftId);
    mail.addMessage(messageFromDraft(session.draft, get().identities, DRAFTS_FOLDER_ID));
  }

  return {
    sessions: [],
    identities: IDENTITIES,

    open(prefill = {}) {
      sessionCounter += 1;
      const id = `compose-${sessionCounter}`;
      const draft: ComposeDraft = {
        ...emptyDraft(),
        to: prefill.to ?? [],
        cc: prefill.cc ?? [],
        subject: prefill.subject ?? '',
        html: prefill.html ?? '',
      };
      const session: ComposeSession = {
        id,
        presentation: 'expanded',
        draft,
        draftEpoch: 1,
        editorHtmlBody: prefill.html ?? '',
        closePromptOpen: false,
        sourceDraftId: prefill.sourceDraftId ?? null,
      };
      set({
        sessions: [
          ...get().sessions.map((s) => (s.presentation === 'expanded' ? { ...s, presentation: 'minimized' as const } : s)),
          session,
        ],
      });
      return id;
    },

    minimize(id) {
      update(id, (session) => ({ ...session, presentation: 'minimized', closePromptOpen: false }));
    },

    restore(id) {
      set({
        sessions: get().sessions.map((session) => {
          if (session.id === id) return { ...session, presentation: 'expanded' };
          return session.presentation === 'expanded' ? { ...session, presentation: 'minimized' } : session;
        }),
      });
    },

    close(id) {
      remove(id);
    },

    requestClose(id) {
      const session = find(id);
      if (!session) return;
      if (!isSessionMeaningfullyNonEmpty(session)) {
        remove(id);
        return;
      }
      get().restore(id);
      update(id, (current) => ({ ...current, closePromptOpen: true }));
    },

    cancelClose(id) {
      update(id, (session) => ({ ...session, closePromptOpen: false }));
    },

    closeWithoutSaving(id) {
      remove(id);
    },

    saveAndClose(id) {
      const session = find(id);
      if (!session) return;
      saveDraft(session);
      remove(id);
      useMailStore.getState().showToast('Draft saved.');
    },

    discardDraft(id) {
      const session = find(id);
      if (!session) return;
      if (session.sourceDraftId != null) useMailStore.getState().removeMessage(session.sourceDraftId);
      remove(id);
    },

    updateDraft(id, patch) {
      update(id, (session) => ({ ...session, draft: { ...session.draft, ...patch } }));
    },

    send(id, schedule = null) {
      const session = find(id);
      if (!session) return;
      const mail = useMailStore.getState();
      const recipients = [...session.draft.to, ...session.draft.cc, ...session.draft.bcc];
      if (recipients.length === 0 || recipients.some((entry) => !isValidRecipient(entry))) {
        mail.showToast(recipients.length === 0
          ? 'Add at least one recipient before sending.'
          : 'Fix the invalid recipients before sending.');
        return;
      }
      if (session.sourceDraftId != null) mail.removeMessage(session.sourceDraftId);
      if (schedule) {
        mail.addMessage(messageFromDraft(session.draft, get().identities, 3, {
          sent_at: schedule.targetAt,
          scheduled_undo_status: 'pending',
        }));
        mail.showToast(`Message scheduled for ${schedule.label}.`);
      } else {
        mail.addMessage(messageFromDraft(session.draft, get().identities, SENT_FOLDER_ID));
        mail.showToast('Message sent.');
      }
      remove(id);
    },

    prepareReply(message, all) {
      const owned = new Set(get().identities.map((identity) => addressKey(identity.email)));
      const notOwned = (addresses: ParsedAddress[]) => addresses.filter((a) => !owned.has(addressKey(a.email)));
      const from = addressesOf(message.from_text);
      const selfAuthored = from.length > 0 && from.every((a) => owned.has(addressKey(a.email)));
      const originalTo = addressesOf(message.to_text);
      let to = selfAuthored ? notOwned(originalTo) : notOwned(from);
      if (to.length === 0) to = from;
      const seen = new Set(to.map((a) => addressKey(a.email)));
      const cc: ParsedAddress[] = [];
      if (all) {
        for (const address of notOwned([...originalTo, ...message.cc])) {
          const key = addressKey(address.email);
          if (seen.has(key)) continue;
          seen.add(key);
          cc.push(address);
        }
      }
      const body = bodyFor(message);
      const quoted = buildQuotedHtml({
        from: message.from_text,
        date: message.received_at,
        subject: message.subject,
        html: body.html,
        text: body.text,
      });
      get().open({
        to,
        cc,
        subject: makeReplySubject(message.subject),
        html: `<p><br></p>${quoted}`,
      });
    },

    prepareForward(message) {
      const body = bodyFor(message);
      const header = [
        `Subject: ${message.subject}`,
        `Date: ${new Date(message.received_at).toUTCString()}`,
        `From: ${message.from_text}`,
        `To: ${message.to_text}`,
      ].map((line) => line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')).join('<br>');
      const inner = body.html ?? textToEditorHtml(body.text ?? '');
      get().open({
        subject: makeForwardSubject(message.subject),
        html: `<p><br></p><div class="moz-forward-container">-------- Forwarded Message --------<br>${header}<br><br>${inner}</div>`,
      });
    },

    openDraft(message) {
      const body = bodyFor(message);
      get().open({
        to: addressesOf(message.to_text),
        cc: message.cc,
        subject: message.subject,
        html: body.html ?? textToEditorHtml(body.text ?? ''),
        sourceDraftId: message.id,
      });
    },
  };
});

