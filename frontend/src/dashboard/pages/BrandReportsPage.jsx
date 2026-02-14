/**
 * BrandReportsPage
 * Executive reports dashboard for brands
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Download, Calendar, TrendingUp, Users,
    DollarSign, Eye, BarChart3, FileSpreadsheet, Loader2
} from 'lucide-react';

const BrandReportsPage = () => {
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

            const response = await fetch(`/api/reports/brand/executive?${params}`, {
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

            const response = await fetch(`/api/reports/brand/executive/${format}?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `executive-report-${Date.now()}.${format}`;
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
            fontSize: '14px',
            fontWeight: '500'
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
        metricsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
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
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '8px'
        },
        metricValue: {
            fontSize: '28px',
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
        roiPositive: {
            color: '#10b981',
            fontWeight: '700',
            fontSize: '32px'
        },
        roiNegative: {
            color: '#ef4444',
            fontWeight: '700',
            fontSize: '32px'
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

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📊 Executive Report</h1>
                    <p style={styles.subtitle}>Campaign performance summary and insights</p>
                </div>
                <div style={styles.controls}>
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.startDate}
                        onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        style={styles.dateInput}
                        value={dateRange.endDate}
                        onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        placeholder="End Date"
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
                    {/* Metrics Grid */}
                    <div style={styles.metricsGrid}>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Total Campaigns</div>
                            <div style={styles.metricValue}>{reportData.summary.totalCampaigns}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Total Spend</div>
                            <div style={styles.metricValue}>${reportData.summary.totalSpend}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Total Reach</div>
                            <div style={styles.metricValue}>{reportData.summary.totalReach.toLocaleString()}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Conversions</div>
                            <div style={styles.metricValue}>{reportData.summary.totalConversions}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>Revenue Attributed</div>
                            <div style={styles.metricValue}>${reportData.summary.totalRevenue}</div>
                        </motion.div>
                        <motion.div style={styles.metricCard} whileHover={{ scale: 1.02 }}>
                            <div style={styles.metricLabel}>ROI</div>
                            <div style={parseFloat(reportData.summary.roi) >= 0 ? styles.roiPositive : styles.roiNegative}>
                                {reportData.summary.roi}%
                            </div>
                        </motion.div>
                    </div>

                    {/* Top Creators */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <Users size={20} color="#8b5cf6" />
                            Top Performing Creators
                        </h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Creator</th>
                                    <th style={styles.th}>Campaigns</th>
                                    <th style={styles.th}>Reach</th>
                                    <th style={styles.th}>Engagement</th>
                                    <th style={styles.th}>Spend</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.topCreators.map((creator, i) => (
                                    <tr key={i}>
                                        <td style={styles.td}>
                                            <strong>{creator.name}</strong>
                                            <span style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '8px' }}>
                                                @{creator.handle}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{creator.campaigns}</td>
                                        <td style={styles.td}>{creator.reach.toLocaleString()}</td>
                                        <td style={styles.td}>{creator.engagement.toLocaleString()}</td>
                                        <td style={styles.td}>${creator.spend.toFixed(2)}</td>
                                    </tr>
                                ))}
                                {reportData.topCreators.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ ...styles.td, textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                            No creator data available
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Campaigns */}
                    <div style={styles.section}>
                        <h3 style={styles.sectionTitle}>
                            <BarChart3 size={20} color="#10b981" />
                            Campaign Performance
                        </h3>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Campaign</th>
                                    <th style={styles.th}>Status</th>
                                    <th style={styles.th}>Budget</th>
                                    <th style={styles.th}>Collaborations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.campaigns.map(campaign => (
                                    <tr key={campaign.id}>
                                        <td style={styles.td}>{campaign.title}</td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                background: campaign.status === 'Active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.1)',
                                                color: campaign.status === 'Active' ? '#10b981' : '#fff'
                                            }}>
                                                {campaign.status}
                                            </span>
                                        </td>
                                        <td style={styles.td}>${campaign.budget || 0}</td>
                                        <td style={styles.td}>{campaign.collaborations}</td>
                                    </tr>
                                ))}
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

export default BrandReportsPage;
