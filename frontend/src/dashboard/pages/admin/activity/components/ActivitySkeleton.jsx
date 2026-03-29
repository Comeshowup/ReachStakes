import React from "react";

const shimmer =
  "animate-pulse bg-zinc-800/60 rounded";

const Row = () => (
  <div className="flex items-start gap-3 px-5 py-4 border-b border-zinc-900/60">
    {/* Icon */}
    <div className={`${shimmer} w-9 h-9 rounded-lg shrink-0`} />
    {/* Content */}
    <div className="flex-1 min-w-0 space-y-2">
      <div className="flex items-center justify-between gap-4">
        <div className={`${shimmer} h-3.5 w-48`} />
        <div className={`${shimmer} h-3 w-16`} />
      </div>
      <div className="flex items-center gap-2">
        <div className={`${shimmer} h-3 w-24`} />
        <div className={`${shimmer} h-3 w-20`} />
      </div>
    </div>
  </div>
);

const ActivitySkeleton = ({ count = 8 }) => (
  <div className="divide-y divide-zinc-900/60">
    {Array.from({ length: count }).map((_, i) => (
      <Row key={i} />
    ))}
  </div>
);

export default ActivitySkeleton;
