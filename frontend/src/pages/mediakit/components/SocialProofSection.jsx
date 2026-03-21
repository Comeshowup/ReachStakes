import React from "react";

const SocialProofSection = ({ collaborations }) => {
  // Hide entirely if no brand collaborations
  if (!collaborations || collaborations.length === 0) return null;

  // Filter out entries without brand names
  const validCollabs = collaborations.filter(
    (c) => c.brandName && c.brandName.trim() !== ""
  );
  if (validCollabs.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Worked With</h2>

      <div className="flex flex-wrap gap-3">
        {validCollabs.map((collab, i) => (
          <div
            key={collab.brandName + i}
            className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl"
          >
            {collab.logo ? (
              <img
                src={collab.logo}
                alt={collab.brandName}
                className="w-6 h-6 rounded object-contain"
              />
            ) : (
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs font-bold text-slate-400">
                {collab.brandName.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-slate-300">
              {collab.brandName}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SocialProofSection;
