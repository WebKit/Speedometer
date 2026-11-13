export const MAX_INLINE_RASTER_BYTES = 10 * 1024 * 1024;

const INLINE_RASTER_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/bmp',
  'image/avif',
  'image/x-icon',
  'image/vnd.microsoft.icon',
]);

export function isInlineRasterType(type: string | null | undefined): boolean {
  return !!type && INLINE_RASTER_TYPES.has(type.trim().toLowerCase());
}
