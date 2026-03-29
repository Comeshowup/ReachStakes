/**
 * BulkActionBar.jsx — Fixed bottom bar for bulk operations on selected creators.
 * Appears only when 1+ rows are selected.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Briefcase, ArrowUpCircle, ShieldOff, Download } from 'lucide-react';

const ACTIONS = [
  { id: 'campaign',  label: 'Assign Campaign', icon: Briefcase,     variant: 'default' },
  { id: 'tier',      label: 'Change Tier',      icon: ArrowUpCircle, variant: 'default' },
  { id: 'suspend',   label: 'Suspend',          icon: ShieldOff,     variant: 'danger' },
  { id: 'export',    label: 'Export Selected',  icon: Download,      variant: 'default' },
];

const BulkActionBar = ({ selectedCount, onClear, onAction }) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-md"
        >
          {/* Count pill */}
          <div className="flex items-center gap-2 pr-3 border-r border-zinc-700">
            <span className="text-xs font-semibold text-white tabular-nums">
              {selectedCount} selected
            </span>
            <button
              onClick={onClear}
              className="w-5 h-5 rounded-full bg-zinc-700 hover:bg-zinc-600 flex items-center justify-center transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-3 h-3 text-zinc-300" />
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            {ACTIONS.map((action) => {
              const Icon = action.icon;
              const isDanger = action.variant === 'danger';
              return (
                <button
                  key={action.id}
                  onClick={() => onAction(action.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isDanger
                      ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300 border border-transparent hover:border-red-900/30'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-white border border-transparent hover:border-zinc-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {action.label}
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionBar;
