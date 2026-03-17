import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * AnalyticsEmptyState
 *
 * Shown when the creator has no submitted content with stats yet.
 */
const AnalyticsEmptyState = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center py-24 px-6 text-center"
    >
        {/* Icon */}
        <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(99,102,241,0.1)' }}
        >
            <BarChart3 className="w-8 h-8" style={{ color: '#6366f1' }} />
        </div>

        {/* Copy */}
        <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--bd-text-primary)' }}
        >
            No analytics data yet
        </h2>
        <p
            className="text-sm max-w-sm mb-8"
            style={{ color: 'var(--bd-text-secondary)' }}
        >
            Start collaborating on campaigns and submit your content. Your views,
            engagement, and performance data will appear here once you have published
            videos.
        </p>

        {/* CTA */}
        <Link
            to="/creator/campaigns"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: '#6366f1' }}
        >
            Browse Campaigns
            <ArrowRight className="w-4 h-4" />
        </Link>
    </motion.div>
);

export default AnalyticsEmptyState;
