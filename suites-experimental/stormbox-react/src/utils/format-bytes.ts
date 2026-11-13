/**
 * Format a byte count for compact UI labels (e.g. "6 GB", "512 MB").
 */
export function formatBytes(bytes: number | null | undefined): string | null {
  if (bytes == null || Number.isNaN(bytes)) {
    return null;
  }
  if (bytes <= 0) {
    return '0 B';
  }

  const units = [
    { threshold: 1024 ** 3, label: 'GB', divisor: 1024 ** 3 },
    { threshold: 1024 ** 2, label: 'MB', divisor: 1024 ** 2 },
    { threshold: 1024, label: 'KB', divisor: 1024 },
  ];

  for (const unit of units) {
    if (bytes >= unit.threshold) {
      const value = Math.floor(bytes / unit.divisor);
      return `${value} ${unit.label}`;
    }
  }

  return `${bytes} B`;
}
