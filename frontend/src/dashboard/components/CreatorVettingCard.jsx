/**
 * CreatorVettingCard
 * Displays verification badge and trust scores for a creator
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CreatorVettingCard = ({ creatorId, compact = false }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (creatorId) {
            fetchVettingSummary();
        }
    }, [creatorId]);

    const fetchVettingSummary = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/vetting/summary/${creatorId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setSummary(data.data);
            }
        } catch (error) {
            console.error('Error fetching vetting summary:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTierConfig = (tier) => {
        const configs = {
            Black: {
                color: '#1a1a1a',
                gradient: 'linear-gradient(135deg, #1a1a1a, #374151)',
                textColor: '#fff',
                label: '⭐ Black Tier',
                description: 'Top performer, fully verified'
            },
            Gold: {
                color: '#f59e0b',
                gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
                textColor: '#000',
                label: '🥇 Gold Tier',
                description: 'Verified authentic audience'
            },
            Silver: {
                color: '#9ca3af',
                gradient: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                textColor: '#000',
                label: '🥈 Silver Tier',
                description: 'Basic verification complete'
            },
            None: {
                color: '#6b7280',
                gradient: 'linear-gradient(135deg, #374151, #1f2937)',
                textColor: '#fff',
                label: 'Unverified',
                description: 'Not yet verified'
            }
        };
        return configs[tier] || configs.None;
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const styles = {
        card: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: compact ? '12px' : '20px',
            color: '#fff'
        },
        badge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
        },
        scoresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '16px'
        },
        scoreItem: {
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '10px',
            padding: '12px',
            textAlign: 'center'
        },
        scoreValue: {
            fontSize: '20px',
            fontWeight: '700'
        },
        scoreLabel: {
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        reliabilityRow: {
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            marginTop: '12px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.6)'
        }
    };

    if (loading) {
        return (
            <div style={{ ...styles.card, textAlign: 'center', padding: '20px' }}>
                <span style={{ opacity: 0.5 }}>Loading verification...</span>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    const tierConfig = getTierConfig(summary.verificationTier);

    // Compact mode - just the badge
    if (compact) {
        return (
            <span
                style={{
                    ...styles.badge,
                    background: tierConfig.gradient,
                    color: tierConfig.textColor
                }}
            >
                {tierConfig.label}
            </span>
        );
    }

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Verification Badge */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <span
                        style={{
                            ...styles.badge,
                            background: tierConfig.gradient,
                            color: tierConfig.textColor
                        }}
                    >
                        {tierConfig.label}
                    </span>
                    <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '6px', marginBottom: 0 }}>
                        {tierConfig.description}
                    </p>
                </div>
                {summary.scores.overall > 0 && (
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: getScoreColor(summary.scores.overall) }}>
                            {summary.scores.overall}
                        </div>
                        <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>OVERALL SCORE</div>
                    </div>
                )}
            </div>

            {/* Score Breakdown */}
            {summary.scores.overall > 0 && (
                <div style={styles.scoresGrid}>
                    <div style={styles.scoreItem}>
                        <div style={{ ...styles.scoreValue, color: getScoreColor(summary.scores.audience) }}>
                            {summary.scores.audience}
                        </div>
                        <div style={styles.scoreLabel}>Audience</div>
                    </div>
                    <div style={styles.scoreItem}>
                        <div style={{ ...styles.scoreValue, color: getScoreColor(summary.scores.engagement) }}>
                            {summary.scores.engagement}
                        </div>
                        <div style={styles.scoreLabel}>Engagement</div>
                    </div>
                    <div style={styles.scoreItem}>
                        <div style={{ ...styles.scoreValue, color: getScoreColor(summary.scores.safety) }}>
                            {summary.scores.safety}
                        </div>
                        <div style={styles.scoreLabel}>Safety</div>
                    </div>
                </div>
            )}

            {/* Reliability Stats */}
            <div style={styles.reliabilityRow}>
                <span>📦 {summary.reliability.completedCampaigns} campaigns</span>
                {summary.reliability.onTimeRate && (
                    <span>⏱️ {summary.reliability.onTimeRate}% on-time</span>
                )}
                {summary.lastVettedAt && (
                    <span>🔍 Verified {new Date(summary.lastVettedAt).toLocaleDateString()}</span>
                )}
            </div>
        </motion.div>
    );
};

export default CreatorVettingCard;
