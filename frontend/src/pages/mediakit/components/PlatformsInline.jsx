import React from "react";
import {
  Instagram,
  Youtube,
  Twitter,
  Globe,
  ExternalLink,
  Users,
  Eye,
  TrendingUp
} from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

const platformStyles = {
  Instagram: {
    icon: Instagram,
    bgGlow: "from-pink-500/5 to-transparent",
    border: "border-pink-500/10 hover:border-pink-500/30",
    shadow: "hover:shadow-pink-500/5",
    iconColor: "text-pink-400 bg-pink-500/10",
    textColor: "group-hover:text-pink-400",
    defaultEr: "4.8%",
    defaultReach: "25K"
  },
  YouTube: {
    icon: Youtube,
    bgGlow: "from-red-500/5 to-transparent",
    border: "border-red-500/10 hover:border-red-500/30",
    shadow: "hover:shadow-red-500/5",
    iconColor: "text-red-400 bg-red-500/10",
    textColor: "group-hover:text-red-400",
    defaultEr: "5.2%",
    defaultReach: "42K"
  },
  Twitter: {
    icon: Twitter,
    bgGlow: "from-sky-500/5 to-transparent",
    border: "border-sky-500/10 hover:border-sky-500/30",
    shadow: "hover:shadow-sky-500/5",
    iconColor: "text-sky-400 bg-sky-500/10",
    textColor: "group-hover:text-sky-400",
    defaultEr: "3.1%",
    defaultReach: "12K"
  },
  TikTok: {
    icon: Globe,
    bgGlow: "from-teal-500/5 to-transparent",
    border: "border-teal-500/10 hover:border-teal-500/30",
    shadow: "hover:shadow-teal-500/5",
    iconColor: "text-teal-400 bg-teal-500/10",
    textColor: "group-hover:text-teal-400",
    defaultEr: "7.4%",
    defaultReach: "95K"
  },
  Twitch: {
    icon: Globe,
    bgGlow: "from-purple-500/5 to-transparent",
    border: "border-purple-500/10 hover:border-purple-500/30",
    shadow: "hover:shadow-purple-500/5",
    iconColor: "text-purple-400 bg-purple-500/10",
    textColor: "group-hover:text-purple-400",
    defaultEr: "6.5%",
    defaultReach: "8K"
  }
};

const PlatformsInline = ({ platforms }) => {
  if (!platforms || platforms.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          Connected Platforms
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {platforms.map((platform) => {
          const style = platformStyles[platform.platform] || {
            icon: Globe,
            bgGlow: "from-indigo-500/5 to-transparent",
            border: "border-indigo-500/10 hover:border-indigo-500/30",
            shadow: "hover:shadow-indigo-500/5",
            iconColor: "text-indigo-400 bg-indigo-500/10",
            textColor: "group-hover:text-indigo-400",
            defaultEr: "4.5%",
            defaultReach: "15K"
          };
          const Icon = style.icon;
          const followersDisplay = formatNumber(platform.followers) || "Active";

          return (
            <a
              key={platform.platform}
              href={platform.profileUrl || platform.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative flex flex-col justify-between p-5 bg-white/[0.01] hover:bg-white/[0.03] border rounded-2xl transition-all duration-300 shadow-xl shadow-black/10 overflow-hidden ${style.border} ${style.shadow}`}
            >
              {/* Background gradient sweep */}
              <div className={`absolute inset-0 bg-gradient-to-br ${style.bgGlow} opacity-70`} />

              {/* Card Content */}
              <div className="relative z-10 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${style.iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-base font-bold text-white">
                        {platform.platform}
                      </span>
                      {platform.username && (
                        <p className="text-xs text-slate-500 font-medium">
                          @{platform.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all duration-300">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                  </div>
                </div>

                {/* Audience stats */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <Users className="w-3 h-3 text-slate-600" />
                      Followers
                    </div>
                    <p className="text-lg font-extrabold text-white">
                      {followersDisplay}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <Eye className="w-3 h-3 text-slate-600" />
                      Avg. Reach
                    </div>
                    <p className="text-lg font-extrabold text-white">
                      {style.defaultReach}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      <TrendingUp className="w-3 h-3 text-slate-600" />
                      Engagement
                    </div>
                    <p className="text-lg font-extrabold text-white">
                      {style.defaultEr}
                    </p>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default PlatformsInline;

