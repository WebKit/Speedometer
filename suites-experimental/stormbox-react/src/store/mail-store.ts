import { create } from 'zustand';

import { generateMailbox, type Contact } from '../data/mailbox';
import type { Folder, Message, ViewId } from '../types';
import { isTagKeyword, normalizeKeyword } from '../utils/message-tags';

export const STARRED_KEYWORD = '$flagged';
export const ARCHIVE_FOLDER_ID = 5;
export const JUNK_FOLDER_ID = 6;
export const TRASH_FOLDER_ID = 7;
export const INBOX_FOLDER_ID = 1;
export const DRAFTS_FOLDER_ID = 2;
export const SENT_FOLDER_ID = 4;

/** Folders a tag view leaves out: their mail is on its way out. */
const TAG_VIEW_EXCLUDED = new Set([JUNK_FOLDER_ID, TRASH_FOLDER_ID]);

interface Attributed {
  id: number | null;
  viewId: ViewId | null;
}

interface Selection {
  viewId: ViewId | null;
  ids: Set<number>;
}

export interface Toast {
  id: number;
  text: string;
}

export interface MailState {
  folders: Folder[];
  messages: Map<number, Message>;
  /** Message ids per folder, newest first. */
  folderIds: Map<number, number[]>;
  contacts: Contact[];
  currentViewId: ViewId;
  /** Bumped on every folder pick, including a re-pick of the current one. */
  folderPickCount: number;
  selection: Selection;
  focused: Attributed;
  open: Attributed;
  toasts: Toast[];

  selectFolder: (viewId: ViewId) => void;
  selectMessage: (id: number | null, viewId?: ViewId) => void;
  setFocusedMessage: (id: number | null, viewId: ViewId) => void;
  setSelection: (viewId: ViewId, ids: Set<number>) => void;
  clearSelection: () => void;
  markManySeen: (ids: number[], seen: boolean) => void;
  toggleManySeen: (ids: number[]) => void;
  markManyFlagged: (ids: number[], flagged: boolean) => void;
  toggleManyFlagged: (ids: number[]) => void;
  setTagsMany: (ids: number[], change: { add?: string[]; remove?: string[] }) => void;
  clearTagsMany: (ids: number[]) => void;
  moveMessages: (ids: number[], targetFolderId: number) => void;
  archiveMessages: (ids: number[]) => void;
  junkMessages: (ids: number[]) => void;
  notJunk: (ids: number[]) => void;
  destroyMessages: (ids: number[]) => void;
  cancelScheduledSend: (id: number) => void;
  addMessage: (message: Omit<Message, 'id'>) => number;
  removeMessage: (id: number) => void;
  showToast: (text: string) => void;
  dismissToast: (id: number) => void;
}

export function isTagViewId(viewId: ViewId | null | undefined): viewId is `tag:${string}` {
  return typeof viewId === 'string';
}

export function tagViewKeyword(viewId: `tag:${string}`): string {
  return viewId.slice(4);
}

export function tagViewIdFor(keyword: string): `tag:${string}` {
  return `tag:${normalizeKeyword(keyword)}`;
}

function messageHasKeyword(message: Message, keyword: string): boolean {
  if (keyword === STARRED_KEYWORD) return message.is_flagged === 1;
  if (!message.keywords_json || message.keywords_json === '{}') return false;
  try {
    const parsed = JSON.parse(message.keywords_json) as Record<string, boolean>;
    return Object.keys(parsed).some((key) => parsed[key] === true && normalizeKeyword(key) === keyword);
  } catch {
    return false;
  }
}

const sortNewestFirst = (messages: Map<number, Message>) => (a: number, b: number) =>
  (messages.get(b)!.received_at - messages.get(a)!.received_at) || (b - a);

let rowsCache: {
  messages: Map<number, Message> | null;
  folderIds: Map<number, number[]> | null;
  rows: Map<ViewId, Message[]>;
} = { messages: null, folderIds: null, rows: new Map() };

