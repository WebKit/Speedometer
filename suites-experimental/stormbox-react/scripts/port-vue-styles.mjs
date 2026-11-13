// Regenerates src/styles/components.css from Stormbox's Vue components.
//
//   node scripts/port-vue-styles.mjs [path/to/stormbox]
//
// Vue's scoped CSS appends a [data-v-*] attribute to the last compound of
// each selector (or the compound before :deep()), raising its specificity
// by one attribute. That bump decides several contests with the global
// stylesheet, so it is reproduced here with an always-matching
// :is([class],:not([class])) instead of the attribute.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stormbox = path.resolve(process.argv[2] ?? path.join(os.homedir(), 'src', 'stormbox'));
const components = path.join(stormbox, 'src', 'components');
const FILES = [
  'AppButton', 'AppIconButton', 'AppToggleButton', 'AppDropdown', 'AppSpaces', 'StorageUsageBar', 'AccountAvatarMenu',
  'AppDrawer', 'FolderTree', 'FolderNode', 'TagViewNode', 'MessageColumns', 'MessageList', 'SelectableListHeader',
  'MessageBulkActions', 'MessageListMoreMenu', 'MessageListRow', 'MessageTagStack', 'MessageTagChip', 'TagPickerPanel',
  'TagPickerDropdown', 'TagPickerPopover', 'MessageView', 'MessageAttachmentBar', 'ComposeManager', 'ComposeDialog',
  'RecipientInput', 'RichTextEditor', 'StoreErrorToast',
];
// Selectors whose names are generic enough to collide once they are global.
// Vue scoping also keeps a parent's tag selectors off a child component's
// elements; `.row input` must not reach the recipient field's input.
const PREFIXES = {
  ComposeDialog: [
    [/^\.row input$/, '.row > input'],
    [/^(\.row\b|footer\b)/, '.compose-dialog__card $1'],
  ],
};
const BUMP = ':is([class],:not([class]))';

function splitTopLevel(text, separator) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (quote) { if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") quote = c;
    else if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (c === separator && depth === 0) { parts.push(text.slice(start, i)); start = i + 1; }
  }
  parts.push(text.slice(start));
  return parts;
}

/** Index just past the last compound selector, before a trailing ::pseudo-element. */
function bumpIndex(selector) {
  let depth = 0;
  let pseudoElement = -1;
  for (let i = 0; i < selector.length; i += 1) {
    const c = selector[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (depth === 0 && /[\s>+~]/.test(c)) pseudoElement = -1;
    else if (depth === 0 && c === ':' && selector[i + 1] === ':' && pseudoElement < 0) pseudoElement = i;
  }
  return pseudoElement >= 0 ? pseudoElement : selector.length;
}

function unwrap(text, fn) {
  let out = '';
  let i = 0;
  const token = `${fn}(`;
  while (i < text.length) {
    const j = text.indexOf(token, i);
    if (j < 0) { out += text.slice(i); break; }
    out += text.slice(i, j);
    let k = j + token.length;
    let depth = 1;
    while (k < text.length && depth > 0) {
      if (text[k] === '(') depth += 1;
      else if (text[k] === ')') depth -= 1;
      k += 1;
    }
    out += text.slice(j + token.length, k - 1);
    i = k;
  }
  return out;
}

function scopeSelector(raw, prefixes) {
  let selector = raw.trim();
  for (const [pattern, replacement] of prefixes) selector = selector.replace(pattern, replacement);
  if (selector.includes(':global(')) return unwrap(selector, ':global');
  const deep = selector.indexOf(':deep(');
  if (deep >= 0) {
    const before = selector.slice(0, deep).replace(/\s+$/, '');
    const after = unwrap(selector.slice(deep), ':deep');
    return before ? `${before}${BUMP} ${after}` : `${BUMP} ${after}`;
  }
  const at = bumpIndex(selector);
  return selector.slice(0, at) + BUMP + selector.slice(at);
}

function transform(css, scoped, prefixes) {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const open = css.indexOf('{', i);
    if (open < 0) { out += css.slice(i); break; }
    const head = css.slice(i, open);
    let depth = 1;
    let k = open + 1;
    while (k < css.length && depth > 0) {
      if (css[k] === '{') depth += 1;
      else if (css[k] === '}') depth -= 1;
      k += 1;
    }
    const body = css.slice(open + 1, k - 1);
    const trimmed = head.trim();
    if (trimmed.startsWith('@')) {
      out += /^@(-webkit-)?keyframes/.test(trimmed)
        ? `${head}{${body}}`
        : `${head}{${transform(body, scoped, prefixes)}}`;
    } else {
      const leading = head.match(/^\s*/)[0];
      const selectors = splitTopLevel(trimmed, ',')
        .map((selector) => (scoped ? scopeSelector(selector, prefixes) : unwrap(selector.trim(), ':global')));
      out += `${leading}${selectors.join(',\n')} {${body}}`;
    }
    i = k;
  }
  return out;
}

let output = `/* Generated by scripts/port-vue-styles.mjs from Stormbox's Vue components
   (MPL-2.0). Do not edit; edit the script or src/styles/local.css. */\n`;
for (const name of FILES) {
  const source = fs.readFileSync(path.join(components, `${name}.vue`), 'utf8');
  const re = /<style([^>]*)>([\s\S]*?)<\/style>/g;
  let match;
  output += `\n/* ---- ${name} ---- */\n`;
  while ((match = re.exec(source))) {
    const scoped = /\bscoped\b/.test(match[1]);
    const css = match[2].replace(/\/\*[\s\S]*?\*\//g, '');
    output += `${transform(css, scoped, PREFIXES[name] ?? []).trim()}\n`;
  }
}
fs.writeFileSync(path.join(root, 'src', 'styles', 'components.css'), output);
console.log(`Wrote src/styles/components.css (${output.length} bytes)`);
