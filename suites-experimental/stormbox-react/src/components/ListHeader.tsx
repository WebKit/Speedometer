import { useEffect, useRef } from 'react';
import type { ComponentType, ReactNode } from 'react';
import {
  Ellipsis, Mail, MailOpen, Star, Tag, Trash2, X,
} from 'lucide-react';

import archiveIcon from '../assets/icons/tb-folder-archive.svg?react';
import junkIcon from '../assets/icons/tb-folder-spam.svg?react';
import type { Folder, SvgComponent } from '../types';
import { AppDropdown, SvgIcon, closeContainingDropdown, menuKeyDown } from './base';

type IconComponent = ComponentType<{ size?: number; strokeWidth?: number; fill?: string }>;

export type BulkActionId =
  | 'whitelist' | 'archive' | 'junk' | 'delete' | 'cancel-send' | 'toggle-star' | 'tag' | 'mark-read' | 'mark-unread';

export interface BulkActionItem {
  id: BulkActionId;
  label: string;
  title: string;
  ariaLabel: string;
  icon: IconComponent | null;
  svgIcon?: SvgComponent;
  variant: 'default' | 'danger' | 'star' | 'whitelist' | 'tag';
  pressed?: boolean;
  disabled?: boolean;
  slots: number;
  overflowRank: number | null;
  run: () => void;
}

export interface BulkActionHandlers {
  archive: () => void;
  junk: () => void;
  delete: () => void;
  cancelSend: () => void;
  toggleStar: () => void;
  tag: () => void;
  markRead: () => void;
  markUnread: () => void;
  whitelist: () => void;
}

/** The bulk actions for a checkbox selection, in display order (see Stormbox useBulkActionItems). */
export function bulkActionItems({
  folder, anyStarred, anyScheduled, handlers,
}: {
  folder: Folder | null;
  anyStarred: boolean;
  anyScheduled: boolean;
  handlers: BulkActionHandlers;
}): BulkActionItem[] {
  const role = folder?.role;
  const items: BulkActionItem[] = [];
  if (role === 'junk') {
    items.push({
      id: 'whitelist', label: 'Not junk', title: 'Whitelist senders and move to Inbox',
      ariaLabel: 'Not junk — whitelist senders and move the selected messages to Inbox',
      icon: null, variant: 'whitelist', slots: 3, overflowRank: 6, run: handlers.whitelist,
    });
  }
  if (!anyScheduled && role !== 'archive') {
    items.push({
      id: 'archive', label: 'Archive', title: 'Archive', ariaLabel: 'Archive', icon: null, svgIcon: archiveIcon,
      variant: 'default', slots: 1, overflowRank: 5, run: handlers.archive,
    });
  }
  if (!anyScheduled && role !== 'junk') {
    items.push({
      id: 'junk', label: 'Mark as junk', title: 'Junk', ariaLabel: 'Mark as junk', icon: null, svgIcon: junkIcon,
      variant: 'default', slots: 1, overflowRank: 2, run: handlers.junk,
    });
  }
  if (anyScheduled) {
    items.push({
      id: 'cancel-send', label: 'Cancel send', title: 'Cancel send',
      ariaLabel: 'Cancel send — return the selected messages to Drafts',
      icon: Trash2, variant: 'danger', slots: 1, overflowRank: null, run: handlers.cancelSend,
    });
  } else {
    items.push({
      id: 'delete', label: 'Delete', title: 'Delete', ariaLabel: 'Delete', icon: Trash2,
      variant: 'danger', slots: 1, overflowRank: null, run: handlers.delete,
    });
    items.push({
      id: 'toggle-star', label: anyStarred ? 'Unstar' : 'Star', title: anyStarred ? 'Unstar' : 'Star',
      ariaLabel: anyStarred ? 'Unstar' : 'Star', icon: Star, variant: 'star', pressed: anyStarred,
      slots: 1, overflowRank: 4, run: handlers.toggleStar,
    });
    items.push({
      id: 'tag', label: 'Tag…', title: 'Tag', ariaLabel: 'Tag selected messages', icon: Tag,
      variant: 'tag', slots: 1, overflowRank: 3, run: handlers.tag,
    });
  }
  items.push({
    id: 'mark-read', label: 'Mark as read', title: 'Mark as read', ariaLabel: 'Mark as read', icon: MailOpen,
    variant: 'default', slots: 1, overflowRank: 1, run: handlers.markRead,
  });
  items.push({
    id: 'mark-unread', label: 'Mark as unread', title: 'Mark as unread', ariaLabel: 'Mark as unread', icon: Mail,
    variant: 'default', slots: 1, overflowRank: 0, run: handlers.markUnread,
  });
  return items;
}

