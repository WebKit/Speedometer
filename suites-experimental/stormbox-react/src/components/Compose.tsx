import {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import type { FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import {
  Check, ChevronDown, Minus, Paperclip, Save, Send as SendIcon, Trash2, X,
} from 'lucide-react';

import { LOCALE, NOW, TIME_ZONE } from '../clock';
import type { Identity } from '../data/mailbox';
import {
  RECIPIENT_FIELDS, isSessionMeaningfullyNonEmpty, isValidRecipient, sessionLabel, useComposeStore,
  type ComposeSession, type RecipientEntry, type RecipientField,
} from '../store/compose-store';
import { autocompleteContacts, browseContacts } from '../store/contacts';
import { isComposingKeyEvent, matchesShortcut } from '../utils/keyboard';
import { senderAvatarStyle, senderInitials } from '../utils/sender-avatar';
import {
  AppButton, AppDropdown, AppIconButton, MaximizeButton, closeContainingDropdown,
} from './base';
import { RecipientInput } from './RecipientInput';
import { RichTextEditor, type EditorContent, type RichTextEditorHandle } from './RichTextEditor';

const RECIPIENT_LABELS: Record<RecipientField, string> = { to: 'To', cc: 'Cc', bcc: 'Bcc' };

interface SchedulePreset {
  id: string;
  label: string;
  targetAt: number;
}

/** Send Later presets relative to the mailbox clock (UTC). */
function schedulePresets(): SchedulePreset[] {
  const day = 86_400_000;
  const startOfDay = Math.floor(NOW / day) * day;
  const weekday = new Date(NOW).getUTCDay();
  const untilMonday = ((8 - weekday) % 7) || 7;
  return [
    { id: 'later-today', label: 'Later today', targetAt: NOW + 3 * 3_600_000 },
    { id: 'tomorrow-morning', label: 'Tomorrow morning', targetAt: startOfDay + day + 8 * 3_600_000 },
    { id: 'tomorrow-afternoon', label: 'Tomorrow afternoon', targetAt: startOfDay + day + 13 * 3_600_000 },
    { id: 'monday-morning', label: 'Monday morning', targetAt: startOfDay + untilMonday * day + 8 * 3_600_000 },
  ];
}

function formatScheduleTarget(at: number): string {
  return new Date(at).toLocaleString(LOCALE, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: TIME_ZONE });
}

function identityLabel(identity: Identity | undefined): string {
  if (!identity) return '';
  return identity.name ? `${identity.name} <${identity.email}>` : identity.email;
}

function ComposeDialog({ session }: { session: ComposeSession }) {
  const compose = useComposeStore.getState;
  const identities = useComposeStore((s) => s.identities);
  const expanded = session.presentation === 'expanded';
  const [maximized, setMaximized] = useState(false);
  const [showCc, setShowCc] = useState(session.draft.cc.length > 0);
  const [showBcc, setShowBcc] = useState(session.draft.bcc.length > 0);
  const [staged, setStaged] = useState<SchedulePreset | null>(null);
  const editorRef = useRef<RichTextEditorHandle | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeMenuTriggerRef = useRef<HTMLElement | null>(null);
  const { draft } = session;
  const presets = useMemo(schedulePresets, []);

  const fieldId = (field: RecipientField) => (expanded ? `compose-${field}` : `compose-${session.id}-${field}`);
  const titleId = expanded ? 'compose-title' : `compose-${session.id}-title`;
  const fromLabelId = expanded ? 'compose-from-label' : `compose-${session.id}-from-label`;
  const subjectId = expanded ? 'compose-subject' : `compose-${session.id}-subject`;
  const nonEmpty = isSessionMeaningfullyNonEmpty(session);
  const closeLabel = nonEmpty ? 'Close options' : 'Close';
  const fromIdentity = identities[draft.fromIdx];

  // Writing starts in To for a fresh message, in the body for a reply.
  useEffect(() => {
    if (!expanded) return;
    requestAnimationFrame(() => {
      if (session.draft.to.length === 0) document.getElementById(fieldId('to'))?.focus();
      else editorRef.current?.focus();
    });
    // Runs when the session expands or a new draft epoch arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expanded, session.id, session.draftEpoch]);

  const onEditorUpdate = useCallback((content: EditorContent) => {
    compose().updateDraft(session.id, { html: content.html, text: content.text });
  }, [compose, session.id]);

  const setEntries = useCallback((field: RecipientField, entries: RecipientEntry[]) => {
    compose().updateDraft(session.id, { [field]: entries });
  }, [compose, session.id]);

  function takenElsewhere(field: RecipientField): string[] {
    return RECIPIENT_FIELDS.filter((other) => other !== field)
      .flatMap((other) => draft[other].filter(isValidRecipient).map((address) => address.email));
  }

  function revealField(field: 'cc' | 'bcc') {
    if (field === 'cc') setShowCc(true);
    else setShowBcc(true);
    requestAnimationFrame(() => document.getElementById(fieldId(field))?.focus());
  }

  function onRecipientFocusOut(field: RecipientField, event: FocusEvent<HTMLDivElement>) {
    if (field === 'to') return;
    const row = event.currentTarget;
    const next = event.relatedTarget as Node | null;
    if (next && row.contains(next)) return;
    setTimeout(() => {
      const current = useComposeStore.getState().sessions.find((s) => s.id === session.id);
      if (!current || current.draft[field].length > 0) return;
      if (field === 'cc') setShowCc(false);
      else setShowBcc(false);
    });
  }

  function send() {
    compose().send(session.id, staged ? { targetAt: staged.targetAt, label: formatScheduleTarget(staged.targetAt) } : null);
  }

  function onDialogKeyDown(event: KeyboardEvent) {
    if (event.defaultPrevented || isComposingKeyEvent(event.nativeEvent)) return;
    if (!matchesShortcut(event.nativeEvent, { key: 'Enter', mod: true })) return;
    event.preventDefault();
    if (session.closePromptOpen) return;
    send();
  }

  const visibleFields: RecipientField[] = ['to', ...(showCc ? ['cc' as const] : []), ...(showBcc ? ['bcc' as const] : [])];

  return (
    <div
      ref={dialogRef}
      className={`compose-dialog${expanded ? ' compose-dialog--expanded' : ''}${maximized ? ' compose-dialog--maximized' : ''}`}
      style={expanded ? undefined : { display: 'none' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      onKeyDown={onDialogKeyDown}
    >
      <div className="compose-dialog__card">
        <header>
          <h2 id={titleId} title={draft.subject || 'New Message'}>{draft.subject || 'New Message'}</h2>
          <div className="compose-dialog__window-actions">
            <AppIconButton className="icon--minimize" title="Minimize" aria-label="Minimize" onClick={() => compose().minimize(session.id)}>
              <Minus size={18} strokeWidth={1.65} aria-hidden="true" />
            </AppIconButton>
            <MaximizeButton maximized={maximized} surface="composer" onToggle={() => setMaximized((value) => !value)} />
            <AppDropdown className="compose-close-menu">
              <summary
                ref={closeMenuTriggerRef}
                className="compose-close-menu__trigger"
                role="button"
                aria-haspopup="menu"
                title={closeLabel}
                aria-label={closeLabel}
                onClick={(event: MouseEvent) => {
                  if (nonEmpty) return;
                  event.preventDefault();
                  compose().close(session.id);
                }}
              >
                <X size={18} strokeWidth={1.65} aria-hidden="true" />
              </summary>
              <div className="app-dropdown__menu compose-close-menu__menu" role="menu" aria-label="Close options">
                <button type="button" className="app-dropdown__item compose-close-menu__discard" role="menuitem" onClick={(event) => { closeContainingDropdown(event); compose().discardDraft(session.id); }}>
                  <Trash2 size={15} aria-hidden="true" />
                  <span>Discard</span>
                </button>
                <button type="button" className="app-dropdown__item" role="menuitem" onClick={(event) => { closeContainingDropdown(event); compose().saveAndClose(session.id); }}>
                  <Save size={15} aria-hidden="true" />
                  <span>Save Draft</span>
                </button>
              </div>
            </AppDropdown>
          </div>
        </header>

        <div className="compose-dialog__body">
          <div className="row">
            <label id={fromLabelId}>From</label>
            <AppDropdown className="from-picker" data-compose-from>
              <summary className="app-dropdown__summary from-picker__summary" aria-labelledby={fromLabelId}>
                {fromIdentity ? (
                  <span className="from-picker__avatar" aria-hidden="true" style={senderAvatarStyle(fromIdentity.email)}>
                    {senderInitials(fromIdentity.name?.trim() || fromIdentity.email)}
                  </span>
                ) : null}
                <span className="from-picker__summary-text">{identityLabel(fromIdentity)}</span>
              </summary>
              <div className="app-dropdown__menu from-picker__menu" role="menu" aria-label="From identity">
                {identities.map((identity, idx) => (
                  <button
                    key={identity.id}
                    type="button"
                    className="app-dropdown__item from-picker__option"
                    role="menuitemradio"
                    aria-checked={idx === draft.fromIdx}
                    onClick={(event) => { closeContainingDropdown(event); compose().updateDraft(session.id, { fromIdx: idx }); }}
                  >
                    <span className="from-picker__avatar" aria-hidden="true" style={senderAvatarStyle(identity.email)}>
                      {senderInitials(identity.name?.trim() || identity.email)}
                    </span>
                    <span className="from-picker__lines">
                      {identity.name ? <span className="from-picker__name">{identity.name}</span> : null}
                      <span className={`from-picker__email${identity.name ? '' : ' from-picker__email--primary'}`}>{identity.email}</span>
                    </span>
                    {idx === draft.fromIdx ? <Check size={15} className="from-picker__check" /> : null}
                  </button>
                ))}
              </div>
            </AppDropdown>
          </div>

          {visibleFields.map((field) => (
            <div key={field} className={`row row--recipient${field === 'to' ? ' row--to' : ''}`} onBlur={(event) => onRecipientFocusOut(field, event)}>
              <label htmlFor={fieldId(field)}>{RECIPIENT_LABELS[field]}</label>
              <RecipientInput
                key={`${session.id}-${field}-${session.draftEpoch}`}
                inputId={fieldId(field)}
                label={RECIPIENT_LABELS[field]}
                entries={draft[field]}
                taken={takenElsewhere(field)}
                query={autocompleteContacts}
                browseAll={browseContacts}
                onEntriesChange={(entries) => setEntries(field, entries)}
              />
              {field === 'to' ? (
                <div className="recipient-cc-toggles">
                  {!showCc ? <button type="button" className="recipient-toggle" onClick={() => revealField('cc')}>Cc</button> : null}
                  {!showBcc ? <button type="button" className="recipient-toggle" onClick={() => revealField('bcc')}>Bcc</button> : null}
                </div>
              ) : null}
            </div>
          ))}

          <div className="row">
            <label htmlFor={subjectId}>Subject</label>
            <input
              id={subjectId}
              type="text"
              value={draft.subject}
              onInput={(event) => compose().updateDraft(session.id, { subject: event.currentTarget.value })}
              onChange={(event) => compose().updateDraft(session.id, { subject: event.target.value })}
            />
          </div>

          <RichTextEditor
            ref={editorRef}
            contentKey={session.id}
            initialHtml={session.editorHtmlBody}
            accessibleLabel="Message body"
            onUpdate={onEditorUpdate}
          />

          <footer>
            <AppButton variant="outline" aria-label="Attach files" title="Attach files" iconLeft={<Paperclip size={17} aria-hidden="true" />}>
              Attach
            </AppButton>
            <div className="compose-send-split">
              <AppButton className="compose-send" disabled={session.closePromptOpen} onClick={send} iconLeft={<SendIcon size={16} strokeWidth={2} aria-hidden="true" />}>
                Send
              </AppButton>
              <AppDropdown className="compose-schedule-menu">
                <summary
                  className={`compose-schedule-menu__trigger${staged ? ' compose-schedule-menu__trigger--selected' : ''}`}
                  role="button"
                  aria-haspopup="menu"
                  aria-label={staged ? `Schedule send: ${staged.label}` : 'Schedule send'}
                  title={staged ? `${staged.label} — ${formatScheduleTarget(staged.targetAt)}` : 'Schedule send'}
                >
                  {staged ? <span className="compose-schedule-menu__selection">{staged.label}</span> : null}
                  <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
                </summary>
                <div className="app-dropdown__menu compose-schedule-menu__menu" role="menu" aria-label="Schedule send">
                  {staged ? (
                    <>
                      <button type="button" className="app-dropdown__item compose-schedule-menu__item" role="menuitem" onClick={(event) => { closeContainingDropdown(event); setStaged(null); }}>
                        <span className="compose-schedule-menu__label">Send now</span>
                        <span className="compose-schedule-menu__secondary">Immediately</span>
                      </button>
                      <div className="compose-schedule-menu__separator" role="separator" />
                    </>
                  ) : null}
                  {presets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className="app-dropdown__item compose-schedule-menu__item"
                      role="menuitem"
                      title={formatScheduleTarget(preset.targetAt)}
                      onClick={(event) => { closeContainingDropdown(event); setStaged(preset); }}
                    >
                      <span className="compose-schedule-menu__label">{preset.label}</span>
                      <span className="compose-schedule-menu__secondary">{formatScheduleTarget(preset.targetAt)}</span>
                    </button>
                  ))}
                </div>
              </AppDropdown>
            </div>
          </footer>
        </div>

        {session.closePromptOpen ? (
          <div className="compose-confirm-backdrop">
            <section className="compose-confirm" role="alertdialog" aria-modal="true" aria-labelledby="compose-close-title" aria-describedby="compose-close-description" tabIndex={-1}>
              <h3 id="compose-close-title">Save this draft?</h3>
              <p id="compose-close-description">Save your latest changes before closing this compose window.</p>
              <div className="compose-confirm__actions">
                <AppButton variant="outline" onClick={() => compose().cancelClose(session.id)}>Cancel</AppButton>
                <AppButton variant="outline" onClick={() => compose().closeWithoutSaving(session.id)}>Don&apos;t Save</AppButton>
                <AppButton onClick={() => compose().saveAndClose(session.id)}>Save draft</AppButton>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function ComposeManager() {
  const sessions = useComposeStore((s) => s.sessions);
  const minimized = sessions.filter((session) => session.presentation === 'minimized');
  const compose = useComposeStore.getState;
  return (
    <>
      {sessions.map((session) => <ComposeDialog key={session.id} session={session} />)}
      {minimized.length > 0 ? (
        <div className="compose-dock" aria-label="Minimized compose windows">
          {minimized.map((session) => (
            <div key={session.id} className="compose-dock__item" data-session-id={session.id}>
              <button type="button" className="compose-dock__restore" aria-label={`Restore ${sessionLabel(session)}`} onClick={() => compose().restore(session.id)}>
                <span className="compose-dock__text">
                  <span className="compose-dock__title">{sessionLabel(session)}</span>
                </span>
              </button>
              <button type="button" className="compose-dock__close" aria-label={`Close ${sessionLabel(session)}`} onClick={() => compose().requestClose(session.id)}>×</button>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
