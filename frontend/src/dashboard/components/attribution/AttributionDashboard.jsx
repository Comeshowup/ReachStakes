import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Target,
    Info,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Award,
    MousePointer,
    Eye,
    RefreshCw
} from 'lucide-react';
import TrackingBundleGenerator from './TrackingBundleGenerator';
import RevenueChart from './RevenueChart';
import CreatorDetailModal from './CreatorDetailModal';
import api from '../../../api/axios';

// KPI Card Component
const KPICard = ({ title, value, change, trend, icon: Icon, color, delay = 0 }) => {
    const isPositive = trend === 'up';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {change && (
                        <div className={`flex items-center mt-2 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPositive ? (
                                <TrendingUp className="w-4 h-4 mr-1" />
                            ) : (
                                <TrendingDown className="w-4 h-4 mr-1" />
                            )}
                            <span className="text-sm font-medium">{change}</span>
                        </div>
                    )}
                </div>
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
        </motion.div>
    );
};

// Confidence Badge
const ConfidenceBadge = ({ score }) => {
    const getConfig = (s) => {
        if (s >= 90) return { label: 'HIGH', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
        if (s >= 70) return { label: 'MEDIUM', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
        return { label: 'LOW', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    };

    const config = getConfig(score || 0);

    return (
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-bold ${config.color}`}>
            {config.label} {score ? `(${score}%)` : ''}
        </div>
    );
};

// Verification Badge
const VerificationBadge = ({ tier }) => {
    if (!tier || tier === 'None') return null;

    const colors = {
        Silver: 'text-slate-400',
        Gold: 'text-amber-400',
        Black: 'text-slate-200'
    };

    return (
        <Award className={`w-4 h-4 ${colors[tier] || 'text-slate-400'}`} />
    );
};

// Creator Row in Attribution Table
const CreatorRow = ({ result, onClick }) => {
    const creator = result.creator;
    const profile = creator?.creatorProfile;

    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            className="border-b border-white/5 cursor-pointer transition-colors"
            onClick={() => onClick && onClick(result)}
        >
            <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                    <img
                        src={profile?.avatarUrl || '/default-avatar.png'}
                        alt={creator?.name || 'Creator'}
                        className="w-10 h-10 rounded-full object-cover bg-slate-700"
                    />
                    <div>
                        <p className="text-white font-medium">{creator?.name || 'Unknown'}</p>
                        <p className="text-slate-400 text-sm">@{profile?.handle || 'creator'}</p>
                    </div>
                    <VerificationBadge tier={profile?.verificationTier} />
                </div>
            </td>
            <td className="py-4 px-4 text-slate-300">
                ₹{parseFloat(result.creatorCost || 0).toLocaleString()}
            </td>
            <td className="py-4 px-4 text-white font-semibold">
                ₹{parseFloat(result.totalRevenue || 0).toLocaleString()}
            </td>
            <td className="py-4 px-4">
                <span className={`font-semibold ${parseFloat(result.roas || 0) >= 1 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.roas ? `${result.roas}x` : '—'}
                </span>
            </td>
            <td className="py-4 px-4 text-slate-300">
                {result.totalConversions || 0}
            </td>
            <td className="py-4 px-4 text-slate-300">
                {result.totalClicks || 0}
            </td>
            <td className="py-4 px-4 text-slate-300">
                {result.conversionRate ? `${result.conversionRate}%` : '—'}
            </td>
            <td className="py-4 px-4">
                <ExternalLink className="w-4 h-4 text-slate-400 hover:text-white transition" />
            </td>
        </motion.tr>
    );
};

// Attribution Explainer Panel
const AttributionExplainer = ({ model, window: attributionWindow }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition"
            >
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-violet-400" />
                    <span className="text-slate-300 text-sm">How was this calculated?</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="px-4 pb-4 text-sm text-slate-400"
                >
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <p className="text-slate-500">Attribution Model</p>
                            <p className="text-white font-medium capitalize">
                                {model?.replace('_', ' ') || 'Last Click'}
                            </p>
                        </div>
                        <div>
                            <p className="text-slate-500">Attribution Window</p>
                            <p className="text-white font-medium">{attributionWindow || 14} days</p>
                        </div>
                    </div>
                    <p className="mt-4 text-slate-500">
                        Revenue is attributed to the creator whose tracking link was the last non-direct
                        click before a conversion, within the attribution window. Multiple creators may
                        be shown as "assisted" if they contributed to the customer journey.
                    </p>
                </motion.div>
            )}
        </div>
    );
};

// Empty State
const EmptyState = () => (
    <div className="text-center py-16">
        <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-violet-400" />
        </div>
        <h3 className="text-white font-semibold text-lg mb-2">No Attribution Data Yet</h3>
        <p className="text-slate-400 max-w-md mx-auto">
            Tracking will begin once creators start driving traffic using their unique links.
            Generate tracking bundles for approved creators to get started.
        </p>
    </div>
);

// Main Attribution Dashboard
const AttributionDashboard = ({ campaignId: propCampaignId }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [campaigns, setCampaigns] = useState([]);
    const [selectedCampaignId, setSelectedCampaignId] = useState(propCampaignId || null);
    const [selectedCreator, setSelectedCreator] = useState(null);

    // Helper to decode JWT and get user ID
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;

            // Decode JWT payload (base64)
            const payload = token.split('.')[1];
            const decoded = JSON.parse(atob(payload));
            return decoded.id;
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    };

    // Fetch campaigns for the brand if no campaignId provided
    const fetchCampaigns = async () => {
        try {
            // Get user ID from JWT token
            const userId = getUserIdFromToken();

            if (!userId) {
                console.error('No user ID found in token');
                setLoading(false);
                return;
            }

            // Fetch campaigns for this brand
            const response = await api.get(`/campaigns/brand/${userId}`);
            const campaignList = response.data.campaigns || response.data.data || response.data || [];

            // Handle if it's an array directly or nested
            const finalList = Array.isArray(campaignList) ? campaignList : [];
            setCampaigns(finalList);

            // Auto-select first campaign if any
            if (finalList.length > 0 && !selectedCampaignId) {
                setSelectedCampaignId(finalList[0].id);
            }
            if (finalList.length === 0) {
                setLoading(false);
            }
        } catch (err) {
            console.error('Failed to fetch campaigns:', err);
            setLoading(false);
        }
    };


    const fetchResults = async () => {

        if (!selectedCampaignId) return;

        try {
            setRefreshing(true);
            const response = await api.get(`/attribution/results/${selectedCampaignId}`);
            setData(response.data.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (!propCampaignId) {
            fetchCampaigns();
        } else {
            setSelectedCampaignId(propCampaignId);
        }
    }, [propCampaignId]);

    useEffect(() => {
        if (selectedCampaignId) {
            fetchResults();
        }
    }, [selectedCampaignId]);

    // No campaigns state
    if (!loading && campaigns.length === 0 && !propCampaignId) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-violet-500/20 rounded-full flex items-center justify-center mb-4">
                    <Target className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">No Campaigns Found</h3>
                <p className="text-slate-400 max-w-md text-center">
                    Create a campaign first to start tracking attribution data.
                </p>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500" />
            </div>
        );
    }


    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-400 mb-4">Error loading attribution data</div>
                <p className="text-slate-500 text-sm">{error}</p>
                <button
                    onClick={fetchResults}
                    className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const { results, totals, attributionModel, attributionWindow } = data || {};

    // Calculate confidence score based on data volume
    const confidenceScore = totals?.totalConversions >= 100 ? 95 :
        totals?.totalConversions >= 50 ? 85 :
            totals?.totalConversions >= 20 ? 70 :
                totals?.totalConversions >= 5 ? 55 : 30;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">Attribution Dashboard</h2>
                    <p className="text-slate-400 text-sm mt-1">Per-creator performance tracking</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Campaign Selector - only show when we have multiple campaigns */}
                    {campaigns.length > 0 && !propCampaignId && (
                        <select
                            value={selectedCampaignId || ''}
                            onChange={(e) => setSelectedCampaignId(parseInt(e.target.value))}
                            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 focus:outline-none focus:border-violet-500 transition"
                        >
                            {campaigns.map((c) => (
                                <option key={c.id} value={c.id} className="bg-slate-800">
                                    {c.title}
                                </option>
                            ))}
                        </select>
                    )}
                    {/* Bulk Generator */}
                    {selectedCampaignId && (
                        <TrackingBundleGenerator
                            campaignId={selectedCampaignId}
                            onSuccess={() => {
                                fetchResults();
                                setRefreshing(true);
                                setTimeout(() => setRefreshing(false), 1000);
                            }}
                            variant="button"
                        />
                    )}
                    <button
                        onClick={fetchResults}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Revenue Chart */}
            <RevenueChart campaignId={selectedCampaignId} />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard

                    title="Total Revenue"
                    value={`₹${(totals?.totalRevenue || 0).toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    delay={0}
                />
                <KPICard
                    title="Overall ROAS"
                    value={`${totals?.overallRoas || 0}x`}
                    icon={TrendingUp}
                    color="bg-violet-500"
                    delay={1}
                />
                <KPICard
                    title="Total Conversions"
                    value={(totals?.totalConversions || 0).toLocaleString()}
                    icon={Target}
                    color="bg-amber-500"
                    delay={2}
                />
                <KPICard
                    title="Total Clicks"
                    value={(totals?.totalClicks || 0).toLocaleString()}
                    icon={MousePointer}
                    color="bg-blue-500"
                    delay={3}
                />
            </div>

            {/* Creator Performance Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Creator Performance</h3>
                        <p className="text-slate-400 text-sm mt-1">Per-creator attribution breakdown</p>
                    </div>
                    <ConfidenceBadge score={confidenceScore} />
                </div>

                {results && results.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white/5">
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Creator</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Spend</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Revenue</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">ROAS</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Conversions</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Clicks</th>
                                    <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">CVR</th>
                                    <th className="py-3 px-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((result) => (
                                    <CreatorRow
                                        key={result.id}
                                        result={result}
                                        onClick={(r) => setSelectedCreator({ creatorId: r.creatorId })}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </motion.div>

            {/* Attribution Explainer */}
            <AttributionExplainer model={attributionModel} window={attributionWindow} />

            {/* Creator Detail Modal */}
            <CreatorDetailModal
                isOpen={!!selectedCreator}
                onClose={() => setSelectedCreator(null)}
                campaignId={selectedCampaignId}
                creatorId={selectedCreator?.creatorId}
            />
        </div>
    );
};

export default AttributionDashboard;
