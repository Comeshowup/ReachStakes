import React from 'react';

/** Animated skeleton row matching the table columns. */
function SkeletonCell({ className = '' }) {
  return (
    <td className="py-3 px-4">
      <div className={`h-4 bg-zinc-800 rounded-md animate-pulse ${className}`} />
    </td>
  );
}

function SkeletonRow({ idx }) {
  return (
    <tr className="border-b border-zinc-800/60" style={{ opacity: 1 - idx * 0.08 }}>
      {/* Brand: avatar + two lines */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-zinc-800 rounded animate-pulse w-28" />
            <div className="h-2.5 bg-zinc-800/60 rounded animate-pulse w-36" />
          </div>
        </div>
      </td>
      <SkeletonCell className="w-16" />
      <SkeletonCell className="w-20" />
      <SkeletonCell className="w-12" />
      <SkeletonCell className="w-12" />
      <SkeletonCell className="w-24" />
      {/* Risk score bar */}
      <td className="py-3 px-4">
        <div className="h-2 bg-zinc-800 rounded-full animate-pulse w-20" />
      </td>
      <SkeletonCell className="w-6 mx-auto" />
    </tr>
  );
}

/**
 * @param {{ rows?: number }} props
 */
export default function TableSkeleton({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <SkeletonRow key={i} idx={i} />
      ))}
    </>
  );
}
