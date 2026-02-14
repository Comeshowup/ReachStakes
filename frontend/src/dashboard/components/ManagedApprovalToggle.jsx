import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Clock, Shield, Loader2 } from "lucide-react";
import managedApprovalService from "../../api/managedApprovalService";

/**
 * ManagedApprovalToggle Component
 * 
 * Allows brands to toggle between:
 * - Manual Mode (OFF): Brand reviews all content, with 24-hour fail-safe escalation
 * - AutoManaged Mode (ON): All content goes directly to Campaign Managers
 * 
 * Props:
 * - campaignId: number - The campaign to configure
 * - initialEnabled: boolean - Current toggle state
 * - initialMode: 'Manual' | 'AutoManaged' - Current approval mode
 * - onToggle: (enabled, mode) => void - Callback when toggle changes
 * - compact: boolean - Render in compact mode for inline use
 */
const ManagedApprovalToggle = ({
    campaignId,
    initialEnabled = false,
    initialMode = "Manual",
    onToggle,
    compact = false
}) => {
    const [enabled, setEnabled] = useState(initialEnabled);
    const [mode, setMode] = useState(initialMode);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleToggle = async () => {
        setLoading(true);
        setError(null);

        const newEnabled = !enabled;
        const newMode = newEnabled ? "AutoManaged" : "Manual";

        try {
            await managedApprovalService.toggleManagedApproval(campaignId, newEnabled, newMode);
            setEnabled(newEnabled);
            setMode(newMode);
            if (onToggle) onToggle(newEnabled, newMode);
        } catch (err) {
            console.error("Failed to toggle managed approval:", err);
            setError("Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">Managed Approvals</span>
                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-purple-500" : "bg-slate-700"
                        }`}
                >
                    <motion.div
                        initial={false}
                        animate={{ x: enabled ? 20 : 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                </button>
                {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
            </div>
        );
    }

    return (
        <div className="p-5 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className={`w-5 h-5 ${enabled ? "text-purple-400" : "text-slate-500"}`} />
                        <h4 className="text-sm font-bold text-white">Managed Approvals</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                        {enabled ? (
                            "Our Campaign Managers will handle all content approvals for this campaign."
                        ) : (
                            "You review content directly. Our team steps in if you need more than 24 hours."
                        )}
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={loading}
                    className={`relative w-14 h-7 rounded-full transition-all duration-300 flex-shrink-0 ${enabled
                            ? "bg-gradient-to-r from-purple-500 to-indigo-500 shadow-lg shadow-purple-500/20"
                            : "bg-slate-700 hover:bg-slate-600"
                        }`}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                    ) : (
                        <motion.div
                            initial={false}
                            animate={{ x: enabled ? 28 : 4 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="absolute top-1 left-0 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                        >
                            {enabled ? (
                                <Shield className="w-3 h-3 text-purple-500" />
                            ) : (
                                <Clock className="w-3 h-3 text-slate-400" />
                            )}
                        </motion.div>
                    )}
                </button>
            </div>

            {/* Status Indicator */}
            <div className={`mt-4 p-3 rounded-xl border ${enabled
                    ? "bg-purple-500/5 border-purple-500/10"
                    : "bg-amber-500/5 border-amber-500/10"
                }`}>
                <div className="flex items-center gap-2">
                    {enabled ? (
                        <>
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-purple-300 font-medium">
                                Full White-Glove Management Active
                            </span>
                        </>
                    ) : (
                        <>
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-xs text-amber-300 font-medium">
                                24-Hour Fail-Safe Enabled
                            </span>
                        </>
                    )}
                </div>
                <p className="text-[10px] text-slate-500 mt-1 ml-6">
                    {enabled ? (
                        "All content submissions will be reviewed by our expert team."
                    ) : (
                        "If you don't review within 24 hours, our team will step in to keep your campaign on track."
                    )}
                </p>
            </div>

            {/* Error Display */}
            {error && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <p className="text-xs text-red-400">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ManagedApprovalToggle;
