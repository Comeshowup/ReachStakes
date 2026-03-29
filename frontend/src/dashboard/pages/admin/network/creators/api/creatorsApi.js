/**
 * creatorsApi.js
 * Mock API layer for the Creators Management module.
 * Swap out the mock functions for real axios calls when backend is ready.
 */

import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const PLATFORMS = ['instagram', 'youtube', 'tiktok'];
const TIERS = ['nano', 'micro', 'macro', 'elite'];
const STATUSES = ['active', 'inactive', 'flagged'];

const NAMES = [
  'Aria Thompson', 'Jordan Kim', 'Maya Patel', 'Alex Rivera', 'Sam Chen',
  'Riley Johnson', 'Casey Morgan', 'Taylor Swift', 'Morgan Lee', 'Quinn Davis',
  'Skylar Brooks', 'Drew Martinez', 'Avery Wilson', 'Blake Anderson', 'Jamie Clark',
  'Brooklyn Harris', 'Cameron Lewis', 'Dakota Young', 'Emery Hall', 'Finley Allen',
  'Gray Scott', 'Harley Adams', 'Indigo Baker', 'Jessie Carter', 'Kendall Turner',
];

const HANDLES = NAMES.map(n =>
  '@' + n.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z_]/g, '')
);

const AVATARS = NAMES.map((_, i) => `https://i.pravatar.cc/80?img=${i + 1}`);

function randFloat(min, max, dec = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(dec));
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randSubset(arr, min = 1, max = arr.length) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, randInt(min, max));
}

/** Build stable mock creator list (seeded for consistency) */
const buildMockCreators = () =>
  NAMES.map((name, i) => {
    const tier = randPick(TIERS);
    const status = Math.random() > 0.85 ? 'flagged' : Math.random() > 0.2 ? 'active' : 'inactive';
    const platforms = randSubset(PLATFORMS, 1, 2);
    const totalCampaigns = randInt(0, 40);
    const activeCampaigns = Math.min(randInt(0, 5), totalCampaigns);

    return {
      id: `cr_${(i + 1).toString().padStart(4, '0')}`,
      name,
      handle: HANDLES[i],
      avatar: AVATARS[i],
      platforms,
      followersTotal: randInt(
        tier === 'nano' ? 1_000 : tier === 'micro' ? 10_000 : tier === 'macro' ? 100_000 : 500_000,
        tier === 'nano' ? 9_999 : tier === 'micro' ? 99_999 : tier === 'macro' ? 499_999 : 5_000_000,
      ),
      engagementRate: randFloat(0.5, 12),
      activeCampaigns,
      totalCampaigns,
      lifetimeEarnings: randFloat(0, tier === 'elite' ? 120_000 : tier === 'macro' ? 40_000 : 8_000),
      pendingPayout: randFloat(0, 4_000),
      tier,
      status,
      lastActiveAt: new Date(Date.now() - randInt(0, 30) * 86_400_000).toISOString(),
    };
  });

// Stable across renders (module-level)
const MOCK_CREATORS = buildMockCreators();

const MOCK_STATS = {
  total: MOCK_CREATORS.length,
  active: MOCK_CREATORS.filter(c => c.status === 'active').length,
  inCampaigns: MOCK_CREATORS.filter(c => c.activeCampaigns > 0).length,
  pendingPayout: MOCK_CREATORS.reduce((s, c) => s + c.pendingPayout, 0),
  flagged: MOCK_CREATORS.filter(c => c.status === 'flagged').length,
};

/** Simulate network delay */
const delay = (ms = 400) => new Promise(r => setTimeout(r, ms));

// ─── API Functions ─────────────────────────────────────────────────────────────

/**
 * Fetch paginated/filtered/sorted creator list.
 * Replace with axios.get('/api/admin/creators', { params }) when backend ready.
 */
export async function fetchCreators({
  page = 1,
  pageSize = 25,
  search = '',
  platforms = [],
  tiers = [],
  statuses = [],
  sortBy = 'name',
  sortDir = 'asc',
} = {}) {
  await delay(350);

  let filtered = [...MOCK_CREATORS];

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q)
    );
  }
  if (platforms.length > 0) {
    filtered = filtered.filter(c => c.platforms.some(p => platforms.includes(p)));
  }
  if (tiers.length > 0) {
    filtered = filtered.filter(c => tiers.includes(c.tier));
  }
  if (statuses.length > 0) {
    filtered = filtered.filter(c => statuses.includes(c.status));
  }

  // Sort
  filtered.sort((a, b) => {
    let valA = a[sortBy], valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    if (valA < valB) return sortDir === 'asc' ? -1 : 1;
    if (valA > valB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    pagination: { page, pageSize, total, totalPages },
  };
}

/**
 * Fetch a single creator by id.
 */
export async function fetchCreatorById(id) {
  await delay(250);
  const creator = MOCK_CREATORS.find(c => c.id === id);
  if (!creator) throw new Error(`Creator ${id} not found`);
  return { data: creator };
}

/**
 * Fetch KPI stats strip data.
 */
export async function fetchCreatorStats() {
  await delay(300);
  return { data: MOCK_STATS };
}

/**
 * Mock campaigns for a creator drawer.
 */
export async function fetchCreatorCampaigns(creatorId) {
  await delay(300);
  const statuses = ['Active', 'Completed', 'Pending', 'Paused'];
  return {
    data: Array.from({ length: randInt(1, 6) }, (_, i) => ({
      id: `camp_${creatorId}_${i}`,
      name: `Campaign ${String.fromCharCode(65 + i)} — Q${randInt(1,4)} 2025`,
      status: randPick(statuses),
      brand: ['Nike', 'Spotify', 'Notion', 'Figma', 'Vercel'][i % 5],
      earnings: randFloat(500, 8000),
      dueDate: new Date(Date.now() + randInt(-30, 60) * 86_400_000).toISOString(),
    })),
  };
}

/**
 * Mock payouts for a creator drawer.
 */
export async function fetchCreatorPayouts(creatorId) {
  await delay(300);
  return {
    data: Array.from({ length: randInt(2, 8) }, (_, i) => ({
      id: `pay_${creatorId}_${i}`,
      amount: randFloat(200, 5000),
      status: randPick(['Paid', 'Pending', 'Processing']),
      date: new Date(Date.now() - randInt(0, 180) * 86_400_000).toISOString(),
      campaign: `Campaign ${String.fromCharCode(65 + (i % 6))}`,
    })),
  };
}

/**
 * Mock activity timeline for a creator drawer.
 */
export async function fetchCreatorActivity(creatorId) {
  await delay(300);
  const types = [
    { type: 'joined', label: 'Joined platform' },
    { type: 'campaign_assigned', label: 'Assigned to campaign' },
    { type: 'payout_processed', label: 'Payout processed' },
    { type: 'tier_changed', label: 'Tier updated' },
    { type: 'flagged', label: 'Account flagged' },
  ];
  return {
    data: Array.from({ length: randInt(3, 8) }, (_, i) => {
      const t = randPick(types);
      return {
        id: `act_${creatorId}_${i}`,
        type: t.type,
        label: t.label,
        detail: `Detail for event #${i + 1}`,
        timestamp: new Date(Date.now() - randInt(0, 365) * 86_400_000).toISOString(),
      };
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
  };
}

/**
 * PATCH update a creator (stub).
 */
export async function patchCreator(id, updates) {
  await delay(500);
  return { data: { id, ...updates } };
}
