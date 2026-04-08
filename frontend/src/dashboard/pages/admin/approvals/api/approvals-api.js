import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types / Constants ────────────────────────────────────────────────────────

const CREATORS = [
  { id: 'c1', name: 'Ava Martinez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ava' },
  { id: 'c2', name: 'Liam Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liam' },
  { id: 'c3', name: 'Sofia Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia' },
  { id: 'c4', name: 'Marcus Webb', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
  { id: 'c5', name: 'Yuki Tanaka', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki' },
  { id: 'c6', name: 'Elena Russo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
  { id: 'c7', name: 'Noah Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noah' },
  { id: 'c8', name: 'Priya Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
];

const CAMPAIGNS = [
  { id: 'cp1', name: 'Summer Glow 2025' },
  { id: 'cp2', name: 'Back to School Push' },
  { id: 'cp3', name: 'Wellness Reset' },
  { id: 'cp4', name: 'Tech Drop Q3' },
  { id: 'cp5', name: 'Festival Vibes' },
];

const BRANDS = [
  { id: 'b1', name: 'NovaSkin' },
  { id: 'b2', name: 'Apex Gear' },
  { id: 'b3', name: 'Lumio Labs' },
  { id: 'b4', name: 'Verdant Co.' },
  { id: 'b5', name: 'Steelcore' },
];

const FLAG_POOL = ['nsfw', 'copyright', 'brand-mismatch', 'low-quality', 'ai-risk', 'manual-escalation'];
const STATUSES = ['pending', 'pending', 'pending', 'approved', 'rejected'];
const PRIORITIES = ['high', 'high', 'medium', 'medium', 'low'];
const CONTENT_TYPES = ['image', 'image', 'image', 'video', 'video'];

const PICSUM_IDS = [10, 20, 30, 40, 48, 56, 64, 74, 82, 91, 99, 103];

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFlags() {
  const count = randInt(0, 2);
  const shuffled = [...FLAG_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
function randDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysAgo));
  d.setHours(randInt(0, 23), randInt(0, 59));
  return d.toISOString();
}

// ── Mock Data Generation ─────────────────────────────────────────────────────

let _mockCache = null;

export function generateMockApprovals() {
  if (_mockCache) return _mockCache;
  _mockCache = Array.from({ length: 50 }, (_, i) => {
    const creator = rand(CREATORS);
    const campaign = rand(CAMPAIGNS);
    const brand = rand(BRANDS);
    const contentType = rand(CONTENT_TYPES);
    const submittedAt = randDate(7);
    const riskScore = randInt(0, 100);
    const priority = riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low';
    const picId = rand(PICSUM_IDS);

    return {
      id: `ap-${String(i + 1).padStart(3, '0')}`,
      creator,
      campaign,
      brand,
      content: {
        type: contentType,
        url: contentType === 'image'
          ? `https://picsum.photos/id/${picId}/800/600`
          : `https://www.w3schools.com/html/mov_bbb.mp4`,
        caption: `Check out this amazing ${brand.name} product! Perfect for the ${campaign.name} campaign.`,
        thumbnail: `https://picsum.photos/id/${picId}/200/150`,
      },
      status: rand(STATUSES),
      riskScore,
      flags: randFlags(),
      priority,
      submittedAt,
      slaDueAt: riskScore > 70
        ? new Date(new Date(submittedAt).getTime() + 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      reviewedAt: null,
      auditLog: [
        { action: 'submitted', at: submittedAt, actor: creator.name },
      ],
    };
  });
  return _mockCache;
}

// Reset cache (for optimistic updates)
function resetCache() { _mockCache = null; }

// ── Simulated API ────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function fetchApprovals(filters = {}) {
  await delay(450);
  let items = [...generateMockApprovals()];

  // Filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      it =>
        it.creator.name.toLowerCase().includes(q) ||
        it.campaign.name.toLowerCase().includes(q) ||
        it.brand.name.toLowerCase().includes(q)
    );
  }
  if (filters.status && filters.status !== 'all') {
    items = items.filter(it => it.status === filters.status);
  }
  if (filters.priority && filters.priority !== 'all') {
    items = items.filter(it => it.priority === filters.priority);
  }
  if (filters.campaign && filters.campaign !== 'all') {
    items = items.filter(it => it.campaign.id === filters.campaign);
  }
  if (filters.brand && filters.brand !== 'all') {
    items = items.filter(it => it.brand.id === filters.brand);
  }
  if (filters.creator) {
    const q = filters.creator.toLowerCase();
    items = items.filter(it => it.creator.name.toLowerCase().includes(q));
  }
  if (filters.contentType && filters.contentType !== 'all') {
    items = items.filter(it => it.content.type === filters.contentType);
  }
  if (filters.flags && filters.flags.length > 0) {
    items = items.filter(it =>
      filters.flags.some(f => it.flags.includes(f))
    );
  }

  // Sort
  const sortBy = filters.sortBy || 'submittedAt';
  const sortDir = filters.sortDir || 'desc';
  items.sort((a, b) => {
    let va = sortBy === 'riskScore' ? a.riskScore : new Date(a.submittedAt).getTime();
    let vb = sortBy === 'riskScore' ? b.riskScore : new Date(b.submittedAt).getTime();
    return sortDir === 'desc' ? vb - va : va - vb;
  });

  // Compute KPI stats
  const all = generateMockApprovals();
  const pending = all.filter(it => it.status === 'pending');
  const now = Date.now();
  const slaBreached = pending.filter(
    it => it.slaDueAt && new Date(it.slaDueAt).getTime() < now
  );
  const highRisk = pending.filter(it => it.riskScore > 70);

  return {
    items,
    kpi: {
      pending: pending.length,
      highRisk: highRisk.length,
      slaBreached: slaBreached.length,
      avgReviewTime: '2.4h',
    },
    meta: { campaigns: CAMPAIGNS, brands: BRANDS },
  };
}

export async function approveItem(id, note = '') {
  await delay(300);
  const data = generateMockApprovals();
  const idx = data.findIndex(it => it.id === id);
  if (idx !== -1) {
    data[idx].status = 'approved';
    data[idx].reviewedAt = new Date().toISOString();
    data[idx].auditLog.push({ action: 'approved', at: new Date().toISOString(), actor: 'Admin', note });
  }
  return { success: true, id };
}

export async function rejectItem(id, reason, note = '') {
  await delay(300);
  const data = generateMockApprovals();
  const idx = data.findIndex(it => it.id === id);
  if (idx !== -1) {
    data[idx].status = 'rejected';
    data[idx].reviewedAt = new Date().toISOString();
    data[idx].auditLog.push({ action: 'rejected', at: new Date().toISOString(), actor: 'Admin', reason, note });
  }
  return { success: true, id };
}

export async function requestChanges(id, note) {
  await delay(300);
  const data = generateMockApprovals();
  const idx = data.findIndex(it => it.id === id);
  if (idx !== -1) {
    data[idx].auditLog.push({ action: 'changes_requested', at: new Date().toISOString(), actor: 'Admin', note });
  }
  return { success: true, id };
}

export async function batchAction(ids, action) {
  await delay(500);
  const data = generateMockApprovals();
  ids.forEach(id => {
    const idx = data.findIndex(it => it.id === id);
    if (idx !== -1) {
      data[idx].status = action;
      data[idx].reviewedAt = new Date().toISOString();
    }
  });
  return { success: true, count: ids.length };
}

// ── React Query Hooks ────────────────────────────────────────────────────────

export const APPROVALS_KEY = 'approvals';

export function useApprovals(filters) {
  return useQuery({
    queryKey: [APPROVALS_KEY, filters],
    queryFn: () => fetchApprovals(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

export function useApproveItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => approveItem(id, note),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            it.id === id ? { ...it, status: 'approved' } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useRejectItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason, note }) => rejectItem(id, reason, note),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            it.id === id ? { ...it, status: 'rejected' } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useRequestChanges() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }) => requestChanges(id, note),
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export function useBatchAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, action }) => batchAction(ids, action),
    onMutate: async ({ ids, action }) => {
      await queryClient.cancelQueries({ queryKey: [APPROVALS_KEY] });
      const prev = queryClient.getQueriesData({ queryKey: [APPROVALS_KEY] });
      const idSet = new Set(ids);
      queryClient.setQueriesData({ queryKey: [APPROVALS_KEY] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map(it =>
            idSet.has(it.id) ? { ...it, status: action } : it
          ),
        };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        ctx.prev.forEach(([key, val]) => queryClient.setQueryData(key, val));
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [APPROVALS_KEY] }),
  });
}

export { CAMPAIGNS, BRANDS, FLAG_POOL };
