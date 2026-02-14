/**
 * CreatorContentPage
 * Creator view for managing licensable content assets
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const CreatorContentPage = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newAsset, setNewAsset] = useState({
        title: '',
        type: 'Image',
        description: '',
        mediaUrl: '',
        pricingTiers: { Organic: 0, PaidAds: 500, Website: 250, Email: 150, Exclusive: 2000 }
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/licensing/creator/assets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.status === 'success') {
                setAssets(data.data);
            }
        } catch (error) {
            console.error('Error fetching assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAsset = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/licensing/assets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newAsset)
            });
            const data = await response.json();
            if (data.status === 'success') {
                setAssets([data.data, ...assets]);
                setShowAddModal(false);
                setNewAsset({
                    title: '',
                    type: 'Image',
                    description: '',
                    mediaUrl: '',
                    pricingTiers: { Organic: 0, PaidAds: 500, Website: 250, Email: 150, Exclusive: 2000 }
                });
            }
        } catch (error) {
            console.error('Error creating asset:', error);
        }
    };

    const handleToggleLicensable = async (assetId, currentValue) => {
        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/licensing/assets/${assetId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isLicensable: !currentValue })
            });
            setAssets(assets.map(a => 
                a.id === assetId ? { ...a, isLicensable: !currentValue } : a
            ));
        } catch (error) {
            console.error('Error updating asset:', error);
        }
    };

    const styles = {
        container: {
            padding: '24px',
            color: '#fff',
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
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
        addBtn: {
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        statsRow: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
        },
        statCard: {
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '20px'
        },
        statLabel: {
            fontSize: '13px',
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '4px'
        },
        statValue: {
            fontSize: '24px',
            fontWeight: '700'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
        },
        card: {
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            overflow: 'hidden',
            transition: 'all 0.2s ease'
        },
        cardImage: {
            height: '160px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
        },
        cardBody: {
            padding: '16px'
        },
        cardTitle: {
            fontSize: '16px',
            fontWeight: '600',
            margin: '0 0 4px'
        },
        typeBadge: {
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#a78bfa'
        },
        licenseToggle: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px'
        },
        toggleLabel: {
            fontSize: '13px',
            color: 'rgba(255,255,255,0.7)'
        },
        toggle: {
            width: '44px',
            height: '24px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.2)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'background 0.2s ease'
        },
        toggleActive: {
            background: '#10b981'
        },
        toggleKnob: {
            position: 'absolute',
            top: '2px',
            left: '2px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#fff',
            transition: 'transform 0.2s ease'
        },
        toggleKnobActive: {
            transform: 'translateX(20px)'
        },
        licensesCount: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '8px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: '16px',
            border: '1px dashed rgba(255,255,255,0.1)'
        },
        // Modal styles
        modalOverlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        },
        modal: {
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            color: '#fff'
        },
        input: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            marginBottom: '16px',
            fontSize: '14px'
        },
        select: {
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: '#fff',
            marginBottom: '16px',
            fontSize: '14px'
        },
        btnRow: {
            display: 'flex',
            gap: '12px',
            marginTop: '16px'
        },
        btnSecondary: {
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer'
        },
        btnPrimary: {
            flex: 1,
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: '600'
        }
    };

    const totalLicenses = assets.reduce((sum, a) => sum + (a.licenses?.length || 0), 0);
    const licensableCount = assets.filter(a => a.isLicensable).length;

    if (loading) {
        return (
            <div style={styles.container}>
                <div style={{ textAlign: 'center', padding: '60px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏳</div>
                    <p>Loading your content...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>🖼️ My Content</h1>
                    <p style={styles.subtitle}>Manage your licensable content assets</p>
                </div>
                <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
                    <span>➕</span> Add Content
                </button>
            </div>

            {/* Stats */}
            <div style={styles.statsRow}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Assets</div>
                    <div style={styles.statValue}>{assets.length}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Available for Licensing</div>
                    <div style={styles.statValue}>{licensableCount}</div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Active Licenses</div>
                    <div style={styles.statValue}>{totalLicenses}</div>
                </div>
            </div>

            {/* Asset Grid */}
            {assets.length === 0 ? (
                <div style={styles.emptyState}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
                    <h3 style={{ margin: '0 0 8px' }}>No content yet</h3>
                    <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0 0 16px' }}>
                        Add your first content asset to start licensing
                    </p>
                    <button style={styles.addBtn} onClick={() => setShowAddModal(true)}>
                        <span>➕</span> Add Content
                    </button>
                </div>
            ) : (
                <div style={styles.grid}>
                    {assets.map((asset, index) => (
                        <motion.div
                            key={asset.id}
                            style={styles.card}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ borderColor: 'rgba(139, 92, 246, 0.5)' }}
                        >
                            <div style={styles.cardImage}>
                                {asset.thumbnailUrl ? (
                                    <img src={asset.thumbnailUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    asset.type === 'Video' ? '🎬' : '🖼️'
                                )}
                            </div>
                            <div style={styles.cardBody}>
                                <h3 style={styles.cardTitle}>{asset.title}</h3>
                                <span style={styles.typeBadge}>{asset.type}</span>

                                <div style={styles.licenseToggle}>
                                    <span style={styles.toggleLabel}>Available for Licensing</span>
                                    <div 
                                        style={{
                                            ...styles.toggle,
                                            ...(asset.isLicensable ? styles.toggleActive : {})
                                        }}
                                        onClick={() => handleToggleLicensable(asset.id, asset.isLicensable)}
                                    >
                                        <div style={{
                                            ...styles.toggleKnob,
                                            ...(asset.isLicensable ? styles.toggleKnobActive : {})
                                        }} />
                                    </div>
                                </div>

                                {asset.licenses?.length > 0 && (
                                    <div style={styles.licensesCount}>
                                        {asset.licenses.length} active license(s)
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
                    <div style={styles.modal} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0 }}>➕ Add Content Asset</h2>
                        
                        <input
                            style={styles.input}
                            placeholder="Title"
                            value={newAsset.title}
                            onChange={e => setNewAsset({ ...newAsset, title: e.target.value })}
                        />

                        <select
                            style={styles.select}
                            value={newAsset.type}
                            onChange={e => setNewAsset({ ...newAsset, type: e.target.value })}
                        >
                            <option value="Image">Image</option>
                            <option value="Video">Video</option>
                            <option value="Carousel">Carousel</option>
                            <option value="Story">Story</option>
                            <option value="Reel">Reel</option>
                        </select>

                        <textarea
                            style={{ ...styles.input, minHeight: '80px' }}
                            placeholder="Description (optional)"
                            value={newAsset.description}
                            onChange={e => setNewAsset({ ...newAsset, description: e.target.value })}
                        />

                        <input
                            style={styles.input}
                            placeholder="Media URL (optional)"
                            value={newAsset.mediaUrl}
                            onChange={e => setNewAsset({ ...newAsset, mediaUrl: e.target.value })}
                        />

                        <div style={styles.btnRow}>
                            <button style={styles.btnSecondary} onClick={() => setShowAddModal(false)}>
                                Cancel
                            </button>
                            <button 
                                style={styles.btnPrimary} 
                                onClick={handleCreateAsset}
                                disabled={!newAsset.title}
                            >
                                Create Asset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorContentPage;
