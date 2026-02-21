/**
 * Centralized financial formatting utilities.
 * Single source of truth for currency, percentage, and ratio display.
 */

/**
 * Format a number as USD currency.
 * @param {number} value
 * @param {object} options
 * @param {boolean} options.compact — Use compact notation for large values (10K, 1.2M)
 * @param {boolean} options.whole — No decimal places
 * @param {number} options.decimals — Override decimal places (default: 2)
 * @returns {string}
 */
export const formatCurrency = (value, { compact = false, whole = false, decimals } = {}) => {
    if (value == null || isNaN(value)) return '$0.00';

    if (compact && Math.abs(value) >= 10000) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            notation: 'compact',
            maximumFractionDigits: 1,
        }).format(value);
    }

    const fractionDigits = whole ? 0 : (decimals ?? 2);

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
};

/**
 * Format a number as a percentage string.
 * @param {number} value — 0–100 scale
 * @param {number} decimals
 * @returns {string}
 */
export const formatPercent = (value, decimals = 0) => {
    if (value == null || isNaN(value)) return '0%';
    return `${Number(value).toFixed(decimals)}%`;
};

/**
 * Format a coverage ratio (e.g., "1.2x").
 * @param {number} value
 * @returns {string}
 */
export const formatRatio = (value) => {
    if (value == null || isNaN(value)) return '0.0x';
    return `${Number(value).toFixed(1)}x`;
};

export default formatCurrency;
