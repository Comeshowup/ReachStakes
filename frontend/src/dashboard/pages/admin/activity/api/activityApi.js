// ─── Mock Activity API ────────────────────────────────────────────────────────
// Drop-in replacement: swap fetchActivityPage for an axios call when backend ready
// Signature: fetchActivityPage(params) → Promise<{ data: ActivityEvent[], nextCursor?: string }>

const now = new Date("2026-03-28T23:42:00+05:30");
const ago = (minutes) => new Date(now - minutes * 60 * 1000).toISOString();

/** @type {ActivityEvent[]} */
const SEED_EVENTS = [
  {
    id: "evt_001",
    type: "campaign.created",
    status: "success",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_101", type: "campaign", name: "Nike Summer Drop" },
    metadata: { budget: 15000, platform: "Instagram", deadline: "2026-04-15" },
    createdAt: ago(3),
  },
  {
    id: "evt_002",
    type: "payout.completed",
    status: "success",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_001", type: "transaction", name: "TXN-78312" },
    metadata: { amount: 2400, currency: "USD", creator: "jordan.creates", bank: "Chase ****4421" },
    createdAt: ago(7),
  },
  {
    id: "evt_003",
    type: "creator.invited",
    status: "pending",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "usr_201", type: "user", name: "Aisha Patel" },
    metadata: { campaign: "Nike Summer Drop", email: "aisha@email.com", inviteCode: "INV-993" },
    createdAt: ago(14),
  },
  {
    id: "evt_004",
    type: "payout.failed",
    status: "failed",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_002", type: "transaction", name: "TXN-78390" },
    metadata: { amount: 850, currency: "USD", creator: "byte_vibes", error: "Invalid account number", retryCount: 2 },
    createdAt: ago(22),
  },
  {
    id: "evt_005",
    type: "campaign.approved",
    status: "success",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_102", type: "campaign", name: "Adidas Heritage Reel" },
    metadata: { reviewNotes: "All requirements met", approvedAt: ago(30) },
    createdAt: ago(31),
  },
  {
    id: "evt_006",
    type: "system.error",
    status: "failed",
    actor: { id: "sys_2", type: "system", name: "Webhook Service" },
    entity: { id: "txn_003", type: "transaction", name: "TXN-78401" },
    metadata: { errorCode: "WH_TIMEOUT", endpoint: "/webhooks/stripe", attempts: 3, lastAttemptAt: ago(35) },
    createdAt: ago(36),
  },
  {
    id: "evt_007",
    type: "admin.action",
    status: "info",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "usr_202", type: "user", name: "DevvDoe" },
    metadata: { action: "account_suspended", reason: "TOS violation — spam submissions", duration: "7 days" },
    createdAt: ago(45),
  },
  {
    id: "evt_008",
    type: "creator.joined",
    status: "success",
    actor: { id: "usr_203", type: "creator", name: "luna.aesthetic" },
    entity: { id: "cmp_103", type: "campaign", name: "Glossier Glow Up" },
    metadata: { followerCount: 142000, platform: "TikTok", acceptedAt: ago(52) },
    createdAt: ago(53),
  },
  {
    id: "evt_009",
    type: "invoice.generated",
    status: "success",
    actor: { id: "sys_3", type: "system", name: "Billing Service" },
    entity: { id: "txn_004", type: "transaction", name: "INV-2024-039" },
    metadata: { amount: 7500, client: "Nike Brand LLC", dueDate: "2026-04-30", itemCount: 3 },
    createdAt: ago(80),
  },
  {
    id: "evt_010",
    type: "campaign.rejected",
    status: "failed",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_104", type: "campaign", name: "GreenTech Awareness" },
    metadata: { reason: "Misleading claims in brief", reviewerNote: "Requires legal clearance first" },
    createdAt: ago(120),
  },
  {
    id: "evt_011",
    type: "payout.initiated",
    status: "pending",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_005", type: "transaction", name: "TXN-78450" },
    metadata: { amount: 1200, creator: "neon_writes", bank: "BofA ****9921" },
    createdAt: ago(180),
  },
  {
    id: "evt_012",
    type: "campaign.created",
    status: "success",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "cmp_105", type: "campaign", name: "Levi's 501 Campaign" },
    metadata: { budget: 22000, platform: "YouTube", deadline: "2026-05-01" },
    createdAt: ago(240),
  },
  {
    id: "evt_013",
    type: "system.sync",
    status: "info",
    actor: { id: "sys_4", type: "system", name: "Sync Worker" },
    entity: { id: "cmp_101", type: "campaign", name: "Nike Summer Drop" },
    metadata: { recordsSynced: 134, duration: "4.2s", source: "StripeAPI" },
    createdAt: ago(300),
  },
  {
    id: "evt_014",
    type: "admin.ban",
    status: "info",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "usr_204", type: "user", name: "fake_inflator" },
    metadata: { reason: "Bot activity detected", banType: "permanent", reportedBy: "system_ai" },
    createdAt: ago(400),
  },
  {
    id: "evt_015",
    type: "payout.completed",
    status: "success",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_006", type: "transaction", name: "TXN-78201" },
    metadata: { amount: 3100, currency: "USD", creator: "reel.maven" },
    createdAt: ago(500),
  },
  {
    id: "evt_016",
    type: "creator.invited",
    status: "success",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "usr_205", type: "user", name: "jasper.films" },
    metadata: { campaign: "Levi's 501 Campaign", email: "jasper@creator.io" },
    createdAt: ago(620),
  },
  {
    id: "evt_017",
    type: "campaign.completed",
    status: "success",
    actor: { id: "sys_5", type: "system", name: "Campaign Scheduler" },
    entity: { id: "cmp_099", type: "campaign", name: "Spotify Wrapped Promo" },
    metadata: { totalSpend: 18400, creatorsInvolved: 12, deliverables: 34 },
    createdAt: ago(780),
  },
  {
    id: "evt_018",
    type: "system.error",
    status: "failed",
    actor: { id: "sys_2", type: "system", name: "Webhook Service" },
    entity: { id: "cmp_098", type: "campaign", name: "H&M Style Edit" },
    metadata: { errorCode: "AUTH_EXPIRED", message: "OAuth token revoked by provider" },
    createdAt: ago(900),
  },
  {
    id: "evt_019",
    type: "notification.sent",
    status: "success",
    actor: { id: "sys_6", type: "system", name: "Notifications Service" },
    entity: { id: "usr_206", type: "user", name: "surf.collective" },
    metadata: { channel: "email", template: "payout_ready", notificationId: "notif_8821" },
    createdAt: ago(1080),
  },
  {
    id: "evt_020",
    type: "invoice.generated",
    status: "pending",
    actor: { id: "sys_3", type: "system", name: "Billing Service" },
    entity: { id: "txn_007", type: "transaction", name: "INV-2024-040" },
    metadata: { amount: 4200, client: "Adidas APAC", dueDate: "2026-05-10" },
    createdAt: ago(1440),
  },
  {
    id: "evt_021",
    type: "campaign.paused",
    status: "info",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "cmp_106", type: "campaign", name: "Oatly Oat Milk" },
    metadata: { reason: "Brand requested pause", estimatedResume: "2026-04-05" },
    createdAt: ago(1600),
  },
  {
    id: "evt_022",
    type: "payout.failed",
    status: "failed",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_008", type: "transaction", name: "TXN-78512" },
    metadata: { amount: 950, error: "Bank account closed", creator: "pixel.ranger", retryCount: 3 },
    createdAt: ago(1800),
  },
  {
    id: "evt_023",
    type: "creator.joined",
    status: "success",
    actor: { id: "usr_207", type: "creator", name: "north.frame" },
    entity: { id: "cmp_102", type: "campaign", name: "Adidas Heritage Reel" },
    metadata: { followerCount: 89000, platform: "Instagram" },
    createdAt: ago(2000),
  },
  {
    id: "evt_024",
    type: "admin.action",
    status: "info",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_104", type: "campaign", name: "GreenTech Awareness" },
    metadata: { action: "brief_updated", changes: ["budget", "deadline"], previousBudget: 5000 },
    createdAt: ago(2400),
  },
  {
    id: "evt_025",
    type: "payout.completed",
    status: "success",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_009", type: "transaction", name: "TXN-76900" },
    metadata: { amount: 1750, currency: "USD", creator: "wanderlust.vid" },
    createdAt: ago(2880),
  },
  {
    id: "evt_026",
    type: "system.maintenance",
    status: "info",
    actor: { id: "sys_7", type: "system", name: "Infrastructure" },
    entity: { id: "sys_7", type: "campaign", name: "Platform" },
    metadata: { window: "02:00–03:00 UTC", services: ["api", "webhooks"], scheduledBy: "devops" },
    createdAt: ago(3600),
  },
  {
    id: "evt_027",
    type: "campaign.approved",
    status: "success",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "cmp_107", type: "campaign", name: "BeautyBlender Drop" },
    metadata: { reviewNotes: "Creative brief is clear" },
    createdAt: ago(4320),
  },
  {
    id: "evt_028",
    type: "creator.invited",
    status: "failed",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "usr_208", type: "user", name: "inkstyle.art" },
    metadata: { campaign: "BeautyBlender Drop", error: "Email bounce", email: "inkstyle@old.net" },
    createdAt: ago(5040),
  },
  {
    id: "evt_029",
    type: "payout.initiated",
    status: "pending",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_010", type: "transaction", name: "TXN-78600" },
    metadata: { amount: 3300, creator: "frame.hunter", bank: "Wise ****0082" },
    createdAt: ago(5760),
  },
  {
    id: "evt_030",
    type: "invoice.generated",
    status: "success",
    actor: { id: "sys_3", type: "system", name: "Billing Service" },
    entity: { id: "txn_011", type: "transaction", name: "INV-2024-041" },
    metadata: { amount: 9100, client: "Glossier Inc", dueDate: "2026-05-15" },
    createdAt: ago(6480),
  },
  {
    id: "evt_031",
    type: "campaign.created",
    status: "success",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_108", type: "campaign", name: "Red Bull Adrenaline Series" },
    metadata: { budget: 35000, platform: "YouTube Shorts", deadline: "2026-04-20" },
    createdAt: ago(7200),
  },
  {
    id: "evt_032",
    type: "system.error",
    status: "failed",
    actor: { id: "sys_2", type: "system", name: "Webhook Service" },
    entity: { id: "cmp_108", type: "campaign", name: "Red Bull Adrenaline Series" },
    metadata: { errorCode: "RATE_LIMIT", retryAfter: "60s", endpoint: "/api/analytics" },
    createdAt: ago(7260),
  },
  {
    id: "evt_033",
    type: "admin.action",
    status: "info",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "usr_209", type: "user", name: "vivid.spark" },
    metadata: { action: "verified_creator", tier: "gold", previousTier: "silver" },
    createdAt: ago(8640),
  },
  {
    id: "evt_034",
    type: "payout.completed",
    status: "success",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_012", type: "transaction", name: "TXN-76800" },
    metadata: { amount: 5200, currency: "USD", creator: "cine.tales" },
    createdAt: ago(10080),
  },
  {
    id: "evt_035",
    type: "campaign.completed",
    status: "success",
    actor: { id: "sys_5", type: "system", name: "Campaign Scheduler" },
    entity: { id: "cmp_095", type: "campaign", name: "Apple Watch Ultra Launch" },
    metadata: { totalSpend: 42000, creatorsInvolved: 8, deliverables: 24 },
    createdAt: ago(14400),
  },
  {
    id: "evt_036",
    type: "creator.joined",
    status: "success",
    actor: { id: "usr_210", type: "creator", name: "mood.studio" },
    entity: { id: "cmp_105", type: "campaign", name: "Levi's 501 Campaign" },
    metadata: { followerCount: 220000, platform: "YouTube" },
    createdAt: ago(16200),
  },
  {
    id: "evt_037",
    type: "payout.failed",
    status: "failed",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_013", type: "transaction", name: "TXN-78620" },
    metadata: { amount: 400, error: "KYC not completed", creator: "anon.lens" },
    createdAt: ago(18000),
  },
  {
    id: "evt_038",
    type: "admin.ban",
    status: "info",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "usr_211", type: "user", name: "click_farm_99" },
    metadata: { reason: "Fraudulent engagements", banType: "permanent" },
    createdAt: ago(21600),
  },
  {
    id: "evt_039",
    type: "campaign.approved",
    status: "success",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "cmp_109", type: "campaign", name: "Garmin Endurance Run" },
    metadata: { reviewNotes: "Strong concept, target audience well-defined" },
    createdAt: ago(25200),
  },
  {
    id: "evt_040",
    type: "invoice.generated",
    status: "failed",
    actor: { id: "sys_3", type: "system", name: "Billing Service" },
    entity: { id: "txn_014", type: "transaction", name: "INV-2024-042" },
    metadata: { amount: 2800, error: "Payment method expired", client: "Oatly AB" },
    createdAt: ago(28800),
  },
  {
    id: "evt_041",
    type: "system.sync",
    status: "success",
    actor: { id: "sys_4", type: "system", name: "Sync Worker" },
    entity: { id: "cmp_103", type: "campaign", name: "Glossier Glow Up" },
    metadata: { recordsSynced: 289, duration: "8.1s", source: "TikTokAPI" },
    createdAt: ago(30600),
  },
  {
    id: "evt_042",
    type: "campaign.paused",
    status: "info",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "cmp_107", type: "campaign", name: "BeautyBlender Drop" },
    metadata: { reason: "Creative assets delayed" },
    createdAt: ago(32400),
  },
  {
    id: "evt_043",
    type: "payout.completed",
    status: "success",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_015", type: "transaction", name: "TXN-76700" },
    metadata: { amount: 6800, currency: "USD", creator: "lens.saga" },
    createdAt: ago(36000),
  },
  {
    id: "evt_044",
    type: "creator.invited",
    status: "pending",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "usr_212", type: "user", name: "tidal.wave.media" },
    metadata: { campaign: "Red Bull Adrenaline Series", email: "tidal@wavemedia.co" },
    createdAt: ago(39600),
  },
  {
    id: "evt_045",
    type: "system.error",
    status: "failed",
    actor: { id: "sys_8", type: "system", name: "Image CDN" },
    entity: { id: "cmp_106", type: "campaign", name: "Oatly Oat Milk" },
    metadata: { errorCode: "CDN_PROPAGATION_FAIL", assets: 6, retrying: true },
    createdAt: ago(43200),
  },
  {
    id: "evt_046",
    type: "campaign.created",
    status: "success",
    actor: { id: "adm_2", type: "admin", name: "Marcus Lee" },
    entity: { id: "cmp_110", type: "campaign", name: "Samsung Galaxy Creator Pack" },
    metadata: { budget: 28000, platform: "Instagram Reels", deadline: "2026-05-10" },
    createdAt: ago(50400),
  },
  {
    id: "evt_047",
    type: "admin.action",
    status: "info",
    actor: { id: "adm_3", type: "admin", name: "Sia Okonkwo" },
    entity: { id: "cmp_110", type: "campaign", name: "Samsung Galaxy Creator Pack" },
    metadata: { action: "brief_locked", reason: "Pre-launch embargo period" },
    createdAt: ago(52200),
  },
  {
    id: "evt_048",
    type: "payout.initiated",
    status: "pending",
    actor: { id: "sys_1", type: "system", name: "Payout Engine" },
    entity: { id: "txn_016", type: "transaction", name: "TXN-78700" },
    metadata: { amount: 2100, creator: "gradient.media", bank: "Revolut ****3319" },
    createdAt: ago(57600),
  },
  {
    id: "evt_049",
    type: "notification.sent",
    status: "success",
    actor: { id: "sys_6", type: "system", name: "Notifications Service" },
    entity: { id: "usr_213", type: "user", name: "sunset.creator" },
    metadata: { channel: "push", template: "campaign_approved", notificationId: "notif_9012" },
    createdAt: ago(61200),
  },
  {
    id: "evt_050",
    type: "campaign.rejected",
    status: "failed",
    actor: { id: "adm_1", type: "admin", name: "Priya Sharma" },
    entity: { id: "cmp_111", type: "campaign", name: "CryptoX Promo" },
    metadata: { reason: "Financial product — requires compliance review", reviewerNote: "Escalated to legal" },
    createdAt: ago(64800),
  },
];

