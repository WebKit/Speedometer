/**
 * CSS colour parsing for the dark-mode email adapter (`dark-email.ts`).
 *
 * We parse colours ourselves: Thunderbird's `InspectorUtils` is Gecko-only,
 * and `CSS.supports('color', x)` wrongly returns true for invalid values
 * under happy-dom. Supports hex (3/4/6/8), `rgb()/rgba()`, `hsl()/hsla()`,
 * named colours, and `transparent`; anything else (`currentColor`,
 * `var(...)`, gradients, multi-token shorthands) is "not a colour".
 * luminance/contrast/transparency match Thunderbird's formulas.
 */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Full CSS named-colour list; `transparent` is handled in parseCssColor.
const NAMED_COLORS: Record<string, [number, number, number]> = {
  aliceblue: [240, 248, 255], antiquewhite: [250, 235, 215], aqua: [0, 255, 255],
  aquamarine: [127, 255, 212], azure: [240, 255, 255], beige: [245, 245, 220],
  bisque: [255, 228, 196], black: [0, 0, 0], blanchedalmond: [255, 235, 205],
  blue: [0, 0, 255], blueviolet: [138, 43, 226], brown: [165, 42, 42],
  burlywood: [222, 184, 135], cadetblue: [95, 158, 160], chartreuse: [127, 255, 0],
  chocolate: [210, 105, 30], coral: [255, 127, 80], cornflowerblue: [100, 149, 237],
  cornsilk: [255, 248, 220], crimson: [220, 20, 60], cyan: [0, 255, 255],
  darkblue: [0, 0, 139], darkcyan: [0, 139, 139], darkgoldenrod: [184, 134, 11],
  darkgray: [169, 169, 169], darkgreen: [0, 100, 0], darkgrey: [169, 169, 169],
  darkkhaki: [189, 183, 107], darkmagenta: [139, 0, 139], darkolivegreen: [85, 107, 47],
  darkorange: [255, 140, 0], darkorchid: [153, 50, 204], darkred: [139, 0, 0],
  darksalmon: [233, 150, 122], darkseagreen: [143, 188, 143], darkslateblue: [72, 61, 139],
  darkslategray: [47, 79, 79], darkslategrey: [47, 79, 79], darkturquoise: [0, 206, 209],
  darkviolet: [148, 0, 211], deeppink: [255, 20, 147], deepskyblue: [0, 191, 255],
  dimgray: [105, 105, 105], dimgrey: [105, 105, 105], dodgerblue: [30, 144, 255],
  firebrick: [178, 34, 34], floralwhite: [255, 250, 240], forestgreen: [34, 139, 34],
  fuchsia: [255, 0, 255], gainsboro: [220, 220, 220], ghostwhite: [248, 248, 255],
  gold: [255, 215, 0], goldenrod: [218, 165, 32], gray: [128, 128, 128],
  green: [0, 128, 0], greenyellow: [173, 255, 47], grey: [128, 128, 128],
  honeydew: [240, 255, 240], hotpink: [255, 105, 180], indianred: [205, 92, 92],
  indigo: [75, 0, 130], ivory: [255, 255, 240], khaki: [240, 230, 140],
  lavender: [230, 230, 250], lavenderblush: [255, 240, 245], lawngreen: [124, 252, 0],
  lemonchiffon: [255, 250, 205], lightblue: [173, 216, 230], lightcoral: [240, 128, 128],
  lightcyan: [224, 255, 255], lightgoldenrodyellow: [250, 250, 210], lightgray: [211, 211, 211],
  lightgreen: [144, 238, 144], lightgrey: [211, 211, 211], lightpink: [255, 182, 193],
  lightsalmon: [255, 160, 122], lightseagreen: [32, 178, 170], lightskyblue: [135, 206, 250],
  lightslategray: [119, 136, 153], lightslategrey: [119, 136, 153], lightsteelblue: [176, 196, 222],
  lightyellow: [255, 255, 224], lime: [0, 255, 0], limegreen: [50, 205, 50],
  linen: [250, 240, 230], magenta: [255, 0, 255], maroon: [128, 0, 0],
  mediumaquamarine: [102, 205, 170], mediumblue: [0, 0, 205], mediumorchid: [186, 85, 211],
  mediumpurple: [147, 112, 219], mediumseagreen: [60, 179, 113], mediumslateblue: [123, 104, 238],
  mediumspringgreen: [0, 250, 154], mediumturquoise: [72, 209, 204], mediumvioletred: [199, 21, 133],
  midnightblue: [25, 25, 112], mintcream: [245, 255, 250], mistyrose: [255, 228, 225],
  moccasin: [255, 228, 181], navajowhite: [255, 222, 173], navy: [0, 0, 128],
  oldlace: [253, 245, 230], olive: [128, 128, 0], olivedrab: [107, 142, 35],
  orange: [255, 165, 0], orangered: [255, 69, 0], orchid: [218, 112, 214],
  palegoldenrod: [238, 232, 170], palegreen: [152, 251, 152], paleturquoise: [175, 238, 238],
  palevioletred: [219, 112, 147], papayawhip: [255, 239, 213], peachpuff: [255, 218, 185],
  peru: [205, 133, 63], pink: [255, 192, 203], plum: [221, 160, 221],
  powderblue: [176, 224, 230], purple: [128, 0, 128], rebeccapurple: [102, 51, 153],
  red: [255, 0, 0], rosybrown: [188, 143, 143], royalblue: [65, 105, 225],
  saddlebrown: [139, 69, 19], salmon: [250, 128, 114], sandybrown: [244, 164, 96],
  seagreen: [46, 139, 87], seashell: [255, 245, 238], sienna: [160, 82, 45],
  silver: [192, 192, 192], skyblue: [135, 206, 235], slateblue: [106, 90, 205],
  slategray: [112, 128, 144], slategrey: [112, 128, 144], snow: [255, 250, 250],
  springgreen: [0, 255, 127], steelblue: [70, 130, 180], tan: [210, 180, 140],
  teal: [0, 128, 128], thistle: [216, 191, 216], tomato: [255, 99, 71],
  turquoise: [64, 224, 208], violet: [238, 130, 238], wheat: [245, 222, 179],
  white: [255, 255, 255], whitesmoke: [245, 245, 245], yellow: [255, 255, 0],
  yellowgreen: [154, 205, 50],
};

