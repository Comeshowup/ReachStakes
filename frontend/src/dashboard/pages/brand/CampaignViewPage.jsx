import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Settings,
    Pause,
    Play,
    CheckCircle,
    Clock,
    Users,
    DollarSign,
    TrendingUp,
    Eye,
    FileText,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    AlertCircle,
    Loader2,
    Activity,
    Target
} from 'lucide-react';

import { getCampaignViewData, getCampaignActivity, updateCampaignStatus } from '../../../api/campaignViewService';

// Status badge component
const StatusBadge = ({ status }) => {
    const statusStyles = {
        Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        Paused: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        Draft: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        Under_Review: 'bg-purple-500/15 text-purple-400 border-purple-500/30 animate-pulse',
        In_Progress: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
        Applied: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
        Approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        Paid: 'bg-green-500/15 text-green-400 border-green-500/30'
    };
    return (
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${statusStyles[status] || statusStyles.Draft}`}>
            {status?.replace('_', ' ')}
        </span>
    );
};

// Summary card component
const SummaryCard = ({ icon: Icon, title, value, subtitle, color = 'indigo' }) => {
    const colorClasses = {
        indigo: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/20',
        emerald: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20',
        amber: 'from-amber-500/10 to-orange-500/10 border-amber-500/20',
        blue: 'from-blue-500/10 to-cyan-500/10 border-blue-500/20'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${colorClasses[color]} border rounded-xl p-5 backdrop-blur-sm`}
        >
            <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/5 rounded-lg">
                    <Icon className="w-5 h-5 text-slate-400" />
                </div>
                <span className="text-sm text-slate-400">{title}</span>
            </div>
            <p className="text-2xl font-bold text-white">{value || '—'}</p>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </motion.div>
    );
};

// Pipeline stage component
const PipelineStage = ({ label, count, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-3 px-4 rounded-lg text-center transition-all duration-200 ${isActive
            ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
            : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
            }`}
    >
        <p className="text-2xl font-bold">{count}</p>
        <p className="text-xs mt-1">{label}</p>
    </button>
);

// Creator row component with expandable details
const CreatorRow = ({ creator, isExpanded, onToggle }) => {
    return (
        <div className="border-b border-slate-800/50 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full px-4 py-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors text-left"
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                    {creator.avatar ? (
                        <img src={creator.avatar} alt={creator.name} className="w-full h-full object-cover" />
                    ) : (
                        creator.name?.charAt(0)?.toUpperCase() || 'C'
                    )}
                </div>

                {/* Name & Handle */}
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{creator.name}</p>
                    <p className="text-sm text-slate-500 truncate">@{creator.handle || 'creator'}</p>
                </div>

                {/* Platform */}
                <div className="hidden md:block">
                    <span className="px-2 py-1 text-xs bg-slate-800 text-slate-400 rounded">
                        {creator.platform}
                    </span>
                </div>

                {/* Status */}
                <StatusBadge status={creator.status} />

                {/* Performance */}
                <div className="hidden lg:block text-right">
                    <p className="text-white text-sm">
                        {creator.reach ? `${(creator.reach / 1000).toFixed(1)}K reach` : '—'}
                    </p>
                    <p className="text-xs text-slate-500">
                        {creator.engagement ? `${creator.engagement}% eng` : 'No metrics'}
                    </p>
                </div>

                {/* Expand icon */}
                <div className="text-slate-500">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>

            {/* Expandable details */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-slate-900/50"
                    >
                        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Submission details */}
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Submission</p>
                                {creator.submissionUrl ? (
                                    <a
                                        href={creator.submissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 text-sm"
                                    >
                                        View Content <ExternalLink className="w-3 h-3" />
                                    </a>
                                ) : (
                                    <p className="text-slate-600 text-sm">Not submitted yet</p>
                                )}
                            </div>

                            {/* Milestones */}
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Milestones</p>
                                <div className="flex gap-1">
                                    {Object.entries(creator.milestones || {}).slice(0, 5).map(([key, value]) => (
                                        <div
                                            key={key}
                                            className={`w-2 h-2 rounded-full ${value === 'complete' ? 'bg-emerald-500' :
                                                value === 'active' ? 'bg-amber-500' : 'bg-slate-700'
                                                }`}
                                            title={`${key}: ${value}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Agreed rate */}
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Agreed Rate</p>
                                <p className="text-white text-sm">
                                    {creator.agreedPrice ? `$${creator.agreedPrice.toLocaleString()}` : '—'}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// Activity log item
const ActivityItem = ({ activity }) => {
    const typeIcons = {
        payment: DollarSign,
        deposit: DollarSign,
        submission: FileText,
        approval: CheckCircle,
        join: Users,
        start: Play,
        update: Activity
    };
    const Icon = typeIcons[activity.type] || Activity;

    return (
        <div className="flex items-start gap-3 py-3">
            <div className="p-2 bg-slate-800 rounded-lg">
                <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-white">
                    <span className="font-medium">{activity.actor}</span>{' '}
                    <span className="text-slate-400">{activity.description}</span>
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                    })}
                </p>
            </div>
        </div>
    );
};

