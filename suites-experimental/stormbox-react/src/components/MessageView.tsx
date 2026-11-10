import {
  useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import type { CSSProperties, KeyboardEvent, RefCallback } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft, ChevronDown, ChevronUp, Clock, Download, Moon, Paperclip, Sun, Trash2,
} from 'lucide-react';

import archiveIcon from '../assets/icons/tb-folder-archive.svg?raw';
import junkIcon from '../assets/icons/tb-folder-spam.svg?raw';
import forwardIcon from '../assets/icons/tb-forward.svg?raw';
import replyIcon from '../assets/icons/tb-reply.svg?raw';
import replyAllIcon from '../assets/icons/tb-reply-all.svg?raw';
import { LOCALE, NOW, TIME_ZONE } from '../clock';
import { bodyFor } from '../data/bodies';
import type { Attachment } from '../types';
import { folderById, useMailStore } from '../store/mail-store';
import { useComposeStore } from '../store/compose-store';
import { useUiStore } from '../store/ui-store';
import { useMediaQuery } from '../hooks/useMediaQuery';
import {
  ALLOWED_URI_REGEXP, BODY_THEME_COLORS, IFRAME_SANDBOX, buildMessageSrcDoc, sanitizeMessageDocument,
} from '../utils/message-html';
import { adaptHtmlForDarkMode } from '../utils/dark-email';
import { formatAddressList } from '../utils/address-parse';
import { plaintextToHtml } from '../utils/plaintext-html';
import { shortFrom } from '../utils/sender-avatar';
import { formatBytes } from '../utils/format-bytes';
import { DEFAULT_MESSAGE_TAGS, resolveMessageTags } from '../utils/message-tags';
import { AppIconButton, MaximizeButton, RawIcon } from './base';
import { MessageTagChip, MessageTagStack, TagPickerPopover, type PopoverAnchor } from './Tags';

const MIN_EMAIL_LAYOUT_WIDTH = 400;
const MIN_IFRAME_HEIGHT = 120;

function fmtDate(ms: number | null | undefined): string {
  if (!ms) return '';
  const d = new Date(Number(ms));
  return Number.isNaN(d.valueOf()) ? '' : d.toLocaleString(LOCALE, { timeZone: TIME_ZONE });
}

function describeTimeUntil(ms: number): string {
  const diffMs = ms - NOW;
  const rtf = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 48) return rtf.format(hours, 'hour');
  return rtf.format(Math.round(diffMs / 86_400_000), 'day');
}

function useElementHeight<T extends HTMLElement>(): [RefCallback<T>, number] {
  const [height, setHeight] = useState(0);
  const observerRef = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: T | null) => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    if (!el) {
      setHeight(0);
      return;
    }
    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      setHeight(box ? box.blockSize : el.offsetHeight);
    });
    observer.observe(el);
    observerRef.current = observer;
  }, []);
  return [ref, height];
}

