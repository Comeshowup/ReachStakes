/**
 * Campaign Management Console — Utility Functions
 * Mappers, formatters, and edge-case handlers
 */

/**
 * Maps raw API campaign response to a unified shape
 * for the Campaign Management Console components.
 */
export function mapApiCampaign(raw) {
    return {
        id: raw.id,
        name: raw.name || raw.title || 'Untitled Campaign',
        status: normalizeStatus(raw.status),
        budget: Number(raw.targetBudget) || 0,
        spent: Number(raw.spent) || 0,
        creators: Number(raw.creators) || 0,
        roi: raw.roi != null ? Number(raw.roi) : null,
        startDate: raw.createdAt || raw.startDate || new Date().toISOString(),
        fundingProgress: Number(raw.fundingProgress) || 0,
    };
}

/**
 * Normalizes status string to expected variants.
 */
function normalizeStatus(status) {
    if (!status) return 'Draft';
    const s = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    const valid = ['Draft', 'Active', 'Completed', 'Pending Payment'];
    return valid.includes(s) ? s : 'Draft';
}

/**
 * Format currency with $ and commas.
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    if (amount == null || isNaN(amount)) return '$0';
    return '$' + Number(amount).toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
}

/**
 * Format ROI display.
 * Handles null, negative, zero, and positive values.
 * @param {number|null} roi
 * @returns {{ text: string, isPositive: boolean }}
 */
export function formatROI(roi) {
    if (roi == null || isNaN(roi)) {
        return { text: '—', isPositive: false };
    }
    if (roi === 0) {
        return { text: '0%', isPositive: false };
    }
    if (roi > 0) {
        return { text: `+${roi}%`, isPositive: true };
    }
    return { text: `${roi}%`, isPositive: false };
}

/**
 * Calculate progress percentage with edge-case guards.
 * @param {number} spent
 * @param {number} budget
 * @returns {number} 0–Infinity (unclamped)
 */
export function calcProgress(spent, budget) {
    if (!budget || budget <= 0) return 0;
    return Math.round((spent / budget) * 100);
}