const LUMINANCE_R = 0.2125;
const LUMINANCE_G = 0.7154;
const LUMINANCE_B = 0.0721;

function clampByte(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(255, Math.round(value)));
}

function clampAlpha(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.max(0, Math.min(1, value));
}

function parseHex(input: string): Rgba | null {
  const hex = input.slice(1);
  if (!/^[0-9a-f]+$/i.test(hex)) return null;
  if (hex.length === 3 || hex.length === 4) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    const a = hex.length === 4 ? parseInt(hex[3] + hex[3], 16) / 255 : 1;
    return { r, g, b, a };
  }
  if (hex.length === 6 || hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }
  return null;
}

function parseChannel(token: string): number {
  const trimmed = token.trim();
  if (trimmed.endsWith('%')) {
    return clampByte((parseFloat(trimmed) / 100) * 255);
  }
  return clampByte(parseFloat(trimmed));
}

function parseAlpha(token: string | undefined): number {
  if (token == null) return 1;
  const trimmed = token.trim();
  if (trimmed === '') return 1;
  if (trimmed.endsWith('%')) return clampAlpha(parseFloat(trimmed) / 100);
  return clampAlpha(parseFloat(trimmed));
}

// Accepts both the legacy comma syntax (`rgb(1, 2, 3)`,
// `rgba(1, 2, 3, .5)`) and the modern space syntax (`rgb(1 2 3 / .5)`).
function parseRgbFunction(input: string): Rgba | null {
  const open = input.indexOf('(');
  if (open < 0 || !input.endsWith(')')) return null;
  const body = input.slice(open + 1, -1).trim();
  const [colorPart, alphaPart] = body.includes('/') ? splitOnce(body, '/') : [body, undefined];
  const parts = colorPart.includes(',')
    ? colorPart.split(',')
    : colorPart.split(/\s+/).filter(Boolean);
  const alphaToken = alphaPart ?? (colorPart.includes(',') && parts.length === 4 ? parts[3] : undefined);
  const channels = parts.slice(0, 3);
  if (channels.length < 3) return null;
  return {
    r: parseChannel(channels[0]),
    g: parseChannel(channels[1]),
    b: parseChannel(channels[2]),
    a: parseAlpha(alphaToken),
  };
}

function splitOnce(value: string, sep: string): [string, string] {
  const idx = value.indexOf(sep);
  return [value.slice(0, idx), value.slice(idx + 1)];
}

