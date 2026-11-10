import {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type { DragEvent, KeyboardEvent, MouseEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Circle, RefreshCw, Star } from 'lucide-react';

import type { JmapViewSort, Message, ViewId } from '../types';
import {
  folderById, isTagViewId, tagViewKeyword, useMailStore, viewRows,
} from '../store/mail-store';
import { readMessageDrag, useMessageDrag } from '../hooks/useMessageDrag';
import { DEFAULT_MESSAGE_TAGS } from '../utils/message-tags';
import { folderShowsRecipients } from '../utils/message-row-presentation';
import { messageMatchesQuickFilter, normalizeFilterText } from '../utils/quick-filter';
import { MessageListRow, type RowHandlers } from './MessageListRow';
import {
  MessageBulkActions, MessageListMoreMenu, SelectableListHeader, bulkActionItems, splitBulkActions,
  type MoreMenuGroup,
} from './ListHeader';
import { TagPickerDropdown, TagPickerPopover, type PopoverAnchor } from './Tags';
import { registerListCommands, type ListNavigationCommand } from '../hooks/useShortcuts';

const CARD_LAYOUT_WIDTH = 480;
const ROW_HEIGHT = 64;
const CARD_ROW_HEIGHT = 96;
const HEADER_COUNT_MIN_WIDTH = 520;
const HEADER_FILTER_LABELS_MIN_WIDTH = 440;
const HEADER_INLINE_CONTROLS_MIN_WIDTH = 340;
const BULK_ROW_FIXED_WIDTH = 232;
const BULK_ACTION_SLOT_WIDTH = 38;
const ROW_DOM_ID_PREFIX = 'msg-row-';
const GRID_ID = 'msg-listbox';

const EMPTY_SELECTION: Set<number> = new Set();
const TAG_DEFINITIONS = DEFAULT_MESSAGE_TAGS;

/** Scroll position per view, kept across folder switches for the page's lifetime. */
const scrollTops = new Map<ViewId, number>();

function sortForFolder(role: string | null | undefined): JmapViewSort {
  return role === 'sent' || role === 'drafts' || role === 'scheduled' ? 'sent' : 'received';
}

interface TagPopoverState {
  ids: number[];
  targets: Message[];
  anchor: PopoverAnchor;
  trigger: HTMLElement | null;
  returnFocus: HTMLElement | null;
}

function anchorOf(element: Element | null | undefined): PopoverAnchor | null {
  if (!element || element.getClientRects().length === 0) return null;
  const rect = element.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

export function MessageList({ quickFilterQuery }: { quickFilterQuery: string }) {
  const viewId = useMailStore((s) => s.currentViewId);
  const folders = useMailStore((s) => s.folders);
  const messages = useMailStore((s) => s.messages);
  const folderIds = useMailStore((s) => s.folderIds);
  const selection = useMailStore((s) => s.selection);
  const focused = useMailStore((s) => s.focused);
  const open = useMailStore((s) => s.open);
  const folderPickCount = useMailStore((s) => s.folderPickCount);
  const draggedIds = useMessageDrag((s) => s.draggedIds);

  const folder = folderById({ folders }, viewId);
  const isTagView = isTagViewId(viewId);
  const folderName = isTagView
    ? (TAG_DEFINITIONS.find((tag) => tag.keyword === tagViewKeyword(viewId))?.name ?? 'Starred')
    : (folder?.name ?? 'Mail');
  const regionLabel = `${folderName} messages, column 1`;

  const rows = viewRows({ messages, folderIds }, viewId);
  const selectedIds = selection.viewId === viewId ? selection.ids : EMPTY_SELECTION;
  const focusedMessageId = focused.viewId === viewId ? focused.id : null;
  const openMessageId = open.viewId === viewId ? open.id : null;

  // ----- dense local filters (Unread, Starred, Quick Filter) ---------------
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const needle = normalizeFilterText(quickFilterQuery);
  const quickFilterActive = needle.length > 0;
  const denseFilterActive = unreadOnly || flaggedOnly || quickFilterActive;

  const passes = useCallback((row: Message, includeSticky: boolean) => {
    if (includeSticky && (row.id === openMessageId || selectedIds.has(row.id))) return true;
    if (unreadOnly && row.is_seen !== 0) return false;
    if (flaggedOnly && row.is_flagged !== 1) return false;
    if (quickFilterActive && !messageMatchesQuickFilter(row, needle)) return false;
    return true;
  }, [openMessageId, selectedIds, unreadOnly, flaggedOnly, quickFilterActive, needle]);

  const visibleMessages = useMemo(
    () => (denseFilterActive ? rows.filter((row) => passes(row, true)) : rows),
    [rows, denseFilterActive, passes],
  );
  const selectAllTargets = useMemo(
    () => (denseFilterActive ? rows.filter((row) => passes(row, false)) : rows),
    [rows, denseFilterActive, passes],
  );
  const rowCount = visibleMessages.length;

  function closeOpenMessageIfFilteredOut(next: { unread: boolean; flagged: boolean; needle: string }) {
    if (openMessageId == null) return;
    const row = rows.find((candidate) => candidate.id === openMessageId);
    const ok = row
      && !(next.unread && row.is_seen !== 0)
      && !(next.flagged && row.is_flagged !== 1)
      && !(next.needle && !messageMatchesQuickFilter(row, next.needle));
    if (!ok) useMailStore.getState().selectMessage(null);
  }

  const previousNeedle = useRef(needle);
  useEffect(() => {
    if (previousNeedle.current !== needle) {
      previousNeedle.current = needle;
      closeOpenMessageIfFilteredOut({ unread: unreadOnly, flagged: flaggedOnly, needle });
    }
    // Runs only when the quick filter text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needle]);

  // ----- selection (Fastmail/Overture anchored model) ----------------------
  const anchorRef = useRef(-1);
  const selectionCount = selectedIds.size;
  const hasSelection = selectionCount > 0;

  const writeSelection = useCallback((ids: Set<number>) => {
    useMailStore.getState().setSelection(viewId, ids);
  }, [viewId]);

  const setFocused = useCallback((index: number): number | null => {
    const row = visibleMessages[index];
    if (!row) return null;
    useMailStore.getState().setFocusedMessage(row.id, viewId);
    return row.id;
  }, [visibleMessages, viewId]);

  const toggleAt = useCallback((index: number) => {
    const row = visibleMessages[index];
    if (!row) return;
    const next = new Set(selectedIds);
    if (next.has(row.id)) next.delete(row.id);
    else next.add(row.id);
    anchorRef.current = index;
    writeSelection(next);
  }, [visibleMessages, selectedIds, writeSelection]);

  const extendRange = useCallback((index: number, fallbackAnchor = index) => {
    if (index < 0 || index >= visibleMessages.length) return;
    const hadAnchor = anchorRef.current >= 0;
    const anchor = hadAnchor ? anchorRef.current : Math.max(0, Math.min(visibleMessages.length - 1, fallbackAnchor));
    const lo = Math.min(index, anchor);
    const hi = Math.max(index, anchor);
    const next = new Set<number>();
    for (let i = lo; i <= hi; i += 1) next.add(visibleMessages[i].id);
    writeSelection(next);
    if (!hadAnchor) anchorRef.current = anchor;
  }, [visibleMessages, writeSelection]);

  const selectNone = useCallback(() => {
    if (selectedIds.size > 0) writeSelection(new Set());
    anchorRef.current = -1;
  }, [selectedIds, writeSelection]);

  const openMessage = useCallback((id: number | null) => {
    useMailStore.getState().selectMessage(id, id == null ? undefined : viewId);
  }, [viewId]);

  const selectAllForCurrentFilter = useCallback(() => {
    const next = new Set<number>();
    for (const row of selectAllTargets) next.add(row.id);
    writeSelection(next);
    if (next.size > 0) anchorRef.current = 0;
  }, [selectAllTargets, writeSelection]);

  const allLoadedSelected = selectAllTargets.length > 0 && selectAllTargets.every((row) => selectedIds.has(row.id));

  // ----- viewport ----------------------------------------------------------
  const listRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [listWidth, setListWidth] = useState(0);
  const cardLayout = listWidth > 0 && listWidth < CARD_LAYOUT_WIDTH;

  useLayoutEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    setListWidth(el.clientWidth);
    const observer = new ResizeObserver(([entry]) => setListWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (cardLayout ? CARD_ROW_HEIGHT : ROW_HEIGHT),
    overscan: 8,
    getItemKey: (index) => visibleMessages[index]?.id ?? `_ph_${index}`,
  });

  useLayoutEffect(() => {
    virtualizer.measure();
  }, [cardLayout, virtualizer]);

  const scrollWriteScheduled = useRef(false);
  const onScroll = useCallback(() => {
    if (scrollWriteScheduled.current) return;
    scrollWriteScheduled.current = true;
    requestAnimationFrame(() => {
      scrollWriteScheduled.current = false;
      if (scrollRef.current) scrollTops.set(viewId, scrollRef.current.scrollTop);
    });
  }, [viewId]);

  // A folder change restores that folder's scroll position; re-picking the
  // current folder scrolls it back to the top.
  const lastView = useRef<{ viewId: ViewId; pick: number } | null>(null);
  useLayoutEffect(() => {
    const previous = lastView.current;
    lastView.current = { viewId, pick: folderPickCount };
    if (previous && previous.viewId === viewId && previous.pick === folderPickCount) return;
    virtualizer.measure();
    const el = scrollRef.current;
    if (previous && previous.viewId === viewId) {
      scrollTops.set(viewId, 0);
      if (el) el.scrollTop = 0;
      return;
    }
    if (el) el.scrollTop = scrollTops.get(viewId) ?? 0;
  }, [viewId, folderPickCount, virtualizer]);

  // Every path that moves the cursor funnels through the store's focused id.
  useEffect(() => {
    if (focusedMessageId == null || !scrollRef.current) return;
    const index = visibleMessages.findIndex((row) => row.id === focusedMessageId);
    if (index >= 0) virtualizer.scrollToIndex(index, { align: 'auto' });
    // Follows the cursor only, not every row change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedMessageId]);

  const virtualItems = virtualizer.getVirtualItems();
  const firstVisibleIndex = () => virtualItems[0]?.index ?? 0;

  // ----- header tiers -------------------------------------------------------
  const measured = listWidth > 0;
  const showsCount = !measured || listWidth >= HEADER_COUNT_MIN_WIDTH;
  const filterLabels = !measured || listWidth >= HEADER_FILTER_LABELS_MIN_WIDTH;
  const inlineControls = !hasSelection && (!measured || listWidth >= HEADER_INLINE_CONTROLS_MIN_WIDTH);
  const headerTier = !inlineControls && !hasSelection ? 'compact' : !filterLabels ? 'icon-filters' : !showsCount ? 'no-count' : 'full';
  const bulkCapacity = measured
    ? Math.max(1, Math.floor((listWidth - BULK_ROW_FIXED_WIDTH) / BULK_ACTION_SLOT_WIDTH))
    : null;

  // ----- actions ------------------------------------------------------------
  const store = useMailStore.getState;
  const selectedRows = useMemo(() => rows.filter((row) => selectedIds.has(row.id)), [rows, selectedIds]);
  const anyStarred = selectedRows.some((row) => row.is_flagged === 1);
  const anyScheduled = selectedRows.some((row) => row.scheduled_undo_status === 'pending');
  const selectedList = () => [...selectedIds];

  const [tagPopover, setTagPopover] = useState<TagPopoverState | null>(null);

  const closeTagPopover = useCallback(() => {
    setTagPopover(null);
  }, []);

  const openBulkTagPicker = useCallback(() => {
    const trigger = listRef.current?.querySelector<HTMLElement>('[data-more-menu]')
      ?? listRef.current?.querySelector<HTMLElement>('.msg-list__header') ?? null;
    const anchor = anchorOf(trigger);
    if (!anchor) return;
    setTagPopover({ ids: [...selectedIds], targets: selectedRows, anchor, trigger, returnFocus: trigger });
  }, [selectedIds, selectedRows]);

  const items = bulkActionItems({
    folder,
    anyStarred,
    anyScheduled,
    handlers: {
      archive: () => store().archiveMessages(selectedList()),
      junk: () => store().junkMessages(selectedList()),
      delete: () => store().destroyMessages(selectedList()),
      cancelSend: () => selectedRows.filter((row) => row.scheduled_undo_status === 'pending').forEach((row) => store().cancelScheduledSend(row.id)),
      toggleStar: () => store().toggleManyFlagged(selectedList()),
      tag: openBulkTagPicker,
      markRead: () => store().markManySeen(selectedList(), true),
      markUnread: () => store().markManySeen(selectedList(), false),
      whitelist: () => store().notJunk(selectedList()),
    },
  });
  const bulkActions = splitBulkActions(items, bulkCapacity);

  const refresh = useCallback(() => {}, []);

  const moreMenuGroups: MoreMenuGroup[] = [];
  if (hasSelection && bulkActions.overflow.length > 0) {
    moreMenuGroups.push({
      id: 'selection',
      items: bulkActions.overflow.map((item) => ({
        id: item.id, label: item.label, icon: item.icon, rawIcon: item.rawIcon, disabled: item.disabled, danger: item.variant === 'danger', run: item.run,
      })),
    });
  }
  if (!inlineControls) {
    moreMenuGroups.push({
      id: 'column',
      label: hasSelection ? folderName : undefined,
      items: [{ id: 'refresh', label: 'Refresh', icon: RefreshCw, run: refresh }],
    });
  }

  // ----- navigation -----------------------------------------------------------
  const navigate = useCallback((command: ListNavigationCommand) => {
    const list = visibleMessages;
    if (list.length === 0) return;
    if (command === 'first') { openMessage(list[0].id); return; }
    if (command === 'last') { openMessage(list[list.length - 1].id); return; }
    const direction = command === 'next' || command === 'nextUnread' ? 1 : -1;
    const unread = command === 'nextUnread' || command === 'previousUnread';
    let index = focusedMessageId == null ? -1 : list.findIndex((row) => row.id === focusedMessageId);
    if (index < 0) index = direction > 0 ? -1 : list.length;
    for (let next = index + direction; next >= 0 && next < list.length; next += direction) {
      if (unread && list[next].is_seen === 1) continue;
      openMessage(list[next].id);
      return;
    }
  }, [visibleMessages, focusedMessageId, openMessage]);

  const openTagMenuForTargets = useCallback(() => {
    if (selectedIds.size > 0) {
      const inline = listRef.current?.querySelector<HTMLElement>('[data-tag-picker-trigger]');
      const details = inline?.closest('details');
      if (details) {
        details.open = true;
        return;
      }
      openBulkTagPicker();
      return;
    }
    if (openMessageId == null) return;
    const row = rows.find((candidate) => candidate.id === openMessageId);
    if (!row || row.scheduled_undo_status === 'pending') return;
    const trigger = document.getElementById(`${ROW_DOM_ID_PREFIX}${openMessageId}`)?.querySelector<HTMLElement>('.msg-list__action--tag') ?? null;
    const anchor = anchorOf(trigger) ?? anchorOf(listRef.current?.querySelector('.msg-list__header'));
    if (!anchor) return;
    setTagPopover({ ids: [openMessageId], targets: [row], anchor, trigger, returnFocus: scrollRef.current });
  }, [selectedIds, openMessageId, rows, openBulkTagPicker]);

  useEffect(() => registerListCommands({
    navigate,
    selectAll: selectAllForCurrentFilter,
    openTagMenu: openTagMenuForTargets,
    containsFocus: () => listRef.current?.contains(document.activeElement) === true,
  }), [navigate, selectAllForCurrentFilter, openTagMenuForTargets]);

  function rowControls(row: Element): HTMLElement[] {
    return [...row.querySelectorAll<HTMLElement>('[data-message-control]')]
      .filter((control) => getComputedStyle(control).display !== 'none' && getComputedStyle(control).visibility !== 'hidden')
      .sort((a, b) => Number(b.matches('input')) - Number(a.matches('input')));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return;
    if ((event.metaKey || event.ctrlKey) && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      selectAllForCurrentFilter();
      return;
    }
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const control = target?.closest<HTMLElement>('[data-message-control]') ?? null;
    const row = control?.closest<HTMLElement>('[role="row"]') ?? null;
    if (control && row) {
      if (event.key === 'Tab') {
        scrollRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key === 'Escape' || event.key === 'F2') {
        event.preventDefault();
        setFocused(Number(row.dataset.index));
        scrollRef.current?.focus({ preventScroll: true });
        return;
      }
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        const controls = rowControls(row);
        const index = controls.indexOf(control);
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1);
        controls[Math.max(0, Math.min(controls.length - 1, next))]?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
      setFocused(Number(row.dataset.index));
      scrollRef.current?.focus({ preventScroll: true });
    } else if (event.key === 'F2' || event.key === 'ArrowRight' || event.key === 'Enter') {
      const rowEls = Array.from(scrollRef.current?.querySelectorAll<HTMLElement>('[role="row"]') ?? []);
      const viewport = scrollRef.current?.getBoundingClientRect();
      const inViewport = (el: HTMLElement) => {
        const bounds = el.getBoundingClientRect();
        return viewport != null && bounds.bottom > viewport.top && bounds.top < viewport.bottom;
      };
      const cursorRow = focusedMessageId != null ? document.getElementById(`${ROW_DOM_ID_PREFIX}${focusedMessageId}`) : null;
      const activeRow = cursorRow && inViewport(cursorRow) ? cursorRow : rowEls.find(inViewport) ?? cursorRow ?? rowEls[0];
      if (!activeRow) return;
      event.preventDefault();
      setFocused(Number(activeRow.dataset.index));
      if (event.key === 'Enter') activeRow.querySelector<HTMLButtonElement>('.msg-list__open')?.click();
      else rowControls(activeRow)[0]?.focus();
      return;
    }
    if ((event.key === 'Home' || event.key === 'End') && !event.shiftKey) {
      event.preventDefault();
      navigate(event.key === 'Home' ? 'first' : 'last');
      return;
    }
    if (event.key === 'Escape') {
      if (hasSelection) {
        event.preventDefault();
        selectNone();
      }
      return;
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
      const index = focusedMessageId == null ? -1 : visibleMessages.findIndex((r) => r.id === focusedMessageId);
      if (index >= 0) {
        event.preventDefault();
        toggleAt(index);
      }
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const length = visibleMessages.length;
      if (!length) return;
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const focusedIndex = focusedMessageId == null ? -1 : visibleMessages.findIndex((r) => r.id === focusedMessageId);
      let from: number;
      if (focusedIndex >= 0) from = focusedIndex;
      else if (anchorRef.current >= 0) from = anchorRef.current;
      else from = direction > 0 ? -1 : length;
      const next = Math.max(0, Math.min(length - 1, from + direction));
      if (event.shiftKey) {
        extendRange(next);
        useMailStore.getState().setFocusedMessage(visibleMessages[next].id, viewId);
      } else {
        openMessage(visibleMessages[next].id);
      }
    }
  }

  function onControlPointerInteraction(event: MouseEvent) {
    if ((event.type === 'contextmenu' ? event.button === 2 : event.detail > 0) && event.target instanceof Element
      && event.target.closest('[data-message-control], .msg-list__check')) {
      scrollRef.current?.focus({ preventScroll: true });
    }
  }

  // Row handlers go through a ref so memoized rows keep stable callbacks.
  const handlerRef = useRef<RowHandlers | null>(null);
  handlerRef.current = {
    rowClick(index, event) {
      scrollRef.current?.focus({ preventScroll: true });
      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        event.preventDefault();
        if (event.shiftKey) extendRange(index, firstVisibleIndex());
        else toggleAt(index);
        return;
      }
      const hadSelection = hasSelection;
      const id = setFocused(index);
      if (id == null) return;
      if (hadSelection) selectNone();
      if (!hadSelection && id === openMessageId) {
        openMessage(null);
        return;
      }
      openMessage(id);
    },
    checkboxClick(index, event) {
      event.stopPropagation();
      if (event.shiftKey) extendRange(index, firstVisibleIndex());
      else toggleAt(index);
    },
    dragStart(message, event) {
      scrollRef.current?.focus({ preventScroll: true });
      useMessageDrag.getState().startDrag(event, { messageId: message.id, selectedIds, sourceViewId: viewId });
    },
    dragEnd() {
      useMessageDrag.getState().endDrag();
    },
    star(message) {
      store().markManyFlagged([message.id], message.is_flagged !== 1);
    },
    tag(message, event) {
      const trigger = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;
      if (tagPopover && tagPopover.ids.length === 1 && tagPopover.ids[0] === message.id) {
        closeTagPopover();
        return;
      }
      const anchor = anchorOf(trigger);
      if (!anchor) return;
      setTagPopover({ ids: [message.id], targets: [message], anchor, trigger, returnFocus: event.detail === 0 ? trigger : scrollRef.current });
    },
    archive(id) {
      store().archiveMessages([id]);
    },
    remove(id) {
      store().destroyMessages([id]);
    },
  };
  const rowHandlers = useMemo<RowHandlers>(() => ({
    rowClick: (index, event) => handlerRef.current!.rowClick(index, event),
    checkboxClick: (index, event) => handlerRef.current!.checkboxClick(index, event),
    dragStart: (message, event) => handlerRef.current!.dragStart(message, event),
    dragEnd: () => handlerRef.current!.dragEnd(),
    star: (message) => handlerRef.current!.star(message),
    tag: (message, event) => handlerRef.current!.tag(message, event),
    archive: (id) => handlerRef.current!.archive(id),
    remove: (id) => handlerRef.current!.remove(id),
  }), []);

  const tagMenuRowId = tagPopover && tagPopover.ids.length === 1 && tagPopover.trigger?.classList.contains('msg-list__action--tag')
    ? tagPopover.ids[0]
    : null;
  const tagPopoverTargets = useMemo(() => {
    if (!tagPopover) return [];
    return tagPopover.ids.map((id) => messages.get(id) ?? tagPopover.targets.find((row) => row.id === id));
  }, [tagPopover, messages]);

  // ----- drop target: rows dragged from another view land in this folder ----
  const dragSource = useMessageDrag((s) => s.sourceViewId);
  const dragging = useMessageDrag((s) => s.dragging);
  const [dropHover, setDropHover] = useState(false);
  const dropState = dragging && dropHover && dragSource !== viewId && !isTagView ? 'move' : null;
  function onListDrop(event: DragEvent) {
    setDropHover(false);
    if (isTagView || typeof viewId !== 'number') return;
    const payload = readMessageDrag(event);
    if (!payload || payload.sourceViewId === viewId) return;
    event.preventDefault();
    store().moveMessages(payload.ids, viewId);
    useMessageDrag.getState().endDrag();
  }

  const showsRecipients = folderShowsRecipients(folder);
  const sort = sortForFolder(folder?.role);
  const isArchiveFolder = folder?.role === 'archive';
  const filteredEmptyText = `No ${[unreadOnly ? 'unread' : null, flaggedOnly ? 'starred' : null].filter(Boolean).join(' ')}${unreadOnly || flaggedOnly ? ' ' : ''}messages in ${folderName}.`;
  const draggedSet = useMemo(() => new Set(draggedIds), [draggedIds]);

  return (
    <section
      ref={listRef}
      className={[
        'msg-list',
        'msg-columns__column',
        'msg-columns__column--last',
        cardLayout ? 'msg-list--card' : '',
        'msg-list--primary',
        dropState === 'move' ? 'is-drop-valid' : '',
      ].filter(Boolean).join(' ')}
      role="region"
      aria-label={regionLabel}
      onDragEnter={() => setDropHover(true)}
      onDragOver={(event) => { if (dragSource !== viewId && !isTagView) event.preventDefault(); }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        setDropHover(false);
      }}
      onDrop={onListDrop}
    >
      <SelectableListHeader
        className="msg-list__header"
        headerTier={headerTier}
        allSelected={allLoadedSelected}
        disabled={false}
        itemLabel="messages"
        singularItemLabel="message"
        selectedCount={selectionCount}
        showTotalCount={showsCount}
        totalCount={rowCount}
        onClearSelection={selectNone}
        onToggleAll={() => (hasSelection ? selectNone() : selectAllForCurrentFilter())}
        selectionActions={(
          <MessageBulkActions
            items={bulkActions.inline}
            renderTag={(item) => (
              <TagPickerDropdown
                targets={selectedRows}
                definitions={TAG_DEFINITIONS}
                label={item.ariaLabel}
                title={item.title}
                triggerClass="msg-list__bulk-action msg-list__bulk-action--tag"
                onToggle={(keyword, on) => store().setTagsMany([...selectedIds], on ? { add: [keyword] } : { remove: [keyword] })}
                onClear={() => store().clearTagsMany([...selectedIds])}
                onManage={() => {}}
              />
            )}
          />
        )}
        normalActions={(
          <div
            className={['msg-list__filters', !filterLabels ? 'msg-list__filters--icons' : '', 'msg-list__filters--lead'].filter(Boolean).join(' ')}
            role="group"
            aria-label="Message filters"
          >
            <button
              className={`msg-list__filter${unreadOnly ? ' is-active' : ''}`}
              type="button"
              aria-pressed={unreadOnly}
              aria-label="Unread"
              title="Unread"
              onClick={() => {
                const next = !unreadOnly;
                setUnreadOnly(next);
                closeOpenMessageIfFilteredOut({ unread: next, flagged: flaggedOnly, needle });
              }}
            >
              {!filterLabels ? <Circle size={10} strokeWidth={2} fill="currentColor" aria-hidden="true" /> : 'Unread'}
            </button>
            <button
              className={`msg-list__filter msg-list__filter--starred${flaggedOnly ? ' is-active' : ''}`}
              type="button"
              aria-pressed={flaggedOnly}
              aria-label="Starred"
              title="Starred"
              onClick={() => {
                const next = !flaggedOnly;
                setFlaggedOnly(next);
                closeOpenMessageIfFilteredOut({ unread: unreadOnly, flagged: next, needle });
              }}
            >
              {!filterLabels ? <Star size={16} strokeWidth={1.75} aria-hidden="true" /> : 'Starred'}
            </button>
          </div>
        )}
        trailing={(
          <>
            {inlineControls ? (
              <button className="msg-list__refresh" type="button" aria-label="Refresh" title="Refresh" onClick={refresh}>
                <RefreshCw size={16} strokeWidth={1.75} aria-hidden="true" />
              </button>
            ) : null}
            {moreMenuGroups.length > 0 ? <MessageListMoreMenu groups={moreMenuGroups} label="More actions for column 1" /> : null}
          </>
        )}
      />

      <p className="msg-list__coverage is-idle" role="status" aria-hidden="true" data-tag-view-coverage />

      <span id={`${GRID_ID}-instructions`} hidden>
        Use Up and Down arrows to navigate messages, Space to select, and Enter to toggle the message preview.
        Press Right Arrow or F2 for message controls, then Left and Right arrows to move between them.
        Escape returns to message navigation. Tab leaves the message list.
      </span>
      {rowCount > 0 ? (
        <div
          id={GRID_ID}
          ref={scrollRef}
          className="msg-list__scroller"
          tabIndex={0}
          role="grid"
          aria-multiselectable="true"
          aria-rowcount={rowCount}
          aria-colcount={1}
          aria-describedby={`${GRID_ID}-instructions`}
          aria-label="Messages"
          aria-activedescendant={focusedMessageId != null && virtualItems.some((item) => visibleMessages[item.index]?.id === focusedMessageId)
            ? `${ROW_DOM_ID_PREFIX}${focusedMessageId}`
            : undefined}
          onScroll={onScroll}
          onKeyDown={handleKeyDown}
          onClickCapture={onControlPointerInteraction}
          onContextMenuCapture={onControlPointerInteraction}
        >
          <ol className="msg-list__items" role="presentation" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualItems.map((item) => {
              const message = visibleMessages[item.index];
              if (!message) return null;
              return (
                <MessageListRow
                  key={item.key}
                  message={message}
                  index={item.index}
                  start={item.start}
                  size={item.size}
                  domIdPrefix={ROW_DOM_ID_PREFIX}
                  focused={openMessageId === message.id}
                  cursor={focusedMessageId === message.id}
                  selected={selectedIds.has(message.id)}
                  dragging={draggedSet.has(message.id)}
                  showsRecipients={showsRecipients}
                  sort={sort}
                  hoverActions={message.scheduled_undo_status !== 'pending'}
                  archiveAction={!isArchiveFolder}
                  deleteAction
                  draggable={!isTagView}
                  tagMenuOpen={tagMenuRowId === message.id}
                  tagDefinitions={TAG_DEFINITIONS}
                  handlers={rowHandlers}
                />
              );
            })}
          </ol>
        </div>
      ) : quickFilterActive ? (
        <div className="msg-list__placeholder"><p>No messages matching "{quickFilterQuery.trim()}" in {folderName}.</p></div>
      ) : unreadOnly || flaggedOnly ? (
        <div className="msg-list__placeholder"><p>{filteredEmptyText}</p></div>
      ) : isTagView ? (
        <div className="msg-list__placeholder"><p>No messages are tagged {folderName}.</p></div>
      ) : (
        <div className="msg-list__placeholder"><p>{folderName} is empty.</p></div>
      )}

      <TagPickerPopover
        anchor={tagPopover?.anchor ?? null}
        targets={tagPopoverTargets}
        definitions={TAG_DEFINITIONS}
        trigger={tagPopover?.trigger ?? null}
        returnFocus={tagPopover?.returnFocus ?? null}
        onClose={closeTagPopover}
        onToggle={(keyword, on) => store().setTagsMany(tagPopover?.ids ?? [], on ? { add: [keyword] } : { remove: [keyword] })}
        onClear={() => store().clearTagsMany(tagPopover?.ids ?? [])}
        onManage={closeTagPopover}
      />
    </section>
  );
}
