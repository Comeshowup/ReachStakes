import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApprovalsStore, selectActiveFilterCount } from '../store/approvals-store';
import { CAMPAIGNS, BRANDS, FLAG_POOL } from '../api/approvals-api';

function FilterSection({ title, children }) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{title}</p>
      {children}
    </div>
  );
}

function FilterChip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-md text-xs font-medium transition-all border',
        active
          ? 'bg-violet-500/20 text-violet-300 border-violet-500/30'
          : 'bg-white/[0.03] text-slate-400 border-white/[0.06] hover:border-white/10 hover:text-slate-300'
      )}
    >
      {children}
    </button>
  );
}

function SelectFilter({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-violet-500/40 appearance-none cursor-pointer"
    >
      <option value="all">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.name}</option>
      ))}
    </select>
  );
}

const FLAG_LABELS = {
  nsfw: 'NSFW',
  copyright: 'Copyright',
  'brand-mismatch': 'Brand Mismatch',
  'low-quality': 'Low Quality',
  'ai-risk': 'AI Risk',
  'manual-escalation': 'Escalated',
};

/**
 * FiltersSidebar — left panel filter controls backed by Zustand.
 */
export default function FiltersSidebar({ className }) {
  const filters = useApprovalsStore(s => s.filters);
  const setFilter = useApprovalsStore(s => s.setFilter);
  const resetFilters = useApprovalsStore(s => s.resetFilters);
  const activeCount = useApprovalsStore(selectActiveFilterCount);

  const toggleFlag = (flag) => {
    const cur = filters.flags;
    setFilter('flags', cur.includes(flag) ? cur.filter(f => f !== flag) : [...cur, flag]);
  };

  return (
    <aside className={cn('flex flex-col gap-5 h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filters</span>
          {activeCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Search creator, campaign..."
          value={filters.search}
          onChange={e => setFilter('search', e.target.value)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40"
        />
        {filters.search && (
          <button
            onClick={() => setFilter('search', '')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Status */}
      <FilterSection title="Status">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'pending', 'approved', 'rejected'].map(s => (
            <FilterChip key={s} active={filters.status === s} onClick={() => setFilter('status', s)}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </FilterChip>
          ))}
        </div>
      </FilterSection>

      {/* Priority */}
      <FilterSection title="Priority">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'high', 'medium', 'low'].map(p => (
            <FilterChip key={p} active={filters.priority === p} onClick={() => setFilter('priority', p)}>
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </FilterChip>
          ))}
        </div>
      </FilterSection>

      {/* Campaign */}
      <FilterSection title="Campaign">
        <SelectFilter
          value={filters.campaign}
          onChange={v => setFilter('campaign', v)}
          options={CAMPAIGNS}
          placeholder="All campaigns"
        />
      </FilterSection>

      {/* Brand */}
      <FilterSection title="Brand">
        <SelectFilter
          value={filters.brand}
          onChange={v => setFilter('brand', v)}
          options={BRANDS}
          placeholder="All brands"
        />
      </FilterSection>

      {/* Content Type */}
      <FilterSection title="Content Type">
        <div className="flex gap-1.5">
          {['all', 'image', 'video'].map(t => (
            <FilterChip key={t} active={filters.contentType === t} onClick={() => setFilter('contentType', t)}>
              {t === 'all' ? 'All' : t.charAt(0).toUpperCase() + t.slice(1)}
            </FilterChip>
          ))}
        </div>
      </FilterSection>

      {/* Flags */}
      <FilterSection title="Flags">
        <div className="flex flex-wrap gap-1.5">
          {FLAG_POOL.map(flag => (
            <FilterChip
              key={flag}
              active={filters.flags.includes(flag)}
              onClick={() => toggleFlag(flag)}
            >
              {FLAG_LABELS[flag]}
            </FilterChip>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}
