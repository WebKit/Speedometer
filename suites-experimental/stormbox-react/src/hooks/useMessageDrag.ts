import { create } from 'zustand';
import type { DragEvent } from 'react';

import type { ViewId } from '../types';

export const MESSAGE_DRAG_MIME = 'application/x-stormbox-message-ids';

interface DragState {
  dragging: boolean;
  draggedIds: number[];
  sourceViewId: ViewId | null;
  startDrag: (event: DragEvent, options: { messageId: number; selectedIds: Set<number>; sourceViewId: ViewId }) => void;
  endDrag: () => void;
}

/**
 * Drag payload for messages: the checked rows when the dragged row is one
 * of them, else that row alone, with the view it came from.
 */
export const useMessageDrag = create<DragState>((set) => ({
  dragging: false,
  draggedIds: [],
  sourceViewId: null,
  startDrag(event, { messageId, selectedIds, sourceViewId }) {
    const ids = selectedIds.has(messageId) ? [...selectedIds] : [messageId];
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData(MESSAGE_DRAG_MIME, JSON.stringify({ ids, sourceViewId }));
    event.dataTransfer.setData('text/plain', ids.length === 1 ? '1 message' : `${ids.length} messages`);
    set({ dragging: true, draggedIds: ids, sourceViewId });
  },
  endDrag() {
    set({ dragging: false, draggedIds: [], sourceViewId: null });
  },
}));

export function readMessageDrag(event: DragEvent): { ids: number[]; sourceViewId: ViewId | null } | null {
  const raw = event.dataTransfer.getData(MESSAGE_DRAG_MIME);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.ids)) return { ids: parsed.ids.map(Number), sourceViewId: parsed.sourceViewId ?? null };
    } catch {
      return null;
    }
  }
  const state = useMessageDrag.getState();
  return state.dragging ? { ids: state.draggedIds, sourceViewId: state.sourceViewId } : null;
}
