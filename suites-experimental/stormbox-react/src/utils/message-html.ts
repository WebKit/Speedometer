/**
 * Build the srcdoc payload for the message-view HTML iframe.
 *
 * Why an iframe (and not just inline HTML in the Vue component):
 *  - Style isolation. HTML emails routinely ship their own <style>
 *    blocks and DOMPurify allows them through. Without an iframe those
 *    rules cascade out and reflow the surrounding webmail UI — the
 *    earlier symptom was that EVERY email appeared at one fixed width
 *    because each one's <style> was the last cascade winner against
 *    the host stylesheet.
 *  - Security. The iframe is sandboxed (no allow-scripts) and carries
 *    a strict CSP, so even if a stray <script> survived the sanitizer
 *    the document cannot execute it.
 *
 * What we deliberately do NOT do:
 *  - Override the email's widths. If a marketing email is designed as
 *    a 640-px hero card we let it render at 640px and put whitespace
 *    around it. Forcing tables/images to `max-width: 100% !important`
 *    flattens those carefully-laid-out designs into a wall of left-
 *    aligned content with broken proportions (PLEDGEBOX/UltraPill was
 *    the regression report). The iframe by itself solves the original
 *    "every email has the same locked width" bug; aggressive overrides
 *    on top of it create a new, worse bug.
 *  - Rewrite arbitrary email colors. The email's design wins. We only
 *    set the iframe document's default canvas/text colors so unstyled
 *    or lightly-styled HTML has readable dark-mode defaults.
 *
 * Bulwark (https://github.com/bulwarkmail/webmail) takes the same
 * iframe + sandbox + srcdoc approach in its email-viewer. Roundcube's
 * classic pipeline does inline rendering after a heavy custom
 * sanitizer (rcube_washtml); for us, iframe + DOMPurify is the
 * simpler equivalent and gets style isolation for free.
 */

import DOMPurify from 'dompurify';

import { isInlineRasterType } from './raster-images';

/**
 * URI scheme allowlist for DOMPurify: standard web schemes plus `cid:`
 * so inline images survive sanitisation (sanitizeMessageHtml resolves
 * them to data: URLs). `data:` is intentionally absent here — DOMPurify
 * permits data: on media tags via its built-in DATA_URI_TAGS branch
 * regardless of this regexp, so the raster allowlist is enforced in the
 * sanitizeMessageHtml hook instead.
 */