/** Keep actions by descending overflow rank while they fit `capacity` slots. */
export function splitBulkActions(items: readonly BulkActionItem[], capacity: number | null) {
  if (capacity == null) return { inline: [...items], overflow: [] as BulkActionItem[] };
  const inline = new Set<BulkActionItem>();
  let used = 0;
  for (const item of items) {
    if (item.overflowRank === null) {
      inline.add(item);
      used += item.slots;
    }
  }
  const candidates = items.filter((item) => item.overflowRank !== null).sort((a, b) => (b.overflowRank ?? 0) - (a.overflowRank ?? 0));
  for (const item of candidates) {
    if (used + item.slots > capacity) continue;
    inline.add(item);
    used += item.slots;
  }
  return { inline: items.filter((item) => inline.has(item)), overflow: items.filter((item) => !inline.has(item)) };
}

export function MessageBulkActions({ items, renderTag }: { items: readonly BulkActionItem[]; renderTag: (item: BulkActionItem) => ReactNode }) {
  return (
    <>
      {items.map((item) => {
        if (item.variant === 'tag') return <span key={item.id} style={{ display: 'contents' }}>{renderTag(item)}</span>;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={[
              'msg-list__bulk-action',
              item.variant === 'danger' ? 'msg-list__bulk-action--danger' : '',
              item.variant === 'star' ? 'msg-list__bulk-action--star' : '',
              item.variant === 'star' && item.pressed ? 'msg-list__bulk-action--starred' : '',
              item.variant === 'whitelist' ? 'msg-list__bulk-action--whitelist' : '',
            ].filter(Boolean).join(' ')}
            type="button"
            disabled={item.disabled}
            title={item.title}
            aria-label={item.ariaLabel}
            aria-pressed={item.variant === 'star' ? item.pressed : undefined}
            data-bulk-action={item.id}
            onClick={() => item.run()}
          >
            {item.variant === 'whitelist' ? item.label : null}
            {item.variant !== 'whitelist' && item.svgIcon ? (
              <SvgIcon className="msg-list__bulk-icon msg-list__bulk-icon--folder" icon={item.svgIcon} />
            ) : null}
            {item.variant !== 'whitelist' && !item.svgIcon && Icon ? (
              <Icon
                size={item.variant === 'star' ? 17 : item.variant === 'danger' ? 18 : 16}
                strokeWidth={item.variant === 'danger' ? 1.65 : 1.75}
                fill={item.variant === 'star' ? (item.pressed ? 'currentColor' : 'none') : undefined}
              />
            ) : null}
          </button>
        );
      })}
    </>
  );
}

export interface MoreMenuItem {
  id: string;
  label: string;
  icon?: IconComponent | null;
  svgIcon?: SvgComponent;
  disabled?: boolean;
  danger?: boolean;
  run: () => void;
}

export interface MoreMenuGroup {
  id: string;
  label?: string;
  items: MoreMenuItem[];
}

const MORE_ITEM_SELECTOR = '[role="menuitem"]:not([aria-disabled="true"])';

