import { memo, useMemo } from 'react';
import type { DragEvent, MouseEvent } from 'react';
import { Paperclip, Star, Trash2 } from 'lucide-react';

import archiveIcon from '../assets/icons/tb-folder-archive.svg?raw';
import type { JmapViewSort, Message } from '../types';
import {
  correspondentLabel, fmtDate, rowCorrespondent, rowTimestamp,
} from '../utils/message-row-presentation';
import { resolveMessageTags, type MessageTagDefinition } from '../utils/message-tags';
import { senderAvatarFor } from '../utils/sender-avatar';
import { MessageTagStack } from './Tags';

export interface RowHandlers {
  rowClick: (index: number, event: MouseEvent) => void;
  checkboxClick: (index: number, event: MouseEvent) => void;
  dragStart: (message: Message, event: DragEvent) => void;
  dragEnd: () => void;
  star: (message: Message) => void;
  tag: (message: Message, event: MouseEvent) => void;
  archive: (id: number) => void;
  remove: (id: number) => void;
}

interface MessageListRowProps {
  message: Message;
  index: number;
  start: number;
  size: number;
  domIdPrefix: string;
  focused: boolean;
  cursor: boolean;
  selected: boolean;
  dragging: boolean;
  showsRecipients: boolean;
  sort: JmapViewSort;
  hoverActions: boolean;
  archiveAction: boolean;
  deleteAction: boolean;
  draggable: boolean;
  tagMenuOpen: boolean;
  tagDefinitions: ReadonlyArray<MessageTagDefinition>;
  handlers: RowHandlers;
}

/** One positioned message-list row; every interaction goes back to the list. */
export const MessageListRow = memo(function MessageListRow({
  message, index, start, size, domIdPrefix, focused, cursor, selected, dragging, showsRecipients, sort,
  hoverActions, archiveAction, deleteAction, draggable, tagMenuOpen, tagDefinitions, handlers,
}: MessageListRowProps) {
  const isUnread = message.is_seen === 0;
  const isFlagged = message.is_flagged === 1;
  const tags = useMemo(() => resolveMessageTags(message.keywords_json, tagDefinitions), [message.keywords_json, tagDefinitions]);
  const tagStackLabel = tags.length === 0 ? 'Tag' : `Tags: ${tags.map((tag) => tag.name).join(', ')}`;
  const correspondent = rowCorrespondent(message, showsRecipients);
  const avatar = useMemo(() => senderAvatarFor(correspondent, ''), [correspondent]);
  const label = correspondentLabel(message, showsRecipients);
  const dateText = fmtDate(rowTimestamp(message, sort));
  const subject = message.subject || '(no subject)';
  const rowLabel = [
    label,
    subject,
    dateText,
    isUnread ? 'Unread' : '',
    isFlagged ? 'Starred' : '',
    message.has_attachment === 1 ? 'Has attachments' : '',
    tags.length > 0 ? tagStackLabel : '',
  ].filter(Boolean).join(', ');
  const scheduled = message.scheduled_undo_status === 'pending';
  const classes = [
    focused ? 'is-focused' : '',
    cursor ? 'is-cursor' : '',
    selected ? 'is-selected' : '',
    dragging ? 'is-dragging' : '',
    isUnread ? 'is-unread' : '',
  ].filter(Boolean).join(' ');

  return (
    <li
      id={`${domIdPrefix}${message.id}`}
      data-index={index}
      data-message-id={message.id}
      role="row"
      aria-rowindex={index + 1}
      aria-label={rowLabel}
      aria-selected={selected}
      className={classes || undefined}
      style={{
        position: 'absolute',
        top: '0px',
        left: '0px',
        right: '0px',
        transform: `translateY(${start}px)`,
        height: `${size}px`,
      }}
    >
      <div
        className={['msg-list__item', hoverActions ? 'msg-list__item--hover-actions' : '', tagMenuOpen ? 'has-tag-menu' : ''].filter(Boolean).join(' ')}
        role="gridcell"
        draggable={draggable && !scheduled}
        onClick={(event) => handlers.rowClick(index, event)}
        onDragStart={(event) => handlers.dragStart(message, event)}
        onDragEnd={handlers.dragEnd}
      >
        <button
          type="button"
          className="msg-list__open"
          data-message-control
          tabIndex={-1}
          aria-label={`Open message: ${subject}, ${label}`}
        />
        <div className="msg-list__state">
          <label className="msg-list__check" draggable={false} onClick={(event) => event.stopPropagation()}>
            <input
              type="checkbox"
              data-message-control
              tabIndex={-1}
              aria-label={`Select message: ${subject}, ${label}`}
              checked={selected}
              onChange={() => {}}
              onClick={(event) => handlers.checkboxClick(index, event)}
            />
          </label>
          {isUnread ? <span className="msg-list__unread-dot" aria-hidden="true" /> : null}
        </div>
        <div className="msg-list__avatar" style={avatar.style} aria-hidden="true">
          <span>{avatar.initials}</span>
        </div>
        <div className="msg-list__content">
          <div className="msg-list__summary">
            <span className="msg-list__from">{label}</span>
            <span className="msg-list__subject">{subject}</span>
            <span className="msg-list__icons">
              {isFlagged && !hoverActions ? <Star size={13} strokeWidth={2} className="msg-list__star" /> : null}
              {message.has_attachment === 1 ? <Paperclip size={13} strokeWidth={1.75} className="msg-list__attach" /> : null}
              {!hoverActions && tags.length > 0 ? <MessageTagStack tags={tags} title={tagStackLabel} data-row-tags /> : null}
            </span>
            <span className="msg-list__date">{dateText}</span>
            {hoverActions ? (
              <div className="msg-list__actions" draggable={false} onClick={(event) => event.stopPropagation()}>
                <button
                  type="button"
                  className={`msg-list__action msg-list__action--tag${tags.length > 0 ? ' is-tagged' : ''}`}
                  tabIndex={-1}
                  data-message-control
                  title={tagStackLabel}
                  aria-label={tagStackLabel}
                  aria-haspopup="dialog"
                  aria-expanded={tagMenuOpen}
                  data-row-tags
                  onClick={(event) => handlers.tag(message, event)}
                >
                  <MessageTagStack tags={tags} />
                </button>
                <button
                  type="button"
                  className={`msg-list__action msg-list__action--star${isFlagged ? ' msg-list__action--starred' : ''}`}
                  tabIndex={-1}
                  data-message-control
                  title={isFlagged ? 'Unstar' : 'Star'}
                  aria-label={isFlagged ? 'Unstar' : 'Star'}
                  aria-pressed={isFlagged}
                  onClick={() => handlers.star(message)}
                >
                  <Star size={17} strokeWidth={1.75} fill={isFlagged ? '#facc15' : 'none'} />
                </button>
                {archiveAction ? (
                  <button type="button" className="msg-list__action" tabIndex={-1} data-message-control title="Archive" aria-label="Archive" onClick={() => handlers.archive(message.id)}>
                    <span className="msg-list__action-icon--folder" aria-hidden="true" dangerouslySetInnerHTML={{ __html: archiveIcon }} />
                  </button>
                ) : null}
                {deleteAction ? (
                  <button type="button" className="msg-list__action msg-list__action--danger" tabIndex={-1} data-message-control title="Delete" aria-label="Delete" onClick={() => handlers.remove(message.id)}>
                    <Trash2 size={18} strokeWidth={1.65} />
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {message.preview ? <p className="msg-list__preview">{message.preview}</p> : null}
        </div>
      </div>
    </li>
  );
});
