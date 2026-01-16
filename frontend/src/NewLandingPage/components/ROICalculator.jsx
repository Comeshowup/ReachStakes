import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    Users,
    TrendingUp,
    Clock,
    DollarSign,
    ArrowRight,
    Sparkles
} from 'lucide-react';

// Industry benchmarks (simulated ReachStakes data)
const INDUSTRY_BENCHMARKS = {
    beauty: { reach: 45000, roas: 12, timeSaved: 120 },
    fashion: { reach: 38000, roas: 10, timeSaved: 100 },
    tech: { reach: 22000, roas: 6, timeSaved: 80 },
    food: { reach: 52000, roas: 8, timeSaved: 90 },
    retail: { reach: 35000, roas: 9, timeSaved: 110 },
    other: { reach: 30000, roas: 7, timeSaved: 85 },
};

const CAMPAIGN_MULTIPLIERS = {
    awareness: { reach: 1.5, roas: 0.7, timeSaved: 0.8 },
    conversion: { reach: 0.8, roas: 1.4, timeSaved: 1.2 },
    ambassador: { reach: 1.0, roas: 1.2, timeSaved: 1.5 },
};

const INDUSTRIES = [
    { value: 'beauty', label: 'Beauty & Cosmetics' },
    { value: 'fashion', label: 'Fashion & Apparel' },
    { value: 'tech', label: 'Tech & Electronics' },
    { value: 'food', label: 'Food & Beverage' },
    { value: 'retail', label: 'Retail & E-commerce' },
    { value: 'other', label: 'Other' },
];

const CAMPAIGN_TYPES = [
    { value: 'awareness', label: 'Brand Awareness', icon: Users, description: 'Maximize reach and impressions' },
    { value: 'conversion', label: 'Drive Conversions', icon: DollarSign, description: 'Focus on sales and ROI' },
    { value: 'ambassador', label: 'Brand Ambassador', icon: Sparkles, description: 'Long-term partnerships' },
];

const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
};

const formatCurrency = (num) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num}`;
};

const ResultCard = ({ icon: Icon, label, value, subtext, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.3 }}
        className="relative p-5 rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden group hover:border-white/20 transition-all"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-white/5 border border-white/10`}>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <span className="text-xs uppercase tracking-wider text-white/40">{label}</span>
        </div>
        <div className="text-2xl lg:text-3xl font-bold text-white mb-1">{value}</div>
        {subtext && <p className="text-xs text-white/40">{subtext}</p>}

        {/* Glow */}
        <div className={`absolute -bottom-10 -right-10 w-20 h-20 ${color.replace('text-', 'bg-')} rounded-full blur-[60px] opacity-20 pointer-events-none`} />
    </motion.div>
);

