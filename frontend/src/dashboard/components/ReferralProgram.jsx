import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Gift,
    Copy,
    Check,
    Users,
    DollarSign,
    Send,
    Sparkles,
    ArrowRight,
    Loader2,
    RefreshCw,
    Twitter,
    Share2
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const ReferralProgram = () => {
    const [copied, setCopied] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [referralData, setReferralData] = useState({
        referralCode: null,
        referralLink: null,
        referralCount: 0,
        referralEarnings: 0,
        recentReferrals: []
    });

    useEffect(() => {
        fetchReferralStats();
    }, []);

    const fetchReferralStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/referrals/my-stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReferralData(res.data.data);
        } catch (error) {
            console.error('Failed to fetch referral stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateCode = async () => {
        setGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/referrals/generate-code`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReferralData(prev => ({
                ...prev,
                referralCode: res.data.data.referralCode,
                referralLink: res.data.data.referralLink
            }));
        } catch (error) {
            console.error('Failed to generate code:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async (text) => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnTwitter = () => {
        const text = `Join me on ReachStakes! Get verified faster with my referral code: ${referralData.referralCode}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralData.referralLink)}`, '_blank');
    };

    const shareViaWhatsApp = () => {
        const text = `Join me on ReachStakes and get fast-tracked verification! Sign up here: ${referralData.referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 flex items-center justify-center h-64">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0e0e11] p-6 overflow-hidden"
        >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-brand-sky/20">
                    <Gift className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Referral Program</h3>
                    <p className="text-xs text-white/50">Earn 1% of each referral's first campaign</p>
                </div>
            </div>

            {/* Reward Banner */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-brand-sky/10 border border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                    <div>
                        <p className="text-lg font-bold text-white">Invite Creators, Earn Together</p>
                        <p className="text-xs text-white/60">You earn 1% of their first campaign. They get Fast-Track Verification.</p>
                    </div>
                </div>
            </div>

            {/* Referral Code Section */}
            {referralData.referralCode ? (
                <>
                    {/* Referral Code */}
                    <div className="mb-4">
                        <label className="text-xs font-medium text-white/50 mb-2 block">Your Referral Code</label>
                        <div className="flex gap-2">
                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 font-mono text-emerald-400 text-lg">
                                {referralData.referralCode}
                            </div>
                            <button
                                onClick={() => handleCopy(referralData.referralCode)}
                                className="px-4 py-3 rounded-xl bg-emerald-500 text-black font-medium hover:bg-emerald-400 transition-colors"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Referral Link */}
                    <div className="mb-6">
                        <label className="text-xs font-medium text-white/50 mb-2 block">Share Link</label>
                        <div className="flex gap-2">
                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white/70 truncate">
                                {referralData.referralLink}
                            </div>
                            <button
                                onClick={() => handleCopy(referralData.referralLink)}
                                className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-colors"
                            >
                                <Copy className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                /* Generate Code Button */
                <div className="mb-6">
                    <button
                        onClick={generateCode}
                        disabled={generating}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {generating ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <RefreshCw className="w-5 h-5" />
                        )}
                        Generate My Referral Code
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/50">Referrals</span>
                    </div>
                    <p className="text-2xl font-bold text-white">{referralData.referralCount}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-white/50">Earnings</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-400">${referralData.referralEarnings?.toFixed(2) || '0.00'}</p>
                </div>
            </div>

            {/* Recent Referrals */}
            {referralData.recentReferrals?.length > 0 && (
                <div className="mb-6">
                    <label className="text-xs font-medium text-white/50 mb-3 block">Recent Referrals</label>
                    <div className="space-y-2">
                        {referralData.recentReferrals.slice(0, 3).map((ref, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/10">
                                <img
                                    src={ref.avatar || `https://ui-avatars.com/api/?name=${ref.name}&background=random`}
                                    alt={ref.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{ref.name}</p>
                                    <p className="text-xs text-white/50">{ref.handle ? `@${ref.handle}` : 'Setting up...'}</p>
                                </div>
                                <span className="text-xs text-emerald-400">
                                    {ref.completedCampaigns > 0 ? `${ref.completedCampaigns} campaigns` : 'New'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Share Buttons */}
            {referralData.referralCode && (
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={shareOnTwitter}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white font-semibold transition-colors"
                    >
                        <Twitter className="w-4 h-4" />
                        Twitter
                    </button>
                    <button
                        onClick={shareViaWhatsApp}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold transition-colors"
                    >
                        <Share2 className="w-4 h-4" />
                        WhatsApp
                    </button>
                </div>
            )}

            {/* Terms */}
            <p className="mt-4 text-center text-[10px] text-white/30">
                Earn 1% of your referral's first campaign payout. Bonus paid by ReachStakes.
            </p>
        </motion.div>
    );
};

export default ReferralProgram;
