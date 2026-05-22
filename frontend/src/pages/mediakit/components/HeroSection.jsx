import React from "react";
import { MapPin, Briefcase, Share2, Sparkles, CheckCircle2, ShieldCheck, Crown } from "lucide-react";
import ReachVerifiedBadge from "../../../dashboard/components/ReachVerifiedBadge";
import StatsBar from "./StatsBar";

const HeroSection = ({ profile, stats, platforms, onBook }) => {
  const hasLocation = profile.location && profile.location.trim() !== "";
  const hasTags = profile.niches && profile.niches.length > 0;

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=6366f1&color=fff&size=256`;
  const avatarUrl = profile.avatar || fallbackAvatar;

  // Visual Verification Display
  const getVerificationTierStyle = (tier) => {
    if (tier === "Silver") return "from-slate-400 to-slate-200 text-slate-900 border-slate-300/30";
    if (tier === "Gold") return "from-amber-400 to-yellow-200 text-amber-950 border-amber-400/30 shadow-yellow-500/10";
    if (tier === "Black") return "from-zinc-900 via-zinc-800 to-zinc-700 text-zinc-100 border-zinc-600/30";
    return "";
  };

  return (
    <section className="relative w-full space-y-6">
      {/* 1. Cover/Banner Area */}
      <div className="relative h-44 sm:h-56 w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/5">
        {/* Abstract Premium Fintech Ambient Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-indigo-950/30 to-violet-950/20" />
        
        {/* Subtle decorative glowing mesh overlay */}
        <div className="absolute top-[-50%] left-[-20%] w-[140%] h-[200%] opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0,transparent_55%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        {/* Visual Brand Tag */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/5 text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
          ReachStakes Verified Creator
        </div>
      </div>

      {/* 2. Identity & Stats Grid Layout */}
      <div className="px-1 sm:px-6 -mt-16 sm:-mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-white/5">
          
          {/* Avatar + Info Block */}
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 text-center md:text-left">
            {/* Overlapping Avatar */}
            <div className="relative shrink-0 select-none group">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-950 ring-4 ring-slate-950 border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-[1.02]">
                <img
                  src={avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackAvatar; }}
                />
              </div>
            </div>

            {/* Title / Description info */}
            <div className="space-y-2 md:mb-1">
              <div className="flex flex-col sm:flex-row items-center gap-2.5 justify-center md:justify-start flex-wrap">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                  {profile.name}
                </h1>
                
                {profile.verificationTier && profile.verificationTier !== "None" && (
                  <ReachVerifiedBadge
                    tier={profile.verificationTier}
                    size="md"
                    className="shadow-lg"
                  />
                )}
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1.5 text-slate-400 font-medium">
                <span className="text-indigo-400/90 font-semibold text-sm">
                  @{profile.handle}
                </span>
                
                {hasLocation && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 border border-white/5 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.location}
                  </span>
                )}
              </div>

              {/* Tags/Niches */}
              {hasTags && (
                <div className="flex flex-wrap items-center gap-1.5 justify-center md:justify-start pt-1">
                  {profile.niches.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-0.5 bg-indigo-500/5 text-indigo-300 border border-indigo-500/20 rounded-md text-xs font-semibold tracking-wide hover:bg-indigo-500/10 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 pt-2 sm:pt-0">
            <button
              onClick={onBook}
              className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 transition-all duration-300"
            >
              <Briefcase className="w-4 h-4" />
              Book Creator
            </button>
          </div>
        </div>

        {/* 3. Stats Strip */}
        <div className="mt-8">
          <StatsBar stats={stats} platforms={platforms} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

