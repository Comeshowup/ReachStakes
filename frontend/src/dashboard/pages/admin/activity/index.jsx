import React, { useState, useEffect, useCallback } from "react";
import { Activity, Zap } from "lucide-react";
import { useActivityFilters } from "./hooks/useActivityFilters";
import { useActivityFeed } from "./hooks/useActivityFeed";
import ActivityFilters from "./components/ActivityFilters";
import ActivityFeed from "./components/ActivityFeed";
import ActivityDrawer from "./components/ActivityDrawer";

const POLL_INTERVAL = 10_000;

const ActivityPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const {
    filters,
    searchInput,
    setSearchInput,
    setFilter,
    resetFilters,
    activeCount,
  } = useActivityFilters();

  const {
    events,
    total,
    isLoading,
    isFetchingNextPage,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useActivityFeed(filters);

  // Auto-refresh polling
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => refetch(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const hasActiveFilters = activeCount > 0;

  return (
    <div className="space-y-5 max-w-[1080px]">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Activity
            </h1>
            {!isLoading && total > 0 && (
              <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded-full tabular-nums">
                {total}
              </span>
            )}
            {autoRefresh && (
              <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-zinc-500 text-sm">
            Platform-wide event log — actions, changes, and system events
          </p>
        </div>
      </div>

      {/* Filters */}
      <ActivityFilters
        filters={filters}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        setFilter={setFilter}
        resetFilters={resetFilters}
        activeCount={activeCount}
        autoRefresh={autoRefresh}
        onToggleAutoRefresh={() => setAutoRefresh((v) => !v)}
      />

      {/* Feed */}
      <div className="bg-zinc-900/40 rounded-xl border border-zinc-800/60 overflow-hidden">
        <ActivityFeed
          events={events}
          isLoading={isLoading}
          isError={isError}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onSelectEvent={handleSelectEvent}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={resetFilters}
        />
      </div>

      {/* Event detail drawer */}
      <ActivityDrawer event={selectedEvent} onClose={handleCloseDrawer} />
    </div>
  );
};

export default ActivityPage;
