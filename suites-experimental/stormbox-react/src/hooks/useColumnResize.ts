import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

export interface ColumnResizePane {
  get: () => number;
  set: (width: number) => void;
  min: () => number;
  max: () => number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Pointer and keyboard resizing for a column handle. Widths are not
 * persisted, so every run starts from the same layout.
 */
export function useColumnResize(pane: ColumnResizePane) {
  const [active, setActive] = useState(false);
  const paneRef = useRef(pane);
  paneRef.current = pane;
  const stateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMove = useCallback((event: PointerEvent) => {
    const state = stateRef.current;
    if (!state) return;
    const current = paneRef.current;
    current.set(clamp(state.startWidth + event.clientX - state.startX, current.min(), current.max()));
  }, []);

  const stop = useCallback(() => {
    if (!stateRef.current) return;
    stateRef.current = null;
    setActive(false);
    document.body.classList.remove('is-column-resizing');
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', stop);
    window.removeEventListener('pointercancel', stop);
  }, [onMove]);

  const onPointerDown = useCallback((event: ReactPointerEvent) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stateRef.current = { startX: event.clientX, startWidth: paneRef.current.get() };
    setActive(true);
    document.body.classList.add('is-column-resizing');
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', stop, { once: true });
    window.addEventListener('pointercancel', stop, { once: true });
  }, [onMove, stop]);

  const onKeyDown = useCallback((event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const current = paneRef.current;
    const step = event.shiftKey ? 40 : 10;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    current.set(clamp(current.get() + direction * step, current.min(), current.max()));
  }, []);

  useEffect(() => stop, [stop]);

  return { active, onPointerDown, onKeyDown };
}
