/**
 * MatchExplainabilityCard
 * Shows match score with top 3 signal explanations
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Info } from 'lucide-react';

const MatchExplainabilityCard = ({ matchData, compact = false }) => {
    if (!matchData) return null;

    const { score, matchLevel, topSignals } = matchData;

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981'; // green
        if (score >= 60) return '#8b5cf6'; // purple
        if (score >= 40) return '#f59e0b'; // amber
        return '#6b7280'; // gray
    };

    const styles = {
        card: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: compact ? '12px' : '16px',
            padding: compact ? '12px' : '20px'
        },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: compact ? '8px' : '16px'
        },
        scoreContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        scoreCircle: {
            width: compact ? '48px' : '64px',
            height: compact ? '48px' : '64px',
            borderRadius: '50%',
            background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
        },
        scoreInner: {
            width: compact ? '38px' : '50px',
            height: compact ? '38px' : '50px',
            borderRadius: '50%',
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
        },
        scoreValue: {
            fontSize: compact ? '14px' : '18px',
            fontWeight: '700',
            color: getScoreColor(score)
        },
        matchLevel: {
            fontSize: compact ? '10px' : '12px',
            color: getScoreColor(score),
            fontWeight: '600'
        },
        title: {
            fontSize: compact ? '12px' : '14px',
            fontWeight: '600',
            color: '#fff'
        },
        subtitle: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)'
        },
        signals: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        signal: {
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '8px 12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px'
        },
        signalIcon: {
            fontSize: '16px',
            flexShrink: 0
        },
        signalContent: {
            flex: 1
        },
        signalName: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#fff'
        },
        signalExplanation: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.6)'
        },
        signalScore: {
            fontSize: '11px',
            color: getScoreColor(score),
            fontWeight: '600'
        }
    };

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
        >
            <div style={styles.header}>
                <div style={styles.scoreContainer}>
                    <div style={styles.scoreCircle}>
                        <div style={styles.scoreInner}>
                            <span style={styles.scoreValue}>{score}</span>
                        </div>
                    </div>
                    <div>
                        <div style={styles.title}>Match Score</div>
                        <div style={styles.matchLevel}>{matchLevel} Match</div>
                    </div>
                </div>
                {!compact && (
                    <Info size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                )}
            </div>

            {!compact && topSignals && topSignals.length > 0 && (
                <div style={styles.signals}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                        Why this match:
                    </div>
                    {topSignals.map((signal, i) => (
                        <div key={i} style={styles.signal}>
                            <span style={styles.signalIcon}>{signal.icon}</span>
                            <div style={styles.signalContent}>
                                <div style={styles.signalName}>{signal.signal}</div>
                                <div style={styles.signalExplanation}>{signal.explanation}</div>
                            </div>
                            <span style={styles.signalScore}>+{signal.score}</span>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default MatchExplainabilityCard;
