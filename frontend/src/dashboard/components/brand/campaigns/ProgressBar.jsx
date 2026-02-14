import React from 'react';
import { motion } from 'framer-motion';

/**
 * ProgressBar — animated budget utilization bar.
 * 6px height, 999px radius, smooth mount animation.
 */
const ProgressBar = ({ value, label, className = '' }) => {
    const clamped = Math.min(value, 100);

    const getFillColor = () => {
        if (value > 100) return 'var(--bd-cm-progress-fill-over)';
        if (value >= 100) return 'var(--bd-cm-progress-fill-full)';
        return 'var(--bd-cm-progress-fill)';
    };

    return (
        <div className={`w-full flex flex-col gap-1.5 ${className}`}>
            <div className="bd-cm-progress-track">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${clamped}%` }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="bd-cm-progress-fill"
                    style={{ background: getFillColor() }}
                />
            </div>
            {label && (
                <span className="bd-cm-label">{label}</span>
            )}
        </div>
    );
};

export default ProgressBar;
