import { memo, useCallback, useMemo, useState } from 'react';
import type { CSSProperties, DragEvent } from 'react';
import { Settings2, Star } from 'lucide-react';

import { DEFAULT_MESSAGE_TAGS } from '../utils/message-tags';
import {
  folderBadgeCount, folderCompare, folderPresentation, isMainFolder,
} from '../utils/folder-presentation';
import type { Folder, ViewId } from '../types';
import {
  STARRED_KEYWORD, folderCounts, isTagViewId, tagViewIdFor, tagViewKeyword, useMailStore,
} from '../store/mail-store';
import { readMessageDrag, useMessageDrag } from '../hooks/useMessageDrag';

interface TreeNode extends Folder {
  depth: number;
  icon: string;
  tone: string;
  children: TreeNode[];
  unread_emails: number;
  total_emails: number;
  subtree_unread: number;
}

function buildTree(folders: Folder[], unread: Map<number, number>, total: Map<number, number>): TreeNode[] {
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const byParent = new Map<number | 'ROOT', Folder[]>();
  for (const folder of folders) {
    const parent = folder.parent_id != null ? byId.get(folder.parent_id) : null;
    const promotedByStar = folder.is_starred === 1 && parent != null;
    const key = parent != null && !promotedByStar ? folder.parent_id! : 'ROOT';
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key)!.push(folder);
  }
  for (const list of byParent.values()) list.sort(folderCompare);
  function build(folder: Folder, depth: number): TreeNode {
    const presentation = folderPresentation(folder);
    const unreadCount = unread.get(folder.id) ?? 0;
    const totalCount = total.get(folder.id) ?? 0;
    const children = (byParent.get(folder.id) ?? []).map((child) => build(child, depth + 1));
    const own = folderBadgeCount({ role: folder.role, unread_emails: unreadCount, total_emails: totalCount });
    return {
      ...folder,
      depth,
      icon: presentation.icon,
      tone: presentation.color,
      children,
      unread_emails: unreadCount,
      total_emails: totalCount,
      subtree_unread: children.reduce((sum, child) => sum + child.subtree_unread, own),
    };
  }
  return (byParent.get('ROOT') ?? []).map((folder) => build(folder, 0));
}

type DropState = 'move' | 'invalid' | null;

interface FolderNodeProps {
  folder: TreeNode;
  current: ViewId;
  expanded: Set<number>;
  dragOverId: number | null;
  dragging: boolean;
  dragSourceId: ViewId | null;
  onPick: (id: number) => void;
  onToggle: (id: number) => void;
  onDragTarget: (id: number | null) => void;
  onDropOn: (id: number, event: DragEvent) => void;
}

const FolderNode = memo(function FolderNode({
  folder, current, expanded, dragOverId, dragging, dragSourceId, onPick, onToggle, onDragTarget, onDropOn,
}: FolderNodeProps) {
  const hasChildren = folder.children.length > 0;
  const collapsed = hasChildren && !expanded.has(folder.id);
  const unread = collapsed
    ? folder.subtree_unread
    : folderBadgeCount({ role: folder.role, unread_emails: folder.unread_emails, total_emails: folder.total_emails });
  const dropState: DropState = dragging && dragOverId === folder.id
    ? (dragSourceId === folder.id ? 'invalid' : 'move')
    : null;
  const style = {
    paddingLeft: `${10 + folder.depth * 16}px`,
    '--folder-tone': folder.tone,
  } as CSSProperties;
  const classes = [
    'folder-node',
    current === folder.id ? 'is-current' : '',
    folder.tone ? 'has-tone' : '',
    dropState === 'move' ? 'is-drop-valid' : '',
    dropState === 'invalid' ? 'is-drop-invalid' : '',
  ].filter(Boolean).join(' ');
  return (
    <>
      <div
        className={classes}
        style={style}
        data-folder-id={folder.id}
        onDragEnter={(event) => { event.preventDefault(); onDragTarget(folder.id); }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = dragSourceId === folder.id ? 'none' : 'move';
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          if (dragOverId === folder.id) onDragTarget(null);
        }}
        onDrop={(event) => onDropOn(folder.id, event)}
      >
        {hasChildren ? (
          <button
            type="button"
            className={`folder-node__toggle${collapsed ? ' is-collapsed' : ''}`}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand folder' : 'Collapse folder'}
            onClick={() => onToggle(folder.id)}
          >
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <span className="folder-node__toggle folder-node__toggle--spacer" aria-hidden="true" />
        )}
        <button type="button" className="folder-node__button" onClick={() => onPick(folder.id)}>
          <span className="folder-node__icon-wrap">
            <span className="folder-node__icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: folder.icon }} />
            {folder.is_starred === 1 ? (
              <Star className="folder-node__star" size={10} strokeWidth={2} aria-label="Starred folder" />
            ) : null}
          </span>
          <span className="folder-node__name">{folder.name || '(unnamed)'}</span>
          {unread > 0 ? <span className="folder-node__count">{unread > 99999 ? '99999+' : unread}</span> : null}
        </button>
      </div>
      {hasChildren && !collapsed ? folder.children.map((child) => (
        <FolderNode
          key={child.id}
          folder={child}
          current={current}
          expanded={expanded}
          dragOverId={dragOverId}
          dragging={dragging}
          dragSourceId={dragSourceId}
          onPick={onPick}
          onToggle={onToggle}
          onDragTarget={onDragTarget}
          onDropOn={onDropOn}
        />
      )) : null}
    </>
  );
});

