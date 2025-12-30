import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    MapPin,
    Users,
    Share2,
    ExternalLink,
    CheckCircle,
    Play,
    Instagram,
    Youtube,
    Clock,
    Zap,
    AlertCircle,
    Check,
    Loader2
} from 'lucide-react';

const CampaignPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [campaign, setCampaign] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_BASE_URL}/campaigns/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Format data to match UI expectations
                const c = response.data.data;
                const formattedCampaign = {
                    id: c.id,
                    title: c.title,
                    description: c.description || "",
                    brand: c.brand?.brandProfile?.companyName || "Unknown Brand",
                    logo: c.brand?.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.brand?.companyName || 'Brand')}&background=random`,
                    platform: c.platformRequired || "Any",
                    type: c.campaignType || "General",
                    budget: c.budgetMin && c.budgetMax ? `$${c.budgetMin} - $${c.budgetMax}` : (c.budgetMin ? `$${c.budgetMin}+` : "Negotiable"),
                    deadline: c.deadline ? new Date(c.deadline).toLocaleDateString() : "Open",
                    rawDeadline: c.deadline
                };

                setCampaign(formattedCampaign);
            } catch (err) {
                console.error("Failed to fetch campaign", err);
                setError("Failed to load campaign details.");
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, [id]);

    const handleApply = async () => {
        if (!confirm("Are you sure you want to apply to this campaign?")) return;

        setApplying(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/campaigns/${id}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Successfully applied! Redirecting to your submissions...");
            navigate('/creator/submissions');
        } catch (err) {
            console.error("Failed to apply", err);
            alert(err.response?.data?.message || "Failed to apply to campaign. You may have already applied.");
        } finally {
            setApplying(false);
        }
    };

    // Animation Variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    const slideInRight = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut", delay: 0.4 } }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    if (error) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">{error}</div>;
    if (!campaign) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Campaign not found</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
            {/* 1. Hero Section Overhaul */}
            <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                {/* Background Radial Gradient */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen opacity-60"></div>
                    <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] opacity-40"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <motion.button
                        onClick={() => navigate(-1)}
                        className="group flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 font-medium text-sm"
                        whileHover={{ x: -4 }}
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Campaigns
                    </motion.button>

                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex flex-col lg:flex-row gap-12 items-start"
                    >
                        {/* Major Header Content */}
                        <div className="flex-1 space-y-8">
                            {/* Brand & Badge */}
                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center gap-6">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-50"></div>
                                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-slate-900/50 backdrop-blur-md border border-white/10 p-1 flex items-center justify-center shadow-2xl overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                                        <img
                                            src={campaign.logo}
                                            alt={campaign.brand}
                                            className="w-full h-full object-cover rounded-2xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h2 className="text-xl font-medium text-indigo-400">{campaign.brand}</h2>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                            </span>
                                            Active Campaign
                                        </div>
                                    </div>
                                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                                        {campaign.title}
                                    </h1>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        {/* Stylized Tags */}
                                        <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-pink-200 text-sm font-semibold flex items-center gap-2">
                                            <Instagram className="w-3.5 h-3.5" />
                                            {campaign.platform}
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium">
                                            {campaign.type}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Mobile-only Actions Placeholders or secondary info text could go here */}
                        </div>

                        {/* Desktop Actions */}
                        <motion.div variants={itemVariants} className="hidden lg:block">
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-zinc-300">

                    {/* 3. Main Content Area - Left Column (Span 8) */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={containerVariants}
                        >
                            {/* "About" Section */}
                            <motion.div variants={itemVariants} className="prose prose-lg prose-invert max-w-none">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400/20" />
                                    About the Campaign
                                </h3>
                                <p className="text-xl text-slate-300 leading-relaxed font-light">
                                    {campaign.description}
                                </p>
                            </motion.div>

                            {/* Key Deliverables Cards */}
                            <motion.div variants={itemVariants} className="mt-12">
                                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                                    <CheckCircle className="w-6 h-6 text-indigo-400" />
                                    Key Deliverables
                                </h3>
                                <div className="grid gap-4">
                                    {[
                                        { icon: Play, title: "1x High-Res Video", desc: "60-90s Vertical format (9:16), 4K preferred." },
                                        { icon: Instagram, title: "2x Instagram Stories", desc: "With link sticker and brand tag. 24h duration." },
                                        { icon: Clock, title: "Draft Submission", desc: "Submit for approval 48h before posting date." }
                                    ].map((item, i) => (
                                        <div key={i} className="group flex items-start gap-4 p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all cursor-default">
                                            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl group-hover:scale-110 transition-transform">
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white">{item.title}</h4>
                                                <p className="text-zinc-400 text-sm mt-1">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* 2. The Sidebar (The "Deal" Card) - Right Column (Span 4) */}
                    <div className="lg:col-span-4 relative">
                        <motion.div
                            variants={slideInRight}
                            initial="hidden"
                            animate="visible"
                            className="sticky top-24"
                        >
                            {/* Glassmorphic Card */}
                            <div className="relative group rounded-3xl overflow-hidden">
                                {/* Glowing gradient border effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-indigo-500 to-purple-500 opacity-20 group-hover:opacity-40 transition-opacity blur rounded-3xl"></div>

                                <div className="relative bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8 space-y-8">

                                    {/* Budget / Price */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Total Budget</p>
                                        <div className="flex items-baseline gap-1 animate-pulse-slow">
                                            <span className="text-2xl text-emerald-400 font-mono">$</span>
                                            <span className="text-5xl font-mono font-bold text-emerald-400 tracking-tighter">{campaign.budget}</span>
                                        </div>
                                    </div>

                                    <div className="h-px w-full bg-white/10"></div>

                                    {/* Stats & Countdown */}
                                    <div className="space-y-6">
                                        {/* Deadline */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-5 h-5 text-indigo-400" />
                                                <span className="text-zinc-300 font-medium">Deadline</span>
                                            </div>
                                            <span className="text-white font-bold">{campaign.deadline}</span>
                                        </div>

                                        {/* Open Spots with Visual Bar */}
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Users className="w-5 h-5 text-orange-400" />
                                                    <span className="text-zinc-300 font-medium">Open Spots</span>
                                                </div>
                                                <span className="text-orange-400 font-bold flex items-center gap-2">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                                                    </span>
                                                    Limited
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[75%] shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div>
                                            </div>
                                            <p className="text-xs text-zinc-500 text-right">High demand. Apply soon.</p>
                                        </div>
                                    </div>

                                    {/* Primary CTA */}
                                    <button
                                        onClick={handleApply}
                                        disabled={applying}
                                        className="relative w-full group overflow-hidden rounded-xl p-[1px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-border-spin" style={{ opacity: 0.5 }}></div>
                                        <div className="relative bg-indigo-600 h-full w-full rounded-xl px-4 py-4 flex items-center justify-center gap-2 group-hover:bg-indigo-700 transition-colors">
                                            <span className="font-bold text-white text-lg tracking-wide">
                                                {applying ? "APPLYING..." : "APPLY NOW"}
                                            </span>
                                            {!applying && <ExternalLink className="w-5 h-5 text-white" />}
                                        </div>
                                    </button>

                                    <p className="text-xs text-center text-zinc-500">
                                        By applying, you agree to the campaign terms.
                                    </p>
                                </div>
                            </div>

                            {/* Secondary Share Action */}
                            <button className="w-full mt-4 py-3 flex items-center justify-center gap-2 text-zinc-400 font-medium hover:text-white transition-colors">
                                <Share2 className="w-4 h-4" />
                                Share with a friend
                            </button>

                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignPage;
