/**
 * @typedef {'draft' | 'active' | 'completed' | 'paused' | 'cancelled'} CampaignStatus
 */

/**
 * @typedef {'invited' | 'accepted' | 'rejected'} CreatorStatus
 */

/**
 * @typedef {Object} CampaignOffer
 * @property {number} amount
 * @property {string[]} deliverables
 * @property {string} deadline - ISO date string
 */

/**
 * @typedef {Object} Campaign
 * @property {string} id
 * @property {string} name
 * @property {string} title
 * @property {string} brandId
 * @property {CampaignStatus} status
 * @property {number} budget
 * @property {number} targetBudget
 * @property {string} createdAt
 * @property {string} [description]
 * @property {string} [deadline]
 * @property {string} [platformRequired]
 * @property {{ brandProfile?: { companyName?: string }, name?: string }} [brand]
 * @property {{ collaborations?: number, issues?: number, tasks?: number }} [_count]
 */

/**
 * @typedef {Object} CampaignCreator
 * @property {string} id
 * @property {string} campaignId
 * @property {string} creatorId
 * @property {CreatorStatus} status
 * @property {CampaignOffer} [offer]
 * @property {{ name: string, creatorProfile?: { handle?: string, primaryPlatform?: string, avatarUrl?: string, followersCount?: number } }} [creator]
 * @property {number} [agreedPrice]
 */

/**
 * @typedef {Object} CampaignInvitePayload
 * @property {string[]} creatorIds
 * @property {CampaignOffer} offer
 * @property {string} [message]
 */

/**
 * @typedef {Object} AvailableCreator
 * @property {string} id
 * @property {string} name
 * @property {{ handle?: string, primaryPlatform?: string, avatarUrl?: string, followersCount?: number, category?: string }} [creatorProfile]
 */

export const CREATOR_STATUS = /** @type {const} */ ({
  invited: 'invited',
  accepted: 'accepted',
  rejected: 'rejected',
});

export const CAMPAIGN_STATUS = /** @type {const} */ ({
  draft: 'draft',
  active: 'active',
  completed: 'completed',
  paused: 'paused',
  cancelled: 'cancelled',
});

export const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Completed' },
  { key: 'needs_attention', label: 'Needs Attention' },
];

export const PLATFORMS = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'LinkedIn'];

export const CATEGORIES = ['Fashion', 'Tech', 'Food', 'Travel', 'Fitness', 'Beauty', 'Gaming', 'Finance'];
