import DOMPurify from 'dompurify';

export interface RichTextContent {
  html: string;
  text: string;
}

const SANITIZE_OPTIONS = {
  ADD_DATA_URI_TAGS: ['img'] as string[],
  ALLOW_UNKNOWN_PROTOCOLS: true,
  FORCE_BODY: false,
  RETURN_DOM: true,
  RETURN_DOM_FRAGMENT: true,
  WHOLE_DOCUMENT: false,
} as const;

export function sanitizeRichTextToDOMFragment(html: string): DocumentFragment {
  const fragment = DOMPurify.sanitize(html, SANITIZE_OPTIONS);
  return fragment
    ? document.importNode(fragment, true) as DocumentFragment
    : document.createDocumentFragment();
}

export function sanitizeRichTextHtml(html: string): string {
  const container = document.createElement('div');
  container.append(sanitizeRichTextToDOMFragment(html));
  return container.innerHTML;
}

const RICH_TEXT_BLOCKS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'LI',
  'OL',
  'P',
  'PRE',
  'SECTION',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'UL',
]);

export function richTextPlainText(root: Node): string {
  let text = '';
  const blockBreak = () => {
    if (text && !text.endsWith('\n')) text += '\n';
  };
  const visit = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue ?? '';
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_FRAGMENT_NODE) {
      return;
    }
    if (node.nodeName === 'BR') {
      text += '\n';
      return;
    }
    const block = node.nodeType === Node.ELEMENT_NODE && RICH_TEXT_BLOCKS.has(node.nodeName);
    if (block) blockBreak();
    node.childNodes.forEach(visit);
    if (block) blockBreak();
  };
  root.childNodes.forEach(visit);
  return text.replace(/\n+$/u, '');
}

export function isSemanticallyEmptyRichTextHtml(html: string): boolean {
  if (!html.trim()) return true;
  const container = document.createElement('div');
  container.append(sanitizeRichTextToDOMFragment(html));
  if (container.querySelector('img,hr')) return false;
  return richTextPlainText(container).replace(/\u00a0/gu, ' ').trim() === '';
}

export function sanitizeRichTextContent(html: string): RichTextContent {
  const container = document.createElement('div');
  container.append(sanitizeRichTextToDOMFragment(html));
  return {
    html: container.innerHTML,
    text: richTextPlainText(container),
  };
}
