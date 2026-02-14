/**
 * CreatorRecommendationsPage
 * Brand page for "Scale this creator" recommendations
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, TrendingUp, ChevronRight, Loader2, Search,
    CheckCircle, Star, ExternalLink
} from 'lucide-react';
import axios from 'axios';

const CreatorRecommendationsPage = () => {
    const [selectedCreator, setSelectedCreator] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [recentCreators, setRecentCreators] = useState([]);

    useEffect(() => {
        fetchRecentCreators();
    }, []);

    const fetchRecentCreators = async () => {
        try {
            // Fetch creators from recent collaborations
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/collaborations/brand/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                const collabs = response.data.data || [];
                const uniqueCreators = [];
                const seen = new Set();

                collabs.forEach(c => {
                    if (c.creator && !seen.has(c.creatorId)) {
                        seen.add(c.creatorId);
                        uniqueCreators.push({
                            id: c.creatorId,
                            name: c.creator.name,
                            handle: c.creator.creatorProfile?.handle,
                            platform: c.creator.creatorProfile?.primaryPlatform,
                            followers: c.creator.creatorProfile?.followersCount,
                            avatar: c.creator.creatorProfile?.avatarUrl
                        });
                    }
                });

                setRecentCreators(uniqueCreators.slice(0, 10));
            }
        } catch (error) {
            console.error('Error fetching creators:', error);
        }
    };

    const fetchRecommendations = async (creatorId) => {
        setLoading(true);
        setSelectedCreator(creatorId);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/matching/scale/${creatorId}?limit=8`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setRecommendations(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const getTierBadge = (tier) => {
        const configs = {
            Black: { bg: 'linear-gradient(135deg, #1a1a2e, #2d2d44)', color: '#fff' },
            Gold: { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000' },
            Silver: { bg: 'linear-gradient(135deg, #94a3b8, #64748b)', color: '#fff' }
        };
        return configs[tier] || null;
    };

    const styles = {
        container: {
            padding: '32px',
            color: '#fff',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
        },
        header: {
            marginBottom: '32px'
        },
        title: {
            fontSize: '28px',
            fontWeight: '700',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
        },
        subtitle: {
            fontSize: '14px',
            color: 'rgba(255,255,255,0.5)',
            marginTop: '8px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '24px'
        },
        sidebar: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '20px'
        },
        sidebarTitle: {
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '16px'
        },
        creatorList: {
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        },
        creatorItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '10px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        },
        creatorItemActive: {
            background: 'rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
        },
        avatar: {
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600'
        },
        creatorInfo: {
            flex: 1
        },
        creatorName: {
            fontSize: '14px',
            fontWeight: '600'
        },
        creatorHandle: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)'
        },
        mainContent: {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '24px'
        },
        emptyState: {
            textAlign: 'center',
            padding: '60px 20px',
            color: 'rgba(255,255,255,0.5)'
        },
        recsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px'
        },
        recCard: {
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
            padding: '20px',
            cursor: 'pointer'
        },
        recHeader: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
        },
        recAvatar: {
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
        },
        recName: {
            fontSize: '15px',
            fontWeight: '600'
        },
        recHandle: {
            fontSize: '12px',
            color: 'rgba(255,255,255,0.5)'
        },
        similarityScore: {
            background: 'rgba(139, 92, 246, 0.2)',
            color: '#8b5cf6',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600'
        },
        reasons: {
            marginTop: '12px'
        },
        reason: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            color: 'rgba(255,255,255,0.7)',
            padding: '4px 0'
        },
        stats: {
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            gap: '16px'
        },
        stat: {
            textAlign: 'center'
        },
        statValue: {
            fontSize: '16px',
            fontWeight: '600',
            color: '#fff'
        },
        statLabel: {
            fontSize: '10px',
            color: 'rgba(255,255,255,0.5)'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    <Users size={28} color="#8b5cf6" />
                    Scale This Creator
                </h1>
                <p style={styles.subtitle}>
                    Find similar creators to expand your successful partnerships
                </p>
            </div>

            <div style={styles.grid}>
                {/* Sidebar - Recent Creators */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarTitle}>Your Creators</div>
                    <div style={styles.creatorList}>
                        {recentCreators.length === 0 ? (
                            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '20px' }}>
                                No collaborations yet
                            </div>
                        ) : (
                            recentCreators.map(creator => (
                                <motion.div
                                    key={creator.id}
                                    style={{
                                        ...styles.creatorItem,
                                        ...(selectedCreator === creator.id ? styles.creatorItemActive : {})
                                    }}
                                    onClick={() => fetchRecommendations(creator.id)}
                                    whileHover={{ background: 'rgba(255,255,255,0.05)' }}
                                >
                                    <div style={styles.avatar}>
                                        {creator.name?.charAt(0)}
                                    </div>
                                    <div style={styles.creatorInfo}>
                                        <div style={styles.creatorName}>{creator.name}</div>
                                        <div style={styles.creatorHandle}>
                                            @{creator.handle || 'unknown'} • {creator.platform}
                                        </div>
                                    </div>
                                    <ChevronRight size={16} style={{ color: 'rgba(255,255,255,0.3)' }} />
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content - Recommendations */}
                <div style={styles.mainContent}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                            <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.5)' }}>
                                Finding similar creators...
                            </p>
                        </div>
                    ) : !recommendations ? (
                        <div style={styles.emptyState}>
                            <Users size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <h3>Select a Creator</h3>
                            <p>Choose a creator from your collaborations to find similar profiles</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                                    Similar to {recommendations.originalCreator.name}
                                </h3>
                                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0 0' }}>
                                    {recommendations.recommendations.length} creators found
                                </p>
                            </div>

                            {recommendations.recommendations.length === 0 ? (
                                <div style={styles.emptyState}>
                                    <p>No similar creators found. Try selecting a different creator.</p>
                                </div>
                            ) : (
                                <div style={styles.recsGrid}>
                                    {recommendations.recommendations.map((rec, i) => {
                                        const tierBadge = getTierBadge(rec.verificationTier);
                                        return (
                                            <motion.div
                                                key={rec.id}
                                                style={styles.recCard}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                whileHover={{ scale: 1.02, borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                            >
                                                <div style={styles.recHeader}>
                                                    <div style={styles.recAvatar}>
                                                        {rec.name?.charAt(0)}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={styles.recName}>{rec.name}</div>
                                                        <div style={styles.recHandle}>
                                                            @{rec.handle} • {rec.platform}
                                                        </div>
                                                    </div>
                                                    <div style={styles.similarityScore}>
                                                        {rec.similarityScore}% match
                                                    </div>
                                                </div>

                                                {tierBadge && (
                                                    <div style={{
                                                        display: 'inline-block',
                                                        padding: '3px 10px',
                                                        borderRadius: '8px',
                                                        fontSize: '11px',
                                                        fontWeight: '600',
                                                        background: tierBadge.bg,
                                                        color: tierBadge.color
                                                    }}>
                                                        ✓ {rec.verificationTier} Tier
                                                    </div>
                                                )}

                                                <div style={styles.reasons}>
                                                    {rec.reasons.map((reason, j) => (
                                                        <div key={j} style={styles.reason}>
                                                            <CheckCircle size={12} color="#10b981" />
                                                            {reason}
                                                        </div>
                                                    ))}
                                                </div>

                                                <div style={styles.stats}>
                                                    <div style={styles.stat}>
                                                        <div style={styles.statValue}>
                                                            {rec.followers ?
                                                                (rec.followers >= 1000000
                                                                    ? `${(rec.followers / 1000000).toFixed(1)}M`
                                                                    : rec.followers >= 1000
                                                                        ? `${(rec.followers / 1000).toFixed(1)}K`
                                                                        : rec.followers
                                                                ) : 'N/A'
                                                            }
                                                        </div>
                                                        <div style={styles.statLabel}>Followers</div>
                                                    </div>
                                                    <div style={styles.stat}>
                                                        <div style={styles.statValue}>
                                                            {rec.engagementRate ? `${parseFloat(rec.engagementRate).toFixed(1)}%` : 'N/A'}
                                                        </div>
                                                        <div style={styles.statLabel}>Engagement</div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorRecommendationsPage;
