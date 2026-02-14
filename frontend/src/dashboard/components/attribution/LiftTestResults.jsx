/**
 * LiftTestResults
 * Results visualization for lift tests
 */

import React, { useState, useEffect } from 'react';

const LiftTestResults = ({ testId, onBack }) => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [testId]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/lift-tests/${testId}/results`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setResults(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const handleRecalculate = async () => {
        try {
            setCalculating(true);
            const token = localStorage.getItem('token');
            await fetch(`/api/lift-tests/${testId}/calculate`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await fetchResults();
        } catch (err) {
            setError('Failed to recalculate');
        } finally {
            setCalculating(false);
        }
    };

    const getSignificanceColor = (status) => {
        const colors = {
            not_significant: '#6b7280',
            trending: '#f59e0b',
            significant: '#10b981',
            highly_significant: '#059669'
        };
        return colors[status] || '#6b7280';
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '—';
        return new Intl.NumberFormat('en-US').format(num);
    };

    const formatCurrency = (num) => {
        if (num === null || num === undefined) return '—';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(num);
    };

    const formatPercent = (num) => {
        if (num === null || num === undefined || !isFinite(num)) return '—';
        return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
    };

    const styles = {
        container: {
            color: '#fff'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
        },
        backButton: {
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        title: {
            fontSize: '24px',
            fontWeight: '600'
        },
        status: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '500'
        },
        heroCard: {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(99, 102, 241, 0.2))',
            borderRadius: '16px',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '32px',
            textAlign: 'center',
            marginBottom: '24px'
        },
        heroLabel: {
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '8px'
        },
        heroValue: {
            fontSize: '48px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
        },
        heroSubtext: {
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '8px'
        },
        significanceBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '20px',
            marginTop: '16px',
            fontSize: '14px',
            fontWeight: '500'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
        },
        comparisonCard: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px'
        },
        cardTitle: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '16px',
            fontWeight: '500',
            marginBottom: '16px'
        },
        metricRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        },
        metricLabel: {
            color: 'rgba(255, 255, 255, 0.6)'
        },
        metricValue: {
            fontWeight: '600'
        },
        chartContainer: {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            marginBottom: '24px'
        },
        barContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
        },
        barLabel: {
            width: '80px',
            fontSize: '14px'
        },
        barTrack: {
            flex: 1,
            height: '32px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            overflow: 'hidden',
            position: 'relative'
        },
        barFill: {
            height: '100%',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: '12px',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'width 0.5s ease'
        },
        statsCard: {
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px'
        },
        interpretation: {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '16px'
        },
        recalculateButton: {
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                    <p>Loading results...</p>
                </div>
            </div>
        );
    }

    if (error || !results) {
        return (
            <div style={styles.container}>
                <div style={styles.header}>
                    <button style={styles.backButton} onClick={onBack}>
                        ← Back
                    </button>
                </div>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚠️</div>
                    <p>{error || 'No results available'}</p>
                </div>
            </div>
        );
    }

    const { lift, testGroup, controlGroup, statistics, interpretation } = results;
    const maxConversions = Math.max(testGroup.conversions, controlGroup.conversions) || 1;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.backButton} onClick={onBack}>
                    ← Back to Tests
                </button>
                <div>
                    <h2 style={styles.title}>{results.testName}</h2>
                </div>
                <button
                    style={styles.recalculateButton}
                    onClick={handleRecalculate}
                    disabled={calculating}
                >
                    {calculating ? '⏳ Calculating...' : '🔄 Recalculate'}
                </button>
            </div>

            {/* Hero Card - Lift Percentage */}
            <div style={styles.heroCard}>
                <div style={styles.heroLabel}>Incremental Lift</div>
                <div style={styles.heroValue}>
                    {formatPercent(lift.percentage)}
                </div>
                <div style={styles.heroSubtext}>
                    {lift.absolute > 0 ? '+' : ''}{formatNumber(lift.absolute)} incremental conversions
                    {lift.incrementalRevenue > 0 && ` (${formatCurrency(lift.incrementalRevenue)} incremental revenue)`}
                </div>
                <span
                    style={{
                        ...styles.significanceBadge,
                        background: `${getSignificanceColor(interpretation.status)}20`,
                        color: getSignificanceColor(interpretation.status)
                    }}
                >
                    {interpretation.status === 'highly_significant' && '✨'}
                    {interpretation.status === 'significant' && '✓'}
                    {interpretation.status === 'trending' && '📈'}
                    {interpretation.status === 'not_significant' && '⏳'}
                    {interpretation.message}
                </span>
            </div>

            {/* Power Analysis Progress - Only show if not yet significant */}
            {!results.isSignificant && (
                <div style={{
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '16px',
                    border: '1px solid rgba(251, 191, 36, 0.3)',
                    padding: '20px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ ...styles.cardTitle, color: '#fbbf24', marginBottom: '16px' }}>
                        ⚡ Progress to Significance
                    </h4>

                    {/* Power Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                            <span style={{ color: 'rgba(255,255,255,0.7)' }}>Statistical Power</span>
                            <span style={{ color: '#fbbf24', fontWeight: '600' }}>
                                {(() => {
                                    // Estimate power based on current sample size and effect size
                                    const n = (testGroup.sampleSize || 0) + (controlGroup.sampleSize || 0);
                                    const effectSize = Math.abs(lift.percentage || 0) / 100;
                                    // Simplified power estimation
                                    const power = Math.min(0.99, Math.max(0.05, 1 - Math.exp(-n * effectSize * effectSize / 100)));
                                    return `${(power * 100).toFixed(0)}%`;
                                })()}
                            </span>
                        </div>
                        <div style={{
                            height: '8px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                height: '100%',
                                width: (() => {
                                    const n = (testGroup.sampleSize || 0) + (controlGroup.sampleSize || 0);
                                    const effectSize = Math.abs(lift.percentage || 0) / 100;
                                    const power = Math.min(0.99, Math.max(0.05, 1 - Math.exp(-n * effectSize * effectSize / 100)));
                                    return `${power * 100}%`;
                                })(),
                                background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                                borderRadius: '4px',
                                transition: 'width 0.5s ease'
                            }} />
                        </div>
                    </div>

                    {/* Insights */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                                Estimated Days to 80% Power
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                                {(() => {
                                    const currentN = (testGroup.sampleSize || 0) + (controlGroup.sampleSize || 0);
                                    const effectSize = Math.abs(lift.percentage || 0) / 100 || 0.1;
                                    // Target sample size for 80% power (simplified)
                                    const targetN = Math.ceil(16 / (effectSize * effectSize));
                                    if (currentN >= targetN) return '✓ Ready';
                                    const daysRun = results.startDate
                                        ? Math.ceil((new Date() - new Date(results.startDate)) / (1000 * 60 * 60 * 24))
                                        : 1;
                                    const dailyRate = currentN / Math.max(1, daysRun);
                                    if (dailyRate <= 0) return '—';
                                    const daysNeeded = Math.ceil((targetN - currentN) / dailyRate);
                                    return `~${daysNeeded} days`;
                                })()}
                            </div>
                        </div>
                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            padding: '12px'
                        }}>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>
                                Recommended Sample Size
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '600', color: '#fff' }}>
                                {(() => {
                                    const effectSize = Math.abs(lift.percentage || 0) / 100 || 0.1;
                                    const targetN = Math.ceil(16 / (effectSize * effectSize));
                                    return formatNumber(targetN * 2); // Total for both groups
                                })()}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Comparison Bars */}
            <div style={styles.chartContainer}>
                <h4 style={styles.cardTitle}>📊 Conversion Comparison</h4>
                <div style={styles.barContainer}>
                    <div style={styles.barLabel}>🟢 Test</div>
                    <div style={styles.barTrack}>
                        <div
                            style={{
                                ...styles.barFill,
                                width: `${(testGroup.conversions / maxConversions) * 100}%`,
                                background: 'linear-gradient(90deg, #10b981, #059669)'
                            }}
                        >
                            {formatNumber(testGroup.conversions)}
                        </div>
                    </div>
                </div>
                <div style={styles.barContainer}>
                    <div style={styles.barLabel}>🔵 Control</div>
                    <div style={styles.barTrack}>
                        <div
                            style={{
                                ...styles.barFill,
                                width: `${(controlGroup.conversions / maxConversions) * 100}%`,
                                background: 'linear-gradient(90deg, #6366f1, #4f46e5)'
                            }}
                        >
                            {formatNumber(controlGroup.conversions)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Group Comparison Cards */}
            <div style={styles.grid}>
                <div style={{ ...styles.comparisonCard, borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                    <h4 style={styles.cardTitle}>
                        <span style={{ color: '#10b981' }}>🟢</span> Test Group
                    </h4>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Conversions</span>
                        <span style={styles.metricValue}>{formatNumber(testGroup.conversions)}</span>
                    </div>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Revenue</span>
                        <span style={styles.metricValue}>{formatCurrency(testGroup.revenue)}</span>
                    </div>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Sample Size</span>
                        <span style={styles.metricValue}>{formatNumber(testGroup.sampleSize)}</span>
                    </div>
                </div>

                <div style={{ ...styles.comparisonCard, borderColor: 'rgba(99, 102, 241, 0.3)' }}>
                    <h4 style={styles.cardTitle}>
                        <span style={{ color: '#6366f1' }}>🔵</span> Control Group
                    </h4>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Conversions</span>
                        <span style={styles.metricValue}>{formatNumber(controlGroup.conversions)}</span>
                    </div>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Revenue</span>
                        <span style={styles.metricValue}>{formatCurrency(controlGroup.revenue)}</span>
                    </div>
                    <div style={styles.metricRow}>
                        <span style={styles.metricLabel}>Sample Size</span>
                        <span style={styles.metricValue}>{formatNumber(controlGroup.sampleSize)}</span>
                    </div>
                </div>
            </div>

            {/* Statistical Details */}
            <div style={styles.statsCard}>
                <h4 style={styles.cardTitle}>📈 Statistical Analysis</h4>
                <div style={styles.grid}>
                    <div>
                        <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>P-Value</span>
                            <span style={styles.metricValue}>
                                {statistics.pValue?.toFixed(4) || '—'}
                                {statistics.pValue < 0.05 && ' ✅'}
                            </span>
                        </div>
                        <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Confidence Level</span>
                            <span style={styles.metricValue}>{statistics.confidenceLevel}%</span>
                        </div>
                    </div>
                    <div>
                        <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Confidence Interval</span>
                            <span style={styles.metricValue}>
                                {statistics.confidenceInterval
                                    ? `${statistics.confidenceInterval.lower?.toFixed(1)}% to ${statistics.confidenceInterval.upper?.toFixed(1)}%`
                                    : '—'}
                            </span>
                        </div>
                        <div style={styles.metricRow}>
                            <span style={styles.metricLabel}>Total Sample</span>
                            <span style={styles.metricValue}>
                                {formatNumber((testGroup.sampleSize || 0) + (controlGroup.sampleSize || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={styles.interpretation}>
                    <strong>Recommendation:</strong> {interpretation.recommendation}
                </div>
            </div>
        </div>
    );
};

export default LiftTestResults;