// ─── Filtering helpers ─────────────────────────────────────────────────────────
const getFromDate = (range) => {
  if (!range) return null;
  const now = new Date();
  if (range === "24h") return new Date(now - 24 * 60 * 60 * 1000);
  if (range === "7d") return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (range === "30d") return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
};

const matchesSearch = (event, search) => {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    event.entity?.name?.toLowerCase().includes(q) ||
    event.actor?.name?.toLowerCase().includes(q) ||
    event.type?.toLowerCase().includes(q) ||
    Object.values(event.metadata || {}).some((v) =>
      String(v).toLowerCase().includes(q)
    )
  );
};

// ─── Fetch function (mock) ─────────────────────────────────────────────────────
const PAGE_SIZE = 20;

export const fetchActivityPage = async ({
  cursor,
  limit = PAGE_SIZE,
  type,
  status,
  entityType,
  search,
  timeRange,
}) => {
  // Simulate network latency
  await new Promise((r) => setTimeout(r, 280));

  let results = [...SEED_EVENTS];

  // Apply filters
  if (type) results = results.filter((e) => e.type === type);
  if (status) results = results.filter((e) => e.status === status);
  if (entityType) results = results.filter((e) => e.entity?.type === entityType);
  if (search) results = results.filter((e) => matchesSearch(e, search));

  const fromDate = getFromDate(timeRange);
  if (fromDate) {
    results = results.filter((e) => new Date(e.createdAt) >= fromDate);
  }

  // Cursor-based pagination (cursor = id of last item seen)
  const startIndex = cursor
    ? results.findIndex((e) => e.id === cursor) + 1
    : 0;

  const page = results.slice(startIndex, startIndex + limit);
  const nextCursor =
    startIndex + limit < results.length ? page[page.length - 1]?.id : undefined;

  return { data: page, nextCursor, total: results.length };
};
