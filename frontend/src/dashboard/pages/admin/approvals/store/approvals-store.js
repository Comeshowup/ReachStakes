import { create } from 'zustand';

/**
 * Approvals UI Store (Zustand)
 * Manages all client-side UI state for the campaign-scoped approvals section.
 */
export const useApprovalsStore = create((set, get) => ({
  // ── Filter State ────────────────────────────────────────────────────────────
  filters: {
    search: '',
    status: 'all',       // 'all' | 'pending' | 'approved' | 'rejected'
    contentType: 'all',  // 'all' | 'image' | 'video'
    flags: [],           // string[]
    sortBy: 'submittedAt',  // 'submittedAt' | 'riskScore'
    sortDir: 'desc',
  },

  // ── Selection State ──────────────────────────────────────────────────────────
  selectedApprovalId: null,
  selectedRows: new Set(),

  // ── Actions ─────────────────────────────────────────────────────────────────
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  resetFilters: () =>
    set({
      filters: {
        search: '',
        status: 'all',
        contentType: 'all',
        flags: [],
        sortBy: 'submittedAt',
        sortDir: 'desc',
      },
    }),

  setSelectedApprovalId: (id) => set({ selectedApprovalId: id }),

  toggleRow: (id) =>
    set((state) => {
      const next = new Set(state.selectedRows);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedRows: next };
    }),

  selectAllRows: (ids) => set({ selectedRows: new Set(ids) }),

  clearSelectedRows: () => set({ selectedRows: new Set() }),

  // Toggle sort — if same field, flip direction; else set new field asc
  toggleSort: (field) =>
    set((state) => ({
      filters: {
        ...state.filters,
        sortBy: field,
        sortDir:
          state.filters.sortBy === field && state.filters.sortDir === 'desc'
            ? 'asc'
            : 'desc',
      },
    })),
}));

// ── Derived selectors ────────────────────────────────────────────────────────

export const selectActiveFilterCount = (state) => {
  const f = state.filters;
  let count = 0;
  if (f.search) count++;
  if (f.status !== 'all') count++;
  if (f.contentType !== 'all') count++;
  if (f.flags.length) count += f.flags.length;
  return count;
};
