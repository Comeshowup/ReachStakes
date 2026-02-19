import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

/**
 * SmartInsightCard — AI-detected insights for the current submission.
 * Non-blocking, dismissible.
 */
const INSIGHT_ICONS = {
    detected: <CheckCircle2 size={14} style={{ color: 'var(--bd-success)' }} />,
    missing: <AlertCircle size={14} style={{ color: 'var(--bd-danger)' }} />,
    info: <Clock size={14} style={{ color: 'var(--bd-info)' }} />,
};

const SmartInsightCard = ({ insights = [] }) => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || insights.length === 0) return null;

    return (
        <AnimatePresence>
            <motion.div
                className="aq-insight"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
            >
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    marginBottom: 'var(--bd-space-3)'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 'var(--bd-space-2)',
                        fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                        letterSpacing: '0.05em', color: 'var(--bd-info)'
                    }}>
                        <Sparkles size={14} />
                        Smart Review Insights
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--bd-text-muted)', padding: 2
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {insights.map((insight, i) => (
                    <div key={i} className="aq-insight__item">
                        {INSIGHT_ICONS[insight.type] || INSIGHT_ICONS.info}
                        <span>{insight.text}</span>
                    </div>
                ))}
            </motion.div>
        </AnimatePresence>
    );
};

export default SmartInsightCard;
