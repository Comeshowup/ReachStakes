import React, { useState } from "react";

const TRUNCATE_LENGTH = 200;

const AboutSection = ({ bio, niches }) => {
  const [expanded, setExpanded] = useState(false);

  const hasBio = bio && bio.trim() !== "";
  const hasTags = niches && niches.length > 0;

  // Hide entire section if there's nothing to show
  if (!hasBio && !hasTags) return null;

  const isLongBio = hasBio && bio.length > TRUNCATE_LENGTH;
  const displayBio =
    hasBio && !expanded && isLongBio
      ? bio.slice(0, TRUNCATE_LENGTH).trim() + "…"
      : bio;

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-white">About</h2>

      {hasBio && (
        <div>
          <p className="text-base text-slate-300 leading-relaxed">
            {displayBio}
          </p>
          {isLongBio && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {expanded ? "Show less" : "Read more"}
            </button>
          )}
        </div>
      )}

      {hasTags && (
        <div className="flex flex-wrap gap-2">
          {niches.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </section>
  );
};

export default AboutSection;
