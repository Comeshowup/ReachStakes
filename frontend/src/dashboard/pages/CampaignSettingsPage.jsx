/**
 * Campaign Settings Page
 * 
 * A dedicated settings page for brands to configure campaign-level options
 * including the Managed Approvals feature (auto-approval by Campaign Managers).
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Settings,
    Shield,
    Clock,
    Zap,
    Users,
    CheckCircle,
    AlertCircle,
    Loader2,
    ChevronRight,
    Info,
    Sparkles,
    Bell,
    Lock
} from "lucide-react";
import { getCampaign } from "../../api/brandService";
import managedApprovalService from "../../api/managedApprovalService";

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, enabled, onToggle, loading, premium = false, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl border p-6 transition-all duration-300 ${enabled
                ? "bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-indigo-500/30"
                : "bg-white dark:bg-slate-900/50 border-gray-200 dark:border-slate-800"
            }`}
    >
        {premium && (
            <div className="absolute -top-2 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-[10px] font-bold text-white uppercase tracking-wide flex items-center gap-1">
                <Sparkles size={10} />
                Premium
            </div>
        )}

        <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${enabled
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                        : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                    }`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{description}</p>
                </div>
            </div>

            {onToggle && (
                <button
                    onClick={onToggle}
                    disabled={loading}
                    className={`relative w-14 h-8 rounded-full transition-all duration-300 ${enabled
                            ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                            : "bg-gray-300 dark:bg-slate-700"
                        } ${loading ? "opacity-50 cursor-wait" : ""}`}
                >
                    <motion.div
                        animate={{ x: enabled ? 24 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center"
                    >
                        {loading && <Loader2 size={14} className="text-indigo-600 animate-spin" />}
                    </motion.div>
                </button>
            )}
        </div>

        {children && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-800">
                {children}
            </div>
        )}
    </motion.div>
);

// Info Banner Component
const InfoBanner = ({ type = "info", children }) => {
    const styles = {
        info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300",
        success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300",
        warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300"
    };

    return (
        <div className={`rounded-xl border p-4 ${styles[type]}`}>
            <div className="flex items-start gap-3">
                <Info size={18} className="mt-0.5 shrink-0" />
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
};

const CampaignSettingsPage = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Settings state
    const [managedApprovalEnabled, setManagedApprovalEnabled] = useState(false);
    const [managedApprovalMode, setManagedApprovalMode] = useState("Manual");
    const [isToggling, setIsToggling] = useState(false);

    // Fetch campaign data
    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                setIsLoading(true);
                const response = await getCampaign(campaignId);
                if (response.status === 'success' || response.data) {
                    const campaignData = response.data || response;
                    setCampaign(campaignData);
                    setManagedApprovalEnabled(campaignData.isManagedApproval || false);
                    setManagedApprovalMode(campaignData.managedApprovalMode || "Manual");
                }
            } catch (err) {
                console.error("Failed to fetch campaign:", err);
                setError("Failed to load campaign settings");
            } finally {
                setIsLoading(false);
            }
        };

        if (campaignId) {
            fetchCampaign();
        }
    }, [campaignId]);

    // Toggle managed approval
    const handleToggleManagedApproval = async () => {
        setIsToggling(true);
        try {
            const newEnabled = !managedApprovalEnabled;
            const newMode = newEnabled ? "AutoManaged" : "Manual";

            await managedApprovalService.toggleManagedApproval(campaignId, newEnabled, newMode);

            setManagedApprovalEnabled(newEnabled);
            setManagedApprovalMode(newMode);
        } catch (err) {
            console.error("Failed to toggle managed approval:", err);
        } finally {
            setIsToggling(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-lg text-gray-900 dark:text-white">{error}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="text-indigo-600 hover:underline"
                >
                    Go back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#09090B] pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(`/brand/workspace/${campaignId}`)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                                <Link to="/brand/campaigns" className="hover:text-indigo-600">Campaigns</Link>
                                <ChevronRight size={14} />
                                <Link to={`/brand/workspace/${campaignId}`} className="hover:text-indigo-600">
                                    {campaign?.title || campaign?.name || "Campaign"}
                                </Link>
                                <ChevronRight size={14} />
                                <span>Settings</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Settings className="w-6 h-6 text-indigo-500" />
                                Campaign Settings
                            </h1>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

                {/* Approval Settings Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-500" />
                        Content Approval
                    </h2>

                    <div className="space-y-4">
                        {/* Managed Approvals Feature Card */}
                        <FeatureCard
                            icon={Zap}
                            title="Managed Approvals"
                            description="Let our Campaign Managers handle content approvals on your behalf. Perfect for busy teams or when you need extra capacity."
                            enabled={managedApprovalEnabled}
                            onToggle={handleToggleManagedApproval}
                            loading={isToggling}
                        >
                            <AnimatePresence mode="wait">
                                {managedApprovalEnabled ? (
                                    <motion.div
                                        key="enabled"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-medium">Active – All submissions go directly to Campaign Managers</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Users size={14} className="text-indigo-500" />
                                                <span>Expert review</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Clock size={14} className="text-indigo-500" />
                                                <span>Faster turnaround</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                <Shield size={14} className="text-indigo-500" />
                                                <span>Quality assured</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="disabled"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-start gap-2 text-amber-600 dark:text-amber-400">
                                            <Clock size={16} className="mt-0.5" />
                                            <div className="text-sm">
                                                <span className="font-medium">24-hour fail-safe active</span>
                                                <p className="text-slate-500 text-xs mt-1">
                                                    If you don't review content within 24 hours, it will automatically be escalated to a Campaign Manager.
                                                </p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </FeatureCard>

                        {/* How It Works Info */}
                        <InfoBanner type={managedApprovalEnabled ? "success" : "info"}>
                            {managedApprovalEnabled ? (
                                <div>
                                    <strong>How it works:</strong> When creators submit content, our Campaign Managers will review it against your brand guidelines and approve or request revisions. You'll receive notifications for all decisions made.
                                </div>
                            ) : (
                                <div>
                                    <strong>How it works:</strong> When creators submit content, you have 24 hours to review it. We'll send you a reminder 6 hours before the deadline. If you don't respond, a Campaign Manager will step in to ensure the creator isn't left waiting.
                                </div>
                            )}
                        </InfoBanner>
                    </div>
                </section>

                {/* Notifications Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-500" />
                        Notifications
                    </h2>

                    <div className="space-y-4">
                        <FeatureCard
                            icon={Bell}
                            title="Email Notifications"
                            description="Receive email alerts for new content submissions, approval deadlines, and CM decisions."
                            enabled={true}
                        >
                            <p className="text-xs text-slate-500">You'll receive notifications at the email associated with your account.</p>
                        </FeatureCard>
                    </div>
                </section>

                {/* Security Section */}
                <section>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-indigo-500" />
                        Security & Access
                    </h2>

                    <div className="space-y-4">
                        <FeatureCard
                            icon={Lock}
                            title="Campaign Access Control"
                            description="Manage who on your team can view and manage this campaign."
                            enabled={false}
                            premium={true}
                        >
                            <p className="text-xs text-slate-500">Coming soon – Invite team members with specific roles.</p>
                        </FeatureCard>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CampaignSettingsPage;
