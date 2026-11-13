/**
 * Dark-mode adaptation for HTML email bodies, ported from Thunderbird's
 * `DarkReader.mjs` (comm-central). Model: "strip, don't invert" — remove
 * declared colours that aren't safe on the dark canvas so they fall back to
 * the iframe's dark defaults (`buildBodyCss('dark')`), keeping colours that
 * already read on dark. Never inverts pixels, so images/logos/emoji are
 * untouched. Returns the input unchanged on any error.
 *
 * Deviations from the straight port (rationale in
 * `specs/002-dark-mode-email/spec.md`):
 *   1. Transform the HTML string before it becomes the srcdoc (no flash).
 *   2. Detect existing dark support (meta/inline color-scheme, @media
 *      prefers-color-scheme: dark, filter: invert), not Thunderbird's dead
 *      computed-filter check.
 *   3. Recurse into @media/@supports in embedded <style> (TB: top-level only).
 *   4. Own CSS colour parser (`color.ts`); InspectorUtils is Gecko-only.
 *   5. Lighten dark chromatic text rather than dropping it, keeping brand
 *      colours (e.g. Netflix red) instead of flattening them to white.
 */

import {
  colorChroma,
  contrast,
  isTransparent,
  isValidColor,
  lightenColorForContrast,
  luminance,
} from './color';
import { BODY_THEME_COLORS } from './message-html';

const LUMINANCE_THRESHOLD = 200;
const CONTRAST_THRESHOLD = 3.5;

// Canvas the adapted body renders on; keeps the contrast maths matching
// what the reader sees.
const DARK_CANVAS = BODY_THEME_COLORS.dark.background;

// Chroma (0–255) below which a colour is grey/black body text (reset to the
// default) vs. a chromatic accent (hue preserved).
const CHROMA_THRESHOLD = 32;

// Thunderbird's selector: any inline style, or a bgcolor/color attr, minus
// <button>. We match on the presence of `style` rather than substringing for
// "color"/"background" so a declaration the CSSOM exposes is never skipped
// (and case-insensitively, since the CSSOM normalises property names).
const COLOR_SELECTOR = [
  ':not(button)[style]',
  ':not(button)[bgcolor]',
  ':not(button)[color]',
].join(',');

function hasGradient(value: string): boolean {
  return value.includes('gradient');
}

/**
 * Sanitize one declaration block (an element's inline style or a CSS rule's
 * style); mirrors Thunderbird `sanitizeStyle`. Returns true if it changed
 * anything.
 */
export function sanitizeStyleDeclaration(style: CSSStyleDeclaration): boolean {
  const color = style.getPropertyValue('color');
  const background = style.getPropertyValue('background');
  const backgroundColor = style.getPropertyValue('background-color');
  const backgroundImage = style.getPropertyValue('background-image');

  if (!color && !background && !backgroundColor && !backgroundImage) {
    return false;
  }

  let changed = false;
  const remove = (property: string) => {
    if (style.getPropertyValue(property)) {
      style.removeProperty(property);
      changed = true;
    }
  };

  // Text colour now on the dark canvas: keep light text; drop dark grey/black
  // (body text → default); lighten dark chromatic text to readable, keeping
  // its hue.
  const adaptTextColor = () => {
    if (!color || luminance(color) > LUMINANCE_THRESHOLD) return;
    if (colorChroma(color) < CHROMA_THRESHOLD) {
      remove('color');
      return;
    }
    const lightened = lightenColorForContrast(color, DARK_CANVAS, CONTRAST_THRESHOLD);
    if (lightened && lightened.toLowerCase() !== color.trim().toLowerCase()) {
      style.setProperty('color', lightened);
      changed = true;
    }
  };

  // A declared background is unsafe on the dark canvas when it is too bright
  // to sit behind light text, or too low-contrast against the text it carries.
  const backgroundIsUnsafe = (value: string) =>
    luminance(value) > LUMINANCE_THRESHOLD
    || (!!color && contrast(color, value) < CONTRAST_THRESHOLD);

  // Strip background images that assume a light context (we cannot inspect
  // a raster image's luminance). Gradients are handled at the end.
  if (backgroundImage && backgroundImage !== 'none' && !hasGradient(backgroundImage)) {
    remove('background-image');
  }

  // No real background: judge the text colour alone.
  if ((!background || background === 'none') && (!backgroundColor || isTransparent(backgroundColor))) {
    adaptTextColor();
    return changed;
  }

  // Background colour too bright, or insufficient contrast with the text.
  if (backgroundColor && isValidColor(backgroundColor) && backgroundIsUnsafe(backgroundColor)) {
    remove('background-color');
    remove('background');
    adaptTextColor();
  }

  // Same test for the `background` shorthand when it is a plain colour.
  if (background && isValidColor(background) && backgroundIsUnsafe(background)) {
    remove('background');
    adaptTextColor();
  }

  // Never let a gradient (which may be light) survive.
  if (hasGradient(style.getPropertyValue('background')) || hasGradient(style.getPropertyValue('background-image'))) {
    remove('background');
    remove('background-image');
  }

  return changed;
}

interface MaybeStyleRule {
  style?: CSSStyleDeclaration;
  cssRules?: CSSRuleList;
}

