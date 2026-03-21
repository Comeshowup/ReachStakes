import React from "react";
import {
  Instagram,
  Youtube,
  Twitter,
  Globe,
  ExternalLink,
} from "lucide-react";
import { formatNumber } from "../utils/formatNumber";

const platformIcons = {
  Instagram: Instagram,
  YouTube: Youtube,
  Twitter: Twitter,
  TikTok: Globe,
  Twitch: Globe,
};

const PlatformsInline = ({ platforms }) => {
  if (!platforms || platforms.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Platforms</h2>

      <div className="flex flex-col gap-2">
        {platforms.map((platform) => {
          const Icon = platformIcons[platform.platform] || Globe;
          const followersDisplay = formatNumber(platform.followers);

          return (
            <a
              key={platform.platform}
              href={platform.profileUrl || platform.link || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/[0.07] transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                <span className="text-sm font-medium text-white">
                  {platform.platform}
                </span>
                {platform.username && (
                  <span className="text-sm text-slate-500">
                    @{platform.username}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {followersDisplay && (
                  <span className="text-sm text-slate-400 font-medium">
                    {followersDisplay} followers
                  </span>
                )}
                <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
};

export default PlatformsInline;
