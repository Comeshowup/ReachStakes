import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Link as LinkIcon,
    Tag,
    Ticket,
    Copy,
    Check,
    QrCode,
    TrendingUp,
    MousePointer,
    ShoppingCart,
    DollarSign,
    Sparkles,
    ExternalLink,
    RefreshCw,
    Eye
} from 'lucide-react';
import api from '../../../api/axios';

// Copy Button Component
const CopyButton = ({ text, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition text-sm font-medium ${copied
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : label || 'Copy'}
        </button>
    );
};

// Tracking Code Row
const TrackingCodeRow = ({ icon: Icon, label, value, showQR, onQRClick }) => (
    <div className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
        <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/20">
                <Icon className="w-5 h-5 text-violet-400" />
            </div>
            <div>
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-white font-mono text-lg">{value}</p>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <CopyButton text={value} />
            {showQR && (
                <button
                    onClick={onQRClick}
                    className="p-2 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition"
                >
                    <QrCode className="w-4 h-4" />
                </button>
            )}
        </div>
    </div>
);

// Impact Stat Card
const ImpactCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-white/20 transition"
    >
        <Icon className={`w-6 h-6 mx-auto ${color}`} />
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
        {trend && (
            <div className="flex items-center justify-center gap-1 mt-1 text-emerald-400 text-xs">
                <TrendingUp className="w-3 h-3" />
                {trend}
            </div>
        )}
    </motion.div>
);

// Empty/Pending State
const PendingState = ({ status }) => (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <LinkIcon className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">
            {status === 'pending' ? 'Tracking Pending Approval' : 'Tracking Not Available Yet'}
        </h3>
        <p className="text-slate-400 max-w-md mx-auto">
            {status === 'pending'
                ? 'Your tracking links will be active once your application is approved.'
                : 'Your unique tracking links will be generated when you get approved for campaigns.'}
        </p>
    </div>
);

// Main Creator Tracking Hub
const CreatorTrackingHub = ({ collaborationId }) => {
    const [loading, setLoading] = useState(true);
    const [bundle, setBundle] = useState(null);
    const [attribution, setAttribution] = useState(null);
    const [error, setError] = useState(null);

    // Helper to decode JWT and get user ID
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.id;
        } catch (e) {
            return null;
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch tracking bundle
            const bundleRes = await api.get(`/attribution/bundle/${collaborationId}`);
            setBundle(bundleRes.data.data);

            // Fetch attribution results for this creator
            const userId = getUserIdFromToken();
            if (userId) {
                try {
                    const attrRes = await api.get(`/attribution/results/creator/${userId}`);
                    const results = attrRes.data.data?.results || [];
                    // Find the result for this specific campaign/collaboration
                    const thisResult = results.find(r => r.collaborationId === parseInt(collaborationId));
                    if (thisResult) {
                        setAttribution(thisResult);
                    }
                } catch (attrErr) {
                    console.log('No attribution data yet');
                }
            }

            setError(null);
        } catch (err) {
            if (err.response?.status === 404) {
                // Bundle not generated yet - this is OK, show pending state
                setBundle(null);
            } else {
                setError(err.response?.data?.error || err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (collaborationId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [collaborationId]);

    // Generate QR code (placeholder - could integrate a real QR library)
    const handleQRClick = () => {
        // Could open a modal with QR code
        alert('QR Code feature coming soon! Share your short link directly for now.');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">Error loading tracking data</div>
                <p className="text-slate-500 text-sm">{error}</p>
                <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!bundle) {
        return <PendingState status="pending" />;
    }

    // Use real attribution data or fallback to 0
    const stats = {
        clicks: attribution?.totalClicks || 0,
        conversions: attribution?.totalConversions || 0,
        revenue: parseFloat(attribution?.totalRevenue || 0)
    };

    return (
        <div className="space-y-6">
            {/* Campaign Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 border border-violet-500/30 rounded-2xl p-6"
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {bundle.campaign?.title || 'Campaign'}
                        </h2>
                        <p className="text-violet-200/70 mt-1">Your personalized tracking links</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${bundle.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                        }`}>
                        {bundle.isActive ? 'Active' : 'Inactive'}
                    </span>
                </div>
            </motion.div>

            {/* Tracking Codes */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Your Tracking Link</h3>
                    <button
                        onClick={() => window.open(bundle.trackingUrl, '_blank')}
                        className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Test Link
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Primary: Full Tracking URL */}
                    <div className="p-4 bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/30 rounded-xl">
                        <p className="text-sm text-violet-300 mb-2 font-medium">Share this link in your content</p>
                        <div className="flex items-center gap-3">
                            <code className="flex-1 text-sm text-white bg-black/30 px-3 py-2 rounded-lg break-all">
                                {bundle.trackingUrl}
                            </code>
                            <CopyButton text={bundle.trackingUrl} label="Copy" />
                        </div>
                    </div>

                    {/* Affiliate Code */}
                    <TrackingCodeRow
                        icon={Tag}
                        label="Your Affiliate Code"
                        value={bundle.affiliateCode}
                    />

                    {bundle.couponCode && (
                        <TrackingCodeRow
                            icon={Ticket}
                            label="Coupon Code"
                            value={bundle.couponCode}
                        />
                    )}
                </div>
            </motion.div>

            {/* Your Impact */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Your Impact</h3>
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <ImpactCard
                        icon={MousePointer}
                        label="Clicks"
                        value={stats.clicks.toLocaleString()}
                        color="text-blue-400"
                    />
                    <ImpactCard
                        icon={ShoppingCart}
                        label="Conversions"
                        value={stats.conversions.toLocaleString()}
                        color="text-emerald-400"
                    />
                    <ImpactCard
                        icon={DollarSign}
                        label="Revenue"
                        value={`₹${stats.revenue.toLocaleString()}`}
                        color="text-amber-400"
                    />
                </div>

                {stats.clicks === 0 && (
                    <p className="text-center text-slate-500 text-sm mt-4">
                        Start sharing your tracking link to see your impact here!
                    </p>
                )}
            </motion.div>

            {/* Pro Tip */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3"
            >
                <Sparkles className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="text-amber-200 font-medium">Pro Tip: Build Your Proof</p>
                    <p className="text-amber-200/70 text-sm mt-1">
                        This data proves your value. High-performing creators use their performance stats
                        to negotiate 2-3x higher rates for future campaigns!
                    </p>
                </div>
            </motion.div>

            {/* How It Works */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
                <h4 className="text-white font-medium mb-3">How Attribution Works</h4>
                <ol className="space-y-2 text-sm text-slate-400">
                    <li className="flex items-start gap-2">
                        <span className="text-violet-400 font-bold">1.</span>
                        Share your tracking link or code with your audience
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-violet-400 font-bold">2.</span>
                        When followers click and purchase, we track the conversion
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-violet-400 font-bold">3.</span>
                        You get credit for the sale within a 14-day window
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-violet-400 font-bold">4.</span>
                        Higher conversions = better proof for future campaigns
                    </li>
                </ol>
            </motion.div>
        </div>
    );
};

export default CreatorTrackingHub;
