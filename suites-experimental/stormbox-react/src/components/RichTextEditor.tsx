import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState,
} from 'react';
import type { FocusEvent, FormEvent, KeyboardEvent, SyntheticEvent } from 'react';
import {
  Bold, Check, Highlighter, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo2,
  RemoveFormatting, Strikethrough, TextAlignCenter, TextAlignEnd, TextAlignJustify, TextAlignStart, Underline, Undo2,
} from 'lucide-react';
import Squire from 'squire-rte';

import { richTextPlainText, sanitizeRichTextToDOMFragment } from '../utils/rich-text';
import { shortcutModifierAria, shortcutModifierLabel } from '../utils/keyboard';
import { AppButton, AppDropdown, closeContainingDropdown } from './base';

export interface EditorContent {
  html: string;
  text: string;
}

export interface RichTextEditorHandle {
  focus: () => void;
  getContent: () => EditorContent;
}

const NORMAL_FONT_SIZE = '14px';
const DEFAULT_TEXT_COLOR = '#e5e7eb';
const DEFAULT_HIGHLIGHT_COLOR = '#fef3c7';
const TOOLBAR_GROUP_ORDER = ['style', 'font', 'insert', 'lists', 'alignment'] as const;
type ToolbarGroup = (typeof TOOLBAR_GROUP_ORDER)[number];

const BLOCK_ELEMENT_NAMES = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGURE', 'FIGCAPTION', 'FOOTER',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'LI', 'OL', 'P', 'PRE', 'SECTION', 'TABLE', 'TBODY', 'TD',
  'TFOOT', 'TH', 'THEAD', 'TR', 'UL',
]);
const FONT_OPTIONS = [
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'Times', value: '"Times New Roman", serif' },
];
const FONT_SIZE_OPTIONS = [
  { label: 'Small', value: '12px' },
  { label: 'Normal', value: NORMAL_FONT_SIZE },
  { label: 'Large', value: '18px' },
  { label: 'Huge', value: '24px' },
];
const FONT_FAMILY_CHOICES = [{ label: 'Default', value: '' }, ...FONT_OPTIONS];
const ALIGNMENT_OPTIONS = [
  { label: 'Align left', value: 'left', icon: TextAlignStart },
  { label: 'Align center', value: 'center', icon: TextAlignCenter },
  { label: 'Align right', value: 'right', icon: TextAlignEnd },
  { label: 'Align justify', value: 'justify', icon: TextAlignJustify },
] as const;
const TOOLBAR_CONTROL_SELECTOR = 'button, summary, input, select';

interface ToolbarState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  subscript: boolean;
  superscript: boolean;
  code: boolean;
  link: boolean;
  unorderedList: boolean;
  orderedList: boolean;
  quote: boolean;
  canUndo: boolean;
  canRedo: boolean;
  fontFamily: string;
  fontSize: string | null;
  textColor: string;
  highlightColor: string;
  alignment: string | null;
  direction: string | null;
}

const INITIAL_TOOLBAR: ToolbarState = {
  bold: false, italic: false, underline: false, strikethrough: false, subscript: false, superscript: false,
  code: false, link: false, unorderedList: false, orderedList: false, quote: false, canUndo: false, canRedo: false,
  fontFamily: '', fontSize: NORMAL_FONT_SIZE, textColor: DEFAULT_TEXT_COLOR, highlightColor: DEFAULT_HIGHLIGHT_COLOR,
  alignment: 'left', direction: 'ltr',
};

