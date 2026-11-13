import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import {
  CircleUserRound, Grip, LogOut, Mail, Settings, Users,
} from 'lucide-react';

import appointmentGlyph from '../assets/icons/app-tile-appointment.svg?react';
import mailTileGlyph from '../assets/icons/app-tile-mail.svg?react';
import sendGlyph from '../assets/icons/app-tile-send.svg?react';
import supportIcon from '../assets/icons/tb-support.svg?react';
import { ACCOUNT } from '../data/mailbox';
import { formatBytes } from '../utils/format-bytes';
import { senderAvatarStyle, senderInitials } from '../utils/sender-avatar';
import { AppToggleButton, SvgIcon } from './base';

export function AppSpaces({
  active, unreadCount, folderListHidden, sidebarLabel, onChange, onToggleFolderList, inert,
}: {
  active: string;
  unreadCount: number;
  folderListHidden: boolean;
  sidebarLabel: string;
  onChange: (space: 'mail' | 'contacts') => void;
  onToggleFolderList: () => void;
  inert?: boolean;
}) {
  const toggleLabel = `${folderListHidden ? 'Show' : 'Hide'} ${sidebarLabel}`;
  return (
    <nav className="app-spaces" aria-label="Spaces" inert={inert} aria-hidden={inert || undefined}>
      <AppToggleButton className="app-spaces__item" active={active === 'mail'} onClick={() => onChange('mail')} aria-label="Mail" title="Mail">
        <Mail size={20} strokeWidth={1.75} />
        {unreadCount > 0 ? (
          <span className="app-spaces__badge" aria-hidden="true">{unreadCount > 9999 ? '9999+' : unreadCount}</span>
        ) : null}
      </AppToggleButton>
      <AppToggleButton className="app-spaces__item" active={active === 'contacts'} onClick={() => onChange('contacts')} aria-label="Contacts" title="Contacts">
        <Users size={20} strokeWidth={1.75} />
      </AppToggleButton>
      <div className="app-spaces__bottom-actions">
        <AppToggleButton className="app-spaces__item app-spaces__settings" aria-label="Settings" title="Settings" data-settings-gear>
          <Settings size={20} strokeWidth={1.75} aria-hidden="true" />
        </AppToggleButton>
        <AppToggleButton
          className="app-spaces__item"
          active={!folderListHidden}
          aria-label={toggleLabel}
          title={toggleLabel}
          data-folder-list-toggle
          onClick={onToggleFolderList}
        >
          <span className={`app-spaces__folder-toggle-icon${folderListHidden ? ' is-hidden' : ''}`} aria-hidden="true">
            <span />
          </span>
        </AppToggleButton>
      </div>
    </nav>
  );
}

/** Closes a <details> popover on an outside pointer down. */
function useDismissOnOutside(ref: RefObject<HTMLDetailsElement | null>) {
  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      const el = ref.current;
      if (el?.open && event.target instanceof Node && !el.contains(event.target)) el.open = false;
    }
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [ref]);
}

export function AccountAvatarMenu() {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  useDismissOnOutside(detailsRef);
  const label = ACCOUNT.email;
  const initials = senderInitials(label);
  const style = senderAvatarStyle(label);
  const close = () => {
    if (detailsRef.current) detailsRef.current.open = false;
  };
  return (
    <details ref={detailsRef} className="account-menu">
      <summary className="account-menu__button" aria-label="Open account menu">
        <span className="account-menu__avatar" style={style} aria-hidden="true">{initials}</span>
      </summary>
      <div className="account-menu__popover" role="menu">
        <div className="account-menu__identity">
          <span className="account-menu__avatar account-menu__avatar--large" style={style} aria-hidden="true">{initials}</span>
          <span className="account-menu__email">{label}</span>
        </div>
        <button className="account-menu__item" type="button" role="menuitem" onClick={close}>
          <Settings size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Settings</span>
        </button>
        <a className="account-menu__item" href="#account" role="menuitem" onClick={close}>
          <CircleUserRound size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Account Settings</span>
        </a>
        <a className="account-menu__item" href="#support" role="menuitem" onClick={close}>
          <SvgIcon className="account-menu__support-icon" icon={supportIcon} />
          <span>Contact Support</span>
        </a>
        <button className="account-menu__item" type="button" role="menuitem" onClick={close}>
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Log Out</span>
        </button>
      </div>
    </details>
  );
}

const OTHER_APPS = [
  { id: 'appointment', name: 'Appointment', glyph: appointmentGlyph },
  { id: 'send', name: 'Send', glyph: sendGlyph },
];

export function AppDrawer() {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);
  useDismissOnOutside(detailsRef);
  const close = () => {
    if (detailsRef.current?.open) detailsRef.current.open = false;
  };
  return (
    <details ref={detailsRef} className="app-drawer" onKeyDown={(event) => { if (event.key === 'Escape') close(); }}>
      <summary className="quick-filter__action app-drawer__button" aria-label="Open app drawer" title="Apps">
        <Grip size={18} strokeWidth={1.75} aria-hidden="true" />
      </summary>
      <div className="app-drawer__popover" role="menu" aria-label="Thunderbird Pro apps">
        <button className="app-drawer__tile app-drawer__tile--current" type="button" role="menuitem" aria-current="page" onClick={close}>
          <SvgIcon className="app-drawer__icon" icon={mailTileGlyph} />
          <span className="app-drawer__label">Mail</span>
        </button>
        {OTHER_APPS.map((app) => (
          <a key={app.id} className="app-drawer__tile" href={`#${app.id}`} role="menuitem" onClick={close}>
            <SvgIcon className="app-drawer__icon" icon={app.glyph} />
            <span className="app-drawer__label">{app.name}</span>
          </a>
        ))}
      </div>
    </details>
  );
}

const QUOTA_BYTES = 30 * 1024 ** 3;
const USED_BYTES = Math.round(QUOTA_BYTES * 0.37);

export function StorageUsageBar() {
  const percent = Math.round((USED_BYTES / QUOTA_BYTES) * 100);
  const label = `${percent}% of ${formatBytes(QUOTA_BYTES)}`;
  return (
    <div className="storage-usage" role="status" aria-label={label}>
      <div className="storage-usage__track" aria-hidden="true">
        <div className="storage-usage__fill" style={{ width: `${percent}%` }} />
      </div>
      <p className="storage-usage__label">{label}</p>
    </div>
  );
}