export const ALLOWED_URI_REGEXP =
  /^(?:(?:https?|mailto|tel|cid):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;

// Raster image types we will inline as data: URLs. This is a strict
// allowlist on purpose, drawing the same line Bulwark's webmail does:
//
//  - Never trust the Content-Type an email declares for inline render
//    (the Proton Mail CVE, Sonar 2024, abused a part typed
//    application/javascript). An exact allowlist means a hostile type
//    is simply not inlined.
//  - SVG is excluded. It is an active document format whose bytes the
//    surrounding HTML sanitizer cannot see once wrapped in a data: URL.
//    Even though we only ever place the URL in an <img> (secure static
//    mode), excluding it keeps our own attack surface minimal. Pasted
//    clipboard images are always raster (PNG/JPEG), so nothing the
//    feature targets is affected.
const LEGACY_BODY_COLOR_ATTRIBUTES = new Set(['text', 'link', 'vlink', 'alink']);
const BASE64_ONLY = /^[A-Za-z0-9+/]*={0,2}$/;
const CID_URL_RE = /cid:\s*(?:<([^>]+)>|([^"'\s)>]+))/gi;

/**
 * Whether a MIME type is an image we will inline. Non-image parts (e.g.
 * application/javascript dressed up as an inline part) and SVG are
 * refused so they never become a renderable inline URL.
 */
export function isInlineImageType(type: string | null | undefined): boolean {
  return isInlineRasterType(type);
}

/**
 * Build a `data:` URL for an inline image part from its base64 bytes and
 * declared MIME type, or null if the part is not an allowed raster image
 * or the payload is not valid base64.
 *
 * We use `data:` (opaque origin) rather than `blob:` deliberately: blob
 * URLs inherit the creating document's origin, the property the Proton
 * Mail CVE leaned on to smuggle a script past CSP. A data: URL has an
 * opaque origin and, with the type allowlisted to a raster image, can
 * only ever render as a picture.
 */
export function buildInlineImageDataUrl(
  base64: string | null | undefined,
  type: string | null | undefined,
): string | null {
  if (!base64 || !isInlineImageType(type)) return null;
  const mime = (type as string).trim().toLowerCase();
  const clean = String(base64).replace(/\s+/g, '');
  if (!BASE64_ONLY.test(clean)) return null;
  return `data:${mime};base64,${clean}`;
}

function stripCidBrackets(value: string): string {
  return value.trim().replace(/^<\s*/, '').replace(/\s*>$/, '').trim();
}

function decodeCidComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Normalize a MIME Content-ID or cid: URL payload for comparison. Mirrors
 * the practical cases Roundcube handles: Content-ID headers commonly arrive
 * wrapped in angle brackets, while HTML may reference the same id as
 * `cid:foo`, `cid:<foo>`, or a percent-encoded URL component.
 */
export function normalizeContentId(value: string | null | undefined): string {
  if (value == null) return '';
  const trimmed = String(value).trim().replace(/^cid:/i, '');
  return stripCidBrackets(decodeCidComponent(stripCidBrackets(trimmed))).toLowerCase();
}

export function cidUrlContentId(value: string | null | undefined): string {
  const raw = String(value ?? '').trim();
  if (!/^cid:/i.test(raw)) return '';
  return normalizeContentId(raw.slice(4));
}

function addCidReference(out: Set<string>, value: string | null | undefined) {
  const id = cidUrlContentId(value);
  if (id) out.add(id);
}

function addCidReferencesInText(out: Set<string>, value: string | null | undefined) {
  if (!value) return;
  for (const match of String(value).matchAll(CID_URL_RE)) {
    const id = normalizeContentId(match[1] ?? match[2] ?? '');
    if (id) out.add(id);
  }
}

/**
 * Return Content-IDs referenced by cid: URLs in an HTML body. This is used
 * both to decide which JMAP blobs to fetch for inline rendering and which
 * referenced image parts should not be duplicated in the attachment list.
 */
export function referencedContentIds(html: string | null | undefined): Set<string> {
  const out = new Set<string>();
  if (!html) return out;

  if (typeof DOMParser === 'function') {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    doc.querySelectorAll('*').forEach((node) => {
      if (!(node instanceof Element)) return;
      addCidReference(out, node.getAttribute('src'));
      addCidReference(out, node.getAttribute('poster'));
      addCidReference(out, node.getAttribute('href'));
      addCidReference(out, node.getAttribute('xlink:href'));
      const srcset = node.getAttribute('srcset');
      if (srcset) {
        for (const candidate of srcset.split(',')) {
          addCidReference(out, candidate.trim().split(/\s+/)[0]);
        }
      }
      addCidReferencesInText(out, node.getAttribute('style'));
    });
  } else {
    addCidReferencesInText(out, html);
  }

  return out;
}

/**
 * Return only cid references that the renderer can author in place.
 * sanitizeMessageMarkup rewrites IMG src attributes; references in links,
 * CSS, poster, or srcset remain inert and do not justify hiding a part from
 * the attachment bar.
 */
export function referencedInlineImageContentIds(
  html: string | null | undefined,
): Set<string> {
  const out = new Set<string>();
  if (!html) return out;

  if (typeof DOMParser === 'function') {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    doc.querySelectorAll('img[src]').forEach((node) => {
      addCidReference(out, node.getAttribute('src'));
    });
    return out;
  }

  const imageSource = /<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of String(html).matchAll(imageSource)) {
    addCidReference(out, match[1] ?? match[2] ?? match[3]);
  }
  return out;
}

// URI-bearing attributes a data: image can ride in on a media tag.
const DATA_URI_ATTRS = ['src', 'poster', 'xlink:href'];

/**
 * Extract the lowercased media type from a `data:` URL, or '' when it
 * has none (e.g. `data:,...`, which defaults to text/plain).
 */
function dataUrlMediaType(value: string): string {
  const match = /^data:([^;,]*)/i.exec(value.trim());
  return (match?.[1] ?? '').trim().toLowerCase();
}

/**
 * Sanitise message HTML for the reading-pane iframe. A single DOMPurify
 * `afterSanitizeAttributes` hook does two things:
 *
 *  1. Resolves known inline `cid:` image references (from `cidUrls`) to
 *     their data: URLs, via `setAttribute` so the value is DOM-escaped
 *     and can never break out of the attribute — the "resolve during the
 *     wash" approach Roundcube uses. Unknown cids are left as-is (render
 *     broken, never fetched).
 *  2. Enforces the raster allowlist on author-embedded `data:` images.
 *     DOMPurify's built-in DATA_URI_TAGS branch otherwise lets *any*
 *     `data:image/*` (including svg) through on <img>/<source>/etc.
 *     regardless of ALLOWED_URI_REGEXP, and that set cannot be narrowed
 *     by config — so we strip disallowed data: URIs here instead.
 */
export function sanitizeMessageHtml(
  html: string,
  cidUrls: Map<string, string> | null = null,
): string {
  if (!html) return '';
  return sanitizeMessageMarkup(html, cidUrls, false);
}

/**
 * Sanitise a complete HTML email while retaining its document presentation.
 *
 * DOMPurify normally returns only `body.innerHTML`, which silently discards
 * styles in `<head>` plus attributes on `<html>` and `<body>`. Those are
 * common in email and often carry the canvas/footer backgrounds. DOMPurify
 * intentionally permits CSS rather than sanitising it; the iframe's
 * no-scripts sandbox and restrictive CSP keep that author CSS isolated from
 * the host application under the same trust boundary used for body styles.
 *
 * Active head metadata is not presentation and is forbidden explicitly:
 * in whole-document mode DOMPurify otherwise retains `<meta http-equiv>`.
 */
export function sanitizeMessageDocument(
  html: string,
  cidUrls: Map<string, string> | null = null,
): string {
  if (!html) return '';
  return sanitizeMessageMarkup(html, cidUrls, true);
}

function sanitizeMessageMarkup(
  html: string,
  cidUrls: Map<string, string> | null,
  wholeDocument: boolean,
): string {
  const cidMap = cidUrls;
  const hook = (node: any) => {
    if (!node || node.nodeType !== 1 || typeof node.getAttribute !== 'function') return;
    if (node.nodeName === 'IMG' && cidMap && cidMap.size > 0) {
      const src = node.getAttribute('src');
      if (src) {
        const cid = cidUrlContentId(src);
        const url = cidMap.get(cid);
        if (url) node.setAttribute('src', url);
      }
    }
    for (const attr of DATA_URI_ATTRS) {
      const value = node.getAttribute(attr);
      if (!value) continue;
      const trimmed = value.trim();
      if (/^data:/i.test(trimmed) && !isInlineRasterType(dataUrlMediaType(trimmed))) {
        node.removeAttribute(attr);
      }
    }
  };
  DOMPurify.addHook('afterSanitizeAttributes', hook);
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_URI_REGEXP,
      ...(wholeDocument
        ? {
            WHOLE_DOCUMENT: true,
            FORBID_TAGS: ['base', 'link', 'meta'],
            ADD_ATTR: (attributeName: string, tagName: string) =>
              tagName.toLowerCase() === 'body'
              && LEGACY_BODY_COLOR_ATTRIBUTES.has(attributeName.toLowerCase()),
          }
        : {}),
    });
  } finally {
    DOMPurify.removeHook('afterSanitizeAttributes');
  }
}

