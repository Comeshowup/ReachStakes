import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Check,
    X,
    ChevronDown,
    Sparkles,
    Zap,
    Building2,
    ShieldCheck,
    ArrowRight,
    MessageSquare
} from 'lucide-react';

const PRICING_TIERS = [
    {
        id: 'starter',
        name: 'Starter',
        tagline: 'Testing the waters',
        monthlyFee: 500,
        performanceFee: '10%',
        icon: Sparkles,
        color: 'brand-sky',
        features: [
            { text: 'Up to 10 creators/month', included: true },
            { text: 'Basic analytics dashboard', included: true },
            { text: 'Email support', included: true },
            { text: 'ReachSecure escrow', included: true },
            { text: 'Content approval workflow', included: true },
            { text: 'Dedicated account manager', included: false },
            { text: 'Priority creator matching', included: false },
            { text: 'Custom integrations', included: false },
        ],
        cta: 'Start Free Trial',
        ctaLink: '/auth?type=brand',
        popular: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        tagline: 'Scaling brands',
        monthlyFee: 1500,
        performanceFee: '8%',
        icon: Zap,
        color: 'emerald',
        features: [
            { text: 'Up to 50 creators/month', included: true },
            { text: 'Advanced analytics + ROI tracking', included: true },
            { text: 'Priority email + chat support', included: true },
            { text: 'ReachSecure escrow', included: true },
            { text: 'Content approval workflow', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Priority creator matching', included: true },
            { text: 'Custom integrations', included: false },
        ],
        cta: 'Get Started',
        ctaLink: '/auth?type=brand',
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        tagline: 'Full-service',
        monthlyFee: null,
        performanceFee: 'Custom',
        icon: Building2,
        color: 'violet',
        features: [
            { text: 'Unlimited creators', included: true },
            { text: 'Custom reporting + API access', included: true },
            { text: '24/7 dedicated support', included: true },
            { text: 'ReachSecure escrow', included: true },
            { text: 'Content approval workflow', included: true },
            { text: 'Dedicated account manager', included: true },
            { text: 'Priority creator matching', included: true },
            { text: 'Custom integrations', included: true },
        ],
        cta: 'Contact Sales',
        ctaLink: '/meetings',
        popular: false,
    },
];

const FAQS = [
    {
        q: 'What does the performance fee cover?',
        a: 'The performance fee is calculated on your total campaign spend and covers creator payments processing, compliance verification, content rights management, and our ReachSecure escrow protection.',
    },
    {
        q: 'Is there a minimum commitment?',
        a: 'No long-term contracts required. All plans are month-to-month, though we offer discounts for annual commitments. You can upgrade, downgrade, or cancel anytime.',
    },
    {
        q: 'How does ReachSecure escrow work?',
        a: 'Funds are held securely until content is delivered and approved. This protects both brands and creators, ensuring everyone gets paid fair and on time.',
    },
    {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, ACH transfers, and wire transfers for enterprise clients. All payments are processed through our PCI-compliant payment partner.',
    },
    {
        q: 'Can I switch plans mid-month?',
        a: 'Yes! Upgrades are applied immediately and prorated. Downgrades take effect at your next billing cycle.',
    },
    {
        q: 'Do you offer refunds?',
        a: 'We offer a 14-day money-back guarantee on your first month. After that, we don\'t offer refunds but you can cancel anytime.',
    },
];

const PricingCard = ({ tier, index }) => {
    const Icon = tier.icon;
    const colorClasses = {
        'brand-sky': {
            border: 'border-brand-sky/30',
            bg: 'bg-brand-sky/10',
            text: 'text-brand-sky',
            glow: 'bg-brand-sky',
            button: 'bg-brand-sky hover:bg-brand-sky/90 text-black',
        },
        'emerald': {
            border: 'border-emerald-500/30',
            bg: 'bg-emerald-500/10',
            text: 'text-emerald-400',
            glow: 'bg-emerald-500',
            button: 'bg-emerald-500 hover:bg-emerald-400 text-black',
        },
        'violet': {
            border: 'border-violet-500/30',
            bg: 'bg-violet-500/10',
            text: 'text-violet-400',
            glow: 'bg-violet-500',
            button: 'bg-violet-500 hover:bg-violet-400 text-white',
        },
    };
    const colors = colorClasses[tier.color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className={`relative rounded-2xl border ${tier.popular ? colors.border : 'border-white/10'} bg-white/[0.02] backdrop-blur-sm overflow-hidden`}
        >
            {/* Popular Badge */}
            {tier.popular && (
                <div className={`absolute top-0 right-0 ${colors.bg} px-4 py-1 rounded-bl-xl`}>
                    <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>Most Popular</span>
                </div>
            )}

            <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl ${colors.bg}`}>
                        <Icon className={`w-6 h-6 ${colors.text}`} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                        <p className="text-sm text-white/50">{tier.tagline}</p>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-baseline gap-1">
                        {tier.monthlyFee ? (
                            <>
                                <span className="text-4xl font-bold text-white">${tier.monthlyFee}</span>
                                <span className="text-white/50">/month</span>
                            </>
                        ) : (
                            <span className="text-4xl font-bold text-white">Custom</span>
                        )}
                    </div>
                    <p className="text-sm text-white/50 mt-1">
                        + <span className={colors.text}>{tier.performanceFee}</span> of campaign spend
                    </p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                    {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                            {feature.included ? (
                                <Check className={`w-4 h-4 ${colors.text}`} />
                            ) : (
                                <X className="w-4 h-4 text-white/20" />
                            )}
                            <span className={feature.included ? 'text-white/80' : 'text-white/30'}>
                                {feature.text}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* CTA */}
                <Link
                    to={tier.ctaLink}
                    className={`flex items-center justify-center gap-2 w-full py-4 rounded-xl font-semibold transition-all ${colors.button}`}
                >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>

            {/* Glow */}
            {tier.popular && (
                <div className={`absolute -bottom-20 left-1/2 -translate-x-1/2 w-60 h-60 ${colors.glow} rounded-full blur-[120px] opacity-20 pointer-events-none`} />
            )}
        </motion.div>
    );
};

const FAQItem = ({ faq, index }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="border-b border-white/10 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-5 flex items-center justify-between text-left group"
            >
                <span className="text-white font-medium group-hover:text-brand-sky transition-colors">
                    {faq.q}
                </span>
                <ChevronDown className={`w-5 h-5 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <p className="pb-5 text-white/60">{faq.a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const Pricing = () => {
    return (
        <div className="min-h-screen bg-[#030303] text-white">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-brand-sky/5 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[150px]" />
            </div>

            {/* Header */}
            <header className="relative z-10 py-6 px-8">
                <nav className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold tracking-tight">
                        <span className="text-white">Reach</span>
                        <span className="text-brand-sky">Stakes</span>
                    </Link>
                    <Link
                        to="/new-landing"
                        className="text-sm text-white/60 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </nav>
            </header>

            <main className="relative z-10 px-6 lg:px-8 pb-24">
                {/* Hero */}
                <section className="text-center max-w-4xl mx-auto pt-16 pb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-400 uppercase tracking-wider">No Hidden Fees</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-6xl font-bold tracking-tight mb-6"
                    >
                        Simple, Transparent Pricing
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/50 max-w-2xl mx-auto"
                    >
                        No surprise fees. No complex contracts. Just results-driven influencer marketing.
                    </motion.p>
                </section>

                {/* Pricing Cards */}
                <section className="max-w-6xl mx-auto mb-24">
                    <div className="grid md:grid-cols-3 gap-6">
                        {PRICING_TIERS.map((tier, index) => (
                            <PricingCard key={tier.id} tier={tier} index={index} />
                        ))}
                    </div>
                </section>

                {/* Guarantee Banner */}
                <section className="max-w-4xl mx-auto mb-24">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-brand-sky/10 border border-emerald-500/20 text-center"
                    >
                        <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">14-Day Money-Back Guarantee</h3>
                        <p className="text-white/60 max-w-xl mx-auto">
                            Not satisfied with your first month? We'll refund your platform fee, no questions asked.
                        </p>
                    </motion.div>
                </section>

                {/* FAQ */}
                <section className="max-w-3xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
                        <p className="text-white/50">Everything you need to know about our pricing</p>
                    </div>

                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                        {FAQS.map((faq, index) => (
                            <FAQItem key={index} faq={faq} index={index} />
                        ))}
                    </div>

                    {/* Contact CTA */}
                    <div className="text-center mt-12">
                        <p className="text-white/50 mb-4">Still have questions?</p>
                        <Link
                            to="/meetings"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Talk to Sales
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Pricing;