// Recurse into @media/@supports grouping rules; skip @keyframes (rewriting
// their colours can break animations).
function visitRules(rules: CSSRuleList): boolean {
  let changed = false;
  for (let i = 0; i < rules.length; i += 1) {
    const rule = rules[i];
    const name = rule.constructor?.name ?? '';
    if (name === 'CSSKeyframesRule' || name === 'CSSKeyframeRule') continue;
    const candidate = rule as unknown as MaybeStyleRule;
    if (candidate.style) {
      if (sanitizeStyleDeclaration(candidate.style)) changed = true;
    }
    if (candidate.cssRules && candidate.cssRules.length) {
      if (visitRules(candidate.cssRules)) changed = true;
    }
  }
  return changed;
}

function serializeSheet(sheet: CSSStyleSheet): string {
  return Array.from(sheet.cssRules, (rule) => `${rule.cssText}\n`).join('');
}

// Sanitize an embedded <style>'s CSS via a constructable sheet — works in
// browsers and happy-dom and never applies to the host.
function adaptCssText(css: string): string {
  if (!css.trim() || typeof CSSStyleSheet === 'undefined') return css;
  let sheet: CSSStyleSheet;
  try {
    sheet = new CSSStyleSheet();
    sheet.replaceSync(css);
  } catch {
    return css;
  }
  if (!visitRules(sheet.cssRules)) return css;
  return serializeSheet(sheet);
}

const PREFERS_DARK_RE = /prefers-color-scheme\s*:\s*dark/i;
const FILTER_INVERT_RE = /filter\s*:[^;"']*invert\s*\(/i;
const COLOR_SCHEME_DARK_RE = /color-scheme\s*:[^;]*dark/i;

function currentEnvironmentPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  // `prefers-color-scheme` is an OS/UA-level preference shared with the
  // sandboxed iframe, so the host window's value is what the email's own
  // `@media` branch will see when it renders (the in-app theme class
  // toggle is independent and does not affect it).
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Whether the email already ships its own dark rendering, so we leave it
 * alone: an active @media prefers-color-scheme: dark branch, a meta/inline
 * color-scheme with `dark`, or filter: invert on the outermost wrapper.
 */
type SanitizableRoot = Document | DocumentFragment;

function emailDeclaresDarkSupport(root: SanitizableRoot, rawHtml: string): boolean {
  if (PREFERS_DARK_RE.test(rawHtml) && currentEnvironmentPrefersDark()) return true;

  for (const meta of root.querySelectorAll('meta[name]')) {
    if ((meta.getAttribute('name') ?? '').toLowerCase() !== 'color-scheme') continue;
    if ((meta.getAttribute('content') ?? '').toLowerCase().includes('dark')) return true;
  }

  // For a complete email check the preserved document/body wrappers; for a
  // fragment, check its outermost wrappers as before.
  const doc = root.nodeType === 9 ? root as Document : null;
  const outerElements = doc
    ? [doc.documentElement, doc.body, ...Array.from(doc.body.children)]
    : Array.from(root.children);
  for (const el of outerElements) {
    if (!el) continue;
    const style = el.getAttribute('style') ?? '';
    if (COLOR_SCHEME_DARK_RE.test(style) || FILTER_INVERT_RE.test(style)) {
      return true;
    }
  }
  return false;
}

function adaptColorMarkup(
  root: SanitizableRoot,
  rawHtml: string,
  body: HTMLElement | null = null,
): boolean {
  if (emailDeclaresDarkSupport(root, rawHtml)) return false;

  // Whole-document rendering now preserves body presentation attributes.
  // Remove the legacy light-canvas variants in dark mode; inline body styles
  // and CSS rules go through the same contrast-aware pass as descendants.
  if (body) {
    for (const attr of ['background', 'bgcolor', 'text', 'link', 'vlink', 'alink']) {
      body.removeAttribute(attr);
    }
  }

  for (const node of root.querySelectorAll(COLOR_SELECTOR)) {
    node.removeAttribute('bgcolor');
    node.removeAttribute('color');
    if (!node.hasAttribute('style')) continue;
    sanitizeStyleDeclaration((node as HTMLElement).style);
  }

  for (const node of root.querySelectorAll('text[fill]')) {
    const fill = node.getAttribute('fill');
    if (isValidColor(fill) && luminance(fill) <= LUMINANCE_THRESHOLD) {
      node.setAttribute('fill', 'currentColor');
    }
  }

  for (const styleEl of root.querySelectorAll('style')) {
    const css = styleEl.textContent ?? '';
    const adapted = adaptCssText(css);
    if (adapted !== css) styleEl.textContent = adapted;
  }

  return true;
}

/**
 * Adapt already-sanitized HTML for the dark theme. Returns the input
 * unchanged when there's no DOM, the email already supports dark mode, or
 * anything throws. Call after `sanitizeMessageHtml`, before
 * `buildMessageSrcDoc`.
 */
export function adaptHtmlForDarkMode(html: string): string {
  if (!html || typeof document === 'undefined') return html;

  try {
    if (/^\s*<html(?:\s|>)/i.test(html) && typeof DOMParser === 'function') {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      if (!adaptColorMarkup(doc, html, doc.body)) {
        return html;
      }
      return doc.documentElement.outerHTML;
    }

    // Parse inertly in a <template>: keeps <style> inline (a full parse
    // hoists a top-level <style> to <head>), loads nothing, never touches
    // the host. This re-parse/re-serialize round-trips already-sanitized
    // HTML; it is safe because the output is only ever rendered in the
    // sandboxed, no-scripts, strict-CSP iframe (`buildMessageSrcDoc`).
    const template = document.createElement('template');
    template.innerHTML = html;
    const content = template.content;

    if (!adaptColorMarkup(content, html)) return html;
    return template.innerHTML;
  } catch {
    return html;
  }
}
