import React from 'react';
import { Upload, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Empty state shown when a campaign has no submissions yet.
 *
 * @param {{ onNewSubmission: () => void; }} props
 */
const SubmissionEmptyState = ({ onNewSubmission }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {/* Icon ring */}
      <div className="relative mb-6">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/10 flex items-center justify-center shadow-xl shadow-indigo-900/20">
          <Upload className="w-8 h-8 text-indigo-400" strokeWidth={1.5} />
        </div>
        {/* Sparkle badge */}
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-600 border-2 border-slate-950 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Copy */}
      <h3 className="text-lg font-bold text-white mb-2">Submit your first content</h3>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-8">
        Share your content URL for brand review. Track status, receive feedback, and manage revisions — all in one place.
      </p>

      {/* CTA */}
      <button
        id="new-submission-cta"
        onClick={onNewSubmission}
        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all duration-150 shadow-lg shadow-indigo-600/25"
      >
        <Upload className="w-4 h-4" />
        New Submission
      </button>

      {/* Subtle grid decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle, #6366f1 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />
    </motion.div>
  );
};

export default SubmissionEmptyState;
