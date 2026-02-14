/**
 * MyLicensesPage
 * Brand view for managing purchased content licenses
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MyLicensesPage = () => {
    const [licenses, setLicenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchLicenses();
    }, []);

    const fetchLicenses = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/licensing/licenses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setLicenses(data.data);
            }
        } catch (error) {
            console.error('Error fetching licenses:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            Active: '#10b981',
            Pending: '#f59e0b',
            Expired: '#6b7280',
            Revoked: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getDaysRemaining = (endDate) => {
        if (!endDate) return 'Perpetual';
        const end = new Date(endDate);
        const now = new Date();
        const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        if (days < 0) return 'Expired';
        if (days === 0) return 'Expires today';
        return `${days} days left`;
    };

    const filteredLicenses = licenses.filter(lic => {
        if (filter === 'all') return true;
        return lic.status === filter;
    });

    const styles = {
        container: {
            padding: '24px',
            color: '#fff',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            marginBottom: '24px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            margin: 0
        },
        subtitle: {
            color: 'rgba(255,255,255,0.6)',
            marginTop: '4px'
        },
        filterRow: {
            display: 'flex',
            gap: '8px',
            marginBottom: '24px'
        },
        filterBtn: {
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
        },
        filterBtnActive: {
            background: 'rgba(139, 92, 246, 0.3)',
            borderColor: '#8b5cf6'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '16px'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '20px',
            transition: 'all 0.2s ease'
        },
        cardHeader: {
            display: 'flex',
            gap: '16px',
            marginBottom: '16px'
        },
        thumbnail: {
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            objectFit: 'cover',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            flexShrink: 0
        },
        assetTitle: {
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 4px'
        },
        creatorName: {
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0
        },
        badge: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '600',
            marginTop: '8px'
        },
        metaRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px'
        },
        metaItem: {
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '12px'
        },
        metaLabel: {
            fontSize: '11px',
            color: 'rgba(255,255,255,0.5)',
            marginBottom: '4px'
        },
        metaValue: {
            fontSize: '14px',
            fontWeight: '600'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.1)'
        }
    };

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <p>Loading licenses...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>📄 My Licenses</h1>
                <p style={styles.subtitle}>Manage your purchased content licenses</p>
            </div>

            {/* Filters */}
            <div style={styles.filterRow}>
                {['all', 'Active', 'Pending', 'Expired'].map(f => (
                    <button
                        key={f}
                        style={{
                            ...styles.filterBtn,
                            ...(filter === f ? styles.filterBtnActive : {})
                        }}
                        onClick={() => setFilter(f)}
                    >
                        {f === 'all' ? 'All' : f}
                    </button>
                ))}
            </div>

            {/* License Grid */}
            {filteredLicenses.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                    <h3 style={{ margin: '0 0 8px' }}>No licenses yet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                        Browse the content hub to license creator content
                    </p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {filteredLicenses.map((license, index) => (
                        <motion.div
                            key={license.id}
                            style={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ borderColor: 'rgba(139, 92, 246, 0.5)' }}
                        >
                            <div style={styles.cardHeader}>
                                <div style={styles.thumbnail}>
                                    {license.asset?.thumbnailUrl ? (
                                        <img
                                            src={license.asset.thumbnailUrl}
                                            alt={license.asset.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
                                        />
                                    ) : (
                                        license.asset?.type === 'Video' ? '🎬' : '🖼️'
                                    )}
                                </div>
                                <div>
                                    <h3 style={styles.assetTitle}>{license.asset?.title || 'Content Asset'}</h3>
                                    <p style={styles.creatorName}>by {license.asset?.creator?.fullName || 'Creator'}</p>
                                    <span style={{
                                        ...styles.badge,
                                        background: `${getStatusColor(license.status)}20`,
                                        color: getStatusColor(license.status)
                                    }}>
                                        {license.status}
                                    </span>
                                </div>
                            </div>

                            <div style={styles.metaRow}>
                                <div style={styles.metaItem}>
                                    <div style={styles.metaLabel}>License Type</div>
                                    <div style={styles.metaValue}>{license.licenseType}</div>
                                </div>
                                <div style={styles.metaItem}>
                                    <div style={styles.metaLabel}>Expires</div>
                                    <div style={styles.metaValue}>{getDaysRemaining(license.endDate)}</div>
                                </div>
                                <div style={styles.metaItem}>
                                    <div style={styles.metaLabel}>Territory</div>
                                    <div style={styles.metaValue}>{license.territory || 'Worldwide'}</div>
                                </div>
                                <div style={styles.metaItem}>
                                    <div style={styles.metaLabel}>Price Paid</div>
                                    <div style={styles.metaValue}>${parseFloat(license.price || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyLicensesPage;
