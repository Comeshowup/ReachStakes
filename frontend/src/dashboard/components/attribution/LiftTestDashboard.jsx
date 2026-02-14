/**
 * LiftTestDashboard
 * Dashboard for managing incremental lift tests
 */

import React, { useState, useEffect } from 'react';

const LiftTestDashboard = ({ campaignId, onCreateTest, onViewTest }) => {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTests();
    }, [campaignId]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            // If campaignId is provided, fetch tests for that campaign
            // Otherwise, fetch all tests for the current brand
            const endpoint = campaignId
                ? `/api/lift-tests/campaign/${campaignId}`
                : '/api/lift-tests/my-tests';

            const response = await fetch(endpoint, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.status === 'success') {
                setTests(data.data);
            } else {
                setError(data.message);
            }
        } catch (err) {
            setError('Failed to fetch lift tests');
        } finally {
            setLoading(false);
        }
    };


    const getStatusColor = (status) => {
        const colors = {
            Draft: '#6b7280',
            Running: '#10b981',
            Paused: '#f59e0b',
            Completed: '#3b82f6',
            Archived: '#9ca3af'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusIcon = (status) => {
        const icons = {
            Draft: '📝',
            Running: '🔄',
            Paused: '⏸️',
            Completed: '✅',
            Archived: '📦'
        };
        return icons[status] || '📋';
    };

    const styles = {
        container: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '24px',
            color: '#fff'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px'
        },
        title: {
            fontSize: '20px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        subtitle: {
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginTop: '4px'
        },
        createButton: {
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'transform 0.2s, box-shadow 0.2s'
        },
        testCard: {
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '16px',
            marginBottom: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s, border-color 0.2s'
        },
        testHeader: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '12px'
        },
        testName: {
            fontSize: '16px',
            fontWeight: '500'
        },
        statusBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500'
        },
        testMeta: {
            display: 'flex',
            gap: '16px',
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        significance: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '12px',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '48px 24px',
            color: 'rgba(255, 255, 255, 0.6)'
        },
        emptyIcon: {
            fontSize: '48px',
            marginBottom: '16px'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>⏳</div>
                    <p>Loading lift tests...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h3 style={styles.title}>
                        🧪 Incremental Lift Tests
                    </h3>
                    <p style={styles.subtitle}>
                        Measure the true incremental impact of your creators
                    </p>
                </div>
                <button
                    style={styles.createButton}
                    onClick={onCreateTest}
                    onMouseOver={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                    }}
                    onMouseOut={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }}
                >
                    ➕ New Test
                </button>
            </div>

            {/* Stats Summary */}
            {tests.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#818cf8' }}>
                            {tests.length}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Total Tests</div>
                    </div>
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
                            {tests.filter(t => t.status === 'Running').length}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Running</div>
                    </div>
                    <div style={{
                        background: 'rgba(251, 191, 36, 0.1)',
                        border: '1px solid rgba(251, 191, 36, 0.3)',
                        borderRadius: '12px',
                        padding: '16px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#fbbf24' }}>
                            {tests.filter(t => t.isSignificant).length}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>Significant</div>
                    </div>
                </div>
            )}

            {error && (
                <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    color: '#ef4444'
                }}>
                    {error}
                </div>
            )}

            {tests.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🧪</div>
                    <h4 style={{ marginBottom: '8px', color: '#fff' }}>No Lift Tests Yet</h4>
                    <p>Create your first test to measure the incremental impact of your creator campaigns.</p>
                </div>
            ) : (
                tests.map((test) => (
                    <div
                        key={test.id}
                        style={styles.testCard}
                        onClick={() => onViewTest(test.id)}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                        }}
                    >
                        <div style={styles.testHeader}>
                            <div style={styles.testName}>{test.name}</div>
                            <span style={{
                                ...styles.statusBadge,
                                background: `${getStatusColor(test.status)}20`,
                                color: getStatusColor(test.status)
                            }}>
                                {getStatusIcon(test.status)} {test.status}
                            </span>
                        </div>

                        <div style={styles.testMeta}>
                            <span>📊 {test.testType}</span>
                            {test.startDate && (
                                <span>📅 Started: {new Date(test.startDate).toLocaleDateString()}</span>
                            )}
                            {test.result && (
                                <span>
                                    📈 Lift: {parseFloat(test.result.liftPercentage)?.toFixed(1) || 'N/A'}%
                                </span>
                            )}
                        </div>

                        {test.isSignificant && (
                            <div style={{
                                ...styles.significance,
                                background: 'rgba(16, 185, 129, 0.1)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                color: '#10b981'
                            }}>
                                ✨ Statistically Significant at {test.confidenceLevel}% confidence
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default LiftTestDashboard;
