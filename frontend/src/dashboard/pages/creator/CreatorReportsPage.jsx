/**
 * CreatorReportsPage
 * Performance reports dashboard for creators
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, TrendingUp, Users, DollarSign, Eye,
    BarChart3, FileSpreadsheet, Loader2, Star, Award, Target
} from 'lucide-react';

const CreatorReportsPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        fetchReport();
    }, []);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await fetch(`/api/reports/creator/performance?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setReportData(data.data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportReport = async (format) => {
        setExporting(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await fetch(`/api/reports/creator/performance/${format}?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `performance-report-${Date.now()}.${format}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
        } finally {
            setExporting(false);
        }
    };

    const getTierConfig = (tier) => {
        const configs = {
            Black: { color: '#1a1a2e', bg: 'linear-gradient(135deg, #1a1a2e, #2d2d44)', icon: '⭐' },
            Gold: { color: '#f59e0b', bg: 'linear-gradient(135deg, #f59e0b20, #f59e0b10)', icon: '🥇' },
            Silver: { color: '#94a3b8', bg: 'linear-gradient(135deg, #94a3b820, #94a3b810)', icon: '🥈' },
            None: { color: '#6b7280', bg: 'rgba(255,255,255,0.05)', icon: '⚪' }
        };
        return configs[tier] || configs.None;
    };

    const styles = {
        container: {
            padding: '32px',
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            margin: 0
        },
        subtitle: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '4px'
        },
        controls: {
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
        },
        dateInput: {
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px'
        },
        exportBtn: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px'
        },
        exportPrimary: {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
        },
        profileCard: {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '20px',
            padding: '28px',
            marginBottom: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
        },
        profileInfo: {
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
        },
        avatar: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
        },
        name: {
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
        },
        handle: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)'
        },
        tierBadge: {
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        metricsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
        },
        metricCard: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
        },
        metricLabel: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '8px'
        },
        metricValue: {
            fontSize: '26px',
            fontWeight: '700'
        },
        section: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
        },
        sectionTitle: {
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        th: {
            textAlign: 'left',
            padding: '12px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            fontWeight: '500'
        },
        td: {
            padding: '14px 12px',
            fontSize: '14px',
            borderBottom: '1px solid rgba(255,255,255,0.05)'
        },
        verificationStats: {
            display: 'flex',
            gap: '24px',
            flexWrap: 'wrap'
        },
        statItem: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: '700',
            color: '#8b5cf6'
        },
        statLabel: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Loader2 size={48} style={{ animation: 'spin 1s linear infinite' }} />
                    <h3 style={{ marginTop: '16px' }}>Generating Report...</h3>
                </div>
            </div>
        );
    }

    const tierConfig = reportData ? getTierConfig(reportData.verification.tier) : getTierConfig('None');

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📈 Performance Report</h1>
                    <p style={styles.subtitle}>Your proof-of-performance for brands</p>
                </div>
                <div style={styles.controls}>
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.startDate}
                        onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.endDate}
                        onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                    <button style={styles.exportBtn} onClick={() => exportReport('csv')} disabled={exporting}>
                        <FileSpreadsheet size={16} />
                        CSV
                    </button>
                    <button style={styles.exportPrimary} onClick={() => exportReport('pdf')} disabled={exporting}>
                        <Download size={16} />
                        {exporting ? 'Exporting...' : 'Export PDF'}
                    </button>
                </div>
            </div>

            {reportData && (
                <>
                    {/* Profile Card */}
                    <motion.div style={styles.profileCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div style={styles.profileInfo}>
                            <div style={styles.avatar}>
                                {reportData.creator.name.charAt(0)}
                            </div>
                            <div>
                                <h2 style={styles.name}>{reportData.creator.name}</h2>
                                <p style={styles.handle}>@{reportData.creator.handle} • {reportData.creator.platform}</p>
                                <p style={styles.handle}>{reportData.creator.followers?.toLocaleString() || 0} followers</p>
                            </div>
                        </div>
                        <div style={{ ...styles.tierBadge, background: tierConfig.bg, color: tierConfig.color }}>
                            <span>{tierConfig.icon}</span>
                            {reportData.verification.tier} Tier Verified
                        </div>
                    </motion.div>

                    {/* Metrics Grid */}
                    <div style={styles.metricsGrid}>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Campaigns Completed</div>
                            <div style={styles.metricValue}>{reportData.summary.totalCampaigns}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Brand Partnerships</div>
                            <div style={styles.metricValue}>{reportData.summary.uniqueBrands}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Total Reach</div>
                            <div style={styles.metricValue}>{reportData.summary.totalReach.toLocaleString()}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Engagement Rate</div>
                            <div style={styles.metricValue}>{reportData.summary.engagementRate}%</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Total Earnings</div>
                            <div style={{ ...styles.metricValue, color: '#10b981' }}>${reportData.summary.totalEarnings}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Conversions Driven</div>
                            <div style={styles.metricValue}>{reportData.summary.totalConversions}</div>
                        </motion.div>
                    </div>

                    {/* Verification Stats */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <Award size={20} color="#f59e0b" />
                            Verification Stats
                        </h3>
                        <div style={styles.verificationStats}>
                            <div style={styles.statItem}>
                                <div style={styles.statValue}>{reportData.verification.completedCampaigns}</div>
                                <div style={styles.statLabel}>Campaigns Completed</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statValue}>{reportData.verification.reliabilityScore}%</div>
                                <div style={styles.statLabel}>Reliability Score</div>
                            </div>
                            <div style={styles.statItem}>
                                <div style={styles.statValue}>
                                    {reportData.verification.onTimeDeliveryRate
                                        ? `${reportData.verification.onTimeDeliveryRate.toFixed(0)}%`
                                        : 'N/A'}
                                </div>
                                <div style={styles.statLabel}>On-Time Delivery</div>
                            </div>
                        </div>
                    </div>

                    {/* Campaign History */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <BarChart3 size={20} color="#8b5cf6" />
                            Campaign History
                        </h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Campaign</th>
                                    <th style={styles.th}>Brand</th>
                                    <th style={styles.th}>Views</th>
                                    <th style={styles.th}>Engagement</th>
                                    <th style={styles.th}>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.campaigns.map((campaign, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>{campaign.campaignTitle}</td>
                                        <td style={styles.td}>{campaign.brand}</td>
                                        <td style={styles.td}>{campaign.views.toLocaleString()}</td>
                                        <td style={styles.td}>{campaign.engagement.toLocaleString()}</td>
                                        <td style={{ ...styles.td, color: '#10b981' }}>${campaign.payment}</td>
                                    </tr>
                                ))}
                                {reportData.campaigns.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                            No campaigns completed yet
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '24px' }}>
                        Report generated: {new Date(reportData.generatedAt).toLocaleString()}
                    </div>
                </>
            )}
        </div>
    );
};

export default CreatorReportsPage;
