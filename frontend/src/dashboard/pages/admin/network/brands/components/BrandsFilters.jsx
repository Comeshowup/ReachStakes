import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { INDUSTRY_OPTIONS } from '../api/brands.api';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
];

const SPEND_RANGES = [
  { value: '', label: 'Any spend' },
  { value: '0-10000', label: '< $10K' },
  { value: '10000-50000', label: '$10K – $50K' },
  { value: '50000-100000', label: '$50K – $100K' },
  { value: '100000+', label: '$100K+' },
];

const CAMPAIGN_STATUS_OPTIONS = [
  { value: '', label: 'All campaigns' },
  { value: 'has_campaigns', label: 'Has active campaigns' },
  { value: 'no_campaigns', label: 'No campaigns' },
];

/**
 * @param {{ searchInput: string, setSearchInput: (v:string)=>void, filters: object, setFilter: (k:string,v:string)=>void, resetFilters: ()=>void, activeCount: number }} props
 */
export default function BrandsFilters({ searchInput, setSearchInput, filters, setFilter, resetFilters, activeCount }) {
  return (
    <div className="space-y-3">
      {/* Row 1: search + status tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search brands…"
            className="pl-9 pr-8 py-2 text-sm bg-zinc-900/60 border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 focus:border-indigo-500/60 transition-all w-56"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex items-center bg-zinc-900/60 border border-zinc-800 rounded-lg p-0.5 gap-0.5">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter('status', tab.value)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all ${
                filters.status === tab.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Active filter count + reset */}
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-400 bg-zinc-800/60 border border-zinc-700/50 rounded-lg hover:text-white hover:bg-zinc-700/60 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset
            <span className="bg-zinc-700 text-zinc-300 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
              {activeCount}
            </span>
          </button>
        )}
      </div>

      {/* Row 2: secondary filters */}
      <div className="flex flex-wrap items-center gap-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600 shrink-0" />

        {/* Industry */}
        <select
          value={filters.industry}
          onChange={e => setFilter('industry', e.target.value)}
          className="px-3 py-1.5 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 cursor-pointer"
        >
          <option value="">All industries</option>
          {INDUSTRY_OPTIONS.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        {/* Spend range */}
        <select
          value={filters.spendRange}
          onChange={e => setFilter('spendRange', e.target.value)}
          className="px-3 py-1.5 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 cursor-pointer"
        >
          {SPEND_RANGES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {/* Campaign status */}
        <select
          value={filters.campaignStatus}
          onChange={e => setFilter('campaignStatus', e.target.value)}
          className="px-3 py-1.5 text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg text-zinc-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/60 cursor-pointer"
        >
          {CAMPAIGN_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
