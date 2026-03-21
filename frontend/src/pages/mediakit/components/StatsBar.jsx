import React from "react";
import { formatNumber, formatPercent } from "../utils/formatNumber";

const StatsBar = ({ stats, platforms }) => {
  const items = [];

  const totalReach = formatNumber(stats?.totalReach);
  if (totalReach) items.push({ label: "Total Reach", value: totalReach });

  const avgViews = formatNumber(stats?.avgViews);
  if (avgViews) items.push({ label: "Avg Views / Post", value: avgViews });

  const engagement = formatPercent(stats?.engagementRate);
  if (engagement) items.push({ label: "Engagement Rate", value: engagement });

  if (stats?.primaryPlatform) {
    items.push({ label: "Primary Platform", value: stats.primaryPlatform });
  }

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden border border-white/10">
      {items.map((item) => (
        <div key={item.label} className="px-5 py-4 bg-slate-950">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
            {item.label}
          </p>
          <p className="text-lg font-semibold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;
