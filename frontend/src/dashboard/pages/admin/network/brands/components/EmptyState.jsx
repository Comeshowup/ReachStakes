import React from 'react';
import { Building2, SearchX } from 'lucide-react';

/**
 * @param {{ variant: 'no-brands' | 'no-results', onReset?: () => void }} props
 */
export default function EmptyState({ variant = 'no-brands', onReset }) {
  const isFiltered = variant === 'no-results';

  return (
    <tr>
      <td colSpan={8}>
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isFiltered ? 'bg-zinc-800/60 text-zinc-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
            {isFiltered ? <SearchX className="w-7 h-7" /> : <Building2 className="w-7 h-7" />}
          </div>

          <h3 className="text-sm font-semibold text-white mb-1.5">
            {isFiltered ? 'No matching brands' : 'No brands yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
            {isFiltered
              ? "Try adjusting your filters or search query to find what you're looking for."
              : 'Brand accounts will appear here once they sign up on the platform.'}
          </p>

          {isFiltered && onReset && (
            <button
              onClick={onReset}
              className="mt-5 px-4 py-2 text-xs font-semibold text-indigo-400 border border-indigo-500/30 rounded-lg hover:bg-indigo-500/10 transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
