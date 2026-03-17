/**
 * Earnings Module — Shared Type Definitions (JSDoc)
 */

/**
 * @typedef {'CAMPAIGN_EARNING' | 'PAYOUT' | 'REFUND' | 'BONUS' | 'ADJUSTMENT'} TransactionType
 */

/**
 * @typedef {'PENDING' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'FAILED'} TransactionStatus
 */

/**
 * @typedef {Object} Transaction
 * @property {string}                id
 * @property {string}                creator_id
 * @property {TransactionType}       type
 * @property {number}                amount          - Always positive; direction implied by type
 * @property {TransactionStatus}     status
 * @property {string|null}           campaign_id
 * @property {string|null}           campaign_name
 * @property {string|null}           payout_id
 * @property {string}                created_at      - ISO 8601
 * @property {string|null}           description
 */

/**
 * @typedef {Object} TimeseriesPoint
 * @property {string} date    - ISO 8601 date string
 * @property {number} amount  - Earnings for that period
 */

/**
 * @typedef {Object} EarningsSummary
 * @property {number}           availableBalance
 * @property {number}           pendingBalance
 * @property {number}           lifetimeEarnings
 * @property {string|null}      nextPayoutDate    - ISO 8601
 * @property {boolean}          bankConnected
 * @property {string|null}      bankName
 * @property {string|null}      bankLastFour
 * @property {Transaction[]}    recentTransactions  - Last 5
 * @property {TimeseriesPoint[]} earningsTimeseries
 */

/**
 * @typedef {Object} TransactionFilters
 * @property {number}           page
 * @property {number}           limit
 * @property {TransactionStatus|''} status
 * @property {TransactionType|''}   type
 * @property {string}           campaignId
 * @property {string}           from    - ISO date string
 * @property {string}           to      - ISO date string
 */

export {};
