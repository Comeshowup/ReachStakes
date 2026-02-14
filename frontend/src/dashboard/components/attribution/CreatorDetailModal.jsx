import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    TrendingUp,
    DollarSign,
    MousePointer,
    ShoppingCart,
    Clock,
    Download,
    ExternalLink,
    ArrowRight,
    Award,
    Copy,
    Check
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid
} from 'recharts';
import api from '../../../api/axios';

// Copy Button Component
const CopyButton = ({ text, size = 'sm' }) => {
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
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition ${copied
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/10 text-slate-400 hover:bg-white/20 hover:text-white'
                } ${size === 'sm' ? 'text-xs' : 'text-sm'}`}
        >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

// Verification Badge
const VerificationBadge = ({ tier }) => {
    if (!tier || tier === 'None') return null;

    const config = {
        Gold: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        Black: 'bg-slate-500/20 text-slate-200 border-slate-500/30',
        Silver: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config[tier] || config.Silver}`}>
            <Award className="w-3 h-3 inline mr-1" />
            {tier} Verified
        </span>
    );
};

const CreatorDetailModal = ({ isOpen, onClose, campaignId, creatorId }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!isOpen || !campaignId || !creatorId) return;

            try {
                setLoading(true);
                setError(null);
                const res = await api.get(`/attribution/detail/${campaignId}/${creatorId}`);
                setData(res.data.data);
            } catch (err) {
                console.error('Failed to fetch creator detail:', err);
                setError(err.response?.data?.error || 'Failed to load creator details');
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [isOpen, campaignId, creatorId]);

    if (!isOpen) return null;

    const result = data?.result;
    const creator = result?.creator;
    const profile = creator?.creatorProfile;

    const formatCurrency = (val) => `₹${parseFloat(val || 0).toLocaleString()}`;

    // Custom tooltip for chart
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-slate-900/95 border border-white/10 rounded-lg p-3 shadow-xl text-sm">
                    <p className="text-slate-300 mb-1">
                        {new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-1">
                        {payload.map((p, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                                <span className="text-slate-400">{p.name}:</span>
                                <span className="text-white">{p.name === 'revenue' ? formatCurrency(p.value) : p.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto mb-4" />
                                <p className="text-slate-400">Loading creator details...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-24">
                            <p className="text-red-400 mb-4">{error}</p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-white/10 rounded-lg text-slate-300 hover:bg-white/20 transition"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-y-auto max-h-[90vh]">
                            {/* Header */}
                            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6 flex items-center justify-between z-10">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={profile?.avatarUrl || '/default-avatar.png'}
                                        alt={creator?.name}
                                        className="w-14 h-14 rounded-full object-cover bg-slate-700 ring-2 ring-violet-500/30"
                                    />
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{creator?.name}</h2>
                                        <p className="text-slate-400">@{profile?.handle}</p>
                                    </div>
                                    <VerificationBadge tier={profile?.verificationTier} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Conversion Funnel */}
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-white font-semibold mb-5 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-violet-400" />
                                    Conversion Funnel
                                </h3>
                                <div className="flex items-center justify-center gap-2">
                                    {[
                                        {
                                            label: 'Clicks',
                                            value: result?.totalClicks || 0,
                                            percent: '100%',
                                            color: 'from-blue-500 to-blue-600'
                                        },
                                        {
                                            label: 'Conversions',
                                            value: result?.totalConversions || 0,
                                            percent: result?.conversionRate ? `${result.conversionRate}%` : '0%',
                                            color: 'from-emerald-500 to-emerald-600'
                                        },
                                    ].map((step, i) => (
                                        <React.Fragment key={step.label}>
                                            <div className="text-center flex-1 max-w-[200px]">
                                                <div className={`bg-gradient-to-br ${step.color} rounded-xl p-4 mb-3`}>
                                                    <p className="text-3xl font-bold text-white">
                                                        {step.value.toLocaleString()}
                                                    </p>
                                                </div>
                                                <p className="text-white font-medium">{step.label}</p>
                                                <p className="text-slate-400 text-sm">{step.percent} rate</p>
                                            </div>
                                            {i < 1 && (
                                                <ArrowRight className="w-6 h-6 text-slate-600 flex-shrink-0 mx-4" />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            {/* Key Metrics */}
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-white font-semibold mb-4">Key Metrics</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-emerald-500/30 transition">
                                        <DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(result?.totalRevenue)}
                                        </p>
                                        <p className="text-slate-400 text-sm">Revenue Generated</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-violet-500/30 transition">
                                        <TrendingUp className="w-6 h-6 text-violet-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">
                                            {result?.roas || 0}x
                                        </p>
                                        <p className="text-slate-400 text-sm">ROAS</p>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center hover:border-amber-500/30 transition">
                                        <ShoppingCart className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                                        <p className="text-2xl font-bold text-white">
                                            {formatCurrency(result?.costPerConversion)}
                                        </p>
                                        <p className="text-slate-400 text-sm">Cost per Conversion</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Links */}
                            {data?.trackingBundle && (
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-white font-semibold mb-4">Tracking Links</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div>
                                                <p className="text-slate-400 text-xs mb-1">Affiliate Code</p>
                                                <p className="text-white font-mono">{data.trackingBundle.affiliateCode}</p>
                                            </div>
                                            <CopyButton text={data.trackingBundle.affiliateCode} />
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="text-slate-400 text-xs mb-1">Short Link</p>
                                                <p className="text-white font-mono text-sm truncate">{data.trackingBundle.shortLinkUrl}</p>
                                            </div>
                                            <CopyButton text={data.trackingBundle.shortLinkUrl} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Daily Chart */}
                            {data?.dailyStats?.length > 0 && (
                                <div className="p-6 border-b border-white/5">
                                    <h3 className="text-white font-semibold mb-4">Daily Performance (Last 14 Days)</h3>
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={data.dailyStats}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                <XAxis
                                                    dataKey="date"
                                                    stroke="rgba(255,255,255,0.2)"
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                                    tickFormatter={(d) => new Date(d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    stroke="rgba(255,255,255,0.2)"
                                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <Tooltip content={<CustomTooltip />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="revenue"
                                                    stroke="#8B5CF6"
                                                    strokeWidth={2}
                                                    dot={false}
                                                    name="revenue"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="clicks"
                                                    stroke="#3B82F6"
                                                    strokeWidth={1.5}
                                                    dot={false}
                                                    name="clicks"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="flex items-center gap-6 mt-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-0.5 bg-violet-500 rounded" />
                                            <span className="text-slate-400">Revenue</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-0.5 bg-blue-500 rounded" />
                                            <span className="text-slate-400">Clicks</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recent Events */}
                            {data?.recentEvents?.length > 0 && (
                                <div className="p-6">
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-slate-400" />
                                        Recent Events
                                    </h3>
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                                        {data.recentEvents.slice(0, 15).map((event) => (
                                            <div
                                                key={event.id}
                                                className="flex items-center justify-between py-2.5 px-3 bg-white/5 rounded-lg hover:bg-white/8 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2.5 h-2.5 rounded-full ${event.eventType === 'Purchase'
                                                            ? 'bg-emerald-400'
                                                            : event.eventType === 'Click'
                                                                ? 'bg-blue-400'
                                                                : 'bg-slate-400'
                                                        }`} />
                                                    <span className="text-white text-sm font-medium">{event.eventType}</span>
                                                    {event.orderValue && (
                                                        <span className="text-emerald-400 text-sm font-semibold">
                                                            {formatCurrency(event.orderValue)}
                                                        </span>
                                                    )}
                                                    {event.orderId && (
                                                        <span className="text-slate-500 text-xs">
                                                            #{event.orderId}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-slate-500 text-xs">
                                                    {new Date(event.eventTimestamp).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur-sm border-t border-white/10 p-6 flex items-center justify-between">
                                <div className="text-slate-500 text-sm">
                                    Last updated: {result?.lastCalculatedAt
                                        ? new Date(result.lastCalculatedAt).toLocaleString()
                                        : 'Never'}
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition">
                                        <Download className="w-4 h-4" />
                                        Export Report
                                    </button>
                                    {result?.collaboration?.submissionUrl && (
                                        <a
                                            href={result.collaboration.submissionUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-white transition"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View Content
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreatorDetailModal;
