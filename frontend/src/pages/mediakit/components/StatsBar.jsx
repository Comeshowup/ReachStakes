import React from "react";
import { formatNumber, formatPercent } from "../utils/formatNumber";
import { Users, Eye, TrendingUp, Clock, Shield } from "lucide-react";

const StatsBar = ({ stats, platforms }) => {
  const items = [];

  const totalReach = formatNumber(stats?.totalReach);
  if (totalReach) {
    items.push({
      label: "Total Reach",
      value: totalReach,
      icon: Users,
      color: "text-indigo-400 bg-indigo-500/10",
      desc: "Combined platform audience"
    });
  }

  const avgViews = formatNumber(stats?.avgViews);
  if (avgViews) {
    items.push({
      label: "Avg Views",
      value: avgViews,
      icon: Eye,
      color: "text-violet-400 bg-violet-500/10",
      desc: "Average views per publication"
    });
  }

  const engagement = formatPercent(stats?.engagementRate);
  if (engagement) {
    items.push({
      label: "Engagement",
      value: engagement,
      icon: TrendingUp,
      color: "text-emerald-400 bg-emerald-500/10",
      desc: "Active community response"
    });
  }

  // Adding premium trust stats
  items.push({
    label: "Response Time",
    value: "< 24 Hours",
    icon: Clock,
    color: "text-amber-400 bg-amber-500/10",
    desc: "Average brand response window"
  });

  items.push({
    label: "Secured Booking",
    value: "100% Escrow",
    icon: Shield,
    color: "text-cyan-400 bg-cyan-500/10",
    desc: "Payments protected by ReachStakes"
  });

  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="group relative p-5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 shadow-xl shadow-black/10 overflow-hidden flex flex-col justify-between"
          >
            {/* Ambient hover glow effect */}
            <div className="absolute -right-4 -top-4 w-12 h-12 rounded-full bg-indigo-500/5 group-hover:bg-indigo-500/10 blur-xl transition-all duration-500" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-white tracking-tight">
                  {item.value}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium leading-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {item.desc}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsBar;

