/**
 * Format a number with K/M notation.
 * Returns "—" for 0, null, or undefined values.
 */
export function formatNumber(value) {
  if (value === null || value === undefined || value === 0) return null;

  const num = Number(value);
  if (isNaN(num) || num === 0) return null;

  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return num.toLocaleString();
}

/**
 * Format a percentage value. Returns null for empty/zero.
 */
export function formatPercent(value) {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  if (isNaN(num) || num === 0) return null;
  return `${num.toFixed(1)}%`;
}

/**
 * Display dash for null/undefined/zero values.
 */
export function safeDisplay(value, formatter = (v) => v) {
  if (value === null || value === undefined || value === 0 || value === "") return "—";
  return formatter(value);
}