/** Rows of a folder or tag view, newest first; memoized per store snapshot. */
export function viewRows(state: Pick<MailState, 'messages' | 'folderIds'>, viewId: ViewId | null): Message[] {
  if (viewId == null) return [];
  if (rowsCache.messages !== state.messages || rowsCache.folderIds !== state.folderIds) {
    rowsCache = { messages: state.messages, folderIds: state.folderIds, rows: new Map() };
  }
  const cached = rowsCache.rows.get(viewId);
  if (cached) return cached;
  let rows: Message[];
  if (isTagViewId(viewId)) {
    const keyword = tagViewKeyword(viewId);
    rows = [];
    for (const message of state.messages.values()) {
      if (TAG_VIEW_EXCLUDED.has(message.folder_id)) continue;
      if (messageHasKeyword(message, keyword)) rows.push(message);
    }
    rows.sort((a, b) => (b.received_at - a.received_at) || (b.id - a.id));
  } else {
    rows = (state.folderIds.get(viewId) ?? []).map((id) => state.messages.get(id)!);
  }
  rowsCache.rows.set(viewId, rows);
  return rows;
}

let countsCache: { messages: Map<number, Message> | null; counts: FolderCounts } = {
  messages: null,
  counts: { unread: new Map(), total: new Map(), tags: new Map() },
};

export interface FolderCounts {
  unread: Map<number, number>;
  total: Map<number, number>;
  /** Messages carrying each tag keyword (and $flagged), outside Junk and Trash. */
  tags: Map<string, number>;
}

export function folderCounts(state: Pick<MailState, 'messages'>): FolderCounts {
  if (countsCache.messages === state.messages) return countsCache.counts;
  const unread = new Map<number, number>();
  const total = new Map<number, number>();
  const tags = new Map<string, number>();
  for (const message of state.messages.values()) {
    total.set(message.folder_id, (total.get(message.folder_id) ?? 0) + 1);
    if (message.is_seen === 0) unread.set(message.folder_id, (unread.get(message.folder_id) ?? 0) + 1);
    if (TAG_VIEW_EXCLUDED.has(message.folder_id)) continue;
    if (message.is_flagged === 1) tags.set(STARRED_KEYWORD, (tags.get(STARRED_KEYWORD) ?? 0) + 1);
    if (message.keywords_json && message.keywords_json !== '{}') {
      const parsed = JSON.parse(message.keywords_json) as Record<string, boolean>;
      for (const key of Object.keys(parsed)) {
        if (parsed[key] !== true) continue;
        const keyword = normalizeKeyword(key);
        tags.set(keyword, (tags.get(keyword) ?? 0) + 1);
      }
    }
  }
  countsCache = { messages: state.messages, counts: { unread, total, tags } };
  return countsCache.counts;
}

function updateMessages(
  messages: Map<number, Message>,
  ids: Iterable<number>,
  update: (message: Message) => Message | null,
): Map<number, Message> {
  let next: Map<number, Message> | null = null;
  for (const id of ids) {
    const current = messages.get(id);
    if (!current) continue;
    const changed = update(current);
    if (!changed || changed === current) continue;
    next ??= new Map(messages);
    next.set(id, changed);
  }
  return next ?? messages;
}

function withKeywords(message: Message, change: (keywords: Record<string, boolean>) => void): Message {
  let parsed: Record<string, boolean> = {};
  try {
    parsed = JSON.parse(message.keywords_json || '{}');
  } catch {
    parsed = {};
  }
  const before = JSON.stringify(parsed);
  change(parsed);
  const after = JSON.stringify(parsed);
  return before === after ? message : { ...message, keywords_json: after };
}

function initialState() {
  const params = typeof location === 'undefined' ? null : new URLSearchParams(location.search);
  const scale = Math.max(0.01, Number(params?.get('scale') ?? 1) || 1);
  const mailbox = generateMailbox(scale);
  const messages = new Map<number, Message>();
  const folderIds = new Map<number, number[]>();
  for (const folder of mailbox.folders) folderIds.set(folder.id, []);
  for (const message of mailbox.messages) {
    messages.set(message.id, message);
    folderIds.get(message.folder_id)!.push(message.id);
  }
  const compare = sortNewestFirst(messages);
  for (const ids of folderIds.values()) ids.sort(compare);
  return {
    folders: mailbox.folders,
    messages,
    folderIds,
    contacts: mailbox.contacts,
  };
}

let toastCounter = 0;

