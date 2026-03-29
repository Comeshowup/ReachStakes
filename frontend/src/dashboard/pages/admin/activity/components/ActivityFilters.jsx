import React from "react";
import { Search, X, RefreshCw, SlidersHorizontal } from "lucide-react";
import {
  EVENT_TYPE_OPTIONS,
  ENTITY_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TIME_RANGE_OPTIONS,
} from "../utils/activityHelpers";

const SelectFilter = ({ value, onChange, options, label }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        h-9 pl-3 pr-8 rounded-lg text-xs font-medium border transition-colors appearance-none cursor-pointer
        bg-zinc-900 border-zinc-800 text-zinc-300
        hover:border-zinc-700 hover:bg-zinc-800/80
        focus:outline-none focus:border-zinc-600
        ${value ? "border-zinc-600 text-white bg-zinc-800" : ""}
      `}
      aria-label={label}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-zinc-900">
          {opt.label}
        </option>
      ))}
    </select>
    {/* custom chevron */}
    <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
      <svg className="w-3 h-3 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const ActivityFilters = ({
  filters,
  searchInput,
  setSearchInput,
  setFilter,
  resetFilters,
  activeCount,
  autoRefresh,
  onToggleAutoRefresh,
}) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search events, actors, entities…"
          className="
            w-full h-9 pl-9 pr-9 rounded-lg text-xs border
            bg-zinc-900 border-zinc-800 text-zinc-200 placeholder-zinc-600
            hover:border-zinc-700 focus:outline-none focus:border-zinc-600
            transition-colors
          "
        />
        {searchInput && (
          <button
            onClick={() => setSearchInput("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        <SelectFilter
          label="Filter by type"
          value={filters.type}
          onChange={(v) => setFilter("type", v)}
          options={EVENT_TYPE_OPTIONS}
        />
        <SelectFilter
          label="Filter by status"
          value={filters.status}
          onChange={(v) => setFilter("status", v)}
          options={STATUS_OPTIONS}
        />
        <SelectFilter
          label="Filter by entity"
          value={filters.entityType}
          onChange={(v) => setFilter("entityType", v)}
          options={ENTITY_TYPE_OPTIONS}
        />
        <SelectFilter
          label="Time range"
          value={filters.timeRange}
          onChange={(v) => setFilter("timeRange", v)}
          options={TIME_RANGE_OPTIONS}
        />

        {/* Clear all */}
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="h-9 px-3 rounded-lg text-xs font-medium text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-600 bg-zinc-900 hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
          >
            <X className="w-3 h-3" />
            Clear
            <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full ml-0.5">
              {activeCount}
            </span>
          </button>
        )}

        {/* Auto-refresh toggle */}
        <button
          onClick={onToggleAutoRefresh}
          title={autoRefresh ? "Auto-refresh ON (10s)" : "Enable auto-refresh"}
          className={`
            h-9 w-9 rounded-lg border flex items-center justify-center transition-all
            ${autoRefresh
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
            }
          `}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin [animation-duration:3s]" : ""}`} />
        </button>
      </div>
    </div>
  );
};

export default ActivityFilters;
