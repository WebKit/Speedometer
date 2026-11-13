import { useEffect, useRef } from 'react';

import { useComposeStore } from '../store/compose-store';
import { useMailStore } from '../store/mail-store';
import { useUiStore } from '../store/ui-store';
import { isComposingKeyEvent, isEditableTarget, isMacPlatform } from '../utils/keyboard';
import { DEFAULT_MESSAGE_TAGS } from '../utils/message-tags';

export type ListNavigationCommand = 'first' | 'last' | 'next' | 'nextUnread' | 'previous' | 'previousUnread';

export interface ListCommands {
  navigate: (command: ListNavigationCommand) => void;
  selectAll: () => void;
  openTagMenu: () => void;
  containsFocus: () => boolean;
}

let listCommands: ListCommands | null = null;

/** The message list registers its commands; returns the unregister function. */
export function registerListCommands(commands: ListCommands): () => void {
  listCommands = commands;
  return () => {
    if (listCommands === commands) listCommands = null;
  };
}

/** Checked rows, else the open message. */
function targetIds(): number[] {
  const { selection, open } = useMailStore.getState();
  if (selection.ids.size > 0) return [...selection.ids];
  return open.id != null ? [open.id] : [];
}

const NAVIGATION: Record<string, ListNavigationCommand> = {
  j: 'next', k: 'previous', n: 'nextUnread', p: 'previousUnread',
};

/** The web shortcut scheme (Stormbox's default `shortcutScheme`). */
export function useShortcuts({ enabled }: { enabled: boolean }) {
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!enabledRef.current || event.defaultPrevented || isComposingKeyEvent(event)) return;
      const compose = useComposeStore.getState();
      const expanded = compose.sessions.find((session) => session.presentation === 'expanded');
      if (expanded) {
        if (event.key !== 'Escape') return;
        const focused = document.activeElement;
        if (focused?.matches?.('.compose-dialog [role="combobox"][aria-expanded="true"]')) return;
        if (document.querySelector('.compose-dialog--expanded details[data-dropdown-group][open]')) return;
        event.preventDefault();
        compose.requestClose(expanded.id);
        return;
      }
      if (event.target instanceof Element && event.target.closest('[data-message-control]')
        && ['Enter', ' ', 'Escape', 'F2', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

      const mod = isMacPlatform() ? event.metaKey : event.ctrlKey;
      const editable = isEditableTarget(event.target);
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if ((key === '/' && !mod && !editable) || (key === 'k' && mod)) {
        event.preventDefault();
        useUiStore.getState().requestQuickFilterFocus();
        return;
      }
      if (useUiStore.getState().space !== 'mail' || editable) return;
      if (event.target instanceof Element && event.target.closest('[data-tag-picker-popover], details.tag-picker-dropdown[open]')) return;
      if (event.altKey || (mod && key !== 'a')) return;

      const mail = useMailStore.getState();
      if (key === 'a' && mod) {
        if (!listCommands) return;
        event.preventDefault();
        listCommands.selectAll();
        return;
      }
      if (event.shiftKey && key !== 'r' && key !== 'Delete' && key !== 'Backspace') return;
      switch (key) {
        case 'c':
          event.preventDefault();
          compose.open();
          return;
        case 'r':
        case 'f': {
          const { open, messages } = mail;
          const message = open.id != null ? messages.get(open.id) : null;
          if (!message || message.scheduled_undo_status === 'pending' || mail.selection.ids.size > 0) return;
          event.preventDefault();
          if (key === 'f') compose.prepareForward(message);
          else compose.prepareReply(message, event.shiftKey);
          return;
        }
        case 'a':
        case 'm':
        case 's':
        case 'Delete':
        case 'Backspace': {
          if (key === 'Backspace' && !isMacPlatform()) return;
          const ids = targetIds();
          if (ids.length === 0) return;
          event.preventDefault();
          if (key === 'a') mail.archiveMessages(ids);
          else if (key === 'm') mail.toggleManySeen(ids);
          else if (key === 's') mail.toggleManyFlagged(ids);
          else mail.destroyMessages(ids);
          return;
        }
        case 't': {
          if (targetIds().length === 0 || !listCommands) return;
          event.preventDefault();
          listCommands.openTagMenu();
          return;
        }
        case 'Escape':
          if (mail.selection.ids.size === 0 || document.querySelector('details.app-dropdown[open]')) return;
          event.preventDefault();
          mail.clearSelection();
          return;
        default:
      }
      if (/^[0-9]$/.test(key)) {
        const ids = targetIds();
        if (ids.length === 0) return;
        event.preventDefault();
        if (key === '0') {
          mail.clearTagsMany(ids);
          return;
        }
        const definition = DEFAULT_MESSAGE_TAGS[Number(key) - 1];
        if (!definition) return;
        const keyword = definition.keyword.toLowerCase();
        const all = ids.every((id) => {
          const json = mail.messages.get(id)?.keywords_json ?? '{}';
          return Boolean(JSON.parse(json)[keyword]);
        });
        mail.setTagsMany(ids, all ? { remove: [keyword] } : { add: [keyword] });
        return;
      }
      const command = NAVIGATION[key];
      if (command && listCommands) {
        event.preventDefault();
        listCommands.navigate(command);
      }
    }
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, []);
}