function hueToRgb(p: number, q: number, tInput: number): number {
  let t = tInput;
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function parseHslFunction(input: string): Rgba | null {
  const open = input.indexOf('(');
  if (open < 0 || !input.endsWith(')')) return null;
  const body = input.slice(open + 1, -1).trim();
  const [colorPart, alphaPart] = body.includes('/') ? splitOnce(body, '/') : [body, undefined];
  const parts = colorPart.includes(',')
    ? colorPart.split(',')
    : colorPart.split(/\s+/).filter(Boolean);
  if (parts.length < 3) return null;
  const h = ((parseFloat(parts[0]) % 360) + 360) % 360 / 360;
  const s = Math.max(0, Math.min(1, parseFloat(parts[1]) / 100));
  const l = Math.max(0, Math.min(1, parseFloat(parts[2]) / 100));
  const alphaToken = alphaPart ?? (colorPart.includes(',') ? parts[3] : undefined);
  const rgb = hslToRgb(h, s, l);
  return { r: rgb.r, g: rgb.g, b: rgb.b, a: parseAlpha(alphaToken) };
}

// Convert HSL (h, s, l all in [0, 1]) to 8-bit RGB.
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hueToRgb(p, q, h + 1 / 3);
    g = hueToRgb(p, q, h);
    b = hueToRgb(p, q, h - 1 / 3);
  }
  return { r: clampByte(r * 255), g: clampByte(g * 255), b: clampByte(b * 255) };
}

// Convert 8-bit RGB to HSL (h, s, l all in [0, 1]).
function rgbToHsl({ r, g, b }: Rgba): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return { h: h / 6, s, l };
}

function toHex2(n: number): string {
  return clampByte(n).toString(16).padStart(2, '0');
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`;
}

/**
 * Parse a CSS colour string into RGBA, or `null` when the value is not a
 * standalone colour we recognise.
 */
export function parseCssColor(input: string | null | undefined): Rgba | null {
  if (input == null) return null;
  const value = input.trim();
  if (value === '') return null;
  const lower = value.toLowerCase();

  if (lower === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  if (value[0] === '#') return parseHex(value);

  if (lower.startsWith('rgb')) return parseRgbFunction(value);
  if (lower.startsWith('hsl')) return parseHslFunction(value);

  const named = NAMED_COLORS[lower];
  if (named) return { r: named[0], g: named[1], b: named[2], a: 1 };

  return null;
}

/** Perceived luminance (0–255), Thunderbird's formula. Unparseable → 0; alpha ignored. */
export function luminance(color: string | null | undefined): number {
  const rgba = parseCssColor(color);
  if (!rgba) return 0;
  return LUMINANCE_R * rgba.r + LUMINANCE_G * rgba.g + LUMINANCE_B * rgba.b;
}

/** Thunderbird-compatible contrast ratio between two colours. */
export function contrast(a: string | null | undefined, b: string | null | undefined): number {
  const la = luminance(a);
  const lb = luminance(b);
  const brightest = Math.max(la, lb);
  const darkest = Math.min(la, lb);
  return (brightest + 0.05) / (darkest + 0.05);
}

/** A colour is transparent when its alpha is at most 0.2 (or unparseable). */
export function isTransparent(color: string | null | undefined): boolean {
  const rgba = parseCssColor(color);
  if (!rgba) return true;
  return rgba.a <= 0.2;
}

/** Whether the value is a colour our parser understands. */
export function isValidColor(color: string | null | undefined): boolean {
  return parseCssColor(color) !== null;
}

/**
 * Colourfulness `max(r,g,b) - min(r,g,b)` (0–255): 0 for grey/black/white,
 * high for saturated colours. Tells achromatic body text from a chromatic
 * accent. Unparseable → 0. (Raw channels, since HSL saturation misleads for
 * near-black colours.)
 */
export function colorChroma(color: string | null | undefined): number {
  const rgba = parseCssColor(color);
  if (!rgba) return 0;
  return Math.max(rgba.r, rgba.g, rgba.b) - Math.min(rgba.r, rgba.g, rgba.b);
}

/**
 * Hex colour with `color`'s hue/saturation, lightened just enough to reach
 * `minContrast` against `background`; the original (as hex) if it already
 * passes; null if unparseable. Binary search is valid because luminance
 * rises monotonically with HSL lightness.
 */
export function lightenColorForContrast(
  color: string | null | undefined,
  background: string,
  minContrast: number,
): string | null {
  const rgba = parseCssColor(color);
  if (!rgba) return null;
  if (contrast(rgbToHex(rgba), background) >= minContrast) return rgbToHex(rgba);

  const { h, s, l } = rgbToHsl(rgba);
  let lo = l;
  let hi = 0.97;
  let best = hslToRgb(h, s, hi);
  for (let i = 0; i < 24; i += 1) {
    const mid = (lo + hi) / 2;
    const candidate = hslToRgb(h, s, mid);
    if (contrast(rgbToHex(candidate), background) >= minContrast) {
      best = candidate;
      hi = mid;
    } else {
      lo = mid;
    }
  }
  return rgbToHex(best);
}