const ROICalculator = () => {
    const [budget, setBudget] = useState(25000);
    const [industry, setIndustry] = useState('beauty');
    const [campaignType, setCampaignType] = useState('conversion');

    const results = useMemo(() => {
        const base = INDUSTRY_BENCHMARKS[industry];
        const mult = CAMPAIGN_MULTIPLIERS[campaignType];

        // Calculate based on budget (per $1000)
        const budgetMultiplier = budget / 10000;

        const estimatedReach = Math.round(base.reach * mult.reach * budgetMultiplier);
        const projectedROAS = (base.roas * mult.roas).toFixed(1);
        const timeSaved = Math.round(base.timeSaved * mult.timeSaved);
        const projectedRevenue = Math.round(budget * parseFloat(projectedROAS));

        return { estimatedReach, projectedROAS, timeSaved, projectedRevenue };
    }, [budget, industry, campaignType]);

    return (
        <section className="relative w-full py-24 overflow-hidden">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                    >
                        <Calculator className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">ROI Calculator</span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        viewport={{ once: true }}
                        className="text-3xl lg:text-4xl font-bold text-white tracking-tight mb-4"
                    >
                        See Your Potential Returns
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        viewport={{ once: true }}
                        className="text-lg text-white/50 max-w-2xl mx-auto"
                    >
                        Calculate your projected ROI based on ReachStakes performance benchmarks
                    </motion.p>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Inputs Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm"
                        >
                            <h3 className="text-lg font-semibold text-white mb-6">Configure Your Campaign</h3>

                            {/* Budget Slider */}
                            <div className="mb-8">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="text-sm font-medium text-white/70">Monthly Budget</label>
                                    <span className="text-xl font-bold text-brand-sky">{formatCurrency(budget)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5000"
                                    max="100000"
                                    step="5000"
                                    value={budget}
                                    onChange={(e) => setBudget(parseInt(e.target.value))}
                                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-sky [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-sky [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
                                />
                                <div className="flex justify-between text-xs text-white/30 mt-2">
                                    <span>$5K</span>
                                    <span>$100K+</span>
                                </div>
                            </div>

                            {/* Industry Dropdown */}
                            <div className="mb-8">
                                <label className="text-sm font-medium text-white/70 block mb-3">Industry</label>
                                <select
                                    value={industry}
                                    onChange={(e) => setIndustry(e.target.value)}
                                    className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white appearance-none cursor-pointer hover:border-white/20 focus:border-brand-sky/50 focus:outline-none transition-colors"
                                >
                                    {INDUSTRIES.map((ind) => (
                                        <option key={ind.value} value={ind.value} className="bg-[#0a0a0b] text-white">
                                            {ind.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Campaign Type */}
                            <div>
                                <label className="text-sm font-medium text-white/70 block mb-3">Campaign Goal</label>
                                <div className="space-y-3">
                                    {CAMPAIGN_TYPES.map((type) => {
                                        const Icon = type.icon;
                                        const isSelected = campaignType === type.value;
                                        return (
                                            <button
                                                key={type.value}
                                                onClick={() => setCampaignType(type.value)}
                                                className={`w-full p-4 rounded-xl border text-left transition-all ${isSelected
                                                        ? 'bg-brand-sky/10 border-brand-sky/30'
                                                        : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-brand-sky/20' : 'bg-white/5'}`}>
                                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-sky' : 'text-white/50'}`} />
                                                    </div>
                                                    <div>
                                                        <span className={`font-medium ${isSelected ? 'text-white' : 'text-white/70'}`}>
                                                            {type.label}
                                                        </span>
                                                        <p className="text-xs text-white/40">{type.description}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>

                        {/* Results Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <ResultCard
                                    icon={Users}
                                    label="Estimated Reach"
                                    value={formatNumber(results.estimatedReach)}
                                    subtext="Unique impressions"
                                    color="text-brand-sky"
                                    delay={0.1}
                                />
                                <ResultCard
                                    icon={TrendingUp}
                                    label="Projected ROAS"
                                    value={`${results.projectedROAS}x`}
                                    subtext="Return on ad spend"
                                    color="text-emerald-400"
                                    delay={0.2}
                                />
                                <ResultCard
                                    icon={Clock}
                                    label="Time Saved"
                                    value={`${results.timeSaved}h`}
                                    subtext="vs. DIY management"
                                    color="text-violet-400"
                                    delay={0.3}
                                />
                                <ResultCard
                                    icon={DollarSign}
                                    label="Projected Revenue"
                                    value={formatCurrency(results.projectedRevenue)}
                                    subtext="Based on benchmarks"
                                    color="text-amber-400"
                                    delay={0.4}
                                />
                            </div>

                            {/* Revenue Highlight */}
                            <motion.div
                                key={results.projectedRevenue}
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-brand-sky/10 border border-emerald-500/20"
                            >
                                <p className="text-sm text-white/60 mb-2">Your investment of {formatCurrency(budget)}/mo could generate:</p>
                                <p className="text-4xl lg:text-5xl font-bold text-white mb-1">
                                    {formatCurrency(results.projectedRevenue)}
                                </p>
                                <p className="text-sm text-emerald-400">in projected revenue per month</p>
                            </motion.div>

                            {/* CTA */}
                            <a
                                href="/meetings"
                                className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-brand-sky hover:bg-brand-sky/90 text-black font-semibold transition-all shadow-[0_0_30px_-5px_rgba(56,189,248,0.4)] hover:shadow-[0_0_40px_-5px_rgba(56,189,248,0.5)]"
                            >
                                Let's Make This Real
                                <ArrowRight className="w-5 h-5" />
                            </a>
                            <p className="text-center text-xs text-white/30">
                                *Based on ReachStakes performance benchmarks. Individual results may vary.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Background */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
                <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-[150px]" />
            </div>
        </section>
    );
};

export default ROICalculator;
