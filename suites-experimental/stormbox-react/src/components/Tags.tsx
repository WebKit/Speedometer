import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, ReactNode, SyntheticEvent } from 'react';
import { createPortal } from 'react-dom';
import {
  Check, Minus, Settings2, Tag as TagIcon, X,
} from 'lucide-react';

import {
  normalizeKeyword, tagPresenceIndex, type MessageTagDefinition, type ResolvedTag, type TagPresence,
} from '../utils/message-tags';
import type { MessageRowLike } from '../utils/message-row-presentation';
import { AppDropdown, closeContainingDropdown, menuKeyDown } from './base';

const MAX_ICONS = 3;
const BODY = 'M6 .496A.691.691 0 0 0 5.51.7L.699 5.51a.692.692 0 0 0 0 .981l4.81 4.811c.272.271.71.271.981 0l4.81-4.81c.23-.205.203-.491.2-.682V1.192A.69.69 0 0 0 10.808.5C9.553.501 7.237.501 6 .496Z';
const OUTLINE = 'M6-.004a1.2 1.2 0 0 0-.844.35l-4.81 4.81a1.202 1.202 0 0 0 0 1.688l4.81 4.81a1.202 1.202 0 0 0 1.688 0l4.789-4.79c.416-.372.37-.911.367-1.063V1.19A1.2 1.2 0 0 0 10.808 0 1272.319 1272.319 0 0 1 6-.005zm-.002 1H6c1.238.005 3.553.005 4.808.004.116 0 .192.076.192.192v4.624c.003.231.01.264-.032.301a.53.53 0 0 0-.021.02l-4.81 4.81c-.082.082-.21.097-.274 0l-4.81-4.81a.184.184 0 0 1 0-.274l4.81-4.81a.216.216 0 0 1 .135-.057zM9 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z';

/** A message's tags as overlapping tag icons (MK-6.5), hollow when it has none. */
export function MessageTagStack({ tags, title, ...rest }: { tags: readonly ResolvedTag[]; title?: string; 'data-row-tags'?: boolean }) {
  const icons = tags.slice(0, MAX_ICONS);
  const extra = tags.length - icons.length;
  return (
    <span className="tag-stack" aria-hidden="true" title={title} {...rest}>
      {icons.length > 0 ? (
        <>
          {icons.map((tag) => (
            <svg
              key={tag.keyword}
              className="tag-stack__icon"
              style={tag.color ? ({ '--tag-color': tag.color } as CSSProperties) : undefined}
              data-tag-keyword={tag.keyword}
              viewBox="0 0 12 12"
              width="16"
              height="16"
            >
              <path className="tag-stack__body" d={BODY} />
              <path className="tag-stack__outline" d={OUTLINE} />
            </svg>
          ))}
          {extra > 0 ? <span className="tag-stack__more">+{extra}</span> : null}
        </>
      ) : (
        <svg className="tag-stack__icon tag-stack__icon--empty" viewBox="0 0 12 12" width="16" height="16">
          <path className="tag-stack__body" d={BODY} />
          <path className="tag-stack__outline" d={OUTLINE} />
        </svg>
      )}
    </span>
  );
}

export function MessageTagChip({ tag, removable = false, onRemove }: { tag: ResolvedTag; removable?: boolean; onRemove?: (tag: ResolvedTag) => void }) {
  const title = tag.defined ? tag.name : `${tag.name} (keyword without a tag definition)`;
  return (
    <span
      className={['tag-chip', !tag.defined ? 'tag-chip--undefined' : '', removable ? 'tag-chip--removable' : ''].filter(Boolean).join(' ')}
      style={tag.color ? ({ '--tag-color': tag.color } as CSSProperties) : undefined}
      data-tag-keyword={tag.keyword}
    >
      <span className="tag-chip__body" title={title}>
        <span className="tag-chip__dot" aria-hidden="true" />
        <span className="tag-chip__name">{tag.name}</span>
      </span>
      {removable ? (
        <button
          className="tag-chip__remove"
          type="button"
          title={`Remove tag ${tag.name}`}
          aria-label={`Remove tag ${tag.name}`}
          onClick={(event) => { event.stopPropagation(); onRemove?.(tag); }}
        >
          <X size={11} strokeWidth={2.25} aria-hidden="true" />
        </button>
      ) : null}
    </span>
  );
}

