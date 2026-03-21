import React from "react";
import { formatNumber, formatPercent } from "../utils/formatNumber";

const PerformanceSection = ({ stats, demographics, platforms }) => {
  // Build metrics list — only include non-empty values
  const metrics = [];

  const followers = formatNumber(stats?.totalReach);
  if (followers) metrics.push({ label: "Total Followers", value: followers });

  const avgViews = formatNumber(stats?.avgViews);
  if (avgViews) metrics.push({ label: "Avg Views", value: avgViews });

  const engagement = formatPercent(stats?.engagementRate);
  if (engagement)
    metrics.push({ label: "Engagement Rate", value: engagement });

  // Top audience location from demographics
  if (demographics?.topCountries) {
    try {
      const countries =
        typeof demographics.topCountries === "string"
          ? JSON.parse(demographics.topCountries)
          : demographics.topCountries;
      const entries = Object.entries(countries);
      if (entries.length > 0) {
        // Sort by value descending, take top
        entries.sort((a, b) => b[1] - a[1]);
        metrics.push({
          label: "Top Audience",
          value: `${entries[0][0]} (${entries[0][1]}%)`,
        });
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Hide entire section if nothing to show
  if (metrics.length === 0) return null;

  // Optional: Gender split
  let genderItems = null;
  if (demographics?.genderSplit) {
    try {
      const gender =
        typeof demographics.genderSplit === "string"
          ? JSON.parse(demographics.genderSplit)
          : demographics.genderSplit;
      const entries = Object.entries(gender);
      if (entries.length > 0) {
        genderItems = entries;
      }
    } catch {
      // Ignore
    }
  }

  // Optional: Age ranges
  let ageItems = null;
  if (demographics?.ageRanges) {
    try {
      const ages =
        typeof demographics.ageRanges === "string"
          ? JSON.parse(demographics.ageRanges)
          : demographics.ageRanges;
      const entries = Object.entries(ages);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        ageItems = entries;
      }
    } catch {
      // Ignore
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-semibold text-white">
        Performance & Audience
      </h2>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="p-4 bg-white/5 border border-white/10 rounded-xl"
          >
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
              {m.label}
            </p>
            <p className="text-xl font-semibold text-white">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Optional demographics row */}
      {(genderItems || ageItems) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {genderItems && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">
                Gender Split
              </p>
              <div className="space-y-2">
                {genderItems.map(([label, pct]) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-24 text-right">
                      {label} {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ageItems && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-3">
                Age Range
              </p>
              <div className="space-y-2">
                {ageItems.map(([range, pct]) => (
                  <div key={range} className="flex items-center gap-3">
                    <span className="text-sm text-slate-400 w-14">
                      {range}
                    </span>
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500/70 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-slate-300 w-10 text-right">
                      {pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PerformanceSection;
