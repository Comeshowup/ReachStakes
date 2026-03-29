import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ActivityItem from "./ActivityItem";
import ActivitySkeleton from "./ActivitySkeleton";
import ActivityEmpty from "./ActivityEmpty";
import { getDateGroupLabel } from "../utils/activityHelpers";
import { Loader2 } from "lucide-react";

const DateDivider = ({ label }) => (
  <div className="flex items-center gap-3 px-5 py-2.5 sticky top-0 z-10 bg-zinc-950/80 backdrop-blur-sm">
    <div className="h-px flex-1 bg-zinc-800/60" />
    <span className="text-[11px] font-semibold text-zinc-600 uppercase tracking-wide whitespace-nowrap">
      {label}
    </span>
    <div className="h-px flex-1 bg-zinc-800/60" />
  </div>
);

const groupEventsByDate = (events) => {
  const groups = [];
  let currentLabel = null;

  for (const event of events) {
    const label = getDateGroupLabel(event.createdAt);
    if (label !== currentLabel) {
      groups.push({ type: "divider", label, id: `divider-${label}` });
      currentLabel = label;
    }
    groups.push({ type: "event", event, id: event.id });
  }

  return groups;
};

const ActivityFeed = ({
  events,
  isLoading,
  isError,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onSelectEvent,
  hasActiveFilters,
  onClearFilters,
}) => {
  const sentinelRef = useRef(null);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <ActivitySkeleton count={10} />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-6">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
          <span className="text-lg">⚠</span>
        </div>
        <p className="text-sm font-medium text-zinc-300 mb-1">Failed to load activity</p>
        <p className="text-xs text-zinc-600">Check your connection and try again.</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <ActivityEmpty
        hasActiveFilters={hasActiveFilters}
        onClearFilters={onClearFilters}
      />
    );
  }

  const grouped = groupEventsByDate(events);

  return (
    <div>
      <AnimatePresence mode="popLayout">
        {grouped.map((item) =>
          item.type === "divider" ? (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DateDivider label={item.label} />
            </motion.div>
          ) : (
            <ActivityItem
              key={item.id}
              event={item.event}
              onClick={onSelectEvent}
            />
          )
        )}
      </AnimatePresence>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-4 flex justify-center">
        {isFetchingNextPage && (
          <Loader2 className="w-4 h-4 text-zinc-600 animate-spin" />
        )}
        {!hasNextPage && events.length > 0 && (
          <p className="text-[11px] text-zinc-700">All events loaded</p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
