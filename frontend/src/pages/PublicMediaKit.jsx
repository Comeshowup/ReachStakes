import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    MapPin,
    Instagram,
    Youtube,
    Twitter,
    Globe,
    Briefcase,
    Star,
    CheckCircle2,
    DollarSign,
    PieChart,
    BarChart3,
    ArrowRight,
    Loader2,
    Lock
} from "lucide-react";
import ReachVerifiedBadge from "../dashboard/components/ReachVerifiedBadge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const PublicMediaKit = () => {
    const { handle } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Remove @ if present in handle
                const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
                const response = await axios.get(`${API_BASE_URL}/media-kit/${cleanHandle}`);

                // Map API response to Component state structure
                const data = response.data.data;
                setProfile({
                    fullName: data.profile.name,
                    handle: data.profile.handle,
                    avatarUrl: data.profile.avatar,
                    about: data.profile.bio,
                    location: data.profile.location,
                    verificationTier: data.profile.verificationTier,
                    nicheTags: data.profile.tags,
                    stats: {
                        followers: data.stats.followersTotal,
                        engagement: data.stats.engagementRate,
                        rating: 5.0 // Default or from API
                    },
                    socialAccounts: data.socials,
                    services: data.services
                });
            } catch (err) {
                console.error("Failed to fetch public profile", err);
                setError(err.response?.data?.message || "Profile not found.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [handle]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
            <h1 className="text-4xl font-bold">404</h1>
            <p className="text-slate-400">{error}</p>
            <Link to="/" className="px-6 py-2 bg-indigo-600 rounded-full font-bold hover:bg-indigo-700 transition-all">Go Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 font-sans">
            {/* Nav / Logo */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-black tracking-tighter text-white">
                        REACHSTAKES<span className="text-indigo-500">.</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
                        Live Media Kit
                    </div>
                </div>
            </nav>

            <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto space-y-12">
                {/* Profile Header */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] -z-10 opacity-50"></div>
                    <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative"
                        >
                            <div className="w-40 h-40 md:w-48 md:h-48 rounded-[2.5rem] bg-indigo-500 overflow-hidden border-4 border-slate-900 shadow-2xl relative z-10">
                                <img src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName)}&background=6366f1&color=fff&size=512`} alt={profile.fullName} className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl z-20">
                                <CheckCircle2 className="w-7 h-7 text-indigo-600" />
                            </div>
                        </motion.div>

                        <div className="text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tight">{profile.fullName}</h1>
                                    {profile.verificationTier && profile.verificationTier !== "None" && (
                                        <ReachVerifiedBadge tier={profile.verificationTier} size="lg" />
                                    )}
                                </div>
                                <p className="text-xl text-slate-400 font-medium">@{profile.handle}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-sm">
                                    <MapPin className="w-4 h-4" /> {profile.location}
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-sm">
                                    <Star className="w-4 h-4 text-yellow-500" /> {profile.stats.rating} Rating
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: About & Services */}
                    <div className="lg:col-span-8 space-y-12">
                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                About the Creator
                            </h3>
                            <p className="text-xl text-slate-300 leading-relaxed font-light">
                                {profile.about}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {profile.nicheTags?.map(tag => (
                                    <span key={tag} className="px-4 py-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-sm font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-3">
                                <div className="w-1 h-8 bg-indigo-500 rounded-full"></div>
                                Services & Rates
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.services?.map(service => (
                                    <div key={service.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="text-lg font-bold group-hover:text-indigo-400 transition-colors">{service.title}</div>
                                            <div className="text-emerald-400 font-mono font-bold">${service.price}</div>
                                        </div>
                                        <p className="text-sm text-slate-400 mb-4">{service.description}</p>
                                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                            {service.turnaroundTime} Turnaround
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Audience & Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Reach Card */}
                        <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[60px]"></div>
                            <div className="relative z-10 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-indigo-100/60 font-bold uppercase tracking-widest text-xs">Total Audience Reach</p>
                                    <h4 className="text-5xl font-black text-white">{profile.stats.followers?.toLocaleString() || "0"}</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-black/20 rounded-2xl backdrop-blur-md">
                                        <p className="text-indigo-100/60 text-[10px] font-bold uppercase">Engagement</p>
                                        <p className="text-xl font-black text-white">{profile.stats.engagement}%</p>
                                    </div>
                                    <div className="p-4 bg-black/20 rounded-2xl backdrop-blur-md">
                                        <p className="text-indigo-100/60 text-[10px] font-bold uppercase">Niches</p>
                                        <p className="text-xl font-black text-white">{profile.nicheTags?.length || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-6">
                            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500">Connected Accounts</h4>
                            <div className="space-y-4">
                                {profile.socialAccounts?.map(account => (
                                    <a
                                        key={account.platform}
                                        href={account.profileUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-white/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white/5 rounded-xl group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                                                {account.platform === 'Instagram' && <Instagram size={20} />}
                                                {account.platform === 'YouTube' && <Youtube size={20} />}
                                                {account.platform === 'Twitter' && <Twitter size={20} />}
                                                {(!['Instagram', 'YouTube', 'Twitter'].includes(account.platform)) && <Globe size={20} />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-white">{account.platform}</p>
                                                <p className="text-xs text-slate-500">{account.username}</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-white" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Lead / Contact CTA */}
                        <button className="w-full py-5 bg-white text-slate-950 font-black rounded-[2rem] hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                            WORK WITH ME
                        </button>
                        <p className="text-[10px] text-center text-slate-500 uppercase font-medium tracking-tighter">
                            Secure Booking Powered by Reachstakes Escrow
                        </p>
                    </div>
                </div>
            </div>

            {/* Sticky Footer for Brand Action */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-sm px-6 z-50 md:hidden">
                <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-[2rem] shadow-2xl shadow-indigo-500/40">
                    BOOK CAMPAIGN
                </button>
            </div>
        </div>
    );
};

export default PublicMediaKit;