function TagViewNode({
  keyword, name, color, count, current, dropActive, onPick, onDragTarget, onDropOn,
}: {
  keyword: string;
  name: string;
  color: string | null;
  count: number;
  current: boolean;
  dropActive: boolean;
  onPick: (keyword: string) => void;
  onDragTarget: (keyword: string | null) => void;
  onDropOn: (keyword: string, event: DragEvent) => void;
}) {
  return (
    <div
      className={['tag-view-node', current ? 'is-current' : '', dropActive ? 'is-drop-valid' : ''].filter(Boolean).join(' ')}
      style={color ? ({ '--tag-color': color } as CSSProperties) : undefined}
      data-tag-view={keyword}
      onDragEnter={(event) => { event.preventDefault(); onDragTarget(keyword); }}
      onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        onDragTarget(null);
      }}
      onDrop={(event) => onDropOn(keyword, event)}
    >
      <button type="button" className="tag-view-node__button" aria-current={current ? 'page' : undefined} onClick={() => onPick(keyword)}>
        <span className="tag-view-node__icon-wrap" aria-hidden="true">
          {color === null
            ? <Star className="tag-view-node__star" size={14} strokeWidth={2} />
            : <span className="tag-view-node__dot" />}
        </span>
        <span className="tag-view-node__name">{name}</span>
        {count > 0 ? <span className="tag-view-node__count">{count > 99999 ? '99999+' : count}</span> : null}
      </button>
    </div>
  );
}

export function FolderTree() {
  const folders = useMailStore((s) => s.folders);
  const messages = useMailStore((s) => s.messages);
  const current = useMailStore((s) => s.currentViewId);
  const selectFolder = useMailStore((s) => s.selectFolder);
  const { dragging, sourceViewId, endDrag } = useMessageDrag();
  const [expanded, setExpanded] = useState<Set<number>>(() => new Set());
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const [dragOverTag, setDragOverTag] = useState<string | null>(null);

  const counts = folderCounts({ messages });
  const tree = useMemo(() => buildTree(folders, counts.unread, counts.total), [folders, counts]);
  const mainFolders = tree.filter(isMainFolder);
  const userFolders = tree.filter((folder) => !isMainFolder(folder));
  const starred = userFolders.filter((folder) => folder.is_starred === 1);
  const unstarred = userFolders.filter((folder) => folder.is_starred !== 1);

  const onToggle = useCallback((id: number) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onDropOn = useCallback((id: number, event: DragEvent) => {
    event.preventDefault();
    setDragOverId(null);
    const payload = readMessageDrag(event);
    if (payload && payload.ids.length > 0 && payload.sourceViewId !== id) {
      useMailStore.getState().moveMessages(payload.ids, id);
    }
    endDrag();
  }, [endDrag]);

  const onTagDrop = useCallback((keyword: string, event: DragEvent) => {
    event.preventDefault();
    setDragOverTag(null);
    const payload = readMessageDrag(event);
    if (payload && payload.ids.length > 0) {
      const store = useMailStore.getState();
      if (keyword === STARRED_KEYWORD) store.markManyFlagged(payload.ids, true);
      else store.setTagsMany(payload.ids, { add: [keyword] });
    }
    endDrag();
  }, [endDrag]);

  const pickTag = useCallback((keyword: string) => selectFolder(tagViewIdFor(keyword)), [selectFolder]);

  const tagRows = [
    { keyword: STARRED_KEYWORD, name: 'Starred', color: null as string | null },
    ...DEFAULT_MESSAGE_TAGS.map((tag) => ({ keyword: tag.keyword.toLowerCase(), name: tag.name, color: tag.color as string | null })),
  ];
  const currentTag = isTagViewId(current) ? tagViewKeyword(current) : null;

  const nodeProps = {
    current, expanded, dragOverId, dragging, dragSourceId: sourceViewId, onPick: selectFolder, onToggle, onDragTarget: setDragOverId, onDropOn,
  };

  return (
    <nav className="folder-tree" aria-label="Mailboxes">
      {mainFolders.map((folder) => <FolderNode key={folder.id} folder={folder} {...nodeProps} />)}
      <div className="folder-tree__heading-row">
        <h3 className="folder-tree__heading">Folders</h3>
        <span className="folder-tree__heading-actions">
          <button type="button" className="folder-tree__manage" data-manage-folders title="Manage Folders" aria-label="Manage Folders">
            <Settings2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </span>
      </div>
      {starred.map((folder) => <FolderNode key={folder.id} folder={folder} {...nodeProps} />)}
      {unstarred.map((folder) => <FolderNode key={folder.id} folder={folder} {...nodeProps} />)}
      <div className="folder-tree__heading-row" data-tag-views>
        <h3 className="folder-tree__heading">Tags</h3>
        <span className="folder-tree__heading-actions">
          <button type="button" className="folder-tree__manage" data-manage-tags title="Manage Tags" aria-label="Manage Tags">
            <Settings2 size={16} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </span>
      </div>
      {tagRows.map((row) => (
        <TagViewNode
          key={row.keyword}
          keyword={row.keyword}
          name={row.name}
          color={row.color}
          count={counts.tags.get(row.keyword) ?? 0}
          current={currentTag === row.keyword}
          dropActive={dragging && dragOverTag === row.keyword}
          onPick={pickTag}
          onDragTarget={setDragOverTag}
          onDropOn={onTagDrop}
        />
      ))}
    </nav>
  );
}
