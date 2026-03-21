import React from "react";
import { MapPin, Briefcase } from "lucide-react";
import ReachVerifiedBadge from "../../../dashboard/components/ReachVerifiedBadge";
import StatsBar from "./StatsBar";

const HeroSection = ({ profile, stats, platforms, onBook }) => {
  const hasLocation = profile.location && profile.location.trim() !== "";
  const hasTags = profile.niches && profile.niches.length > 0;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=256`;
  const avatarUrl = profile.avatar || fallbackAvatar;

  return (
    <section className="space-y-8">
      {/* Identity Row */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
            <img
              src={avatarUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
              loading="eager"
              onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                {profile.name}
              </h1>
              {profile.verificationTier &&
                profile.verificationTier !== "None" && (
                  <ReachVerifiedBadge
                    tier={profile.verificationTier}
                    size="md"
                  />
                )}
            </div>
            <p className="text-base text-slate-400 font-medium">
              @{profile.handle}
            </p>
          </div>

          {/* Location + Tags */}
          <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            {hasLocation && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            {hasTags &&
              profile.niches.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden sm:flex items-center gap-3 pt-1">
            <button
              onClick={onBook}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              Book Now
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} platforms={platforms} />
    </section>
  );
};

export default HeroSection;
