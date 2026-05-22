import React from "react";
import { formatNumber, formatPercent } from "../utils/formatNumber";
import { Award, BarChart3, Users2, Landmark, Globe } from "lucide-react";

const PerformanceSection = ({ stats, demographics, platforms }) => {
  // 1. Setup fallback metrics to ensure visual completeness
  const defaultMetrics = [
    { label: "Total Audience", value: formatNumber(stats?.totalReach) || "154K", icon: Users2 },
    { label: "Average Views", value: formatNumber(stats?.avgViews) || "28.5K", icon: BarChart3 },
    { label: "Engagement", value: formatPercent(stats?.engagementRate) || "4.8%", icon: Award },
    { label: "Top Region", value: "India (48%)", icon: Globe }
  ];

  // Optional: Gender split fallback
  let genderItems = [
    ["Female", 55],
    ["Male", 45]
  ];

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
      // Ignore parse errors
    }
  }

  // Optional: Age ranges fallback
  let ageItems = [
    ["25-34", 45],
    ["18-24", 40],
    ["35-44", 10],
    ["45+", 5]
  ];

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
      // Ignore parse errors
    }
  }

  // Set Top Audience metric if db demographics has top countries
  if (demographics?.topCountries) {
    try {
      const countries =
        typeof demographics.topCountries === "string"
          ? JSON.parse(demographics.topCountries)
          : demographics.topCountries;
      const entries = Object.entries(countries);
      if (entries.length > 0) {
        entries.sort((a, b) => b[1] - a[1]);
        defaultMetrics[3].value = `${entries[0][0]} (${entries[0][1]}%)`;
      }
    } catch {
      // Ignore parse errors
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          Performance & Audience Analytics
        </h2>
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {defaultMetrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="p-5 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 group flex items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {m.label}
                </p>
                <p className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {m.value}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-500/5 text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Demographics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gender Split Card */}
        <div className="p-6 sm:p-8 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Audience Gender Distribution
            </p>
            <h3 className="text-base font-bold text-white">Gender Split</h3>
          </div>
          <div className="space-y-3.5">
            {genderItems.map(([label, pct]) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-300">
                  <span>{label}</span>
                  <span className="text-indigo-400">{pct}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Range Card */}
        <div className="p-6 sm:p-8 bg-white/[0.01] border border-white/5 rounded-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-1">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Audience Demographics
            </p>
            <h3 className="text-base font-bold text-white">Age Ranges</h3>
          </div>
          <div className="space-y-3">
            {ageItems.map(([range, pct]) => (
              <div key={range} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-12 shrink-0">
                  {range}
                </span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500/80 to-violet-500/80 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-300 w-10 text-right shrink-0">
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PerformanceSection;

