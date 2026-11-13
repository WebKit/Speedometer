export interface SenderAvatar {
  domain: string;
  imageUrl: string;
  initials: string;
  style: Record<string, string>;
}

const DOMAIN_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const SENDER_AVATAR_URL_VERSION = '3';

export function senderAvatarFor(fromText: string | null | undefined, proxyBaseUrl: string): SenderAvatar {
  const domain = senderDomainFromText(fromText);
  return {
    domain,
    imageUrl: avatarImageUrlForDomain(domain, proxyBaseUrl),
    initials: senderInitials(fromText),
    style: senderAvatarStyle(fromText),
  };
}

export function avatarImageUrlForDomain(domain: string, proxyBaseUrl: string): string {
  const normalizedDomain = normalizeDomain(domain);
  const base = proxyBaseUrl.trim().replace(/\/+$/, '');
  if (!base || !normalizedDomain) return '';
  return `${base}/${encodeURIComponent(normalizedDomain)}?v=${SENDER_AVATAR_URL_VERSION}`;
}

export function senderDomainFromText(fromText: string | null | undefined): string {
  const email = extractEmail(fromText);
  if (!email) return '';
  const at = email.lastIndexOf('@');
  if (at < 0) return '';
  return normalizeDomain(email.slice(at + 1));
}

export function normalizeDomain(value: string | null | undefined): string {
  const raw = String(value ?? '').trim().toLowerCase().replace(/\.+$/, '');
  if (!raw || raw.length > 253) return '';
  if (/[\s/:?#@\\[\]]/.test(raw)) return '';

  let hostname: string;
  try {
    hostname = new URL(`https://${raw}`).hostname.toLowerCase().replace(/\.+$/, '');
  } catch {
    return '';
  }

  if (!hostname || hostname !== raw && raw.startsWith('xn--')) return '';
  if (hostname === 'localhost' || !hostname.includes('.')) return '';
  if (isIpv4Address(hostname)) return '';

  const labels = hostname.split('.');
  if (labels.some((label) => !DOMAIN_LABEL_RE.test(label))) return '';
  return hostname;
}

export function extractEmail(fromText: string | null | undefined): string {
  const value = String(fromText ?? '').trim();
  if (!value) return '';
  const bracketed = value.match(/<([^<>@\s]+@[^<>@\s]+)>/)?.[1];
  const plain = value.match(/([^<>\s,;]+@[^<>\s,;]+)/)?.[1];
  return String(bracketed ?? plain ?? '').trim().toLowerCase();
}

export function shortFrom(text: string | null | undefined): string {
  if (!text) return '(no sender)';
  const m = String(text).match(/^(.+?)\s*<.+>$/);
  return m ? m[1].replace(/^"|"$/g, '') : String(text);
}

export function senderInitials(text: string | null | undefined): string {
  const label = text ? shortFrom(text) : '';
  if (!label) return '?';

  const compactInitials = label
    .match(/(^\S\S?|\s\S)?/g)
    ?.map((part) => part.trim())
    .join('');
  const initials = compactInitials
    ?.match(/(^\S|\S$)?/g)
    ?.join('')
    .toLocaleUpperCase();

  return initials || '?';
}

export function senderAvatarStyle(text: string | null | undefined): Record<string, string> {
  const seed = extractEmail(text) || shortFrom(text);
  const hue = hashText(seed) % 360;
  return {
    background: `hsl(${hue} 42% 42%)`,
  };
}

function isIpv4Address(hostname: string): boolean {
  const parts = hostname.split('.');
  if (parts.length !== 4) return false;
  return parts.every((part) => /^\d+$/.test(part) && Number(part) >= 0 && Number(part) <= 255);
}

function hashText(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}
