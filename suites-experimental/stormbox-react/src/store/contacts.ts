import type { Contact } from '../data/mailbox';
import { addressKey } from '../utils/address-key';
import { useMailStore } from './mail-store';

export interface AutocompleteCandidate {
  name: string | null;
  email: string;
  organization?: string | null;
  source: string;
  last_sent_at?: number;
  send_count?: number;
}

function candidate(contact: Contact): AutocompleteCandidate {
  return {
    name: contact.name,
    email: contact.email,
    organization: contact.organization ?? null,
    source: 'contact',
    last_sent_at: contact.last_sent_at,
    send_count: contact.send_count,
  };
}

function matches(contact: Contact, needle: string): boolean {
  if (contact.email.toLowerCase().startsWith(needle)) return true;
  for (const word of contact.name.toLowerCase().split(/\s+/)) {
    if (word.startsWith(needle)) return true;
  }
  return Boolean(contact.organization?.toLowerCase().split(/\s+/).some((word) => word.startsWith(needle)));
}

/** Address book lookup ranked by how often and how recently Alex wrote to each contact. */
export async function autocompleteContacts(prefix: string, limit: number, exclude: string[]): Promise<AutocompleteCandidate[]> {
  const needle = prefix.trim().toLowerCase();
  const excluded = new Set(exclude.map((email) => addressKey(email)));
  const { contacts } = useMailStore.getState();
  const found = contacts
    .filter((contact) => !excluded.has(addressKey(contact.email)) && matches(contact, needle))
    .sort((a, b) => (b.send_count - a.send_count) || (b.last_sent_at - a.last_sent_at) || a.name.localeCompare(b.name));
  return found.slice(0, limit).map(candidate);
}

export async function browseContacts(): Promise<AutocompleteCandidate[]> {
  const { contacts } = useMailStore.getState();
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name)).map(candidate);
}
