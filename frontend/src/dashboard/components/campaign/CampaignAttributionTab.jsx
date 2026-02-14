import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    Eye,
    Loader2,
    AlertCircle
} from "lucide-react";
import api from "../../../api/axios";

// Copy Button Component
const CopyButton = ({ text, label }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`p-2 rounded-lg transition-all ${copied
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-white/5 hover:bg-white/10 text-slate-400"
                }`}
            title={`Copy ${label}`}
        >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

// Tracking Code Row
const TrackingCodeRow = ({ icon: Icon, label, value, color }) => {
    if (!value) return null;

    return (
        <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className={`p-2 rounded-lg ${color}`}>
                <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-sm font-mono text-white truncate mt-1">{value}</p>
            </div>
            <CopyButton text={value} label={label} />
        </div>
    );
};

// Impact Stat Card
const ImpactCard = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <Icon className={`w-5 h-5 ${color} mb-2`} />
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
        {trend && (
            <p className={`text-xs font-bold mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                {trend > 0 ? '+' : ''}{trend}% this week
            </p>
        )}
    </div>
);

// Pending State
const PendingState = ({ status }) => (
    <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h3 className="font-bold text-white text-lg mb-2">Attribution Links Not Yet Available</h3>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
            {status === "Applied" || status === "Invited"
                ? "Attribution links will be generated once your application is approved and the campaign is in progress."
                : "Attribution links are being generated. Please check back shortly."}
        </p>
    </div>
);

// Main Attribution Tab
const CampaignAttributionTab = ({ collaborationId, campaign }) => {
    const [trackingData, setTrackingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (collaborationId) {
            fetchTrackingData();
        }
    }, [collaborationId]);

    const fetchTrackingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/attribution/tracking-data/${collaborationId}`);
            if (response.data.status === "success") {
                setTrackingData(response.data.data);
            }
        } catch (err) {
            console.error("Failed to fetch tracking data:", err);
            // Don't show error for expected cases (no tracking yet)
            if (err.response?.status !== 404) {
                setError("Failed to load tracking data");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    // Show pending state if campaign is not in progress or no tracking data
    if (!trackingData || campaign?.status !== "In_Progress") {
        return <PendingState status={campaign?.status} />;
    }

    const { trackingCodes, stats } = trackingData;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-400" />
                        Attribution & Tracking
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Your unique tracking codes and performance metrics
                    </p>
                </div>
                <button
                    onClick={fetchTrackingData}
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-400"
                >
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Tracking Codes */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="font-bold text-white text-lg mb-4">Your Tracking Codes</h3>
                <div className="space-y-3">
                    <TrackingCodeRow
                        icon={LinkIcon}
                        label="Attribution Link"
                        value={trackingCodes?.attributionLink}
                        color="bg-indigo-500/10 text-indigo-400"
                    />
                    <TrackingCodeRow
                        icon={Tag}
                        label="Discount Code"
                        value={trackingCodes?.discountCode}
                        color="bg-emerald-500/10 text-emerald-400"
                    />
                    <TrackingCodeRow
                        icon={Ticket}
                        label="Promo Code"
                        value={trackingCodes?.promoCode}
                        color="bg-purple-500/10 text-purple-400"
                    />
                </div>

                {trackingCodes?.attributionLink && (
                    <div className="mt-4 pt-4 border-t border-white/5">
                        <a
                            href={trackingCodes.attributionLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300"
                        >
                            <ExternalLink className="w-4 h-4" />
                            Test your link
                        </a>
                    </div>
                )}
            </div>

            {/* Impact Stats */}
            {stats && (
                <div>
                    <h3 className="font-bold text-white text-lg mb-4">Your Impact</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <ImpactCard
                            icon={MousePointer}
                            label="Link Clicks"
                            value={stats.clicks?.toLocaleString() || 0}
                            color="text-blue-400"
                            trend={stats.clicksTrend}
                        />
                        <ImpactCard
                            icon={Eye}
                            label="Page Views"
                            value={stats.pageViews?.toLocaleString() || 0}
                            color="text-purple-400"
                            trend={stats.pageViewsTrend}
                        />
                        <ImpactCard
                            icon={ShoppingCart}
                            label="Conversions"
                            value={stats.conversions?.toLocaleString() || 0}
                            color="text-emerald-400"
                            trend={stats.conversionsTrend}
                        />
                        <ImpactCard
                            icon={DollarSign}
                            label="Revenue Driven"
                            value={`$${stats.revenue?.toLocaleString() || 0}`}
                            color="text-amber-400"
                            trend={stats.revenueTrend}
                        />
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6">
                <h3 className="font-bold text-indigo-400 text-sm mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Pro Tips
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                    <li>• Include your attribution link in your video description</li>
                    <li>• Mention your discount code verbally in your content</li>
                    <li>• Pin a comment with your link for maximum visibility</li>
                    <li>• Use link-in-bio tools if platform doesn't allow clickable links</li>
                </ul>
            </div>
        </div>
    );
};

export default CampaignAttributionTab;