function AttachmentBar({ attachments, contextKey }: { attachments: Attachment[]; contextKey: number }) {
  const [expanded, setExpanded] = useState(true);
  const [hasOverflow, setHasOverflow] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const headingRef = useRef<HTMLDivElement | null>(null);
  const [sizes, setSizes] = useState({ heading: 0, firstRow: 0 });

  useLayoutEffect(() => {
    setExpanded(true);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [contextKey]);

  useLayoutEffect(() => {
    const bar = barRef.current;
    const list = listRef.current;
    if (!bar || !list) return;
    const heading = headingRef.current?.offsetHeight ?? 0;
    const firstRow = (list.firstElementChild as HTMLElement | null)?.offsetHeight ?? 0;
    setSizes((previous) => (previous.heading === heading && previous.firstRow === firstRow ? previous : { heading, firstRow }));
    const budget = bar.clientHeight - heading;
    const overflow = attachments.length > 1 && list.scrollHeight > budget + 1;
    setHasOverflow(overflow);
    if (!overflow) setExpanded(true);
  }, [attachments, contextKey]);

  if (attachments.length === 0) return null;
  return (
    <section
      ref={barRef}
      className={`message-attachment-bar${expanded ? '' : ' message-attachment-bar--collapsed'}`}
      style={{
        '--attachment-heading-height': `${sizes.heading}px`,
        '--attachment-first-row-height': `${sizes.firstRow}px`,
      } as CSSProperties}
      aria-label="Attachments"
      tabIndex={-1}
    >
      <div ref={headingRef} className="message-attachment-bar__heading">
        <h3>Attachments <span aria-hidden="true">({attachments.length})</span></h3>
        <button
          className="message-attachment-bar__toggle"
          style={hasOverflow ? undefined : { display: 'none' }}
          type="button"
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} attachment list`}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? <ChevronUp size={14} strokeWidth={1.75} aria-hidden="true" /> : <ChevronDown size={14} strokeWidth={1.75} aria-hidden="true" />}
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <ul ref={listRef} className="message-attachment-bar__list">
        {attachments.map((attachment, index) => {
          const collapsed = !expanded && index > 0;
          return (
            <li
              key={`${attachment.name}-${index}`}
              className={`message-attachment-row${collapsed ? ' message-attachment-row--collapsed' : ''}`}
              inert={collapsed}
              aria-hidden={collapsed || undefined}
            >
              <Paperclip size={15} strokeWidth={1.75} className="message-attachment-row__icon" aria-hidden="true" />
              <div className="message-attachment-row__description">
                <span className="message-attachment-row__name" title={attachment.name}>{attachment.name}</span>
                <span className="message-attachment-row__metadata">{`${attachment.mime_type} · ${formatBytes(attachment.size)}`}</span>
              </div>
              <div className="message-attachment-row__actions">
                <AppIconButton title={`Download ${attachment.name}`} aria-label={`Download ${attachment.name}`}>
                  <Download size={16} strokeWidth={1.75} />
                </AppIconButton>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function MessageView({ maximized, onToggleMaximized }: { maximized: boolean; onToggleMaximized: () => void }) {
  const open = useMailStore((s) => s.open);
  const message = useMailStore((s) => (s.open.id != null ? s.messages.get(s.open.id) ?? null : null));
  const folders = useMailStore((s) => s.folders);
  const theme = useUiStore((s) => s.theme);
  const compactHeader = useMediaQuery('(max-width: 639px)');

  const messageViewRef = useRef<HTMLElement | null>(null);
  const [viewRef, viewHeight] = useElementHeight<HTMLElement>();
  const [toolbarRef, toolbarHeight] = useElementHeight<HTMLElement>();
  const [bannerRef, bannerHeight] = useElementHeight<HTMLDivElement>();
  const bodyScrollRef = useRef<HTMLDivElement | null>(null);
  const htmlShellRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const fitRef = useRef<(() => void) | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [iframeHeight, setIframeHeight] = useState(MIN_IFRAME_HEIGHT);
  const [forceLightBody, setForceLightBody] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);
  const [tagMenuAnchor, setTagMenuAnchor] = useState<PopoverAnchor | null>(null);
  const tagButtonRef = useRef<HTMLButtonElement | null>(null);
  const metadataId = useId();
  const metadataRef = useRef<HTMLDListElement | null>(null);

  const messageId = message?.id ?? null;
  useEffect(() => {
    setForceLightBody(false);
    setHeaderExpanded(false);
    setTagMenuAnchor(null);
    if (metadataRef.current) metadataRef.current.scrollTop = 0;
  }, [messageId]);

  // Opening a draft hands it to the composer (Stormbox prepareDraftFromMessage).
  useEffect(() => {
    if (!message || message.is_draft !== 1) return;
    useComposeStore.getState().openDraft(message);
    const mail = useMailStore.getState();
    mail.selectMessage(null);
    mail.clearSelection();
  }, [message]);

  const body = message ? bodyFor(message) : null;
  const effectiveScheme = theme;
  const bodyScheme = effectiveScheme === 'dark' && forceLightBody ? 'light' : effectiveScheme;
  const iframeBackground = BODY_THEME_COLORS[bodyScheme].background;

  const textHtml = useMemo(() => {
    if (!body?.text || body.html) return '';
    return DOMPurify.sanitize(plaintextToHtml(body.text), { ALLOWED_URI_REGEXP, ADD_ATTR: ['target'] }) as string;
  }, [body]);

  const srcDoc = useMemo(() => {
    if (!body?.html) return '';
    const safeHtml = sanitizeMessageDocument(body.html, null);
    const themed = bodyScheme === 'dark' ? adaptHtmlForDarkMode(safeHtml) : safeHtml;
    return buildMessageSrcDoc(themed, { colorScheme: bodyScheme });
  }, [body, bodyScheme]);

  const teardown = useCallback(() => {
    fitRef.current = null;
    cleanupRef.current?.();
    cleanupRef.current = null;
  }, []);

  useLayoutEffect(() => {
    teardown();
    setIframeHeight(MIN_IFRAME_HEIGHT);
  }, [srcDoc, teardown]);

  useEffect(() => teardown, [teardown]);

  const onIframeLoad = useCallback(() => {
    teardown();
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc?.body) return;
    doc.querySelectorAll('a[href]').forEach((a) => {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    });
    let active = true;
    let rafScheduled = false;
    const docEl = doc.documentElement;
    const bodyEl = doc.body;
    const applyFit = () => {
      if (!active) return;
      const shellWidth = htmlShellRef.current?.clientWidth ?? 0;
      if (shellWidth <= 0) return;
      docEl.style.zoom = '';
      const contentWidth = Math.max(docEl.scrollWidth, bodyEl.scrollWidth, 1);
      const view = doc.defaultView;
      const bodyStyle = view?.getComputedStyle(bodyEl);
      const rootStyle = view?.getComputedStyle(docEl);
      const bottomSpace = [bodyStyle?.marginBottom, rootStyle?.paddingBottom, rootStyle?.borderBottomWidth, rootStyle?.marginBottom]
        .reduce((total, value) => total + Math.max(0, Number.parseFloat(value ?? '') || 0), 0);
      const bodyTop = Math.max(0, bodyEl.getBoundingClientRect().top + (view?.scrollY ?? 0));
      const contentHeight = Math.max(bodyTop + Math.max(bodyEl.offsetHeight, bodyEl.scrollHeight) + bottomSpace, MIN_IFRAME_HEIGHT);
      const effectiveWidth = Math.max(contentWidth, MIN_EMAIL_LAYOUT_WIDTH);
      const ratio = effectiveWidth > shellWidth ? shellWidth / effectiveWidth : 1;
      docEl.style.zoom = ratio === 1 ? '' : String(ratio);
      setIframeHeight(Math.max(MIN_IFRAME_HEIGHT, Math.ceil(contentHeight * ratio)));
    };
    fitRef.current = applyFit;
    const scheduleApplyFit = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      requestAnimationFrame(() => {
        rafScheduled = false;
        applyFit();
      });
    };
    applyFit();
    const cleanups: Array<() => void> = [];
    const raf = requestAnimationFrame(applyFit);
    cleanups.push(() => cancelAnimationFrame(raf));
    for (const delay of [150, 600]) {
      const timer = window.setTimeout(applyFit, delay);
      cleanups.push(() => clearTimeout(timer));
    }
    doc.fonts?.ready.then(applyFit).catch(() => {});
    let observer: ResizeObserver | null = null;
    if (htmlShellRef.current) {
      observer = new ResizeObserver(scheduleApplyFit);
      observer.observe(htmlShellRef.current);
    }
    cleanupRef.current = () => {
      active = false;
      observer?.disconnect();
      for (const cleanup of cleanups) cleanup();
    };
  }, [teardown]);

  const mail = useMailStore.getState;
  const compose = useComposeStore.getState;
  const openFolder = folderById({ folders }, typeof open.viewId === 'number' ? open.viewId : message?.folder_id ?? null);
  const inJunk = openFolder?.role === 'junk';
  const inArchive = openFolder?.role === 'archive';
  const scheduled = message?.scheduled_undo_status === 'pending';
  const messageTags = useMemo(
    () => (message ? resolveMessageTags(message.keywords_json, DEFAULT_MESSAGE_TAGS) : []),
    [message],
  );
  const tagStackLabel = messageTags.length === 0 ? 'Tag' : `Tags: ${messageTags.map((tag) => tag.name).join(', ')}`;
  const tagTargets = useMemo(() => (message ? [message] : []), [message]);

  function onReadingKeyDown(event: KeyboardEvent) {
    if (!maximized || event.key !== 'Escape' || event.defaultPrevented || tagMenuAnchor) return;
    if (messageViewRef.current?.querySelector('[role="dialog"], details[open]')) return;
    event.preventDefault();
    onToggleMaximized();
  }

  const setRefs = useCallback((el: HTMLElement | null) => {
    messageViewRef.current = el;
    viewRef(el);
  }, [viewRef]);

  const style = {
    '--message-view-height': viewHeight > 0 ? `${viewHeight}px` : undefined,
    '--message-toolbar-height': `${toolbarHeight}px`,
    '--message-banner-height': `${bannerHeight}px`,
    '--message-attachment-bar-height': '0px',
  } as CSSProperties;

  if (!message) {
    return (
      <section ref={setRefs} className="message-view" style={style} aria-label="Message detail" tabIndex={-1}>
        <div className="message-view__empty"><p>Select a message to read it.</p></div>
      </section>
    );
  }

  const metadataExpanded = !compactHeader || headerExpanded;
  const senderText = metadataExpanded ? message.from_text || '(no sender)' : shortFrom(message.from_text);
  const ccText = formatAddressList(message.cc);
  const ids = [message.id];
  const headerDetailsLabel = headerExpanded ? 'Hide message details' : 'Show message details';

  return (
    <section ref={setRefs} className="message-view" style={style} aria-label="Message detail" tabIndex={-1} onKeyDown={onReadingKeyDown}>
      <article className="message-view__article">
        <header ref={toolbarRef} className="message-view__header">
          <AppIconButton
            className="message-view__action message-view__action--back"
            title="Back"
            aria-label="Back"
            onClick={() => { mail().selectMessage(null); mail().clearSelection(); }}
          >
            <ArrowLeft className="message-view__toolbar-icon" size={18} strokeWidth={1.65} />
          </AppIconButton>
          {inJunk ? (
            <button
              className="message-view__action message-view__action--whitelist"
              type="button"
              title="Whitelist sender and move to Inbox"
              aria-label="Not junk — whitelist sender and move to Inbox"
              onClick={() => mail().notJunk(ids)}
            >
              <span className="message-view__whitelist-label">Not junk</span>
            </button>
          ) : null}
          {!scheduled ? (
            <>
              {!inArchive ? (
                <AppIconButton className="message-view__action" title="Archive (A)" aria-label="Archive" onClick={() => mail().archiveMessages(ids)}>
                  <RawIcon className="message-view__toolbar-icon message-view__toolbar-icon--folder" svg={archiveIcon} />
                </AppIconButton>
              ) : null}
              {!inJunk ? (
                <AppIconButton className="message-view__action" title="Junk" aria-label="Mark as junk" onClick={() => mail().junkMessages(ids)}>
                  <RawIcon className="message-view__toolbar-icon message-view__toolbar-icon--folder" svg={junkIcon} />
                </AppIconButton>
              ) : null}
              <AppIconButton className="message-view__action" danger title="Delete (Delete)" aria-label="Delete" onClick={() => mail().destroyMessages(ids)}>
                <Trash2 className="message-view__toolbar-icon" size={18} strokeWidth={1.65} />
              </AppIconButton>
              <AppIconButton className="message-view__action" title="Reply (R)" aria-label="Reply" onClick={() => compose().prepareReply(message, false)}>
                <RawIcon className="message-view__toolbar-icon message-view__toolbar-icon--shape" svg={replyIcon} />
              </AppIconButton>
              <AppIconButton className="message-view__action" title="Reply All (Shift+R)" aria-label="Reply All" onClick={() => compose().prepareReply(message, true)}>
                <RawIcon className="message-view__toolbar-icon message-view__toolbar-icon--shape" svg={replyAllIcon} />
              </AppIconButton>
              <AppIconButton className="message-view__action" title="Forward (F)" aria-label="Forward" onClick={() => compose().prepareForward(message)}>
                <RawIcon className="message-view__toolbar-icon message-view__toolbar-icon--shape" svg={forwardIcon} />
              </AppIconButton>
              <AppIconButton
                ref={tagButtonRef}
                className="message-view__action message-view__action--tags"
                title={`${tagStackLabel} (T)`}
                aria-label={tagStackLabel}
                aria-haspopup="dialog"
                aria-expanded={tagMenuAnchor !== null}
                data-tag-picker-trigger
                onClick={() => {
                  if (tagMenuAnchor) {
                    setTagMenuAnchor(null);
                    return;
                  }
                  const rect = tagButtonRef.current?.getBoundingClientRect();
                  if (rect) setTagMenuAnchor({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
                }}
              >
                <MessageTagStack tags={messageTags} />
              </AppIconButton>
            </>
          ) : null}
          <TagPickerPopover
            anchor={tagMenuAnchor}
            targets={tagTargets}
            definitions={DEFAULT_MESSAGE_TAGS}
            trigger={tagButtonRef.current}
            label="Tags"
            onClose={() => setTagMenuAnchor(null)}
            onToggle={(keyword, on) => mail().setTagsMany(ids, on ? { add: [keyword] } : { remove: [keyword] })}
            onClear={() => mail().clearTagsMany(ids)}
            onManage={() => setTagMenuAnchor(null)}
          />
          <div className="message-view__view-actions">
            {effectiveScheme === 'dark' && srcDoc ? (
              <AppIconButton
                className="message-view__action message-view__action--view-mode"
                aria-pressed={forceLightBody}
                title={forceLightBody ? 'View this message in dark mode' : 'View this message in light mode'}
                aria-label={forceLightBody ? 'View this message in dark mode' : 'View this message in light mode'}
                onClick={() => setForceLightBody((value) => !value)}
              >
                {forceLightBody ? <Moon size={16} strokeWidth={1.75} /> : <Sun size={16} strokeWidth={1.75} />}
              </AppIconButton>
            ) : null}
            <MaximizeButton className="message-view__action message-view__action--maximize" maximized={maximized} surface="message view" onToggle={onToggleMaximized} />
          </div>
        </header>
        {scheduled ? (
          <div ref={bannerRef} className="message-view__scheduled" role="status">
            <Clock size={16} strokeWidth={1.75} aria-hidden="true" />
            <span className="message-view__scheduled-text">
              {`Scheduled to send ${fmtDate(message.sent_at)} (${describeTimeUntil(message.sent_at)}).`}
            </span>
            <button className="message-view__scheduled-cancel" type="button" onClick={() => mail().cancelScheduledSend(message.id)}>
              Cancel send
            </button>
          </div>
        ) : null}
        <section className={`message-view__details${headerExpanded ? ' message-view__details--expanded' : ''}`} aria-label="Message header">
          <AppIconButton
            className="message-view__details-toggle"
            style={compactHeader ? undefined : { display: 'none' }}
            aria-expanded={headerExpanded}
            aria-controls={metadataId}
            aria-label={headerDetailsLabel}
            title={headerDetailsLabel}
            onClick={() => {
              setHeaderExpanded((value) => !value);
              if (metadataRef.current) metadataRef.current.scrollTop = 0;
            }}
          >
            <ChevronDown size={18} strokeWidth={1.75} aria-hidden="true" />
          </AppIconButton>
          <dl
            id={metadataId}
            ref={metadataRef}
            className="message-view__metadata"
            tabIndex={compactHeader ? 0 : undefined}
            aria-label={compactHeader ? 'Message details' : undefined}
          >
            <div className="message-view__metadata-row">
              <dt>From</dt>
              <dd>{senderText}</dd>
            </div>
            {message.to_text ? (
              <div className="message-view__metadata-row" style={metadataExpanded ? undefined : { display: 'none' }}>
                <dt>To</dt>
                <dd>{message.to_text}</dd>
              </div>
            ) : null}
            {ccText ? (
              <div className="message-view__metadata-row" style={metadataExpanded ? undefined : { display: 'none' }}>
                <dt>Cc</dt>
                <dd>{ccText}</dd>
              </div>
            ) : null}
            <div className="message-view__metadata-row message-view__title">
              <dt>Subject</dt>
              <dd><h2>{message.subject || '(no subject)'}</h2></dd>
            </div>
            <div className="message-view__metadata-row" style={metadataExpanded ? undefined : { display: 'none' }}>
              <dt>{scheduled ? 'Send at' : 'Date'}</dt>
              <dd className="message-view__date">{fmtDate(scheduled ? message.sent_at : message.received_at)}</dd>
            </div>
            {messageTags.length > 0 ? (
              <div className="message-view__metadata-row message-view__tags-row" style={metadataExpanded ? undefined : { display: 'none' }}>
                <dt>Tags</dt>
                <dd className="message-view__tags" data-message-tags>
                  {messageTags.map((tag) => (
                    <MessageTagChip
                      key={tag.keyword}
                      tag={tag}
                      removable={!scheduled}
                      onRemove={() => mail().setTagsMany(ids, { remove: [tag.keyword] })}
                    />
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>
        <div ref={bodyScrollRef} className="message-view__body" tabIndex={0} aria-label="Message body">
          {srcDoc ? (
            <div ref={htmlShellRef} className="message-view__html-shell">
              <iframe
                ref={iframeRef}
                className="message-view__html-frame"
                srcDoc={srcDoc}
                sandbox={IFRAME_SANDBOX}
                style={{ height: `${iframeHeight}px`, backgroundColor: iframeBackground }}
                title="Message body"
                onLoad={onIframeLoad}
              />
            </div>
          ) : textHtml ? (
            <div className="message-view__text" dangerouslySetInnerHTML={{ __html: textHtml }} />
          ) : (
            <p className="message-view__placeholder">This message has no content.</p>
          )}
        </div>
        <AttachmentBar attachments={body?.attachments ?? []} contextKey={message.id} />
      </article>
    </section>
  );
}

