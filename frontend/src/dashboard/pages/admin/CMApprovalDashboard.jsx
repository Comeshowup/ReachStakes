import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Clock,
    Users,
    CheckCircle,
    XCircle,
    ExternalLink,
    MessageSquare,
    AlertTriangle,
    Loader2,
    Play,
    ChevronRight,
    Eye,
    TrendingUp
} from "lucide-react";

import managedApprovalService from "../../../api/managedApprovalService";

/**
 * CM Approval Dashboard
 * 
 * Internal admin view for Campaign Managers to:
 * - View all escalated approval items
 * - See brand context and AI recommendations
 * - Approve or reject content on brand's behalf
 */

const CMApprovalDashboard = () => {
    const [queue, setQueue] = useState([]);
    const [stats, setStats] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [cmNotes, setCmNotes] = useState("");
    const [rejectFeedback, setRejectFeedback] = useState("");
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Fetch queue and stats on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [queueRes, statsRes] = await Promise.all([
                    managedApprovalService.getCMQueue(),
                    managedApprovalService.getCMStats()
                ]);
                setQueue(queueRes.data || []);
                setStats(statsRes.data);
                if (queueRes.data?.length > 0) {
                    setSelectedItem(queueRes.data[0]);
                }
            } catch (error) {
                console.error("Failed to fetch CM data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleApprove = async () => {
        if (!selectedItem) return;
        setActionLoading(true);
        try {
            await managedApprovalService.cmApprove(selectedItem.id, cmNotes);

            // Remove from local state
            setQueue(prev => prev.filter(item => item.id !== selectedItem.id));
            setSelectedItem(queue.find(item => item.id !== selectedItem.id) || null);
            setCmNotes("");

            // Update stats
            if (stats) {
                setStats(prev => ({
                    ...prev,
                    totalPending: prev.totalPending - 1,
                    approvedToday: prev.approvedToday + 1
                }));
            }
        } catch (error) {
            console.error("Approval failed:", error);
            alert("Failed to approve content");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!selectedItem || !rejectFeedback.trim()) {
            alert("Please provide feedback for the creator");
            return;
        }
        setActionLoading(true);
        try {
            await managedApprovalService.cmReject(selectedItem.id, rejectFeedback, cmNotes);

            setQueue(prev => prev.filter(item => item.id !== selectedItem.id));
            setSelectedItem(queue.find(item => item.id !== selectedItem.id) || null);
            setCmNotes("");
            setRejectFeedback("");
            setShowRejectModal(false);

            if (stats) {
                setStats(prev => ({
                    ...prev,
                    totalPending: prev.totalPending - 1
                }));
            }
        } catch (error) {
            console.error("Rejection failed:", error);
            alert("Failed to reject content");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePickup = async (item) => {
        try {
            await managedApprovalService.cmPickupItem(item.id);
            // Update local state to reflect CMReview status
            setQueue(prev => prev.map(q =>
                q.id === item.id ? { ...q, status: 'CMReview' } : q
            ));
        } catch (error) {
            console.error("Pickup failed:", error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-purple-400" />
                    <h1 className="text-2xl font-bold">Managed Approvals</h1>
                </div>
                <p className="text-slate-400 text-sm">
                    Review and approve escalated content on behalf of brands
                </p>
            </div>

            {/* Stats Row */}
            {stats && (
                <div className="grid grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-slate-400">Pending Escalations</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.pendingEscalated || 0}</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Eye className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-slate-400">In Review</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.inReview || 0}</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-slate-400">Approved Today</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.approvedToday || 0}</p>
                    </div>
                    <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-400">Avg Response Time</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{stats.avgResponseTimeHours || 0}h</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-12 gap-6">
                {/* Queue List */}
                <div className="col-span-4 space-y-3">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                            Escalation Queue ({queue.length})
                        </h2>
                    </div>

                    {queue.length === 0 ? (
                        <div className="p-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
                            <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm">No pending escalations</p>
                            <p className="text-slate-500 text-xs mt-1">Great work! All caught up.</p>
                        </div>
                    ) : (
                        queue.map(item => (
                            <motion.div
                                key={item.id}
                                onClick={() => setSelectedItem(item)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedItem?.id === item.id
                                        ? 'bg-purple-500/10 border-purple-500/30'
                                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                    }`}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{item.brandName}</h4>
                                        <p className="text-xs text-slate-400">{item.campaignTitle}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${item.status === 'CMReview'
                                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                        }`}>
                                        {item.status === 'CMReview' ? 'In Review' : 'Escalated'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Users className="w-3 h-3" />
                                    <span>@{item.creatorHandle}</span>
                                    <span>•</span>
                                    <Clock className="w-3 h-3" />
                                    <span>{item.escalatedReason === '24h_timeout' ? 'Timeout' : 'Requested'}</span>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* Detail Panel */}
                <div className="col-span-8">
                    {selectedItem ? (
                        <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6">
                            {/* Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-lg font-bold text-white">{selectedItem.campaignTitle}</h2>
                                        {selectedItem.status !== 'CMReview' && (
                                            <button
                                                onClick={() => handlePickup(selectedItem)}
                                                className="px-2 py-0.5 text-xs bg-blue-500/10 text-blue-400 rounded border border-blue-500/20 hover:bg-blue-500/20"
                                            >
                                                Pick Up
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400">
                                        Submitted by <span className="text-white">@{selectedItem.creatorHandle}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-emerald-400">
                                        ${parseFloat(selectedItem.agreedPrice || 0).toFixed(2)}
                                    </p>
                                    <p className="text-xs text-slate-500">Agreed rate</p>
                                </div>
                            </div>

                            {/* Content Preview */}
                            <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">
                                            {selectedItem.creatorName?.[0]?.toUpperCase() || 'C'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{selectedItem.creatorName}</p>
                                        <p className="text-xs text-slate-400">{selectedItem.platform}</p>
                                    </div>
                                </div>

                                {selectedItem.submissionUrl && (
                                    <a
                                        href={selectedItem.submissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        View Content
                                        <ChevronRight className="w-4 h-4" />
                                    </a>
                                )}
                            </div>

                            {/* Brand Context */}
                            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    <span className="text-sm font-bold text-amber-400">Escalation Reason</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    {selectedItem.escalatedReason === '24h_timeout'
                                        ? 'Brand did not review within 24 hours (automatic escalation)'
                                        : selectedItem.escalatedReason === 'brand_request'
                                            ? 'Brand requested Campaign Manager assistance'
                                            : 'Auto-managed campaign - all content goes to CM'
                                    }
                                </p>
                            </div>

                            {/* CM Notes */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                                    Internal Notes (optional)
                                </label>
                                <textarea
                                    value={cmNotes}
                                    onChange={(e) => setCmNotes(e.target.value)}
                                    placeholder="Add notes about this decision..."
                                    className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50"
                                    rows={3}
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Approve on Behalf of Brand
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={actionLoading}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-300 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400 transition-all"
                                >
                                    <XCircle className="w-5 h-5" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center bg-white/[0.02] rounded-2xl border border-white/5 p-12">
                            <div className="text-center">
                                <Shield className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400">Select an item to review</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
                        onClick={() => setShowRejectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#12121A] rounded-2xl border border-white/10 p-6 max-w-md w-full mx-4"
                        >
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-400" />
                                Reject Content
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Please provide feedback for the creator explaining why this content was rejected.
                            </p>
                            <textarea
                                value={rejectFeedback}
                                onChange={(e) => setRejectFeedback(e.target.value)}
                                placeholder="e.g., The content doesn't match brand guidelines. Please ensure the product is clearly visible..."
                                className="w-full p-3 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 mb-4"
                                rows={4}
                            />
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 border border-white/10 text-slate-300 rounded-lg hover:bg-white/10"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectFeedback.trim()}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {actionLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        "Confirm Rejection"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CMApprovalDashboard;
