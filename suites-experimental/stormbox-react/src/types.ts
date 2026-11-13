import type { FunctionComponent, SVGProps } from 'react';

/** A static SVG asset imported as a React component via `*.svg?react`. */
export type SvgComponent = FunctionComponent<SVGProps<SVGSVGElement>>;

export type MailboxRole =
  | 'inbox'
  | 'sent'
  | 'drafts'
  | 'trash'
  | 'junk'
  | 'archive'
  | 'scheduled'
  | 'important'
  | 'flagged'
  | 'all';

export type JmapViewSort = 'received' | 'sent' | 'scheduled';

export interface Address {
  name?: string;
  email: string;
}

export interface Folder {
  id: number;
  name: string;
  role: MailboxRole | null;
  parent_id: number | null;
  is_starred: 0 | 1;
}

export interface Attachment {
  name: string;
  mime_type: string;
  size: number;
}

export interface Message {
  id: number;
  folder_id: number;
  from_text: string;
  to_text: string;
  cc: Address[];
  subject: string;
  preview: string;
  received_at: number;
  sent_at: number;
  is_seen: 0 | 1;
  is_flagged: 0 | 1;
  is_draft: 0 | 1;
  has_attachment: 0 | 1;
  keywords_json: string;
  /** Set on a pending scheduled send; its toolbar is read-only. */
  scheduled_undo_status?: 'pending' | null;
  body_kind: BodyKind;
  /** Seed for the body generator; replies and sends carry their body inline instead. */
  body_seed: number;
  body?: MessageBody;
}

export type BodyKind = 'text' | 'html' | 'newsletter' | 'notification' | 'junk' | 'draft';

export interface MessageBody {
  text?: string;
  html?: string;
  attachments: Attachment[];
}

/** A tag view is addressed as `tag:<keyword>` where a folder id would go. */
export type ViewId = number | `tag:${string}`;
