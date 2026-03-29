import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ─── Campaigns ─────────────────────────────────────────────────────

/**
 * Fetch paginated campaign list
 * @param {{ page: number, pageSize: number, search?: string, status?: string }} params
 */
export const fetchCampaigns = async ({ page = 1, pageSize = 20, search, status }) => {
  const params = new URLSearchParams({ page, pageSize });
  if (search) params.set('search', search);
  if (status && status !== 'all') {
    // Map 'needs_attention' to something the API understands
    if (status !== 'needs_attention') params.set('status', capitalise(status));
  }
  const { data } = await axios.get(`${API}/api/admin/campaigns?${params}`, {
    headers: authHeader(),
  });
  return data;
};

/**
 * Fetch a single campaign by ID
 * @param {string} id
 */
export const fetchCampaignById = async (id) => {
  const { data } = await axios.get(`${API}/api/admin/campaigns/${id}`, {
    headers: authHeader(),
  });
  return data;
};

/**
 * Update campaign status
 * @param {{ id: string, status: string }} params
 */
export const updateCampaignStatus = async ({ id, status }) => {
  const { data } = await axios.put(
    `${API}/api/admin/campaigns/${id}/status`,
    { status },
    { headers: authHeader() }
  );
  return data;
};

// ─── Campaign Creators ───────────────────────────────────────────

/**
 * Fetch creators attached to a campaign
 * @param {{ campaignId: string, page?: number, status?: string }} params
 */
export const fetchCampaignCreators = async ({ campaignId, page = 1, status }) => {
  const params = new URLSearchParams({ page, pageSize: 50 });
  if (status) params.set('status', status);
  const { data } = await axios.get(
    `${API}/api/admin/campaigns/${campaignId}/creators?${params}`,
    { headers: authHeader() }
  );
  return data;
};

/**
 * Invite creators to a campaign
 * @param {{ campaignId: string, payload: import('../types/index.js').CampaignInvitePayload }} params
 */
export const inviteCreators = async ({ campaignId, payload }) => {
  const { data } = await axios.post(
    `${API}/api/admin/campaigns/${campaignId}/invite`,
    payload,
    { headers: authHeader() }
  );
  return data;
};

/**
 * Update status for a creator in a campaign (resend/cancel)
 * @param {{ campaignId: string, collaborationId: string, action: 'resend' | 'cancel' }} params
 */
export const updateCreatorInviteStatus = async ({ campaignId, collaborationId, action }) => {
  const { data } = await axios.post(
    `${API}/api/admin/campaigns/${campaignId}/creators/${collaborationId}/${action}`,
    {},
    { headers: authHeader() }
  );
  return data;
};

// ─── Available Creators (for invite search) ──────────────────────

/**
 * Search creators available to invite
 * @param {{ search?: string, platform?: string, minFollowers?: number, maxFollowers?: number, category?: string, page?: number }} params
 */
export const fetchAvailableCreators = async ({
  search,
  platform,
  minFollowers,
  maxFollowers,
  category,
  page = 1,
}) => {
  const params = new URLSearchParams({ page, pageSize: 30 });
  if (search) params.set('search', search);
  if (platform) params.set('platform', platform);
  if (minFollowers) params.set('minFollowers', minFollowers);
  if (maxFollowers) params.set('maxFollowers', maxFollowers);
  if (category) params.set('category', category);
  const { data } = await axios.get(`${API}/api/admin/creators?${params}`, {
    headers: authHeader(),
  });
  return data;
};

// ─── Helpers ─────────────────────────────────────────────────────

const capitalise = (str) => str.charAt(0).toUpperCase() + str.slice(1);
