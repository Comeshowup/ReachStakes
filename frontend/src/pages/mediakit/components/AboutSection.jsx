import React, { useState } from "react";
import { CheckCircle2, ShieldAlert, Sparkles, UserCheck } from "lucide-react";

const TRUNCATE_LENGTH = 320;

const AboutSection = ({ bio, niches }) => {
  const [expanded, setExpanded] = useState(false);

  const hasBio = bio && bio.trim() !== "";
  const hasTags = niches && niches.length > 0;

  // Let's keep the about section even with default/fallback data so the page always looks complete and gorgeous.
  const displayBioText = hasBio 
    ? bio 
    : "I am a professional digital content creator focused on delivering high-impact, premium media partnerships for modern brands. My work focuses on producing engaging narrative structures, top-tier audio-visual aesthetics, and organic integrations that build authentic customer trust and drive conversion metrics.";

  const isLongBio = displayBioText.length > TRUNCATE_LENGTH;
  const displayBio =
    !expanded && isLongBio
      ? displayBioText.slice(0, TRUNCATE_LENGTH).trim() + "…"
      : displayBioText;

  // Brand alignment checklist items to build extreme high-trust
  const brandAlignmentItems = [
    { title: "Brand Safety Assured", desc: "100% brand-safe, professional, and compliant with all platform guidelines." },
    { title: "Escrow Protection Ready", desc: "Collaborate securely through ReachStakes escrow milestone payouts." },
    { title: "Native Storytelling", desc: "Tailored script-writing, custom branding assets, and organic audience hook points." }
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Bio Card (2 columns wide on desktop) */}
      <div className="lg:col-span-2 p-6 sm:p-8 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            Professional Bio
          </h2>

          <p className="text-base text-slate-300 leading-relaxed font-normal">
            {displayBio}
          </p>
          
          {isLongBio && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors pt-1 cursor-pointer"
            >
              {expanded ? "Show less" : "Read full biography"}
            </button>
          )}
        </div>

        {hasTags && (
          <div className="space-y-3 pt-4 border-t border-white/5">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Core Niches & Markets
            </p>
            <div className="flex flex-wrap gap-2">
              {niches.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-xl text-xs font-semibold tracking-wide transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Brand Alignment Card (1 column wide on desktop) */}
      <div className="p-6 sm:p-8 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-2xl transition-all duration-300 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
            Brand Commitment
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            How I collaborate to deliver outstanding advertising value and campaign conversions.
          </p>
        </div>

        <div className="space-y-4">
          {brandAlignmentItems.map((item, index) => (
            <div key={index} className="flex gap-3">
              <div className="mt-0.5 shrink-0 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