export function MessageListMoreMenu({ groups, label = 'More actions' }: { groups: MoreMenuGroup[]; label?: string }) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  return (
    <AppDropdown
      className="msg-list__more"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          requestAnimationFrame(() => menuRef.current?.querySelector<HTMLElement>(MORE_ITEM_SELECTOR)?.focus());
        }
      }}
    >
      <summary ref={triggerRef} className="app-dropdown__summary msg-list__more-trigger" aria-haspopup="menu" aria-label={label} title={label} data-more-menu>
        <Ellipsis size={18} strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div ref={menuRef} className="app-dropdown__menu msg-list__more-menu" role="menu" aria-label={label} onKeyDown={(event) => menuKeyDown(menuRef.current, MORE_ITEM_SELECTOR, event)}>
        {groups.map((group, index) => (
          <div key={group.id} style={{ display: 'contents' }}>
            {index > 0 ? <div className="msg-list__more-separator" role="separator" /> : null}
            <div role="group" aria-label={group.label}>
              {group.label ? <div className="app-dropdown__heading msg-list__more-heading" title={group.label} aria-hidden="true">{group.label}</div> : null}
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`app-dropdown__item msg-list__more-item${item.danger ? ' msg-list__more-item--danger' : ''}`}
                    type="button"
                    tabIndex={-1}
                    role="menuitem"
                    aria-disabled={item.disabled ? 'true' : undefined}
                    data-more-item={item.id}
                    onClick={(event) => {
                      if (item.disabled) return;
                      closeContainingDropdown(event);
                      triggerRef.current?.focus();
                      item.run();
                    }}
                  >
                    <span className="msg-list__more-icon" aria-hidden="true">
                      {item.svgIcon
                        ? <SvgIcon className="msg-list__more-icon-raw" icon={item.svgIcon} />
                        : Icon ? <Icon size={16} strokeWidth={1.75} /> : null}
                    </span>
                    <span className="msg-list__more-label">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppDropdown>
  );
}

export function SelectableListHeader({
  className, allSelected, disabled, itemLabel, singularItemLabel, selectedCount, showTotalCount, totalCount, headerTier,
  onClearSelection, onToggleAll, selectionActions, normalActions, trailing,
}: {
  className?: string;
  allSelected: boolean;
  disabled: boolean;
  itemLabel: string;
  singularItemLabel: string;
  selectedCount: number;
  showTotalCount: boolean;
  totalCount: number;
  headerTier: string;
  onClearSelection: () => void;
  onToggleAll: () => void;
  selectionActions: ReactNode;
  normalActions: ReactNode;
  trailing: ReactNode;
}) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const indeterminate = selectedCount > 0 && !allSelected;
  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = indeterminate;
  }, [indeterminate]);
  const empty = disabled || totalCount === 0;
  return (
    <header className={`selectable-list-header ${className ?? ''}`} data-header-tier={headerTier}>
      <label
        className={`selectable-list-header__select-all msg-list__select-all${empty ? ' is-disabled' : ''}`}
        title={empty ? `No ${itemLabel} to select` : (allSelected ? `Deselect all ${itemLabel}` : `Select all ${itemLabel}`)}
      >
        <input ref={selectAllRef} type="checkbox" checked={allSelected} disabled={empty} onChange={onToggleAll} aria-label="Select all messages" />
      </label>
      {selectedCount > 0 ? (
        <div className="selectable-list-header__selection-actions msg-list__bulk-actions" role="group" aria-label="Selection actions">
          {selectionActions}
          <button
            className="selectable-list-header__clear msg-list__bulk-action msg-list__bulk-action--ghost"
            type="button"
            title="Clear selection"
            aria-label="Clear selection"
            onClick={onClearSelection}
          >
            <X size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div className="selectable-list-header__normal-actions">{normalActions}</div>
      )}
      <span
        className={`selectable-list-header__count${selectedCount === 0 ? ' selectable-list-header__count--total' : ''} msg-list__count`}
        aria-live="polite"
      >
        {selectedCount > 0
          ? `${selectedCount} selected`
          : (showTotalCount && totalCount > 0 ? `${totalCount} ${totalCount === 1 ? singularItemLabel : itemLabel}` : null)}
      </span>
      {trailing}
    </header>
  );
}
