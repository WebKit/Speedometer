import {
  useCallback, useEffect, useLayoutEffect, useRef, useState,
} from 'react';
import type { CSSProperties } from 'react';
import {
  Bug, Lightbulb, Moon, Plus, Sun, X,
} from 'lucide-react';

import mailGlyph from './assets/icons/tb-mail-glyph.svg?react';
import { ACCOUNT } from './data/mailbox';
import { INBOX_FOLDER_ID, folderCounts, useMailStore } from './store/mail-store';
import { useComposeStore } from './store/compose-store';
import {
  MESSAGE_COLUMN_MAX_WIDTH, MESSAGE_COLUMN_MIN_WIDTH, MESSAGE_COLUMN_RESIZER_WIDTH, useUiStore,
} from './store/ui-store';
import { useColumnResize } from './hooks/useColumnResize';
import { useShortcuts } from './hooks/useShortcuts';
import { AppButton, SvgIcon } from './components/base';
import {
  AccountAvatarMenu, AppDrawer, AppSpaces, StorageUsageBar,
} from './components/Shell';
import { FolderTree } from './components/FolderTree';
import { MessageList } from './components/MessageList';
import { MessageView } from './components/MessageView';
import { ComposeManager } from './components/Compose';
import { Toasts } from './components/Toasts';
import { ANIMATIONS_OFF } from './motion';

const SPACE_RAIL_WIDTH = 56;
const RESIZER_WIDTH = 6;
const COMPACT_READING_WIDTH = 1024;
const SINGLE_COLUMN_WIDTH = 640;
const FOLDER_LIST_TRANSITION_MS = ANIMATIONS_OFF ? 0 : 360;
const MESSAGE_VIEW_PRELOAD_MS = 50;
const FOLDER_LIST_MIN_WIDTH = 180;
const FOLDER_LIST_MAX_WIDTH = 420;
const MESSAGE_VIEW_MIN_WIDTH = 240;

function useWindowWidth(): number {
  const [width, setWidth] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return width;
}

