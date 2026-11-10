/**
 * Pure presentation helpers for a message-list row. Shared by every
 * surface that renders MessageListRow so the row reads the same in the
 * folder list and in other list layouts.
 */

import type { JmapViewSort } from '../types';
import { LOCALE, NOW, TIME_ZONE } from '../clock';
import { shortFrom } from './sender-avatar';

export interface MessageRowLike {
  id?: number | null;
  from_text?: string | null;
  to_text?: string | null;
  subject?: string | null;
  preview?: string | null;
  received_at?: number | string | null;
  sent_at?: number | string | null;
  is_seen?: number | string | null;
  is_flagged?: number | string | null;
  has_attachment?: number | string | null;
  keywords_json?: string | null;
  scheduled_undo_status?: string | null;
}

/** Sent and Drafts list the people you wrote to, not yourself (Fixes #98). */
export function folderShowsRecipients(
  folder: { role?: string | null } | null | undefined,
): boolean {
  const role = folder?.role;
  return role === 'sent' || role === 'drafts';
}

export function rowCorrespondent(
  row: MessageRowLike | null | undefined,
  showsRecipients: boolean,
): string | null | undefined {
  return showsRecipients ? row?.to_text : row?.from_text;
}

export function correspondentLabel(
  row: MessageRowLike | null | undefined,
  showsRecipients: boolean,
): string {
  const text = rowCorrespondent(row, showsRecipients);
  if (!text) {
    return showsRecipients ? '(no recipient)' : '(no sender)';
  }
  return shortFrom(text);
}

/**
 * The timestamp the row shows: the active sort's column, so what the
 * user sees explains the order they see it in. Received-sorted folders
 * show received_at; Sent/Drafts/Scheduled (sentAt sorts) show sent_at.
 */
export function rowTimestamp(
  row: MessageRowLike,
  sort: JmapViewSort,
): number | string | null | undefined {
  return sort === 'received'
    ? row.received_at
    : (row.sent_at ?? row.received_at);
}

export function fmtDate(ms: number | string | null | undefined): string {
  if (!ms) return '';
  const d = new Date(Number(ms));
  if (Number.isNaN(d.valueOf())) return '';
  const now = new Date(NOW);
  const sameDay = d.getUTCFullYear() === now.getUTCFullYear()
    && d.getUTCMonth() === now.getUTCMonth()
    && d.getUTCDate() === now.getUTCDate();
  if (sameDay) {
    return d.toLocaleTimeString(LOCALE, { hour: '2-digit', minute: '2-digit', timeZone: TIME_ZONE });
  }
  const sameYear = d.getUTCFullYear() === now.getUTCFullYear();
  return d.toLocaleDateString(LOCALE, sameYear
    ? { month: 'short', day: 'numeric', timeZone: TIME_ZONE }
    : { year: 'numeric', month: 'short', day: 'numeric', timeZone: TIME_ZONE });
}
