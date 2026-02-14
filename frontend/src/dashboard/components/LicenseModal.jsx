/**
 * LicenseModal
 * Modal for purchasing content licenses
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LICENSE_TYPES = [
    { id: 'Organic', name: 'Organic Use', description: 'Free use in organic social posts', icon: '📱' },
    { id: 'PaidAds', name: 'Paid Advertising', description: 'Use in paid social & digital ads', icon: '🎯' },
    { id: 'Website', name: 'Website Use', description: 'Use on brand website & landing pages', icon: '🌐' },
    { id: 'Email', name: 'Email Marketing', description: 'Use in email campaigns & newsletters', icon: '✉️' },
    { id: 'Exclusive', name: 'Exclusive Rights', description: 'Full exclusive usage rights', icon: '👑' }
];

const DURATION_OPTIONS = [
    { months: 3, label: '3 Months' },
    { months: 6, label: '6 Months' },
    { months: 12, label: '1 Year' },
    { months: null, label: 'Perpetual' }
];

const TERRITORY_OPTIONS = [
    { value: 'Worldwide', label: 'Worldwide' },
    { value: 'US', label: 'United States' },
    { value: 'NA', label: 'North America' },
    { value: 'EU', label: 'Europe' },
    { value: 'APAC', label: 'Asia Pacific' }
];

const LicenseModal = ({ asset, onClose, onSuccess }) => {
    const [licenseType, setLicenseType] = useState('Organic');
    const [duration, setDuration] = useState(12);
    const [territory, setTerritory] = useState('Worldwide');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get price from asset pricing tiers
    const getPrice = () => {
        if (!asset?.pricingTiers) return 0;
        return asset.pricingTiers[licenseType] || 0;
    };

    // Calculate total with duration multiplier
    const getTotal = () => {
        const basePrice = getPrice();
        if (duration === null) return basePrice * 2; // Perpetual = 2x annual
        if (duration === 3) return basePrice * 0.3;
        if (duration === 6) return basePrice * 0.6;
        return basePrice; // 12 months = base price
    };

    const handlePurchase = async () => {
        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('token');
            const response = await fetch('/api/licensing/licenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    assetId: asset.id,
                    licenseType,
                    territory,
                    durationMonths: duration
                })
            });

            const data = await response.json();

            if (data.status === 'success') {
                onSuccess?.(data.data);
                onClose();
            } else {
                setError(data.message || 'Failed to purchase license');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        },
        modal: {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            color: '#fff'
        },
        header: {
            padding: '24px 24px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        },
        closeBtn: {
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            color: '#fff',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        },
        content: {
            padding: '24px'
        },
        assetPreview: {
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
        },
        thumbnail: {
            width: '100px',
            height: '100px',
            borderRadius: '8px',
            objectFit: 'cover',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px'
        },
        section: {
            marginBottom: '24px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
        },
        typeGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
        },
        typeCard: {
            padding: '12px',
            borderRadius: '10px',
            border: '2px solid transparent',
            background: 'rgba(255, 255, 255, 0.05)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        typeCardSelected: {
            borderColor: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.15)'
        },
        optionRow: {
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
        },
        optionBtn: {
            padding: '10px 16px',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            background: 'transparent',
            color: '#fff',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontSize: '14px'
        },
        optionBtnSelected: {
            borderColor: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.2)'
        },
        priceBox: {
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.1))',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px'
        },
        priceLabel: {
            fontSize: '13px',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '8px'
        },
        priceValue: {
            fontSize: '36px',
            fontWeight: '700',
            color: '#fff'
        },
        purchaseBtn: {
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
        },
        error: {
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            padding: '12px',
            color: '#ef4444',
            marginBottom: '16px',
            fontSize: '14px'
        }
    };

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
                    <div style={styles.header}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '22px' }}>📄 License Content</h2>
                            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
                                Purchase usage rights for this content
                            </p>
                        </div>
                        <button style={styles.closeBtn} onClick={onClose}>×</button>
                    </div>

                    <div style={styles.content}>
                        {/* Asset Preview */}
                        <div style={styles.assetPreview}>
                            <div style={styles.thumbnail}>
                                {asset?.thumbnailUrl ? (
                                    <img src={asset.thumbnailUrl} alt={asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                ) : (
                                    asset?.type === 'Video' ? '🎬' : '🖼️'
                                )}
                            </div>
                            <div>
                                <h3 style={{ margin: '0 0 4px', fontSize: '16px' }}>{asset?.title}</h3>
                                <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '13px' }}>
                                    by {asset?.creator?.fullName || 'Creator'}
                                </p>
                                <span style={{
                                    display: 'inline-block',
                                    marginTop: '8px',
                                    padding: '4px 10px',
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    color: '#a78bfa'
                                }}>
                                    {asset?.type}
                                </span>
                            </div>
                        </div>

                        {/* License Type */}
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>License Type</div>
                            <div style={styles.typeGrid}>
                                {LICENSE_TYPES.map(type => (
                                    <div
                                        key={type.id}
                                        style={{
                                            ...styles.typeCard,
                                            ...(licenseType === type.id ? styles.typeCardSelected : {})
                                        }}
                                        onClick={() => setLicenseType(type.id)}
                                    >
                                        <div style={{ fontSize: '20px', marginBottom: '4px' }}>{type.icon}</div>
                                        <div style={{ fontWeight: '600', fontSize: '14px' }}>{type.name}</div>
                                        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{type.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>Duration</div>
                            <div style={styles.optionRow}>
                                {DURATION_OPTIONS.map(opt => (
                                    <button
                                        key={opt.months || 'perpetual'}
                                        style={{
                                            ...styles.optionBtn,
                                            ...(duration === opt.months ? styles.optionBtnSelected : {})
                                        }}
                                        onClick={() => setDuration(opt.months)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Territory */}
                        <div style={styles.section}>
                            <div style={styles.sectionTitle}>Territory</div>
                            <div style={styles.optionRow}>
                                {TERRITORY_OPTIONS.map(opt => (
                                    <button
                                        key={opt.value}
                                        style={{
                                            ...styles.optionBtn,
                                            ...(territory === opt.value ? styles.optionBtnSelected : {})
                                        }}
                                        onClick={() => setTerritory(opt.value)}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div style={styles.priceBox}>
                            <div style={styles.priceLabel}>Total License Fee</div>
                            <div style={styles.priceValue}>
                                {getTotal() === 0 ? 'Free' : `$${getTotal().toLocaleString()}`}
                            </div>
                        </div>

                        {error && <div style={styles.error}>{error}</div>}

                        {/* Purchase Button */}
                        <button
                            style={{
                                ...styles.purchaseBtn,
                                opacity: loading ? 0.7 : 1
                            }}
                            onClick={handlePurchase}
                            disabled={loading}
                        >
                            {loading ? '⏳ Processing...' : getTotal() === 0 ? '✓ Activate Free License' : '🔒 Purchase License'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default LicenseModal;