export function App() {
  const theme = useUiStore((s) => s.theme);
  const space = useUiStore((s) => s.space);
  const quickFilter = useUiStore((s) => s.quickFilter);
  const folderListWidth = useUiStore((s) => s.folderListWidth);
  const messageColumnWidth = useUiStore((s) => s.messageColumnWidth);
  const quickFilterFocusRequest = useUiStore((s) => s.quickFilterFocusRequest);
  const openId = useMailStore((s) => s.open.id);
  const selectionSize = useMailStore((s) => s.selection.ids.size);
  const messages = useMailStore((s) => s.messages);
  const composeExpanded = useComposeStore((s) => s.sessions.some((session) => session.presentation === 'expanded'));
  const windowWidth = useWindowWidth();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const quickFilterRef = useRef<HTMLInputElement | null>(null);

  const [folderListHidden, setFolderListHidden] = useState(false);
  const responsiveHiddenRef = useRef(false);
  const [maximized, setMaximized] = useState(false);
  const showMessageView = openId != null && selectionSize === 0;
  const singleColumn = windowWidth < SINGLE_COLUMN_WIDTH;
  const singleMailColumn = space === 'mail' && showMessageView && singleColumn;
  const displayedMessageList = !(space === 'mail' && singleMailColumn);
  const [displayedMessageView, setDisplayedMessageView] = useState(
    showMessageView && !(space === 'mail' && windowWidth < COMPACT_READING_WIDTH),
  );
  const timerRef = useRef<number | null>(null);
  const inboxUnread = folderCounts({ messages }).unread.get(INBOX_FOLDER_ID) ?? 0;

  useShortcuts({ enabled: !maximized || composeExpanded });

  // Theme classes on <html>: services-ui and the stylesheets key off them.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    root.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (quickFilterFocusRequest === 0) return;
    quickFilterRef.current?.focus();
    quickFilterRef.current?.select();
  }, [quickFilterFocusRequest]);

  useEffect(() => {
    setMaximized(false);
  }, [openId]);

  useEffect(() => {
    if (!displayedMessageView) setMaximized(false);
  }, [displayedMessageView]);

  // R-10.2: the compact layouts hide the folder list beside an open
  // message, and the reading pane waits for the folder list to slide away.
  useLayoutEffect(() => {
    const compact = windowWidth < COMPACT_READING_WIDTH;
    const detailVisible = space === 'mail' ? showMessageView : false;
    const shouldHide = singleColumn || (compact && detailVisible);
    let willHide = false;
    if (shouldHide) {
      if (!folderListHidden) {
        responsiveHiddenRef.current = true;
        willHide = true;
        setFolderListHidden(true);
      }
    } else if (responsiveHiddenRef.current) {
      setFolderListHidden(false);
      responsiveHiddenRef.current = false;
    }
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!showMessageView) {
      setDisplayedMessageView(false);
      return;
    }
    if (!(space === 'mail' && willHide && !singleMailColumn) || FOLDER_LIST_TRANSITION_MS === 0) {
      setDisplayedMessageView(true);
      return;
    }
    setDisplayedMessageView(false);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setDisplayedMessageView(true);
    }, Math.max(0, FOLDER_LIST_TRANSITION_MS - MESSAGE_VIEW_PRELOAD_MS));
    // Re-evaluated when the inputs of the layout change, as in App.vue.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMessageView, windowWidth, space]);

  useEffect(() => () => {
    if (timerRef.current != null) clearTimeout(timerRef.current);
  }, []);

  const toggleFolderList = useCallback(() => {
    setFolderListHidden((hidden) => !hidden);
    responsiveHiddenRef.current = false;
  }, []);

  const messageColumnsWidth = messageColumnWidth + (displayedMessageView ? 1 : 0) * MESSAGE_COLUMN_RESIZER_WIDTH;

  function maxFolderListWidth() {
    const shellWidth = shellRef.current?.clientWidth || window.innerWidth;
    const available = Math.max(0, shellWidth - SPACE_RAIL_WIDTH - (folderListHidden ? 0 : RESIZER_WIDTH));
    const reserve = displayedMessageView
      ? MESSAGE_COLUMN_MIN_WIDTH + MESSAGE_COLUMN_RESIZER_WIDTH + MESSAGE_VIEW_MIN_WIDTH
      : MESSAGE_COLUMN_MIN_WIDTH;
    return Math.min(FOLDER_LIST_MAX_WIDTH, available - reserve);
  }

  const folderResize = useColumnResize({
    get: () => useUiStore.getState().folderListWidth,
    set: (width) => useUiStore.getState().setFolderListWidth(width),
    min: () => FOLDER_LIST_MIN_WIDTH,
    max: maxFolderListWidth,
  });
  const columnResize = useColumnResize({
    get: () => useUiStore.getState().messageColumnWidth,
    set: (width) => useUiStore.getState().setMessageColumnWidth(width),
    min: () => MESSAGE_COLUMN_MIN_WIDTH,
    max: () => MESSAGE_COLUMN_MAX_WIDTH,
  });

  const shellStyle = {
    '--folder-list-width': `${folderListWidth}px`,
    '--message-columns-width': `${messageColumnsWidth}px`,
    '--message-list-min-width': `${MESSAGE_COLUMN_MIN_WIDTH}px`,
    '--message-view-min-width': `${MESSAGE_VIEW_MIN_WIDTH}px`,
    '--column-resizer-width': `${RESIZER_WIDTH}px`,
    '--folder-list-transition-ms': `${FOLDER_LIST_TRANSITION_MS}ms`,
  } as CSSProperties;

  const shellClasses = [
    'shell',
    space === 'mail' && !displayedMessageView ? 'shell--message-view-hidden' : '',
    space === 'mail' && !displayedMessageList ? 'shell--message-list-hidden' : '',
    maximized ? 'shell--message-view-maximized' : '',
    folderListHidden ? 'shell--folder-list-hidden' : '',
    space === 'contacts' ? 'shell--contacts' : '',
    folderResize.active || columnResize.active ? 'shell--column-resizing' : '',
  ].filter(Boolean).join(' ');

  const sidebarLabel = space === 'contacts' ? 'address book list' : 'folder list';
  const quickFilterPlaceholder = space === 'contacts' ? 'Filter contacts or identities' : 'Filter messages';
  const themeToggleLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  function setQuickFilter(next: string) {
    if (next === useUiStore.getState().quickFilter) return;
    if (space === 'mail' && useMailStore.getState().open.id != null) useMailStore.getState().selectMessage(null);
    useUiStore.getState().setQuickFilter(next);
  }

  return (
    <div ref={shellRef} className={shellClasses} style={shellStyle}>
      <header className="quick-filter" inert={maximized} aria-hidden={maximized || undefined}>
        <div className="quick-filter__brand">
          <SvgIcon className="quick-filter__glyph" icon={mailGlyph} />
          <span className="quick-filter__wordmark">Mail</span>
        </div>
        <div className="quick-filter__search" role="search">
          <input
            ref={quickFilterRef}
            className={`quick-filter__input${quickFilter.length === 0 ? ' quick-filter__input--empty' : ''}`}
            type="search"
            value={quickFilter}
            aria-label={space === 'contacts' ? 'Filter contacts or identities by name or email address' : 'Quick Filter messages by from, to, or subject'}
            aria-keyshortcuts="/ Control+K"
            placeholder={quickFilterPlaceholder}
            autoComplete="off"
            spellCheck={false}
            onInput={(event) => setQuickFilter(event.currentTarget.value)}
            onChange={(event) => setQuickFilter(event.target.value)}
          />
          {quickFilter.length === 0 ? <kbd className="quick-filter__shortcut" aria-hidden="true">/</kbd> : (
            <button className="quick-filter__clear" type="button" aria-label="Clear Quick Filter" title="Clear Quick Filter" onClick={() => setQuickFilter('')}>
              <X size={17} strokeWidth={2.25} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="quick-filter__actions">
          <a className="quick-filter__action" href="#report-bug" aria-label="Report a bug" title="Report a bug">
            <Bug size={18} strokeWidth={1.75} aria-hidden="true" />
          </a>
          <a className="quick-filter__action" href="#feedback" aria-label="Give feedback" title="Give feedback">
            <Lightbulb size={18} strokeWidth={1.75} aria-hidden="true" />
          </a>
          <button
            className="quick-filter__action theme-toggle"
            type="button"
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
            onClick={() => useUiStore.getState().toggleTheme()}
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.75} aria-hidden="true" /> : <Moon size={18} strokeWidth={1.75} aria-hidden="true" />}
          </button>
          <AppDrawer />
          <AccountAvatarMenu />
        </div>
      </header>

      <AppSpaces
        inert={maximized}
        active={space}
        unreadCount={inboxUnread}
        folderListHidden={folderListHidden}
        sidebarLabel={sidebarLabel}
        onChange={(next) => useUiStore.getState().setSpace(next)}
        onToggleFolderList={toggleFolderList}
      />

      <div
        className={`sidebar-slot${folderListHidden ? ' sidebar-slot--hidden' : ''}`}
        aria-hidden={folderListHidden || maximized || undefined}
        inert={folderListHidden || maximized}
      >
        {space === 'mail' ? (
          <aside className="sidebar">
            <header className="sidebar__header">
              <AppButton className="sidebar__compose" onClick={() => useComposeStore.getState().open()} iconLeft={<Plus size={16} strokeWidth={2} />}>
                New Message
              </AppButton>
            </header>
            <div className="sidebar__account">
              <span className="sidebar__account-name">{ACCOUNT.email}</span>
            </div>
            <FolderTree />
            <footer className="sidebar__footer">
              <StorageUsageBar />
            </footer>
          </aside>
        ) : (
          <div className="sidebar sidebar--contacts" />
        )}
      </div>

      <div
        className={`column-resizer column-resizer--folder-list${folderResize.active ? ' is-active' : ''}${folderListHidden ? ' column-resizer--hidden' : ''}`}
        role="separator"
        aria-label={`Resize ${sidebarLabel}`}
        aria-orientation="vertical"
        aria-valuemin={FOLDER_LIST_MIN_WIDTH}
        aria-valuenow={folderListWidth}
        aria-hidden={folderListHidden || maximized || undefined}
        inert={maximized}
        tabIndex={folderListHidden || maximized ? -1 : 0}
        onPointerDown={folderResize.onPointerDown}
        onKeyDown={folderResize.onKeyDown}
      />

      {space === 'mail' ? (
        <>
          {displayedMessageList ? (
            <div
              className={`msg-columns${columnResize.active ? ' msg-columns--resizing' : ''}`}
              inert={maximized}
              aria-hidden={maximized || undefined}
              style={{
                '--message-column-resizer-width': `${MESSAGE_COLUMN_RESIZER_WIDTH}px`,
                '--message-column-min-width': `${MESSAGE_COLUMN_MIN_WIDTH}px`,
                '--message-column-width': `${messageColumnWidth}px`,
              } as CSSProperties}
            >
              <MessageList quickFilterQuery={quickFilter} />
              {displayedMessageView ? (
                <div
                  className={`column-resizer msg-columns__resizer${columnResize.active ? ' is-active' : ''}`}
                  role="separator"
                  aria-label="Resize message list"
                  aria-orientation="vertical"
                  aria-valuemin={MESSAGE_COLUMN_MIN_WIDTH}
                  aria-valuemax={MESSAGE_COLUMN_MAX_WIDTH}
                  aria-valuenow={messageColumnWidth}
                  tabIndex={0}
                  onPointerDown={columnResize.onPointerDown}
                  onKeyDown={columnResize.onKeyDown}
                />
              ) : null}
            </div>
          ) : null}
          {displayedMessageView ? (
            <MessageView maximized={maximized} onToggleMaximized={() => setMaximized((value) => !value)} />
          ) : null}
        </>
      ) : (
        <section className="contacts contacts--placeholder" aria-label="Contacts">
          <p>Contacts are not part of this clone.</p>
        </section>
      )}

      <ComposeManager />
      <Toasts />
    </div>
  );
}