// Main component
const CampaignViewPage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();

    const [campaign, setCampaign] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCreatorId, setExpandedCreatorId] = useState(null);
    const [pipelineFilter, setPipelineFilter] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [campaignRes, activityRes] = await Promise.all([
                    getCampaignViewData(campaignId),
                    getCampaignActivity(campaignId, 10)
                ]);
                setCampaign(campaignRes.data);
                setActivities(activityRes.data || []);
            } catch (err) {
                console.error('Failed to load campaign:', err);
                setError(err.response?.data?.message || 'Failed to load campaign data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [campaignId]);

    const handleStatusChange = async (newStatus) => {
        try {
            setStatusUpdating(true);
            await updateCampaignStatus(campaignId, newStatus);
            setCampaign(prev => ({ ...prev, status: newStatus }));
        } catch (err) {
            console.error('Failed to update status:', err);
        } finally {
            setStatusUpdating(false);
        }
    };

    // Filter creators by pipeline stage
    const filteredCreators = campaign?.creators?.filter(c => {
        if (!pipelineFilter) return true;
        const statusMap = {
            submitted: 'In_Progress',
            inReview: 'Under_Review',
            approved: 'Approved',
            published: 'Paid'
        };
        return c.status === statusMap[pipelineFilter];
    }) || [];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#09090B]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                    <p className="text-slate-500">Loading campaign...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#09090B]">
                <div className="text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Unable to load campaign</h2>
                    <p className="text-slate-400 mb-4">{error}</p>
                    <button
                        onClick={() => navigate('/brand')}
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#09090B] min-h-screen overflow-y-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <button
                            onClick={() => navigate('/brand')}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-400" />
                        </button>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white">{campaign?.title}</h1>
                                <StatusBadge status={campaign?.status} />
                            </div>
                            <p className="text-slate-500 text-sm">
                                {campaign?.campaignType || 'Campaign'} • {campaign?.platformRequired || 'Multi-platform'}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {campaign?.status === 'Active' ? (
                                <button
                                    onClick={() => handleStatusChange('Paused')}
                                    disabled={statusUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-500/20 transition-colors disabled:opacity-50"
                                >
                                    <Pause className="w-4 h-4" />
                                    Pause
                                </button>
                            ) : campaign?.status === 'Paused' ? (
                                <button
                                    onClick={() => handleStatusChange('Active')}
                                    disabled={statusUpdating}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                >
                                    <Play className="w-4 h-4" />
                                    Resume
                                </button>
                            ) : null}

                            <Link
                                to={`/brand/campaign/${campaignId}/settings`}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                Settings
                            </Link>
                        </div>
                    </div>
                </motion.div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <SummaryCard
                        icon={DollarSign}
                        title="Budget"
                        value={campaign?.budgetMetrics?.totalBudget ? `$${campaign.budgetMetrics.totalBudget.toLocaleString()}` : '—'}
                        subtitle={`${campaign?.budgetMetrics?.utilizationPercent || 0}% utilized`}
                        color="indigo"
                    />
                    <SummaryCard
                        icon={Users}
                        title="Creators"
                        value={campaign?.performanceMetrics?.creatorsJoined || 0}
                        subtitle={`${campaign?.performanceMetrics?.totalCreators || 0} total applicants`}
                        color="emerald"
                    />
                    <SummaryCard
                        icon={Eye}
                        title="Total Reach"
                        value={campaign?.performanceMetrics?.totalReach ? `${(campaign.performanceMetrics.totalReach / 1000).toFixed(1)}K` : '—'}
                        subtitle={campaign?.performanceMetrics?.avgEngagementRate ? `${campaign.performanceMetrics.avgEngagementRate}% avg engagement` : 'No data yet'}
                        color="blue"
                    />
                    <SummaryCard
                        icon={Target}
                        title="Deliverables"
                        value={Object.values(campaign?.pipelineCounts || {}).reduce((a, b) => a + b, 0)}
                        subtitle={`${campaign?.pipelineCounts?.published || 0} published`}
                        color="amber"
                    />
                </div>

                {/* Content Pipeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8"
                >
                    <h2 className="text-lg font-semibold text-white mb-4">Content Pipeline</h2>
                    <div className="flex gap-3">
                        <PipelineStage
                            label="Submitted"
                            count={campaign?.pipelineCounts?.submitted || 0}
                            isActive={pipelineFilter === 'submitted'}
                            onClick={() => setPipelineFilter(pipelineFilter === 'submitted' ? null : 'submitted')}
                        />
                        <PipelineStage
                            label="In Review"
                            count={campaign?.pipelineCounts?.inReview || 0}
                            isActive={pipelineFilter === 'inReview'}
                            onClick={() => setPipelineFilter(pipelineFilter === 'inReview' ? null : 'inReview')}
                        />
                        <PipelineStage
                            label="Approved"
                            count={campaign?.pipelineCounts?.approved || 0}
                            isActive={pipelineFilter === 'approved'}
                            onClick={() => setPipelineFilter(pipelineFilter === 'approved' ? null : 'approved')}
                        />
                        <PipelineStage
                            label="Published"
                            count={campaign?.pipelineCounts?.published || 0}
                            isActive={pipelineFilter === 'published'}
                            onClick={() => setPipelineFilter(pipelineFilter === 'published' ? null : 'published')}
                        />
                    </div>
                    {pipelineFilter && (
                        <p className="text-xs text-slate-500 mt-3">
                            Showing {filteredCreators.length} creator(s) •
                            <button
                                onClick={() => setPipelineFilter(null)}
                                className="text-indigo-400 hover:text-indigo-300 ml-1"
                            >
                                Clear filter
                            </button>
                        </p>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Creator Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="font-semibold text-white">Creators</h2>
                            <span className="text-sm text-slate-500">{filteredCreators.length} creators</span>
                        </div>
                        {filteredCreators.length > 0 ? (
                            <div className="divide-y divide-slate-800/50">
                                {filteredCreators.map(creator => (
                                    <CreatorRow
                                        key={creator.id}
                                        creator={creator}
                                        isExpanded={expandedCreatorId === creator.id}
                                        onToggle={() => setExpandedCreatorId(
                                            expandedCreatorId === creator.id ? null : creator.id
                                        )}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <Users className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500">
                                    {pipelineFilter ? 'No creators in this stage' : 'No creators yet'}
                                </p>
                            </div>
                        )}
                    </motion.div>

                    {/* Activity Log */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden"
                    >
                        <div className="px-4 py-3 border-b border-slate-800">
                            <h2 className="font-semibold text-white">Recent Activity</h2>
                        </div>
                        <div className="px-4 divide-y divide-slate-800/50 max-h-96 overflow-y-auto">
                            {activities.length > 0 ? (
                                activities.map(activity => (
                                    <ActivityItem key={activity.id} activity={activity} />
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <Activity className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                                    <p className="text-slate-500 text-sm">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* AI Suggestions Panel (Advisory) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-6"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold mb-1">AI Optimization Suggestions</h3>
                            <p className="text-slate-400 text-sm mb-3">
                                These are advisory insights based on campaign performance patterns.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    Consider inviting more creators from the {campaign?.platformRequired || 'TikTok'} niche to increase reach
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-indigo-400 mt-0.5">•</span>
                                    {campaign?.pipelineCounts?.inReview > 0
                                        ? `Review ${campaign.pipelineCounts.inReview} pending submission(s) to keep momentum`
                                        : 'Campaign is running smoothly with no pending reviews'}
                                </li>
                            </ul>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CampaignViewPage;
