import React from 'react';
import { motion } from 'framer-motion';
import { Plus, SearchX } from 'lucide-react';

/**
 * EmptyState — shown when no campaigns exist or filters clear all.
 * Uses CSS classes. Subtle fade animation on mount.
 */

const fadeIn = {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: 'easeOut' },
};

const EmptyState = ({ onCreate, isFiltered = false, onClearFilters }) => {
    if (isFiltered) {
        return (
            <motion.div {...fadeIn} className="bd-cm-empty flex flex-col items-center justify-center py-16 px-4 text-center">
                <div
                    className="p-3 rounded-full mb-4"
                    style={{ background: 'var(--bd-cm-input)' }}
                >
                    <SearchX className="w-5 h-5" style={{ color: 'var(--bd-text-muted)' }} />
                </div>
                <h3
                    className="text-base font-medium"
                    style={{ color: 'var(--bd-text-primary)' }}
                >
                    No campaigns found
                </h3>
                <p
                    className="mt-1 mb-5 max-w-sm text-sm"
                    style={{ color: 'var(--bd-text-secondary)' }}
                >
                    No campaigns match your current filters.
                </p>
                <button
                    onClick={onClearFilters}
                    className="bd-cm-btn-secondary bd-cm-focus-ring text-sm"
                    aria-label="Clear all filters"
                >
                    Clear all filters
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div {...fadeIn} className="bd-cm-empty flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
                className="p-4 rounded-full mb-4"
                style={{ background: 'var(--bd-cm-input)' }}
            >
                <Plus className="w-6 h-6" style={{ color: 'var(--bd-text-muted)' }} />
            </div>
            <h3
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--bd-text-primary)' }}
            >
                No campaigns yet
            </h3>
            <p
                className="max-w-md mb-6 text-sm"
                style={{ color: 'var(--bd-text-secondary)' }}
            >
                Create your first campaign to start collaborating with creators and tracking performance.
            </p>
            <button
                onClick={onCreate}
                className="bd-cm-btn-primary bd-cm-focus-ring"
                aria-label="Create your first campaign"
            >
                <Plus className="w-4 h-4" />
                Create Campaign
            </button>
        </motion.div>
    );
};

export default EmptyState;