/**
 * Content-Security-Policy applied INSIDE the iframe. The outer document
 * is unaffected. We forbid script execution entirely (default-src 'none'
 * + no script-src), allow inline styles and fonts, and permit images /
 * media via http/https/data/blob (the sanitizer already filters scheme
 * via ALLOWED_URI_REGEXP).
 */
export const IFRAME_CSP = [
  "default-src 'none'",
  "img-src data: blob: http: https: cid:",
  "style-src 'unsafe-inline'",
  "font-src data: http: https:",
  "media-src data: blob: http: https:",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-src 'none'",
].join('; ');

/**
 * Minimal stylesheet injected at the top of the iframe body. The
 * guiding principle is "do as little as possible" — the email's own
 * design has to come through intact, including its widths, alignment,
 * fonts, colors, and backgrounds.
 *
 * Specifically:
 *  - We zero out the user-agent's default 8-px body margin so the
 *    iframe content starts flush, otherwise a thin band of host
 *    background bleeds through at every edge of the iframe.
 *  - We provide a sans-serif default for emails that contain only
 *    plain text or unstyled markup. The vast majority of HTML emails
 *    set their own font-family in inline styles, so this default only
 *    matters for the "received as text/html but contains no styling"
 *    edge case.
 *  - We set the default text color on html, but leave its background
 *    transparent. Authored body backgrounds can then propagate to the iframe
 *    canvas and cover short messages; the iframe element supplies the themed
 *    fallback when the email has no background of its own.
 *  - We constrain replaced elements and common fixed-width containers
 *    to the iframe width so message bodies never require horizontal
 *    scrolling in the reading pane. We intentionally avoid colour,
 *    typography, spacing, or other broad design rewrites.
 */
