/**
 * The Quick Filter is a dense local match over From / To / Subject.
 * `needle` must already be normalized with `normalizeFilterText`.
 */

export function normalizeFilterText(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

export function messageMatchesQuickFilter(
  row: { from_text?: string | null; to_text?: string | null; subject?: string | null } | null | undefined,
  needle: string,
): boolean {
  if (!needle) return true;
  return [row?.from_text, row?.to_text, row?.subject]
    .some((value) => normalizeFilterText(value).includes(needle));
}
