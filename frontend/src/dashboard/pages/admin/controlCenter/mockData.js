/**
 * mockData.js — Realistic dummy data for the Admin Control Center.
 * All data shapes mirror the expected API response schema.
 * Components use this as fallback when the API is unavailable.
 */

const now = Date.now();
const h = (n) => now - n * 3600_000;
const m = (n) => now - n * 60_000;

// ─── 1. Attention Required ──────────────────────────────────────────────────
// severity: 'critical' | 'time_sensitive' | 'operational'
export const MOCK_ATTENTION_ITEMS = [
  {
    id: 'att-1',
    severity: 'critical',
    title: 'Payment dispute · Nike Summer Campaign',
    context: '$4,200 in escrow · Brand filed',
    slaDeadline: h(2),          // 2 hours ago → overdue
    cta: 'Resolve',
    ctaPath: '/admin/finance/disputes',
    secondaryPath: '/admin/finance/disputes?id=att-1',
  },
  {
    id: 'att-2',
    severity: 'critical',
    title: 'Failed payout · Emma Wilson',
    context: '$1,800 · Bank rejected transfer',
    slaDeadline: m(60),          // 60 min from now
    cta: 'Retry',
    ctaPath: '/admin/finance/payouts',
    secondaryPath: '/admin/finance/payouts?id=att-2',
  },
  {
    id: 'att-3',
    severity: 'time_sensitive',
    title: 'Deliverable deadline · H&M Fall Campaign',
    context: '3 pending deliverables · 14 creators',
    slaDeadline: now + 18 * 3600_000,  // 18 h from now
    cta: 'Review',
    ctaPath: '/admin/campaigns/deliverables',
    secondaryPath: '/admin/campaigns?id=att-3',
  },
  {
    id: 'att-4',
    severity: 'time_sensitive',
    title: 'Payout release overdue · Jake Torres',
    context: '$950 · Milestone approved 4d ago',
    slaDeadline: now + 4 * 3600_000,
    cta: 'Release',
    ctaPath: '/admin/finance/payouts',
    secondaryPath: '/admin/finance/payouts?id=att-4',
  },
  {
    id: 'att-5',
    severity: 'time_sensitive',
    title: 'Contract unsigned · Adidas Collab',
    context: 'Brand · Expires in 6h',
    slaDeadline: now + 6 * 3600_000,
    cta: 'Follow Up',
    ctaPath: '/admin/campaigns',
    secondaryPath: '/admin/campaigns?id=att-5',
  },
  {
    id: 'att-6',
    severity: 'operational',
    title: 'Adidas Collab · Campaign approval pending',
    context: '14 creators submitted deliverables',
    slaDeadline: now + 48 * 3600_000,
    cta: 'Review',
    ctaPath: '/admin/campaigns/approvals',
    secondaryPath: '/admin/campaigns?id=att-6',
  },
  {
    id: 'att-7',
    severity: 'operational',
    title: 'New creator application · Maria Reyes',
    context: 'Fashion · 128K followers',
    slaDeadline: now + 72 * 3600_000,
    cta: 'Vet',
    ctaPath: '/admin/network/creators',
    secondaryPath: '/admin/network/creators?id=att-7',
  },
];

// ─── 2. System Health ────────────────────────────────────────────────────────
export const MOCK_SYSTEM_HEALTH = {
  paymentSuccessRate: { value: 96.4, prev: 98.1, unit: '%', status: 'warning' },
  escrowLocked:      { value: 284_200, prev: 241_000, unit: '$', status: 'healthy' },
  disputeRate:       { value: 2.8, prev: 1.4, unit: '%', status: 'critical' },
  avgApprovalHrs:    { value: 11.2, prev: 9.8, unit: 'h', status: 'warning' },
};

// ─── 3. Financial Snapshot ──────────────────────────────────────────────────
export const MOCK_FINANCIAL = {
  totalEscrow:    284_200,
  released7d:    48_750,
  pendingPayouts: 31_400,
  atRiskFunds:    12_600,
};

// ─── 4. Operations Pipeline ─────────────────────────────────────────────────
export const MOCK_PIPELINE = [
  { id: 'del', label: 'Deliverables Pending Review', count: 27, path: '/admin/campaigns/deliverables', slaBreached: true },
  { id: 'app', label: 'Approvals Pending',           count: 11, path: '/admin/campaigns/approvals',    slaBreached: false },
  { id: 'pay', label: 'Payouts Pending Release',     count: 8,  path: '/admin/finance/payouts',         slaBreached: false },
];