function normalizeColor(value: string | undefined, fallback: string) {
  if (/^#[0-9a-f]{6}$/i.test(value || '')) return value as string;
  const rgb = (value || '').match(/^rgb\(\s*(\d+),\s*(\d+),\s*(\d+)\s*\)$/i);
  if (!rgb) return fallback;
  return `#${rgb.slice(1).map((channel) => Number(channel).toString(16).padStart(2, '0')).join('')}`;
}

function normalizeFontFamily(value: string | undefined) {
  const first = (value || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
  return FONT_OPTIONS.find((option) => option.value.split(',')[0].replace(/["']/g, '').trim().toLowerCase() === first)?.value || '';
}

function selectedFontSize(range: Range | null): string | null {
  if (!range) return null;
  const sizeForNode = (node: Node) => {
    const element = node instanceof Element ? node : node.parentElement;
    return element ? getComputedStyle(element).fontSize || NORMAL_FONT_SIZE : NORMAL_FONT_SIZE;
  };
  const common = range.commonAncestorContainer;
  if (range.collapsed || common instanceof Text) return sizeForNode(range.startContainer);
  const walker = document.createTreeWalker(common, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let selected: string | null = null;
  let node: Node | null;
  while ((node = walker.nextNode())) {
    if (!(node instanceof Text) && node.nodeName !== 'BR' && node.nodeName !== 'IMG') continue;
    if (!range.intersectsNode(node)) continue;
    if (node instanceof Text && (!node.length
      || (node === range.startContainer && range.startOffset === node.length)
      || (node === range.endContainer && range.endOffset === 0))) continue;
    const size = sizeForNode(node);
    if (selected !== null && selected !== size) return null;
    selected = size;
  }
  return selected;
}

function pathHasFormat(path: string, tag: string) {
  return new RegExp(`(?:^|>)${tag}(?:$|[.#\\[])`).test(path) || new RegExp(`(?:^|>)${tag}(?:>|$)`).test(path);
}

function elementOuterWidth(element: Element | null) {
  if (!element) return 0;
  const styles = window.getComputedStyle(element);
  const rectWidth = element.getBoundingClientRect().width || (element instanceof HTMLElement ? element.offsetWidth : 0);
  return rectWidth + Number.parseFloat(styles.marginLeft || '0') + Number.parseFloat(styles.marginRight || '0');
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, {
  contentKey: string;
  initialHtml: string;
  accessibleLabel?: string;
  onUpdate: (content: EditorContent) => void;
}>(function RichTextEditor({ contentKey, initialHtml, accessibleLabel = 'Rich text editor', onUpdate }, ref) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const linkInputRef = useRef<HTMLInputElement | null>(null);
  const squireRef = useRef<Squire | null>(null);
  const lastSelectionRef = useRef<Range | null>(null);
  const groupWidthsRef = useRef(new Map<ToolbarGroup, number>());
  const tabStopRef = useRef<HTMLElement | null>(null);
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;
  const [toolbar, setToolbar] = useState<ToolbarState>(INITIAL_TOOLBAR);
  const toolbarStateRef = useRef(toolbar);
  toolbarStateRef.current = toolbar;
  const [visibleGroups, setVisibleGroups] = useState<ToolbarGroup[]>([...TOOLBAR_GROUP_ORDER]);
  const [linkEditor, setLinkEditor] = useState<{ open: boolean; hasLink: boolean; url: string; error: string | null }>({
    open: false, hasLink: false, url: '', error: null,
  });
  const shortcutModifier = shortcutModifierLabel();
  const ariaShortcutModifier = shortcutModifierAria();

  const serialize = useCallback((): EditorContent => {
    const squire = squireRef.current;
    const el = editorRef.current;
    if (!squire || !el) return { html: '', text: '' };
    return {
      html: squire.getHTML(),
      text: richTextPlainText(el).replace(/​/gu, '').replace(/\n+$/u, ''),
    };
  }, []);

  const rememberSelection = useCallback(() => {
    try {
      lastSelectionRef.current = squireRef.current?.getSelection().cloneRange() ?? null;
    } catch {
      lastSelectionRef.current = null;
    }
  }, []);

  const restoreSelection = useCallback(() => {
    const squire = squireRef.current;
    if (!squire || !lastSelectionRef.current) return;
    try {
      squire.setSelection(lastSelectionRef.current);
    } catch {
      lastSelectionRef.current = null;
    }
  }, []);

  const updateToolbarState = useCallback((pathOverride: string | null = null) => {
    const squire = squireRef.current;
    if (!squire) return;
    let range: Range | null = null;
    try {
      range = squire.getSelection();
    } catch {
      range = null;
    }
    const path = pathOverride ?? squire.getPath();
    const stateFor = (tag: string) => (path && path !== '(selection)'
      ? pathHasFormat(path, tag)
      : !!range && !!squire.hasFormat(tag, null, range));
    const fontInfo = range ? squire.getFontInfo(range) : {};
    let alignment: string | null = null;
    let direction: string | null = null;
    let seenBlock = false;
    if (range) {
      squire.forEachBlock((block) => {
        const style = getComputedStyle(block);
        const blockDirection = style.direction === 'rtl' ? 'rtl' : 'ltr';
        const textAlign = style.textAlign.replace(/^-(?:moz|webkit)-/, '');
        let blockAlignment = textAlign;
        if (!textAlign || textAlign === 'start' || textAlign === 'auto') blockAlignment = blockDirection === 'rtl' ? 'right' : 'left';
        else if (textAlign === 'end') blockAlignment = blockDirection === 'rtl' ? 'left' : 'right';
        alignment = !seenBlock || alignment === blockAlignment ? blockAlignment : null;
        direction = !seenBlock || direction === blockDirection ? blockDirection : null;
        seenBlock = true;
        return alignment === null && direction === null;
      }, false, range);
    }
    const previous = toolbarStateRef.current;
    setToolbar({
      ...previous,
      bold: stateFor('B'),
      italic: stateFor('I'),
      underline: stateFor('U'),
      strikethrough: stateFor('S'),
      subscript: stateFor('SUB'),
      superscript: stateFor('SUP'),
      code: stateFor('CODE') || stateFor('PRE'),
      link: stateFor('A'),
      unorderedList: stateFor('UL'),
      orderedList: stateFor('OL'),
      quote: /(?:^|>)BLOCKQUOTE/.test(path),
      fontFamily: normalizeFontFamily(fontInfo.fontFamily),
      fontSize: selectedFontSize(range),
      textColor: normalizeColor(fontInfo.color, previous.textColor || DEFAULT_TEXT_COLOR),
      highlightColor: normalizeColor(fontInfo.backgroundColor, previous.highlightColor || DEFAULT_HIGHLIGHT_COLOR),
      alignment,
      direction,
    });
  }, []);

  const syncContent = useCallback(() => {
    onUpdateRef.current(serialize());
  }, [serialize]);

  const ensureEditorBlocks = useCallback(() => {
    const squire = squireRef.current;
    if (!squire) return;
    const root = squire.getRoot();
    let wrapper: HTMLDivElement | null = null;
    Array.from(root.childNodes).forEach((child) => {
      const isBlock = child.nodeType === Node.ELEMENT_NODE && BLOCK_ELEMENT_NAMES.has(child.nodeName);
      const wrap = !isBlock && (child.nodeType === Node.TEXT_NODE ? (child as Text).data.length > 0 : child.nodeType === Node.ELEMENT_NODE);
      if (!wrap) {
        wrapper = null;
        return;
      }
      if (!wrapper) {
        wrapper = document.createElement('div');
        root.insertBefore(wrapper, child);
      }
      wrapper.appendChild(child);
    });
  }, []);

  const runEditorCommand = useCallback((command: (editor: Squire) => void, { restore = true } = {}) => {
    const squire = squireRef.current;
    if (!squire) return;
    if (restore) {
      squire.focus();
      restoreSelection();
    }
    ensureEditorBlocks();
    command(squire);
    syncContent();
    rememberSelection();
    updateToolbarState();
    if (restore) squire.focus();
  }, [ensureEditorBlocks, rememberSelection, restoreSelection, syncContent, updateToolbarState]);

  const toggleFormatInRange = useCallback((editor: Squire, tag: string, remove: { tag: string } | null = null, range: Range = editor.getSelection()) => {
    ensureEditorBlocks();
    if (editor.hasFormat(tag, null, range)) editor.changeFormat(null, { tag }, range);
    else editor.changeFormat({ tag }, remove, range);
  }, [ensureEditorBlocks]);

  const toggleFormat = (tag: string, remove: { tag: string } | null = null) => {
    runEditorCommand((editor) => toggleFormatInRange(editor, tag, remove, editor.getSelection()));
  };

  const toggleList = (type: 'UL' | 'OL') => {
    runEditorCommand((editor) => {
      if (editor.hasFormat(type)) editor.removeList();
      else if (type === 'UL') editor.makeUnorderedList();
      else editor.makeOrderedList();
    });
  };

  const adjustQuote = (delta: number) => {
    runEditorCommand((editor) => (delta > 0 ? editor.increaseQuoteLevel() : editor.decreaseQuoteLevel()));
  };

  const openLinkEditor = useCallback((event?: SyntheticEvent) => {
    const squire = squireRef.current;
    if (!squire) return;
    rememberSelection();
    if (event) closeContainingDropdown(event);
    const range = lastSelectionRef.current ?? squire.getSelection();
    const node = range.startContainer;
    const element = node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
    const anchor = element?.closest('a') as HTMLAnchorElement | null;
    const selectedText = squire.getSelectedText().trim();
    setLinkEditor({
      open: true,
      hasLink: anchor !== null,
      url: anchor?.getAttribute('href') ?? (/^https?:\/\//i.test(selectedText) || /^mailto:/i.test(selectedText) ? selectedText : ''),
      error: null,
    });
    requestAnimationFrame(() => {
      linkInputRef.current?.focus();
      linkInputRef.current?.select();
    });
  }, [rememberSelection]);

  // Squire lives outside React: created per content key, destroyed on unmount.
  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) return undefined;
    const squire = new Squire(el, { sanitizeToDOMFragment: sanitizeRichTextToDOMFragment });
    squireRef.current = squire;
    squire.setHTML(initialHtml || '<p><br></p>');
    const onInput = () => {
      syncContent();
      rememberSelection();
      updateToolbarState();
    };
    const onPathChange = (event: Event) => {
      rememberSelection();
      updateToolbarState((event as CustomEvent<{ path?: string }>).detail?.path ?? null);
    };
    const onSelect = () => {
      rememberSelection();
      updateToolbarState();
    };
    const onUndoState = (event: Event) => {
      const detail = (event as CustomEvent<{ canUndo?: boolean; canRedo?: boolean }>).detail;
      setToolbar((previous) => ({ ...previous, canUndo: !!detail?.canUndo, canRedo: !!detail?.canRedo }));
    };
    squire.addEventListener('input', onInput);
    squire.addEventListener('pathChange', onPathChange);
    squire.addEventListener('select', onSelect);
    squire.addEventListener('cursor', onSelect);
    squire.addEventListener('undoStateChange', onUndoState);
    const keyCommand = (key: string, command: (editor: Squire, range: Range) => void) => {
      squire.setKeyHandler(key, (editor, event, range) => {
        event.preventDefault();
        command(editor, range);
        ensureEditorBlocks();
        syncContent();
        lastSelectionRef.current = range.cloneRange();
        updateToolbarState();
      });
    };
    ['Ctrl-b', 'Ctrl-B', 'Meta-b', 'Meta-B'].forEach((key) => keyCommand(key, (editor, range) => toggleFormatInRange(editor, 'B', null, range)));
    ['Ctrl-i', 'Ctrl-I', 'Meta-i', 'Meta-I'].forEach((key) => keyCommand(key, (editor, range) => toggleFormatInRange(editor, 'I', null, range)));
    ['Ctrl-u', 'Ctrl-U', 'Meta-u', 'Meta-U'].forEach((key) => keyCommand(key, (editor, range) => toggleFormatInRange(editor, 'U', null, range)));
    ['Ctrl-z', 'Meta-z'].forEach((key) => keyCommand(key, (editor) => editor.undo()));
    ['Ctrl-y', 'Meta-y', 'Ctrl-Shift-z', 'Ctrl-Shift-Z', 'Meta-Shift-z', 'Meta-Shift-Z'].forEach((key) => keyCommand(key, (editor) => editor.redo()));
    ['Ctrl-k', 'Meta-k'].forEach((key) => {
      squire.setKeyHandler(key, (_editor, event, range) => {
        event.preventDefault();
        lastSelectionRef.current = range.cloneRange();
        openLinkEditor();
      });
    });
    syncContent();
    updateToolbarState();
    return () => {
      squire.destroy();
      squireRef.current = null;
      lastSelectionRef.current = null;
    };
    // initialHtml is read when the content key changes, not on every edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  useImperativeHandle(ref, () => ({
    focus: () => squireRef.current?.focus(),
    getContent: serialize,
  }), [serialize]);

  // ----- toolbar overflow: trailing groups move into More when short of room
  const updateOverflow = useCallback(() => {
    const toolbarEl = toolbarRef.current;
    if (!toolbarEl) return;
    toolbarEl.querySelectorAll<HTMLElement>('[data-toolbar-group]').forEach((groupEl) => {
      const group = groupEl.dataset.toolbarGroup as ToolbarGroup | undefined;
      const width = elementOuterWidth(groupEl);
      if (group && width > 0) groupWidthsRef.current.set(group, width);
    });
    const toolbarWidth = toolbarEl.clientWidth || toolbarEl.getBoundingClientRect().width;
    if (!toolbarWidth) return;
    const moreWidth = elementOuterWidth(toolbarEl.querySelector('.toolbar-more')) || 70;
    const next: ToolbarGroup[] = [...TOOLBAR_GROUP_ORDER];
    const total = () => moreWidth + next.length * 4 + next.reduce((sum, group) => sum + (groupWidthsRef.current.get(group) ?? 0), 0);
    while (next.length > 1 && total() > toolbarWidth) next.pop();
    setVisibleGroups((previous) => (previous.join('|') === next.join('|') ? previous : next));
  }, []);

  useLayoutEffect(() => {
    updateOverflow();
    const toolbarEl = toolbarRef.current;
    if (!toolbarEl) return undefined;
    const observer = new ResizeObserver(() => updateOverflow());
    observer.observe(toolbarEl);
    window.addEventListener('resize', updateOverflow);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateOverflow);
    };
  }, [updateOverflow]);

  // ----- WAI-ARIA toolbar: one Tab stop, arrows move between controls
  const toolbarControls = useCallback((): HTMLElement[] => {
    const toolbarEl = toolbarRef.current;
    if (!toolbarEl) return [];
    return [...toolbarEl.querySelectorAll<HTMLElement>(TOOLBAR_CONTROL_SELECTOR)].filter((control) => !control.closest('.app-dropdown__menu'));
  }, []);

  const syncTabStops = useCallback(() => {
    const controls = toolbarControls();
    if (!tabStopRef.current || !controls.includes(tabStopRef.current)) tabStopRef.current = controls[0] ?? null;
    controls.forEach((control) => {
      const tabIndex = control === tabStopRef.current ? 0 : -1;
      if (control.tabIndex !== tabIndex) control.tabIndex = tabIndex;
    });
  }, [toolbarControls]);

  useLayoutEffect(() => {
    syncTabStops();
  });

  function onToolbarFocusIn(event: FocusEvent) {
    const target = event.target;
    if (!(target instanceof HTMLElement) || !toolbarControls().includes(target)) return;
    tabStopRef.current = target;
    syncTabStops();
  }

  function onToolbarKeyDown(event: KeyboardEvent) {
    const controls = toolbarControls();
    const from = controls.indexOf(event.target as HTMLElement);
    if (from === -1) return;
    let to: number;
    switch (event.key) {
      case 'ArrowRight': to = (from + 1) % controls.length; break;
      case 'ArrowLeft': to = (from - 1 + controls.length) % controls.length; break;
      case 'Home': to = 0; break;
      case 'End': to = controls.length - 1; break;
      default: return;
    }
    event.preventDefault();
    controls[to].focus();
  }

  useEffect(() => {
    setLinkEditor({ open: false, hasLink: false, url: '', error: null });
  }, [contentKey]);

  function applyLink(event: FormEvent) {
    event.preventDefault();
    const trimmed = linkEditor.url.trim();
    let valid = false;
    try {
      const protocol = new URL(trimmed).protocol.toLowerCase();
      valid = protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:';
    } catch {
      valid = false;
    }
    if (!valid) {
      setLinkEditor((state) => ({ ...state, error: 'Enter an HTTP, HTTPS, or mailto URL.' }));
      linkInputRef.current?.focus();
      return;
    }
    runEditorCommand((editor) => editor.makeLink(trimmed));
    setLinkEditor((state) => ({ ...state, open: false, error: null }));
  }

  function cancelLinkEditor() {
    setLinkEditor((state) => ({ ...state, open: false, error: null }));
    squireRef.current?.focus();
    restoreSelection();
  }

  const isVisible = (group: ToolbarGroup) => visibleGroups.includes(group);
  const preventMouseDown = (event: React.MouseEvent) => event.preventDefault();
  const fontFamilyLabel = FONT_OPTIONS.find((font) => font.value === toolbar.fontFamily)?.label ?? 'Font';
  const fontSizeLabel = FONT_SIZE_OPTIONS.find((size) => size.value === toolbar.fontSize)?.label ?? 'Size';
  const check = (on: boolean) => (on ? <Check size={15} aria-hidden="true" /> : <span aria-hidden="true" />);

  return (
    <div className="rich-text-editor">
      <div
        ref={toolbarRef}
        className="compose-toolbar"
        role="toolbar"
        aria-label="Rich text formatting"
        onPointerDownCapture={rememberSelection}
        onFocus={onToolbarFocusIn}
        onKeyDown={onToolbarKeyDown}
      >
        {isVisible('style') ? (
          <div className="toolbar-group" data-toolbar-group="style">
            <button type="button" className={`toolbar-button${toolbar.bold ? ' active' : ''}`} aria-label="Bold" aria-keyshortcuts={`${ariaShortcutModifier}+B`} title={`Bold (${shortcutModifier}+B)`} onMouseDown={preventMouseDown} onClick={() => toggleFormat('B')}>
              <Bold size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.italic ? ' active' : ''}`} aria-label="Italic" aria-keyshortcuts={`${ariaShortcutModifier}+I`} title={`Italic (${shortcutModifier}+I)`} onMouseDown={preventMouseDown} onClick={() => toggleFormat('I')}>
              <Italic size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.underline ? ' active' : ''}`} aria-label="Underline" aria-keyshortcuts={`${ariaShortcutModifier}+U`} title={`Underline (${shortcutModifier}+U)`} onMouseDown={preventMouseDown} onClick={() => toggleFormat('U')}>
              <Underline size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.strikethrough ? ' active' : ''}`} aria-label="Strikethrough" title="Strikethrough" onMouseDown={preventMouseDown} onClick={() => toggleFormat('S')}>
              <Strikethrough size={15} />
            </button>
          </div>
        ) : null}

        {isVisible('font') ? (
          <div className="toolbar-group" data-toolbar-group="font">
            <AppDropdown className="toolbar-dropdown">
              <summary className="app-dropdown__summary toolbar-button toolbar-more__summary" aria-label="Font family" title="Font family" onMouseDown={preventMouseDown}>{fontFamilyLabel}</summary>
              <div className="app-dropdown__menu toolbar-more__menu" role="menu" aria-label="Font family">
                {FONT_FAMILY_CHOICES.map((font) => (
                  <button
                    key={font.value}
                    type="button"
                    className="app-dropdown__item toolbar-menu-button"
                    role="menuitemradio"
                    aria-checked={toolbar.fontFamily === font.value}
                    onMouseDown={preventMouseDown}
                    onClick={(event) => {
                      closeContainingDropdown(event);
                      runEditorCommand((editor) => editor.setFontFace(font.value || null));
                    }}
                  >
                    {check(toolbar.fontFamily === font.value)}
                    <span style={font.value ? { fontFamily: font.value } : undefined}>{font.label}</span>
                  </button>
                ))}
              </div>
            </AppDropdown>
            <AppDropdown className="toolbar-dropdown">
              <summary className="app-dropdown__summary toolbar-button toolbar-more__summary" aria-label="Font size" title="Font size" onMouseDown={preventMouseDown}>{fontSizeLabel}</summary>
              <div className="app-dropdown__menu toolbar-more__menu" role="menu" aria-label="Font size">
                {FONT_SIZE_OPTIONS.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    className="app-dropdown__item toolbar-menu-button"
                    role="menuitemradio"
                    aria-checked={toolbar.fontSize === size.value}
                    onMouseDown={preventMouseDown}
                    onClick={(event) => {
                      closeContainingDropdown(event);
                      runEditorCommand((editor) => editor.setFontSize(size.value || null));
                    }}
                  >
                    {check(toolbar.fontSize === size.value)}
                    <span>{size.label}</span>
                  </button>
                ))}
              </div>
            </AppDropdown>
            <label className="toolbar-color" title="Text color">
              <span>A</span>
              <input type="color" value={toolbar.textColor} aria-label="Text color" onMouseDown={rememberSelection} onChange={(event) => runEditorCommand((editor) => editor.setTextColor(event.target.value || null))} />
            </label>
            <label className="toolbar-color" title="Highlight color">
              <Highlighter size={15} />
              <input type="color" value={toolbar.highlightColor} aria-label="Highlight color" onMouseDown={rememberSelection} onChange={(event) => runEditorCommand((editor) => editor.setHighlightColor(event.target.value || null))} />
            </label>
          </div>
        ) : null}

        {isVisible('insert') ? (
          <div className="toolbar-group" data-toolbar-group="insert">
            <button type="button" className="toolbar-button" aria-label="Insert image" title="Insert image" onMouseDown={preventMouseDown}>
              <ImageIcon size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.link ? ' active' : ''}`} aria-label="Insert or remove link" aria-keyshortcuts={`${ariaShortcutModifier}+K`} title={`Insert or remove link (${shortcutModifier}+K)`} onMouseDown={preventMouseDown} onClick={() => openLinkEditor()}>
              <LinkIcon size={15} />
            </button>
          </div>
        ) : null}

        {isVisible('lists') ? (
          <div className="toolbar-group" data-toolbar-group="lists">
            <button type="button" className={`toolbar-button${toolbar.unorderedList ? ' active' : ''}`} aria-label="Bulleted list" title="Bulleted list" onMouseDown={preventMouseDown} onClick={() => toggleList('UL')}>
              <List size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.orderedList ? ' active' : ''}`} aria-label="Numbered list" title="Numbered list" onMouseDown={preventMouseDown} onClick={() => toggleList('OL')}>
              <ListOrdered size={15} />
            </button>
            <button type="button" className={`toolbar-button${toolbar.quote ? ' active' : ''}`} aria-label="Quote" title="Quote" onMouseDown={preventMouseDown} onClick={() => adjustQuote(1)}>
              <Quote size={15} className="icon-mirrored" />
            </button>
            <button type="button" className="toolbar-button" aria-label="Unquote" title="Unquote" onMouseDown={preventMouseDown} onClick={() => adjustQuote(-1)}>
              <Quote size={15} />
            </button>
          </div>
        ) : null}

        {isVisible('alignment') ? (
          <div className="toolbar-group" data-toolbar-group="alignment">
            {ALIGNMENT_OPTIONS.map((alignment) => {
              const Icon = alignment.icon;
              return (
                <button key={alignment.value} type="button" className="toolbar-button" aria-label={alignment.label} title={alignment.label} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setTextAlignment(alignment.value))}>
                  <Icon size={15} />
                </button>
              );
            })}
          </div>
        ) : null}

        <AppDropdown className="toolbar-more">
          <summary className="app-dropdown__summary toolbar-button toolbar-more__summary" onMouseDown={preventMouseDown}>More</summary>
          <div className="app-dropdown__menu toolbar-more__menu" role="menu" aria-label="More formatting options">
            {!isVisible('font') ? (
              <div className="toolbar-menu-section" role="group" aria-label="Font formatting">
                <span className="app-dropdown__heading toolbar-menu-heading" aria-hidden="true">Font</span>
                {FONT_FAMILY_CHOICES.map((font) => (
                  <button key={`font-${font.value}`} type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemradio" aria-checked={toolbar.fontFamily === font.value} aria-label={`Font: ${font.label}`} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setFontFace(font.value || null))}>
                    {check(toolbar.fontFamily === font.value)}
                    <span style={font.value ? { fontFamily: font.value } : undefined}>{font.label}</span>
                  </button>
                ))}
                <span className="app-dropdown__heading toolbar-menu-heading" aria-hidden="true">Size</span>
                {FONT_SIZE_OPTIONS.map((size) => (
                  <button key={`size-${size.value}`} type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemradio" aria-checked={toolbar.fontSize === size.value} aria-label={`Size: ${size.label}`} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setFontSize(size.value || null))}>
                    {check(toolbar.fontSize === size.value)}
                    <span>{size.label}</span>
                  </button>
                ))}
                <label className="toolbar-menu-field">
                  <span>Text color</span>
                  <input type="color" value={toolbar.textColor} aria-label="Text color" onMouseDown={rememberSelection} onChange={(event) => runEditorCommand((editor) => editor.setTextColor(event.target.value || null))} />
                </label>
                <label className="toolbar-menu-field">
                  <span>Highlight</span>
                  <input type="color" value={toolbar.highlightColor} aria-label="Highlight color" onMouseDown={rememberSelection} onChange={(event) => runEditorCommand((editor) => editor.setHighlightColor(event.target.value || null))} />
                </label>
              </div>
            ) : null}
            {!isVisible('insert') ? (
              <div className="toolbar-menu-section" role="group" aria-label="Insert">
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitem" onMouseDown={preventMouseDown}>
                  <ImageIcon size={15} />
                  <span>Insert image</span>
                </button>
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitem" aria-label="Insert or remove link" onMouseDown={preventMouseDown} onClick={(event) => openLinkEditor(event)}>
                  <LinkIcon size={15} />
                  <span>Link</span>
                </button>
              </div>
            ) : null}
            {!isVisible('lists') ? (
              <div className="toolbar-menu-section" role="group" aria-label="Lists and quoting">
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemcheckbox" aria-checked={toolbar.unorderedList} onMouseDown={preventMouseDown} onClick={() => toggleList('UL')}>
                  {check(toolbar.unorderedList)}
                  <span>Bulleted list</span>
                </button>
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemcheckbox" aria-checked={toolbar.orderedList} onMouseDown={preventMouseDown} onClick={() => toggleList('OL')}>
                  {check(toolbar.orderedList)}
                  <span>Numbered list</span>
                </button>
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitem" onMouseDown={preventMouseDown} onClick={() => adjustQuote(1)}>
                  <Quote size={15} className="icon-mirrored" />
                  <span>Quote</span>
                </button>
                <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitem" onMouseDown={preventMouseDown} onClick={() => adjustQuote(-1)}>
                  <Quote size={15} />
                  <span>Unquote</span>
                </button>
              </div>
            ) : null}
            {!isVisible('alignment') ? (
              <div className="toolbar-menu-section" role="group" aria-label="Alignment">
                {ALIGNMENT_OPTIONS.map((alignment) => (
                  <button key={alignment.value} type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemradio" aria-checked={toolbar.alignment === alignment.value} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setTextAlignment(alignment.value))}>
                    {check(toolbar.alignment === alignment.value)}
                    <span>{alignment.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="toolbar-menu-section" role="group" aria-label="More formatting">
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemradio" aria-checked={toolbar.direction === 'ltr'} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setTextDirection('ltr'))}>
                {check(toolbar.direction === 'ltr')}
                <span>Left-to-right</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemradio" aria-checked={toolbar.direction === 'rtl'} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.setTextDirection('rtl'))}>
                {check(toolbar.direction === 'rtl')}
                <span>Right-to-left</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemcheckbox" aria-checked={toolbar.subscript} onMouseDown={preventMouseDown} onClick={() => toggleFormat('SUB', { tag: 'SUP' })}>
                {check(toolbar.subscript)}
                <span>Subscript</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemcheckbox" aria-checked={toolbar.superscript} onMouseDown={preventMouseDown} onClick={() => toggleFormat('SUP', { tag: 'SUB' })}>
                {check(toolbar.superscript)}
                <span>Superscript</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitemcheckbox" aria-checked={toolbar.code} onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.toggleCode())}>
                {check(toolbar.code)}
                <span>Code</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" role="menuitem" onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.removeAllFormatting())}>
                <RemoveFormatting size={15} />
                <span>Clear formatting</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" disabled={!toolbar.canUndo} role="menuitem" aria-label="Undo" onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.undo())}>
                <Undo2 size={15} />
                <span>Undo</span>
              </button>
              <button type="button" className="app-dropdown__item toolbar-menu-button" disabled={!toolbar.canRedo} role="menuitem" aria-label="Redo" onMouseDown={preventMouseDown} onClick={() => runEditorCommand((editor) => editor.redo())}>
                <Redo2 size={15} />
                <span>Redo</span>
              </button>
            </div>
          </div>
        </AppDropdown>
      </div>

      {linkEditor.open ? (
        <form className="editor-link-form" onSubmit={applyLink} onKeyDown={(event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelLinkEditor(); } }}>
          <label className="editor-link-form__field">
            <span>Link URL</span>
            <input
              ref={linkInputRef}
              value={linkEditor.url}
              onChange={(event) => setLinkEditor((state) => ({ ...state, url: event.target.value }))}
              type="url"
              inputMode="url"
              autoComplete="url"
              placeholder="https://example.com"
              aria-invalid={linkEditor.error ? 'true' : undefined}
            />
          </label>
          {linkEditor.error ? <p className="editor-link-form__error" role="alert">{linkEditor.error}</p> : null}
          <div className="editor-link-form__actions">
            <AppButton variant="outline" onClick={cancelLinkEditor}>Cancel</AppButton>
            {linkEditor.hasLink ? (
              <AppButton variant="outline" onClick={() => { runEditorCommand((editor) => editor.removeLink()); setLinkEditor((state) => ({ ...state, open: false })); }}>Remove link</AppButton>
            ) : null}
            <AppButton formAction="submit">Apply link</AppButton>
          </div>
        </form>
      ) : null}

      <div className="editor-wrap" tabIndex={-1}>
        <div
          ref={editorRef}
          className="editor"
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-label={accessibleLabel}
          aria-multiline="true"
        />
      </div>
    </div>
  );
});