interface PickerRow {
  keyword: string;
  name: string;
  color: string | null;
  presence: TagPresence;
  digit: number | null;
}

export interface TagPickerHandlers {
  onToggle: (keyword: string, on: boolean) => void;
  onClear: () => void;
  onManage: (event: SyntheticEvent) => void;
  onClose?: () => void;
}

export interface TagPickerPanelHandle {
  focusFirst: () => void;
}

const ITEM_SELECTOR = '[role="menuitemcheckbox"], [role="menuitem"]';

/** The tag menu's contents (MK-6.6): tri-state checkboxes over the target rows. */
export const TagPickerPanel = forwardRef<TagPickerPanelHandle, {
  targets: ReadonlyArray<MessageRowLike | null | undefined>;
  definitions: ReadonlyArray<MessageTagDefinition>;
  label?: string;
} & TagPickerHandlers>(function TagPickerPanel({
  targets, definitions, label = 'Tags', onToggle, onClear, onManage, onClose,
}, ref) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const presenceIndex = useMemo(() => tagPresenceIndex(targets, definitions), [targets, definitions]);
  const definedRows: PickerRow[] = definitions.map((definition, index) => {
    const keyword = normalizeKeyword(definition.keyword);
    return {
      keyword,
      name: definition.name,
      color: definition.color,
      presence: presenceIndex.presence(keyword),
      digit: index < 9 ? index + 1 : null,
    };
  });
  const defined = new Set(definitions.map((d) => normalizeKeyword(d.keyword)));
  const otherRows: PickerRow[] = presenceIndex.keywords
    .filter((keyword) => !defined.has(keyword))
    .map((keyword) => ({ keyword, name: keyword, color: null, presence: presenceIndex.presence(keyword), digit: null }));
  const showsClear = presenceIndex.keywords.length > 0;
  const toggle = (row: PickerRow) => onToggle(row.keyword, row.presence !== 'all');

  useImperativeHandle(ref, () => ({
    focusFirst: () => rootRef.current?.querySelector<HTMLElement>(ITEM_SELECTOR)?.focus(),
  }), []);

  function onKeyDown(event: KeyboardEvent) {
    const plain = !event.ctrlKey && !event.metaKey && !event.altKey;
    if (plain && (event.key === 't' || event.key === 'T')) {
      event.preventDefault();
      event.stopPropagation();
      onClose?.();
      return;
    }
    if (plain && /^[0-9]$/.test(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      const digit = Number(event.key);
      if (digit === 0) {
        if (showsClear) onClear();
        return;
      }
      const row = definedRows[digit - 1];
      if (row) toggle(row);
      return;
    }
    menuKeyDown(rootRef.current, ITEM_SELECTOR, event);
  }

  const checkIcon = (presence: TagPresence) => (presence === 'all'
    ? <Check size={14} strokeWidth={2.5} />
    : presence === 'some' ? <Minus size={14} strokeWidth={2.5} /> : null);
  const ariaChecked = (presence: TagPresence) => (presence === 'all' ? 'true' : presence === 'some' ? 'mixed' : 'false');

  return (
    <div ref={rootRef} className="tag-picker" role="menu" aria-label={label} onKeyDown={onKeyDown}>
      {showsClear ? (
        <>
          <button className="app-dropdown__item tag-picker__item tag-picker__clear" type="button" role="menuitem" tabIndex={-1} aria-keyshortcuts="0" data-tag-picker-clear onClick={onClear}>
            <span className="tag-picker__check" aria-hidden="true"><X size={14} strokeWidth={2} /></span>
            <span className="tag-picker__name">Remove All Tags</span>
            <kbd className="tag-picker__digit" aria-hidden="true">0</kbd>
          </button>
          <div className="tag-picker__separator" role="separator" />
        </>
      ) : null}
      {definedRows.length > 0 ? (
        <div role="group" aria-label="Tags">
          {definedRows.map((row) => (
            <button
              key={row.keyword}
              className="app-dropdown__item tag-picker__item"
              type="button"
              role="menuitemcheckbox"
              tabIndex={-1}
              aria-checked={ariaChecked(row.presence)}
              aria-keyshortcuts={row.digit !== null ? String(row.digit) : undefined}
              data-tag-keyword={row.keyword}
              style={row.color ? ({ '--tag-color': row.color } as CSSProperties) : undefined}
              onClick={() => toggle(row)}
            >
              <span className="tag-picker__check" aria-hidden="true">{checkIcon(row.presence)}</span>
              <span className="tag-picker__dot" aria-hidden="true" />
              <span className="tag-picker__name">{row.name}</span>
              {row.digit !== null ? <kbd className="tag-picker__digit" aria-hidden="true">{row.digit}</kbd> : null}
            </button>
          ))}
        </div>
      ) : null}
      {otherRows.length > 0 ? (
        <>
          {definedRows.length > 0 ? <div className="tag-picker__separator" role="separator" /> : null}
          <div role="group" aria-label="Other keywords">
            <div className="app-dropdown__heading tag-picker__heading" aria-hidden="true">Other keywords</div>
            {otherRows.map((row) => (
              <button
                key={row.keyword}
                className="app-dropdown__item tag-picker__item tag-picker__item--undefined"
                type="button"
                role="menuitemcheckbox"
                tabIndex={-1}
                aria-checked={ariaChecked(row.presence)}
                data-tag-keyword={row.keyword}
                title={`${row.keyword} has no tag definition`}
                onClick={() => toggle(row)}
              >
                <span className="tag-picker__check" aria-hidden="true">{checkIcon(row.presence)}</span>
                <span className="tag-picker__dot" aria-hidden="true" />
                <span className="tag-picker__name">{row.name}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
      {definedRows.length === 0 && otherRows.length === 0 ? <p className="tag-picker__empty" role="none">No tags defined yet.</p> : null}
      <div className="tag-picker__separator" role="separator" />
      <button className="app-dropdown__item tag-picker__item tag-picker__manage" type="button" role="menuitem" tabIndex={-1} data-tag-picker-manage onClick={onManage}>
        <span className="tag-picker__check" aria-hidden="true"><Settings2 size={14} strokeWidth={1.75} /></span>
        <span className="tag-picker__name">Manage Tags…</span>
      </button>
    </div>
  );
});

/** The tag menu as an AppDropdown: a 34px trigger in the bulk toolbar with the panel beneath. */
export function TagPickerDropdown({
  targets, definitions, label = 'Tag', title, triggerClass = '', onToggle, onClear, onManage, trigger,
}: {
  targets: ReadonlyArray<MessageRowLike | null | undefined>;
  definitions: ReadonlyArray<MessageTagDefinition>;
  label?: string;
  title?: string;
  triggerClass?: string;
  trigger?: ReactNode;
} & Omit<TagPickerHandlers, 'onClose'>) {
  const triggerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<TagPickerPanelHandle | null>(null);
  return (
    <AppDropdown
      className="tag-picker-dropdown"
      onToggle={(event) => {
        if (event.currentTarget.open) requestAnimationFrame(() => panelRef.current?.focusFirst());
      }}
    >
      <summary
        ref={triggerRef}
        className={`app-dropdown__summary tag-picker-dropdown__trigger ${triggerClass}`}
        aria-haspopup="menu"
        aria-label={label}
        title={title ?? label}
        data-tag-picker-trigger
      >
        {trigger ?? <TagIcon size={16} strokeWidth={1.75} aria-hidden="true" />}
      </summary>
      <div className="app-dropdown__menu tag-picker-dropdown__menu">
        <TagPickerPanel
          ref={panelRef}
          targets={targets}
          definitions={definitions}
          onToggle={onToggle}
          onClear={onClear}
          onManage={(event) => { closeContainingDropdown(event); onManage(event); }}
          onClose={() => {
            const details = triggerRef.current?.closest('details');
            if (details instanceof HTMLDetailsElement) details.open = false;
            triggerRef.current?.focus();
          }}
        />
      </div>
    </AppDropdown>
  );
}

export interface PopoverAnchor {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PANEL_WIDTH = 260;
const ANCHOR_GAP = 6;
const VIEWPORT_MARGIN = 8;

/**
 * The tag menu anchored to a point that cannot host a <details>, fixed to
 * the viewport in a portal; outside pointer down, Escape, Tab, scroll and
 * resize close it.
 */
export function TagPickerPopover({
  anchor, targets, definitions, label = 'Tags', trigger = null, returnFocus = null, onClose, onToggle, onClear, onManage,
}: {
  anchor: PopoverAnchor | null;
  targets: ReadonlyArray<MessageRowLike | null | undefined>;
  definitions: ReadonlyArray<MessageTagDefinition>;
  label?: string;
  trigger?: HTMLElement | null;
  returnFocus?: HTMLElement | null;
  onClose: () => void;
} & Omit<TagPickerHandlers, 'onClose'>) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<TagPickerPanelHandle | null>(null);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const focusReturnRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const triggerRef = useRef(trigger);
  triggerRef.current = trigger;
  const open = anchor != null;

  const measure = useCallback(() => {
    const root = rootRef.current;
    const list = root?.querySelector<HTMLElement>('.tag-picker');
    if (!root || !list) return;
    setNaturalHeight(list.scrollHeight + root.offsetHeight - list.clientHeight);
  }, []);

  useLayoutEffect(() => {
    if (open) measure();
  }, [open, targets, definitions, measure]);

  useEffect(() => {
    if (!open) return undefined;
    const active = document.activeElement;
    focusReturnRef.current = returnFocus ?? triggerRef.current
      ?? (active instanceof HTMLElement && active !== document.body ? active : null);
    panelRef.current?.focusFirst();
    const onOutside = (event: Event) => {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node) || root.contains(event.target)) return;
      if (triggerRef.current?.contains(event.target)) return;
      onCloseRef.current();
    };
    const onEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      onCloseRef.current();
    };
    const onViewport = (event: Event) => {
      if (event.target instanceof Node && rootRef.current?.contains(event.target)) return;
      onCloseRef.current();
    };
    document.addEventListener('pointerdown', onOutside, true);
    document.addEventListener('keydown', onEscape, true);
    document.addEventListener('scroll', onViewport, { capture: true, passive: true });
    window.addEventListener('resize', onViewport, { passive: true });
    return () => {
      document.removeEventListener('pointerdown', onOutside, true);
      document.removeEventListener('keydown', onEscape, true);
      document.removeEventListener('scroll', onViewport, true);
      window.removeEventListener('resize', onViewport);
      setNaturalHeight(0);
      const target = focusReturnRef.current;
      focusReturnRef.current = null;
      if (target?.isConnected) target.focus();
    };
    // returnFocus is read once when the popover opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!anchor) return null;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  let left = anchor.left + anchor.width - PANEL_WIDTH;
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, viewportWidth - PANEL_WIDTH - VIEWPORT_MARGIN));
  const below = anchor.top + anchor.height + ANCHOR_GAP;
  const roomBelow = viewportHeight - VIEWPORT_MARGIN - below;
  const roomAbove = anchor.top - ANCHOR_GAP - VIEWPORT_MARGIN;
  let top = below;
  let maxHeight = roomBelow;
  if (naturalHeight > roomBelow && (naturalHeight <= roomAbove || roomAbove > roomBelow)) {
    maxHeight = roomAbove;
    top = anchor.top - ANCHOR_GAP - Math.min(naturalHeight, roomAbove);
  }
  const style: CSSProperties = {
    position: 'fixed',
    top: `${Math.max(VIEWPORT_MARGIN, top)}px`,
    left: `${left}px`,
    width: `${PANEL_WIDTH}px`,
    maxHeight: `${Math.max(0, maxHeight)}px`,
  };
  return createPortal(
    <div
      ref={rootRef}
      className="app-dropdown__menu tag-picker-popover"
      style={style}
      role="dialog"
      aria-label={label}
      data-tag-picker-popover
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;
        event.preventDefault();
        onClose();
      }}
    >
      <TagPickerPanel
        ref={panelRef}
        targets={targets}
        definitions={definitions}
        label={label}
        onToggle={onToggle}
        onClear={onClear}
        onManage={onManage}
        onClose={onClose}
      />
    </div>,
    document.body,
  );
}
