/**
 * ROIPredictionCard
 * Shows predicted ROI for creator-campaign pairing
 */

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Eye, MousePointer, ShoppingCart, AlertTriangle } from 'lucide-react';

const ROIPredictionCard = ({ roiData }) => {
    if (!roiData) return null;

    const { investment, projectedMetrics, efficiency, projectedROI, confidence, factors } = roiData;

    const roiValue = parseFloat(projectedROI);
    const isPositive = roiValue >= 0;

    const styles = {
        card: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px'
        },
        title: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        confidenceBadge: {
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '600',
            background: confidence === 'High' ? 'rgba(16, 185, 129, 0.2)' :
                confidence === 'Medium' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
            color: confidence === 'High' ? '#10b981' :
                confidence === 'Medium' ? '#f59e0b' : '#ef4444'
        },
        roiDisplay: {
            textAlign: 'center',
            padding: '24px',
            background: isPositive
                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05))',
            borderRadius: '12px',
            marginBottom: '20px'
        },
        roiValue: {
            fontSize: '48px',
            fontWeight: '700',
            color: isPositive ? '#10b981' : '#ef4444'
        },
        roiLabel: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.6)'
        },
        metricsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '20px'
        },
        metric: {
            textAlign: 'center',
            padding: '12px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '8px'
        },
        metricIcon: {
            marginBottom: '4px'
        },
        metricValue: {
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff'
        },
        metricLabel: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)'
        },
        factors: {
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '16px'
        },
        factorsTitle: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '12px'
        },
        factor: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 0',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        factorName: {
            fontSize: '13px',
            color: '#fff'
        },
        factorValue: {
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)'
        },
        impactBadge: {
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '10px',
            marginLeft: '8px'
        }
    };

    const getImpactStyle = (impact) => {
        const colors = {
            High: { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981' },
            Medium: { bg: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' },
            Low: { bg: 'rgba(107, 114, 128, 0.2)', color: '#6b7280' }
        };
        return colors[impact] || colors.Low;
    };

    return (
        <motion.div
            style={styles.card}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div style={styles.header}>
                <div style={styles.title}>
                    <TrendingUp size={20} color="#8b5cf6" />
                    Predicted ROI
                </div>
                <span style={styles.confidenceBadge}>{confidence} Confidence</span>
            </div>

            <div style={styles.roiDisplay}>
                <div style={styles.roiValue}>{roiValue > 0 ? '+' : ''}{projectedROI}%</div>
                <div style={styles.roiLabel}>
                    Based on ${investment} investment
                </div>
            </div>

            <div style={styles.metricsGrid}>
                <div style={styles.metric}>
                    <Eye size={16} style={{ ...styles.metricIcon, color: '#8b5cf6' }} />
                    <div style={styles.metricValue}>{projectedMetrics.views.toLocaleString()}</div>
                    <div style={styles.metricLabel}>Est. Views</div>
                </div>
                <div style={styles.metric}>
                    <MousePointer size={16} style={{ ...styles.metricIcon, color: '#f59e0b' }} />
                    <div style={styles.metricValue}>{projectedMetrics.clicks.toLocaleString()}</div>
                    <div style={styles.metricLabel}>Est. Clicks</div>
                </div>
                <div style={styles.metric}>
                    <ShoppingCart size={16} style={{ ...styles.metricIcon, color: '#10b981' }} />
                    <div style={styles.metricValue}>{projectedMetrics.conversions}</div>
                    <div style={styles.metricLabel}>Est. Conversions</div>
                </div>
            </div>

            <div style={styles.factors}>
                <div style={styles.factorsTitle}>Key Factors</div>
                {factors.map((factor, i) => {
                    const impactStyle = getImpactStyle(factor.impact);
                    return (
                        <div key={i} style={styles.factor}>
                            <span style={styles.factorName}>{factor.factor}</span>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={styles.factorValue}>{factor.value}</span>
                                <span style={{
                                    ...styles.impactBadge,
                                    background: impactStyle.bg,
                                    color: impactStyle.color
                                }}>
                                    {factor.impact}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {confidence === 'Low' && (
                <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '12px',
                    color: '#f59e0b'
                }}>
                    <AlertTriangle size={14} />
                    Limited historical data - predictions may vary
                </div>
            )}
        </motion.div>
    );
};

export default ROIPredictionCard;
