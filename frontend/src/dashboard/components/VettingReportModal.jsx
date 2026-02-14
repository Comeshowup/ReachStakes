/**
 * VettingReportModal
 * Detailed vetting report modal for brands to review creator verification
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const VettingReportModal = ({ creatorId, onClose }) => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        generateReport();
    }, [creatorId]);

    const generateReport = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/vetting/report/${creatorId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setReport(data.data);
            }
        } catch (error) {
            console.error('Error generating report:', error);
        } finally {
            setLoading(false);
            setGenerating(false);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return '#10b981';
        if (score >= 60) return '#f59e0b';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    const getSeverityColor = (severity) => {
        if (severity === 'high') return '#ef4444';
        if (severity === 'medium') return '#f59e0b';
        return '#6b7280';
    };

    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modal: {
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            color: '#fff'
        },
        header: {
            padding: '24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        title: {
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
        },
        closeBtn: {
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '18px'
        },
        content: {
            padding: '24px'
        },
        creatorInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px'
        },
        scoresSection: {
            marginBottom: '24px'
        },
        scoresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px'
        },
        scoreCard: {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '16px',
            textAlign: 'center'
        },
        scoreValue: {
            fontSize: '28px',
            fontWeight: '700'
        },
        scoreLabel: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px',
            textTransform: 'uppercase'
        },
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: 'rgba(255,255,255,0.8)'
        },
        factorsList: {
            listStyle: 'none',
            padding: 0,
            margin: 0
        },
        factorItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            marginBottom: '8px',
            fontSize: '13px'
        },
        factorImpact: {
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600'
        },
        riskFlag: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '8px',
            fontSize: '13px'
        },
        recommendation: {
            padding: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            borderRadius: '8px',
            marginBottom: '8px',
            fontSize: '13px',
            lineHeight: 1.5
        },
        tierBadge: {
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600'
        }
    };

    if (loading || generating) {
        return (
            <div style={styles.overlay}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                    <h3>Generating Vetting Report...</h3>
                    <p style={{ opacity: 0.6 }}>Analyzing creator authenticity and engagement</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return (
            <div style={styles.overlay} onClick={onClose}>
                <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
                    <h3>Failed to generate report</h3>
                    <button onClick={onClose} style={{ marginTop: '16px', padding: '10px 20px', borderRadius: '8px', background: '#8b5cf6', border: 'none', color: '#fff', cursor: 'pointer' }}>
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const reportData = report.reportData || {};
    const creator = reportData.creator || {};
    const scores = reportData.scores || {};
    const factors = reportData.factors || {};
    const riskFlags = reportData.riskFlags || [];
    const recommendations = reportData.recommendations || [];

    return (
        <AnimatePresence>
            <motion.div
                style={styles.overlay}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    style={styles.modal}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={styles.header}>
                        <div>
                            <h2 style={styles.title}>🔍 Creator Vetting Report</h2>
                            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                Generated {new Date(report.createdAt).toLocaleDateString()} • Valid until {new Date(report.expiresAt).toLocaleDateString()}
                            </p>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}>✕</button>
                    </div>

                    <div style={styles.content}>
                        {/* Creator Info */}
                        <div style={styles.creatorInfo}>
                            <div style={{
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '24px'
                            }}>
                                👤
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '16px' }}>{creator.name || 'Creator'}</h3>
                                <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>
                                    @{creator.handle} • {creator.platform} • {(creator.followers || 0).toLocaleString()} followers
                                </p>
                            </div>
                            <span style={{
                                ...styles.tierBadge,
                                background: report.verificationTierAtTime === 'Black'
                                    ? 'linear-gradient(135deg, #1a1a1a, #374151)'
                                    : report.verificationTierAtTime === 'Gold'
                                        ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                        : 'linear-gradient(135deg, #6b7280, #4b5563)',
                                color: report.verificationTierAtTime === 'Gold' ? '#000' : '#fff'
                            }}>
                                {report.verificationTierAtTime} Tier
                            </span>
                        </div>

                        {/* Scores */}
                        <div style={styles.scoresSection}>
                            <h4 style={styles.sectionTitle}>📊 Trust Scores</h4>
                            <div style={styles.scoresGrid}>
                                <div style={styles.scoreCard}>
                                    <div style={{ ...styles.scoreValue, color: getScoreColor(scores.overall || 0) }}>
                                        {scores.overall || 0}
                                    </div>
                                    <div style={styles.scoreLabel}>Overall</div>
                                </div>
                                <div style={styles.scoreCard}>
                                    <div style={{ ...styles.scoreValue, color: getScoreColor(scores.audience || 0) }}>
                                        {scores.audience || 0}
                                    </div>
                                    <div style={styles.scoreLabel}>Audience</div>
                                </div>
                                <div style={styles.scoreCard}>
                                    <div style={{ ...styles.scoreValue, color: getScoreColor(scores.engagement || 0) }}>
                                        {scores.engagement || 0}
                                    </div>
                                    <div style={styles.scoreLabel}>Engagement</div>
                                </div>
                                <div style={styles.scoreCard}>
                                    <div style={{ ...styles.scoreValue, color: getScoreColor(scores.safety || 0) }}>
                                        {scores.safety || 0}
                                    </div>
                                    <div style={styles.scoreLabel}>Safety</div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Flags */}
                        {riskFlags.length > 0 && (
                            <div style={styles.section}>
                                <h4 style={styles.sectionTitle}>⚠️ Risk Flags ({riskFlags.length})</h4>
                                {riskFlags.map((flag, idx) => (
                                    <div
                                        key={idx}
                                        style={{
                                            ...styles.riskFlag,
                                            background: `${getSeverityColor(flag.severity)}15`,
                                            borderLeft: `3px solid ${getSeverityColor(flag.severity)}`
                                        }}
                                    >
                                        <span style={{ color: getSeverityColor(flag.severity), fontWeight: '600' }}>
                                            {flag.severity === 'high' ? '🔴' : '🟡'}
                                        </span>
                                        <div>
                                            <div style={{ fontWeight: '500' }}>{flag.message}</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{flag.detail}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recommendations */}
                        {recommendations.length > 0 && (
                            <div style={styles.section}>
                                <h4 style={styles.sectionTitle}>💡 Recommendations</h4>
                                {recommendations.map((rec, idx) => (
                                    <div key={idx} style={styles.recommendation}>
                                        {rec}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Factors Breakdown */}
                        {factors.audience && factors.audience.length > 0 && (
                            <div style={styles.section}>
                                <h4 style={styles.sectionTitle}>📋 Analysis Details</h4>
                                <ul style={styles.factorsList}>
                                    {[...factors.audience, ...factors.engagement, ...factors.safety].map((factor, idx) => (
                                        <li key={idx} style={styles.factorItem}>
                                            <span style={{
                                                ...styles.factorImpact,
                                                background: factor.impact > 0
                                                    ? 'rgba(16, 185, 129, 0.2)'
                                                    : factor.impact < 0
                                                        ? 'rgba(239, 68, 68, 0.2)'
                                                        : 'rgba(107, 114, 128, 0.2)',
                                                color: factor.impact > 0
                                                    ? '#10b981'
                                                    : factor.impact < 0
                                                        ? '#ef4444'
                                                        : '#9ca3af'
                                            }}>
                                                {factor.impact > 0 ? '+' : ''}{factor.impact}
                                            </span>
                                            <div>
                                                <span style={{ fontWeight: '500' }}>{factor.name}</span>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                                                    {factor.detail}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default VettingReportModal;
