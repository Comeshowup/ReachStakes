/**
 * CreatorFilters.jsx — Sticky header with search + multi-select filters.
 * Search: debounced via useDeferredValue in the hook.
 * Filters: platform, tier, status (multi-select popovers).
 * Actions: Export CSV, Invite Creator.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Search, X, ChevronDown, Download, UserPlus, SlidersHorizontal } from 'lucide-react';
import { PLATFORM_META, TIER_META, STATUS_META } from '../utils/creatorUtils';

// ─── Multi-select dropdown ─────────────────────────────────────────────────────
const FILTER_OPTIONS = {
  platforms: [
    { value: 'instagram', label: 'Instagram' },
    { value: 'youtube',   label: 'YouTube' },
    { value: 'tiktok',   label: 'TikTok' },
  ],
  tiers: [
    { value: 'nano',  label: 'Nano' },
    { value: 'micro', label: 'Micro' },
    { value: 'macro', label: 'Macro' },
    { value: 'elite', label: 'Elite' },
  ],
  statuses: [
    { value: 'active',   label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'flagged',  label: 'Flagged' },
  ],
};

const MultiSelectDropdown = ({ label, filterKey, selected, onToggle, onClear }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = FILTER_OPTIONS[filterKey];
  const count = selected.length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium border transition-colors ${
          count > 0
            ? 'bg-zinc-800 text-white border-zinc-600'
            : 'bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
        }`}
      >
        <span>{label}</span>
        {count > 0 && (
          <span className="bg-zinc-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1.5 left-0 z-50 min-w-[160px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/50 overflow-hidden py-1">
          {options.map(opt => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => onToggle(filterKey, opt.value)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-xs text-left transition-colors ${
                  checked ? 'text-white bg-zinc-800' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                  checked ? 'bg-zinc-200 border-zinc-200' : 'border-zinc-600'
                }`}>
                  {checked && (
                    <svg viewBox="0 0 10 10" className="w-2 h-2 text-zinc-900" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="1.5,5 4,7.5 8.5,2.5" />
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
          {count > 0 && (
            <>
              <div className="my-1 border-t border-zinc-800" />
              <button
                onClick={() => onClear(filterKey)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Filter Bar ───────────────────────────────────────────────────────────
const CreatorFilters = ({
  searchInput,
  setSearchInput,
  filters,
  toggleMultiFilter,
  setFilter,
  resetFilters,
  activeFilterCount,
  onExport,
  onInvite,
}) => {
  const handleClear = (key) => setFilter(key, []);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search creators…"
          className="w-full h-8 pl-8 pr-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-colors"
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="h-5 w-px bg-zinc-800 hidden sm:block" />

      {/* Filter dropdowns */}
      <MultiSelectDropdown
        label="Platform"
        filterKey="platforms"
        selected={filters.platforms}
        onToggle={toggleMultiFilter}
        onClear={handleClear}
      />
      <MultiSelectDropdown
        label="Tier"
        filterKey="tiers"
        selected={filters.tiers}
        onToggle={toggleMultiFilter}
        onClear={handleClear}
      />
      <MultiSelectDropdown
        label="Status"
        filterKey="statuses"
        selected={filters.statuses}
        onToggle={toggleMultiFilter}
        onClear={handleClear}
      />

      {/* Reset */}
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-xs text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-colors border border-transparent hover:border-red-900/30"
        >
          <X className="w-3 h-3" />
          Reset
        </button>
      )}

      {/* Right-side actions */}
      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-zinc-400 border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 transition-colors bg-zinc-900/40"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          onClick={onInvite}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold text-white bg-zinc-700 hover:bg-zinc-600 transition-colors border border-zinc-600"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite
        </button>
      </div>
    </div>
  );
};

export default CreatorFilters;
