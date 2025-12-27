import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    Check
} from 'lucide-react';
import { AVAILABLE_CAMPAIGNS } from '../../dashboard/data';

const CampaignPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const campaign = AVAILABLE_CAMPAIGNS.find(c => String(c.id) === String(id));

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

    if (!campaign) return null; // Or reuse the Not Found state

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
                                            src={campaign.logo || "https://via.placeholder.com/80"}
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
                                            Instagram Reels
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium">
                                            Lifestyle
                                        </span>
                                        <span className="px-4 py-1.5 rounded-full bg-slate-800/50 border border-white/10 text-slate-300 text-sm font-medium">
                                            Tech
                                        </span>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Mobile-only Actions Placeholders or secondary info text could go here */}
                        </div>

                        {/* Desktop Actions - Floated or Integrated? Keeping it clean, the main CTA is in the content flow for mobile, or sidebar for desktop usually.
                            BUT per Requirements: "Apply Now" is the star. Let's put a massive one in the Hero for impact.
                        */}
                        <motion.div variants={itemVariants} className="hidden lg:block">
                            {/* This space intentionally left blank for visual balance, CTA is in sidebar or below title? 
                                Actually, high conversion pages often put the Main CTA near the headline or in the sticky sidebar.
                                The prompt asks for it to be a "prominent position".
                            */}
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
                                    {campaign.description} we are inviting creators to showcase our latest product line in a high-energy, authentic way.
                                    We believe in storytelling that connects lifestyle with innovation.
                                </p>
                                <p className="text-zinc-400 leading-relaxed">
                                    Ideally, you are a creator who loves tech and aesthetics. You know how to make a product shine without it feeling like a forced ad.
                                    We're looking for <strong className="text-white">bold visuals</strong>, crisp audio, and genuine enthusiasm.
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

                            {/* Inspiration Grid */}
                            <motion.div variants={itemVariants} className="mt-16">
                                <h3 className="text-2xl font-bold text-white mb-6">Inspiration & Assets</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 h-96">
                                    {[1, 2, 3].map((n) => (
                                        <div key={n} className={`rounded-3xl overflow-hidden relative group cursor-pointer border border-white/5 ${n === 1 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                                            <img
                                                src={`https://source.unsplash.com/random/800x800?tech,neon&sig=${n}`}
                                                alt="Moodboard"
                                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <div className="p-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 transform scale-50 group-hover:scale-100 transition-transform duration-300">
                                                    <ExternalLink className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
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
                                                    5 Remaining
                                                </span>
                                            </div>
                                            {/* Progress Bar */}
                                            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 w-[75%] shadow-[0_0_10px_rgba(249,115,22,0.4)]"></div>
                                            </div>
                                            <p className="text-xs text-zinc-500 text-right">High demand. Apply soon.</p>
                                        </div>
                                    </div>

                                    {/* Quick Checklist */}
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                                            <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            Min. 10k Followers
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                                            <div className="p-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            Tech / Lifestyle Niche
                                        </div>
                                    </div>

                                    {/* Primary CTA */}
                                    <button
                                        className="relative w-full group overflow-hidden rounded-xl p-[1px]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_100%] animate-border-spin" style={{ opacity: 0.5 }}></div>
                                        <div className="relative bg-indigo-600 h-full w-full rounded-xl px-4 py-4 flex items-center justify-center gap-2 group-hover:bg-indigo-700 transition-colors">
                                            <span className="font-bold text-white text-lg tracking-wide">APPLY NOW</span>
                                            <ExternalLink className="w-5 h-5 text-white" />
                                        </div>
                                        {/* Shimmer overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-x pointer-events-none"></div>
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
