import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    Users,
    Clock,
    Sparkles,
    ShoppingBag,
    Cpu,
    ChevronDown,
    ChevronUp,
    ArrowRight
} from 'lucide-react';

const CASE_STUDIES = [
    {
        id: 1,
        industry: 'DTC Beauty',
        icon: Sparkles,
        iconColor: 'text-pink-400',
        bgGlow: 'bg-pink-500',
        brandInitials: 'BB',
        brandName: 'BeautyBox',
        challenge: 'Scaling influencer campaigns while maintaining a 10:1 ROAS target across multiple product launches.',
        solution: 'ReachStakes managed 47 creators simultaneously, handling contracts, content approval, and payments — all while optimizing for conversion.',
        results: 'Exceeded targets within 30 days with zero brand-side management overhead.',
        kpis: [
            { label: 'ROAS', value: '15:1', icon: TrendingUp },
            { label: 'Reach', value: '2.3M', icon: Users },
            { label: 'Launch', value: '5 Days', icon: Clock },
        ],
        quote: '"We went from drowning in DMs to just approving content. ReachStakes handled everything else."',
        author: 'CMO, BeautyBox',
    },
    {
        id: 2,
        industry: 'Retail Chain',
        icon: ShoppingBag,
        iconColor: 'text-emerald-400',
        bgGlow: 'bg-emerald-500',
        brandInitials: 'LC',
        brandName: 'LocalChain',
        challenge: 'Building hyperlocal awareness across 12 markets with micro-influencers who actually drive foot traffic.',
        solution: 'Deployed a geo-targeted micro-influencer army with store-specific tracking links and in-app redemption codes.',
        results: 'Measurable store visits increased 34% in campaign markets vs. control.',
        kpis: [
            { label: 'ROAS', value: '8x', icon: TrendingUp },
            { label: 'Creators', value: '120+', icon: Users },
            { label: 'Markets', value: '12', icon: Clock },
        ],
        quote: '"Finally, influencer marketing that actually drives people into our stores."',
        author: 'VP Marketing, LocalChain',
    },
    {
        id: 3,
        industry: 'B2B SaaS',
        icon: Cpu,
        iconColor: 'text-violet-400',
        bgGlow: 'bg-violet-500',
        brandInitials: 'TF',
        brandName: 'TechFlow',
        challenge: 'Generating qualified leads through thought leadership without sounding like every other SaaS company.',
        solution: 'Partnered with 8 industry thought leaders for a LinkedIn-first campaign with gated content offers.',
        results: 'Generated 340 MQLs at 62% lower CAC than paid advertising.',
        kpis: [
            { label: 'Impressions', value: '500K', icon: TrendingUp },
            { label: 'MQLs', value: '340', icon: Users },
            { label: 'CAC Drop', value: '-62%', icon: Clock },
        ],
        quote: '"B2B influencer marketing sounded crazy until we saw the pipeline impact."',
        author: 'Head of Growth, TechFlow',
    },
];

const CaseStudyCard = ({ study, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const Icon = study.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <div className="relative rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]">
                {/* Header */}
                <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            {/* Brand Avatar */}
                            <div className={`relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                                <span className="text-sm font-bold text-white">{study.brandInitials}</span>
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-md ${study.bgGlow}/20 border border-white/10 flex items-center justify-center`}>
                                    <Icon className={`w-3 h-3 ${study.iconColor}`} />
                                </div>
                            </div>
                            <div>
                                <span className={`text-xs font-bold uppercase tracking-wider ${study.iconColor}`}>
                                    {study.industry}
                                </span>
                                <h4 className="text-lg font-semibold text-white">{study.brandName}</h4>
                            </div>
                        </div>
                    </div>

                    {/* KPI Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {study.kpis.map((kpi, i) => (
                            <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5">
                                <span className="text-xl lg:text-2xl font-bold text-white block">{kpi.value}</span>
                                <span className="text-[10px] uppercase tracking-wider text-white/50">{kpi.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Quote Preview */}
                    <blockquote className="text-sm text-white/60 italic border-l-2 border-brand-sky/30 pl-3 mb-4">
                        {study.quote}
                        <footer className="text-xs text-white/40 mt-1 not-italic">— {study.author}</footer>
                    </blockquote>
                </div>

                {/* Expand Toggle */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-3 border-t border-white/5 flex items-center justify-center gap-2 text-xs font-medium text-white/50 hover:text-white/80 transition-colors"
                >
                    {isExpanded ? (
                        <>Hide Details <ChevronUp className="w-4 h-4" /></>
                    ) : (
                        <>Read Full Story <ChevronDown className="w-4 h-4" /></>
                    )}
                </button>

                {/* Expanded Content */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                        >
                            <div className="p-6 pt-0 space-y-4 border-t border-white/5">
                                <div>
                                    <h5 className="text-xs uppercase tracking-wider text-white/40 mb-2">The Challenge</h5>
                                    <p className="text-sm text-white/70">{study.challenge}</p>
                                </div>
                                <div>
                                    <h5 className="text-xs uppercase tracking-wider text-white/40 mb-2">The Solution</h5>
                                    <p className="text-sm text-white/70">{study.solution}</p>
                                </div>
                                <div>
                                    <h5 className="text-xs uppercase tracking-wider text-white/40 mb-2">The Results</h5>
                                    <p className="text-sm text-white/70">{study.results}</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Glow effect */}
                <div className={`absolute -bottom-20 -right-20 w-40 h-40 ${study.bgGlow} rounded-full blur-[100px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700`} />
            </div>
        </motion.div>
    );
};

const CaseStudies = () => {
    return (
        <section className="relative w-full py-24 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-xs font-mono text-brand-sky/80 uppercase tracking-[0.3em] mb-4"
                    >
                        Success Stories
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4"
                    >
                        Real Brands. Real Results.
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/50 max-w-2xl mx-auto"
                    >
                        See how brands like yours are driving measurable ROI with ReachStakes
                    </motion.p>
                </div>

                {/* Case Study Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {CASE_STUDIES.map((study, index) => (
                        <CaseStudyCard key={study.id} study={study} index={index} />
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                >
                    <a
                        href="/meetings"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-brand-sky/10 border border-brand-sky/30 text-brand-sky font-medium hover:bg-brand-sky/20 hover:border-brand-sky/50 transition-all duration-300"
                    >
                        See How We Can Help You
                        <ArrowRight className="w-4 h-4" />
                    </a>
                </motion.div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/3 left-0 w-[400px] h-[400px] pointer-events-none">
                <div className="absolute inset-0 bg-brand-sky/5 rounded-full blur-[150px]" />
            </div>
            <div className="absolute bottom-1/4 right-0 w-[300px] h-[300px] pointer-events-none">
                <div className="absolute inset-0 bg-violet-500/5 rounded-full blur-[120px]" />
            </div>
        </section>
    );
};

export default CaseStudies;
