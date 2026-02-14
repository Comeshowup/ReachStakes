import React from "react";
import { motion } from "framer-motion";
import { Briefcase, Download, MessageSquare, ArrowRight } from "lucide-react";

/**
 * ProfileCTA - Bottom conversion section
 * Final call-to-action for brands to start collaborating
 */

const ProfileCTA = ({
    creatorName = "this creator",
    onInviteCampaign,
    onDownloadMediaKit,
    onContact,
    isOwner = false,
    className = ""
}) => {
    if (isOwner) {
        // Owner view - show share/edit options
        return (
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`mt-12 p-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-center relative overflow-hidden ${className}`}
            >
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -ml-24 -mb-24 blur-3xl" />

                <div className="relative z-10">
                    <h3 className="text-2xl font-black text-white mb-3">
                        Share Your Profile
                    </h3>
                    <p className="text-slate-400 mb-8 max-w-md mx-auto">
                        Get discovered by brands looking for creators like you. Share your media kit to attract new opportunities.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button
                            onClick={onDownloadMediaKit}
                            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Media Kit
                        </button>
                        <button
                            onClick={() => {
                                const shareUrl = `${window.location.origin}/profile/@${creatorName.toLowerCase().replace(/\s+/g, '')}`;
                                navigator.clipboard.writeText(shareUrl);
                                alert("Profile link copied to clipboard!");
                            }}
                            className="px-8 py-4 border-2 border-slate-600 hover:border-slate-500 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2"
                        >
                            Copy Profile Link
                        </button>
                    </div>
                </div>
            </motion.section>
        );
    }

    // Brand/Guest view - show collaboration CTAs
    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-12 p-10 md:p-12 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl text-center text-white relative overflow-hidden ${className}`}
        >
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-300/20 rounded-full -ml-24 -mb-24 blur-3xl" />

            {/* Floating shapes */}
            <motion.div
                className="absolute top-8 left-12 w-3 h-3 bg-white/30 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute bottom-12 right-16 w-2 h-2 bg-white/20 rounded-full"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            <div className="relative z-10">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6 border border-white/20"
                >
                    <Briefcase className="w-4 h-4" />
                    Ready to collaborate?
                </motion.div>

                <h3 className="text-3xl md:text-4xl font-black mb-4">
                    Work with {creatorName}
                </h3>
                <p className="text-indigo-100/80 mb-8 max-w-lg mx-auto text-lg">
                    Start a campaign and reach their engaged audience. Secure payments powered by ReachStakes escrow.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={onInviteCampaign}
                        className="group px-8 py-4 bg-white text-indigo-600 font-bold rounded-full hover:bg-gray-100 transition-all shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                    >
                        <Briefcase className="w-5 h-5" />
                        Invite to Campaign
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onDownloadMediaKit}
                        className="px-8 py-4 border-2 border-white/30 hover:border-white/50 text-white font-bold rounded-full hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        Download Media Kit
                    </button>
                </div>

                {onContact && (
                    <button
                        onClick={onContact}
                        className="mt-6 text-white/70 hover:text-white font-medium text-sm flex items-center gap-2 mx-auto transition-colors"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Or send a message first
                    </button>
                )}
            </div>
        </motion.section>
    );
};

// Sticky Mobile CTA for brand view
export const StickyMobileCTA = ({ onInviteCampaign, isVisible = true }) => {
    if (!isVisible) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50 md:hidden"
        >
            <button
                onClick={onInviteCampaign}
                className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
                <Briefcase className="w-5 h-5" />
                INVITE TO CAMPAIGN
            </button>
        </motion.div>
    );
};

export default ProfileCTA;
