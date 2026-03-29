/**
 * @typedef {'active' | 'pending' | 'suspended'} BrandStatus
 *
 * @typedef {Object} Brand
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} logo
 * @property {string} industry
 * @property {BrandStatus} status
 * @property {number} spend_30d
 * @property {number} active_campaigns
 * @property {number} creators_count
 * @property {string | null} last_activity_at
 * @property {number} risk_score          — 0-100
 * @property {string} created_at
 *
 * @typedef {Object} BrandFilters
 * @property {string} search
 * @property {BrandStatus | ''} status
 * @property {string} industry
 * @property {[number, number]} spendRange  — [min, max]
 * @property {string} campaignStatus
 *
 * @typedef {Object} BrandsPagination
 * @property {number} page
 * @property {number} pageSize
 * @property {number} total
 * @property {number} totalPages
 *
 * @typedef {Object} BrandsResponse
 * @property {Brand[]} data
 * @property {BrandsPagination} pagination
 * @property {Record<string, number>} kpis
 */
