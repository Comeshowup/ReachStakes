import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('adminToken') || localStorage.getItem('token')}` });

// ─────────────────────────────────────────────────────────
// Mock data — 50 realistic brand entries
// ─────────────────────────────────────────────────────────
const INDUSTRIES = ['Fashion', 'Tech', 'Beauty', 'Food & Bev', 'Health', 'Sports', 'Travel', 'Finance', 'Auto', 'Retail'];
const STATUSES = ['active', 'active', 'active', 'pending', 'suspended'];

function rng(seed, max) {
  const x = Math.sin(seed + 1) * 10000;
  return Math.floor((x - Math.floor(x)) * max);
}

const MOCK_BRANDS = Array.from({ length: 50 }, (_, i) => {
  const id = `brand-${String(i + 1).padStart(3, '0')}`;
  const industry = INDUSTRIES[rng(i * 7, INDUSTRIES.length)];
  const status = STATUSES[rng(i * 3, STATUSES.length)];
  const spend = rng(i * 11, 180000) + 2000;
  const campaigns = rng(i * 5, 14);
  const creators = campaigns * (rng(i * 2, 8) + 3);
  const risk = status === 'suspended' ? rng(i, 30) + 65 : status === 'pending' ? rng(i, 40) + 20 : rng(i, 25);
  const daysAgo = rng(i * 13, 60);
  const lastActivity = new Date(Date.now() - daysAgo * 86_400_000).toISOString();
  const createdAt = new Date(Date.now() - (rng(i * 17, 700) + 30) * 86_400_000).toISOString();

  const names = [
    'Nova Collective', 'Apex Dynamics', 'Luminary Co', 'Drift Studio', 'Ember Brands',
    'Crest Media', 'Orbit Agency', 'Pulse Group', 'Echo Labs', 'Vibe Works',
    'Zenith Corp', 'Summit Digital', 'Horizon Ventures', 'Forge Creative', 'Catalyst Co',
    'Anchor Media', 'Beacon Group', 'Cedar Brands', 'Delta Studio', 'Epsilon Co',
    'Flux Agency', 'Glide Collective', 'Haven Works', 'Ignite Corp', 'Journey Labs',
    'Kinetic Media', 'Lumen Group', 'Maple Studio', 'Nexus Brands', 'Origin Co',
    'Pivot Agency', 'Quest Media', 'Radius Corp', 'Scale Works', 'Terra Collective',
    'Union Studio', 'Vector Brands', 'Woven Group', 'Axis Media', 'Bloom Corp',
    'Canvas Agency', 'Dome Studio', 'Edge Collective', 'Frame Works', 'Grid Brands',
    'Haven Labs', 'Iris Media', 'Jade Group', 'Kilo Studio', 'Loop Agency',
  ];

  const domains = [
    'novaco.io', 'apexdyn.com', 'luminaryco.com', 'driftstudio.io', 'emberbrands.co',
    'crestmedia.com', 'orbitagency.io', 'pulsegroup.co', 'echolabs.com', 'vibeworks.io',
    'zenithcorp.com', 'summitdigital.io', 'horizonv.co', 'forgecreative.com', 'catalystco.io',
    'anchormedia.com', 'beacongrp.io', 'cedarbrands.co', 'deltastudio.com', 'epsilonco.io',
    'fluxagency.com', 'glidecol.io', 'havenworks.co', 'ignitecorp.com', 'journeylabs.io',
    'kineticmedia.co', 'lumengrp.com', 'maplestudio.io', 'nexusbrands.co', 'originco.com',
    'pivotagency.io', 'questmedia.co', 'radiuscorp.com', 'scaleworks.io', 'terracol.co',
    'unionstudio.com', 'vectorbrands.io', 'wovengrp.co', 'axismedia.com', 'bloomcorp.io',
    'canvasagency.co', 'domestudio.com', 'edgecol.io', 'frameworks.co', 'gridbrands.com',
    'havenlabs.io', 'irismedia.co', 'jadegroup.com', 'kilostudio.io', 'loopagency.co',
  ];

  const name = names[i] || `Brand ${i + 1}`;
  const domain = domains[i] || `brand${i + 1}.com`;

  return {
    id,
    name,
    email: `hello@${domain}`,
    logo: '',
    industry,
    status,
    spend_30d: spend,
    active_campaigns: campaigns,
    creators_count: creators,
    last_activity_at: daysAgo < 1 ? null : lastActivity,
    risk_score: risk,
    created_at: createdAt,
  };
});

// ─────────────────────────────────────────────────────────
// KPIs derived from mock data
// ─────────────────────────────────────────────────────────
function computeKpis(brands) {
  const total = brands.length;
  const active = brands.filter(b => b.status === 'active').length;
  const monthlySpend = brands.reduce((s, b) => s + b.spend_30d, 0);
  const activeCampaigns = brands.reduce((s, b) => s + b.active_campaigns, 0);
  const highRisk = brands.filter(b => b.risk_score >= 65).length;
  const churnRisk = total > 0 ? Math.round((highRisk / total) * 100) : 0;
  return { total, active, monthlySpend, activeCampaigns, churnRisk };
}

// ─────────────────────────────────────────────────────────
// Filter + paginate mock data locally
// ─────────────────────────────────────────────────────────
function applyFilters(brands, { search, status, industry, spendMin, spendMax, campaignStatus }) {
  return brands.filter(b => {
    if (search && !b.name.toLowerCase().includes(search.toLowerCase()) && !b.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (status && b.status !== status) return false;
    if (industry && b.industry !== industry) return false;
    if (spendMin != null && b.spend_30d < spendMin) return false;
    if (spendMax != null && b.spend_30d > spendMax) return false;
    if (campaignStatus === 'has_campaigns' && b.active_campaigns === 0) return false;
    if (campaignStatus === 'no_campaigns' && b.active_campaigns > 0) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────

/**
 * @param {{ page?: number, pageSize?: number, search?: string, status?: string, industry?: string, spendMin?: number, spendMax?: number, campaignStatus?: string }} params
 * @returns {Promise<import('../types').BrandsResponse>}
 */
export async function fetchBrands(params = {}) {
  const { page = 1, pageSize = 25, search = '', status = '', industry = '', spendMin, spendMax, campaignStatus = '' } = params;

  try {
    const qp = new URLSearchParams({ page, pageSize });
    if (search) qp.set('search', search);
    if (status) qp.set('status', status);
    if (industry) qp.set('industry', industry);
    if (spendMin != null) qp.set('spendMin', spendMin);
    if (spendMax != null) qp.set('spendMax', spendMax);
    if (campaignStatus) qp.set('campaignStatus', campaignStatus);

    const { data } = await axios.get(`${API}/api/admin/brands?${qp}`, { headers: authHeader(), timeout: 8000 });

    if (data?.data?.length) return data;
    throw new Error('empty');
  } catch {
    // Fallback: serve mock data
    const filtered = applyFilters(MOCK_BRANDS, { search, status, industry, spendMin, spendMax, campaignStatus });
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const sliced = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      data: sliced,
      pagination: { page, pageSize, total, totalPages },
      kpis: computeKpis(MOCK_BRANDS),
    };
  }
}

/**
 * Fetch KPIs separately (for header strip).
 */
export async function fetchBrandKpis() {
  try {
    const { data } = await axios.get(`${API}/api/admin/brands/kpis`, { headers: authHeader(), timeout: 5000 });
    if (data) return data;
    throw new Error('empty');
  } catch {
    return computeKpis(MOCK_BRANDS);
  }
}

export const INDUSTRY_OPTIONS = [...new Set(MOCK_BRANDS.map(b => b.industry))].sort();

export { MOCK_BRANDS };
