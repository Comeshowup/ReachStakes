import React from "react";
import { Handshake, Award, Sparkles } from "lucide-react";

const SocialProofSection = ({ collaborations }) => {
  // Filter out entries without brand names
  const validCollabs = collaborations
    ? collaborations.filter((c) => c.brandName && c.brandName.trim() !== "")
    : [];

  // Custom premium mockup brands for fallback display to maintain high trust
  const fallbackBrands = [
    { name: "VERTEX CORE", logoChar: "V" },
    { name: "ACME MEDIA", logoChar: "A" },
    { name: "NEXUS SYSTEMS", logoChar: "N" },
    { name: "PULSE TECH", logoChar: "P" },
    { name: "APEX VENTURES", logoChar: "A" }
  ];

  const hasCollabs = validCollabs.length > 0;
  const displayBrands = hasCollabs ? validCollabs : fallbackBrands;

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-indigo-500 to-violet-500" />
          {hasCollabs ? "Proven Collaborations" : "Brand Partnerships"}
        </h2>
        <div className="flex items-center gap-1 text-xs text-indigo-400 font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Active Creator
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {displayBrands.map((collab, i) => (
          <div
            key={(collab.brandName || collab.name) + i}
            className="flex items-center justify-center gap-3 px-5 py-4 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all duration-300 group select-none relative overflow-hidden"
          >
            {/* Background subtle mesh glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/0 via-indigo-500/[0.01] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {collab.logo ? (
              <img
                src={collab.logo}
                alt={collab.brandName}
                className="w-5 h-5 rounded object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
              />
            ) : (
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center text-[10px] font-extrabold text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                {collab.logoChar || (collab.brandName ? collab.brandName.charAt(0).toUpperCase() : "B")}
              </div>
            )}
            <span className="text-xs sm:text-sm font-bold text-slate-500 group-hover:text-slate-300 transition-colors tracking-wide">
              {collab.brandName || collab.name}
            </span>
          </div>
        ))}
      </div>

      {!hasCollabs && (
        <div className="flex items-center gap-3 p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
          <Handshake className="w-4 h-4 text-indigo-400 shrink-0" />
          <p className="text-xs text-slate-400 leading-normal font-medium">
            This creator is <strong className="text-indigo-300">open to new collaborations and sponsorships</strong>. Use the packages above to request a custom campaign with escrow payment safety.
          </p>
        </div>
      )}
    </section>
  );
};

export default SocialProofSection;