/** Canvas under the classic palette: --panel, the Bolt ramp's base surface
 *  in light and lower in dark (assets/styles.css). */
export const BODY_THEME_COLORS = {
  light: {
    background: '#fcfcfd',
    color: '#111827',
  },
  dark: {
    background: '#111113',
    color: '#e6e8ef',
  },
};

/** Canvas under the Bolt palette (assets/bolt-theme.css): its --panel2, the
 *  lower surface the message list and reading pane share. */
export const BOLT_BODY_BACKGROUND = {
  light: '#f7f7f7',
  dark: '#18181b',
};

export function buildBodyCss(colorScheme = 'light') {
  const colors = Object.prototype.hasOwnProperty.call(BODY_THEME_COLORS, colorScheme)
    ? BODY_THEME_COLORS[colorScheme]
    : BODY_THEME_COLORS.light;
  return `
  html {
    margin: 0;
    padding: 0;
    background: transparent;
    color: ${colors.color};
    /* The host (.message-view__body) is the sole scroll container for
     * the open message. The iframe document must never grow its own
     * scrollbars: we already size the iframe element to the document's
     * scroll height (post-zoom) from MessageView.vue, so any residual
     * iframe-level scrollbar would be visual noise stacked beside the
     * host's scrollbar, not a navigation affordance. */
    overflow: hidden;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    overflow-wrap: anywhere;
    overflow: hidden;
  }
  img, video, canvas, svg {
    max-width: 100%;
    height: auto;
  }
  table {
    max-width: 100%;
  }
  div, section, article, main, header, footer, aside, table, tbody, thead, tfoot, tr, td, th {
    max-width: 100%;
  }
`;
}

/**
 * Build the srcdoc string used for the message-view iframe.
 *
 * @param {string} sanitizedHtml HTML that has already been passed
 *   through DOMPurify (or equivalent). Pass an empty string for an
 *   empty document.
 * @param {object} [opts]
 * @param {string} [opts.colorScheme='light'] CSS color-scheme value.
 *   Also controls the iframe document's default canvas/text colors.
 * @returns {string} Self-contained HTML document suitable for use as
 *   the `srcdoc` attribute of an iframe.
 */
export function buildMessageSrcDoc(sanitizedHtml: string, opts: { colorScheme?: string } = {}) {
  const colorScheme = opts.colorScheme === 'dark' ? 'dark' : 'light';
  const body = sanitizedHtml || '';
  const bodyCss = buildBodyCss(colorScheme);

  // Whole-document sanitisation preserves the email's head styles and its
  // html/body presentation attributes. Inject our policy/defaults into that
  // document instead of nesting it inside a second <body>.
  if (/^\s*<html(?:\s|>)/i.test(body) && typeof DOMParser === 'function') {
    const doc = new DOMParser().parseFromString(body, 'text/html');
    const head = doc.head;

    const charset = doc.createElement('meta');
    charset.setAttribute('charset', 'utf-8');
    const viewport = doc.createElement('meta');
    viewport.setAttribute('name', 'viewport');
    viewport.setAttribute('content', 'width=device-width, initial-scale=1');
    const csp = doc.createElement('meta');
    csp.setAttribute('http-equiv', 'Content-Security-Policy');
    csp.setAttribute('content', IFRAME_CSP);
    const defaults = doc.createElement('style');
    defaults.textContent = bodyCss;

    const policyFragment = doc.createDocumentFragment();
    policyFragment.append(charset, viewport, csp, defaults);
    head.insertBefore(policyFragment, head.firstChild);
    doc.documentElement.style.colorScheme = colorScheme;

    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
  }

  return `<!DOCTYPE html>
<html style="color-scheme: ${colorScheme};">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${IFRAME_CSP}">
<style>${bodyCss}</style>
</head>
<body>${body}</body>
</html>`;
}

/**
 * Sandbox attribute for the message-view iframe.
 *
 * Notably absent: `allow-scripts`. Without it the iframe document
 * cannot execute any inline or external JavaScript, even if the
 * sanitizer somehow misses a <script> element. `allow-same-origin`
 * is required so the parent (Vue component) can read
 * `iframe.contentDocument` to wire up auto-resize and to retarget
 * `<a>` clicks to a new tab.
 */
export const IFRAME_SANDBOX =
  'allow-same-origin allow-popups allow-popups-to-escape-sandbox';
