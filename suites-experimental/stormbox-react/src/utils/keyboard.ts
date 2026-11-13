/**
 * Keyboard helpers shared by Thunderbird-style shortcut handlers.
 */

export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.platform);
}

export function shortcutModifierLabel(): '⌘' | 'Ctrl' {
  return isMacPlatform() ? '⌘' : 'Ctrl';
}

export function shortcutModifierAria(): 'Meta' | 'Control' {
  return isMacPlatform() ? 'Meta' : 'Control';
}

/** Primary modifier: Ctrl on Windows/Linux, Meta (Cmd) on macOS. */
export function isModKey(event: KeyboardEvent): boolean {
  return isMacPlatform() ? event.metaKey : event.ctrlKey;
}

/**
 * True while an input method editor owns the key event.
 *
 * `isComposing` is the standard signal. Some browsers and input stacks
 * report IME-consumed keys only through the legacy 229 key code.
 */
export function isComposingKeyEvent(event: KeyboardEvent): boolean {
  return event.isComposing || event.keyCode === 229;
}

/**
 * True when the event target is a field where single-key shortcuts
 * would interfere with typing. Checkbox inputs are excluded — they
 * are selection toggles, not text entry, and should not block Delete
 * and other mail shortcuts after the user checks rows.
 */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest('iframe')) return false;
  const field = target.closest('input, textarea, select, [contenteditable="true"]');
  if (!field) return false;
  if (field instanceof HTMLInputElement && field.type === 'checkbox') return false;
  return true;
}

export interface ShortcutSpec {
  key: string;
  mod?: boolean;
  shift?: boolean;
  alt?: boolean;
}

export function matchesShortcut(event: KeyboardEvent, spec: ShortcutSpec): boolean {
  const key = spec.key.length === 1 ? spec.key.toLowerCase() : spec.key;
  const eventKey = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (eventKey !== key) return false;
  if (Boolean(spec.mod) !== isModKey(event)) return false;
  if (Boolean(spec.shift) !== event.shiftKey) return false;
  if (Boolean(spec.alt) !== event.altKey) return false;
  return true;
}

/** Thunderbird "Delete message" — Del on Windows/Linux, Backspace on Mac. */
export function isDeleteKey(event: KeyboardEvent): boolean {
  return event.key === 'Delete' || event.key === 'Backspace';
}
