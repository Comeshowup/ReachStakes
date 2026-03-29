import React from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, SlidersHorizontal } from "lucide-react";

const ActivityEmpty = ({ hasActiveFilters = false, onClearFilters }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center mb-5">
        {hasActiveFilters ? (
          <SlidersHorizontal className="w-6 h-6 text-zinc-500" />
        ) : (
          <Inbox className="w-6 h-6 text-zinc-500" />
        )}
      </div>

      <p className="text-sm font-semibold text-zinc-300 mb-1.5">
        {hasActiveFilters ? "No matching events" : "No activity yet"}
      </p>
      <p className="text-xs text-zinc-600 max-w-xs leading-relaxed">
        {hasActiveFilters
          ? "Try adjusting your filters or search query to find what you're looking for."
          : "Platform events will appear here as campaigns, payouts, and user actions occur."}
      </p>

      <div className="mt-6 flex items-center gap-3">
        {hasActiveFilters ? (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700"
          >
            Clear filters
          </button>
        ) : (
          <button
            onClick={() => navigate("/admin/campaigns")}
            className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors border border-zinc-700"
          >
            Go to Campaigns
          </button>
        )}
      </div>
    </div>
  );
};

export default ActivityEmpty;