export const useMailStore = create<MailState>((set, get) => {
  /**
   * Drop the open message, cursor and selection when they belong to `viewId`.
   */
  function clearInteractionFor(state: MailState, viewId: ViewId | null): Partial<MailState> {
    const patch: Partial<MailState> = {};
    if (state.open.id != null && state.open.viewId === viewId) patch.open = { id: null, viewId: null };
    if (state.focused.viewId === viewId) patch.focused = { id: null, viewId: null };
    if (state.selection.ids.size > 0 && state.selection.viewId === viewId) {
      patch.selection = { viewId: null, ids: new Set() };
    }
    return patch;
  }

  /**
   * The row to preview once `ids` leave the view the open message or the
   * checkbox selection came from: the neighbour after the first removed
   * row, else the one before. Undefined when neither was affected.
   */
  function nextPreviewAfterRemoval(state: MailState, ids: Set<number>): { id: number | null; viewId: ViewId } | undefined {
    const openRemoved = state.open.id != null && ids.has(state.open.id);
    let selectionRemoved = false;
    if (state.open.id == null && state.selection.ids.size > 0) {
      for (const id of state.selection.ids) {
        if (ids.has(id)) {
          selectionRemoved = true;
          break;
        }
      }
    }
    if (!openRemoved && !selectionRemoved) return undefined;
    const viewId = (openRemoved ? state.open.viewId : state.selection.viewId) ?? state.currentViewId;
    const rows = viewRows(state, viewId);
    const first = rows.findIndex((row) => ids.has(row.id));
    if (first < 0) return { id: null, viewId };
    for (let i = first + 1; i < rows.length; i += 1) {
      if (!ids.has(rows[i].id)) return { id: rows[i].id, viewId };
    }
    for (let i = first - 1; i >= 0; i -= 1) {
      if (!ids.has(rows[i].id)) return { id: rows[i].id, viewId };
    }
    return { id: null, viewId };
  }

  function pruneInteraction(state: MailState, ids: Set<number>): Partial<MailState> {
    const patch: Partial<MailState> = {};
    if (state.open.id != null && ids.has(state.open.id)) patch.open = { id: null, viewId: null };
    if (state.focused.id != null && ids.has(state.focused.id)) patch.focused = { id: null, viewId: null };
    if (state.selection.ids.size > 0) {
      const next = new Set(state.selection.ids);
      let changed = false;
      for (const id of ids) if (next.delete(id)) changed = true;
      if (changed) patch.selection = { viewId: next.size > 0 ? state.selection.viewId : null, ids: next };
    }
    return patch;
  }

  /** Apply a removal from the visible views, then open the neighbour as Stormbox does. */
  function relocate(ids: number[], targetFolderId: number | null) {
    const state = get();
    const idSet = new Set(ids.filter((id) => state.messages.has(id)));
    if (idSet.size === 0) return;
    const next = nextPreviewAfterRemoval(state, idSet);
    const messages = new Map(state.messages);
    const folderIds = new Map(state.folderIds);
    const touchedSources = new Set<number>();
    for (const id of idSet) {
      const message = messages.get(id)!;
      touchedSources.add(message.folder_id);
      if (targetFolderId == null) messages.delete(id);
      else messages.set(id, { ...message, folder_id: targetFolderId });
    }
    for (const folderId of touchedSources) {
      folderIds.set(folderId, folderIds.get(folderId)!.filter((id) => !idSet.has(id)));
    }
    if (targetFolderId != null) {
      const target = [...folderIds.get(targetFolderId)!.filter((id) => !idSet.has(id)), ...idSet];
      target.sort(sortNewestFirst(messages));
      folderIds.set(targetFolderId, target);
    }
    const patch: Partial<MailState> = { messages, folderIds, ...pruneInteraction(state, idSet) };
    set(patch);
    if (next !== undefined) get().selectMessage(next.id, next.id == null ? undefined : next.viewId);
  }

  return {
    ...initialState(),
    currentViewId: INBOX_FOLDER_ID,
    folderPickCount: 0,
    selection: { viewId: null, ids: new Set() },
    focused: { id: null, viewId: null },
    open: { id: null, viewId: null },
    toasts: [],

    selectFolder(viewId) {
      const state = get();
      const previous = state.currentViewId;
      set({
        currentViewId: viewId,
        folderPickCount: state.folderPickCount + 1,
        ...clearInteractionFor(state, previous),
        ...(previous !== viewId ? clearInteractionFor(state, viewId) : {}),
      });
    },

    selectMessage(id, viewId) {
      const state = get();
      const owner = id == null ? null : (viewId ?? state.currentViewId);
      const patch: Partial<MailState> = {
        open: { id, viewId: owner },
        focused: { id, viewId: owner },
      };
      if (id != null) {
        const message = state.messages.get(id);
        if (message && message.is_seen === 0) {
          patch.messages = updateMessages(state.messages, [id], (m) => ({ ...m, is_seen: 1 }));
        }
      }
      set(patch);
    },

    setFocusedMessage(id, viewId) {
      set({ focused: { id, viewId: id == null ? null : viewId } });
    },

    setSelection(viewId, ids) {
      set({ selection: { viewId: ids.size > 0 ? viewId : null, ids } });
    },

    clearSelection() {
      if (get().selection.ids.size === 0) return;
      set({ selection: { viewId: null, ids: new Set() } });
    },

    markManySeen(ids, seen) {
      const value = seen ? 1 : 0;
      set({ messages: updateMessages(get().messages, ids, (m) => (m.is_seen === value ? m : { ...m, is_seen: value })) });
    },

    toggleManySeen(ids) {
      const { messages } = get();
      const anyUnread = ids.some((id) => messages.get(id)?.is_seen === 0);
      get().markManySeen(ids, anyUnread);
    },

    markManyFlagged(ids, flagged) {
      const value = flagged ? 1 : 0;
      set({ messages: updateMessages(get().messages, ids, (m) => (m.is_flagged === value ? m : { ...m, is_flagged: value })) });
    },

    toggleManyFlagged(ids) {
      const { messages } = get();
      const anyStarred = ids.some((id) => messages.get(id)?.is_flagged === 1);
      get().markManyFlagged(ids, !anyStarred);
    },

    setTagsMany(ids, { add = [], remove = [] }) {
      set({
        messages: updateMessages(get().messages, ids, (m) => withKeywords(m, (keywords) => {
          for (const keyword of remove) {
            for (const key of Object.keys(keywords)) {
              if (normalizeKeyword(key) === normalizeKeyword(keyword)) delete keywords[key];
            }
          }
          for (const keyword of add) keywords[normalizeKeyword(keyword)] = true;
        })),
      });
    },

    clearTagsMany(ids) {
      set({
        messages: updateMessages(get().messages, ids, (m) => withKeywords(m, (keywords) => {
          for (const key of Object.keys(keywords)) {
            if (isTagKeyword(key)) delete keywords[key];
          }
        })),
      });
    },

    moveMessages(ids, targetFolderId) {
      const { messages } = get();
      relocate(ids.filter((id) => messages.get(id)?.folder_id !== targetFolderId), targetFolderId);
    },

    archiveMessages(ids) {
      get().moveMessages(ids, ARCHIVE_FOLDER_ID);
    },

    junkMessages(ids) {
      get().moveMessages(ids, JUNK_FOLDER_ID);
    },

    notJunk(ids) {
      get().moveMessages(ids, INBOX_FOLDER_ID);
    },

    destroyMessages(ids) {
      const { messages } = get();
      const inTrash = ids.filter((id) => messages.get(id)?.folder_id === TRASH_FOLDER_ID);
      const elsewhere = ids.filter((id) => messages.has(id) && messages.get(id)!.folder_id !== TRASH_FOLDER_ID);
      if (elsewhere.length > 0) relocate(elsewhere, TRASH_FOLDER_ID);
      if (inTrash.length > 0) relocate(inTrash, null);
    },

    cancelScheduledSend(id) {
      const state = get();
      const message = state.messages.get(id);
      if (!message) return;
      state.selectMessage(null);
      set({
        messages: updateMessages(get().messages, [id], (m) => ({ ...m, scheduled_undo_status: null, is_draft: 1 })),
      });
      get().moveMessages([id], DRAFTS_FOLDER_ID);
      get().showToast('Sending was canceled; the message is back in Drafts.');
    },

    addMessage(input) {
      const state = get();
      let id = 0;
      for (const key of state.messages.keys()) if (key > id) id = key;
      id += 1;
      const message: Message = { ...input, id };
      const messages = new Map(state.messages);
      messages.set(id, message);
      const folderIds = new Map(state.folderIds);
      const target = [id, ...folderIds.get(message.folder_id)!];
      target.sort(sortNewestFirst(messages));
      folderIds.set(message.folder_id, target);
      set({ messages, folderIds });
      return id;
    },

    removeMessage(id) {
      relocate([id], null);
    },

    showToast(text) {
      toastCounter += 1;
      const toast = { id: toastCounter, text };
      set({ toasts: [...get().toasts.slice(-2), toast] });
    },

    dismissToast(id) {
      set({ toasts: get().toasts.filter((toast) => toast.id !== id) });
    },
  };
});

export function folderById(state: Pick<MailState, 'folders'>, id: ViewId | null): Folder | null {
  if (id == null || isTagViewId(id)) return null;
  return state.folders.find((folder) => folder.id === id) ?? null;
}