// ─── 5. Insights & Alerts ────────────────────────────────────────────────────
export const MOCK_INSIGHTS = [
  {
    id: 'ins-1',
    severity: 'critical',
    message: 'Dispute rate doubled today — 2.8% vs 1.4% yesterday',
    deltaLabel: '+100% vs yesterday',
    action: 'View disputes',
    actionPath: '/admin/finance/disputes',
  },
  {
    id: 'ins-2',
    severity: 'warning',
    message: 'Campaign success rate dropped 12% week-over-week',
    deltaLabel: '-12% WoW',
    action: 'View campaigns',
    actionPath: '/admin/campaigns',
  },
  {
    id: 'ins-3',
    severity: 'warning',
    message: 'Creator response rate below SLA for 3 active campaigns',
    deltaLabel: '3 campaigns flagged',
    action: 'Review',
    actionPath: '/admin/campaigns?filter=lowResponse',
  },
  {
    id: 'ins-4',
    severity: 'info',
    message: 'Payment success rate fell 1.7pp in the last 24h',
    deltaLabel: '96.4% vs 98.1%',
    action: 'View transactions',
    actionPath: '/admin/finance/transactions',
  },
  {
    id: 'ins-5',
    severity: 'healthy',
    message: 'Escrow volume up 18% month-over-month — $284K locked',
    deltaLabel: '+18% MoM',
    action: null,
    actionPath: null,
  },
];

// ─── 6. Live Activity Feed ───────────────────────────────────────────────────
export const MOCK_ACTIVITY = [
  { id: 'ev-1', timestamp: m(3),   actor: 'System',       actorType: 'system',  eventType: 'payment_released', description: 'Released $1,200 to @sara_creates · Zara Campaign' },
  { id: 'ev-2', timestamp: m(8),   actor: 'Admin',        actorType: 'admin',   eventType: 'dispute_opened',   description: 'Dispute opened · Nike Summer · $4,200 in escrow' },
  { id: 'ev-3', timestamp: m(15),  actor: 'Brand (Nike)', actorType: 'brand',   eventType: 'campaign_created', description: 'New campaign created · "Winter Drop 2026" · $18,000 budget' },
  { id: 'ev-4', timestamp: m(24),  actor: 'System',       actorType: 'system',  eventType: 'payout_failed',    description: 'Payout failed · Emma Wilson · Bank rejected' },
  { id: 'ev-5', timestamp: m(40),  actor: 'Maria Reyes',  actorType: 'creator', eventType: 'creator_joined',   description: 'New creator applied · Fashion · 128K followers' },
  { id: 'ev-6', timestamp: m(55),  actor: 'Admin',        actorType: 'admin',   eventType: 'approval_granted', description: 'Approved deliverable · H&M Fall · @jordan_style' },
  { id: 'ev-7', timestamp: h(1.5), actor: 'System',       actorType: 'system',  eventType: 'escrow_locked',    description: 'Escrow funded · Adidas Collab · $22,000 locked' },
  { id: 'ev-8', timestamp: h(2.2), actor: 'Brand (H&M)',  actorType: 'brand',   eventType: 'campaign_created', description: 'Campaign updated · "H&M Fall" · deadline extended 48h' },
  { id: 'ev-9', timestamp: h(3),   actor: 'System',       actorType: 'system',  eventType: 'payment_released', description: 'Released $3,500 to @mike_vids · Pepsi Campaign' },
  { id: 'ev-10', timestamp: h(4),  actor: 'Jake Torres',  actorType: 'creator', eventType: 'deliverable_submitted', description: 'Deliverable submitted · Nike Summer · video 2/2' },
];

// ─── Command Bar Actions ─────────────────────────────────────────────────────
export const COMMAND_BAR_ACTIONS = [
  // Navigate
  { id: 'nav-1', group: 'Navigate',      label: 'Go to Dashboard',          icon: 'LayoutGrid',  path: '/admin' },
  { id: 'nav-2', group: 'Navigate',      label: 'Go to Campaigns',          icon: 'Target',      path: '/admin/campaigns' },
  { id: 'nav-3', group: 'Navigate',      label: 'Go to Finance · Disputes', icon: 'AlertOctagon',path: '/admin/finance/disputes' },
  { id: 'nav-4', group: 'Navigate',      label: 'Go to Finance · Payouts',  icon: 'Banknote',    path: '/admin/finance/payouts' },
  { id: 'nav-5', group: 'Navigate',      label: 'Go to Creators',           icon: 'Users',       path: '/admin/network/creators' },
  { id: 'nav-6', group: 'Navigate',      label: 'Go to Approvals',          icon: 'CheckCircle', path: '/admin/campaigns/approvals' },
  { id: 'nav-7', group: 'Navigate',      label: 'Go to Audit Logs',         icon: 'ScrollText',  path: '/admin/system/audit-logs' },
  // Quick Actions
  { id: 'qa-1',  group: 'Quick Actions', label: 'Release all pending payouts', icon: 'Zap',      action: 'release_all' },
  { id: 'qa-2',  group: 'Quick Actions', label: 'Approve all deliverables',    icon: 'CheckSquare', action: 'approve_all' },
  { id: 'qa-3',  group: 'Quick Actions', label: 'View escalated disputes',     icon: 'AlertTriangle', path: '/admin/finance/disputes?filter=escalated' },
];
