import React from 'react';
import { TrendingUp, Wallet, Zap } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, color, delay }) => (
    <div
        className="group relative flex flex-col items-center p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-white/20 hover:bg-white/[0.04]"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Icon with glow */}
        <div className={`relative mb-4`}>
            <div className={`absolute inset-0 blur-xl opacity-30 ${color}`} />
            <div className={`relative p-3 rounded-xl bg-white/5 border border-white/10`}>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
        </div>

        {/* Value */}
        <span className="text-4xl lg:text-5xl font-bold text-white tracking-tight mb-2 group-hover:text-brand-sky transition-colors duration-300">
            {value}
        </span>

        {/* Label */}
        <span className="text-sm font-medium text-white/50 uppercase tracking-wider">
            {label}
        </span>

        {/* Hover effect line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-3/4 h-px bg-gradient-to-r from-transparent via-brand-sky/50 to-transparent transition-all duration-500" />
    </div>
);

const SocialProof = () => {
    const stats = [
        {
            icon: TrendingUp,
            value: '20:1',
            label: 'Average ROAS',
            color: 'text-brand-sky',
            delay: 0,
        },
        {
            icon: Wallet,
            value: '$2.4M',
            label: 'Paid to Creators',
            color: 'text-emerald-400',
            delay: 100,
        },
        {
            icon: Zap,
            value: '<7 Days',
            label: 'Time to Launch',
            color: 'text-violet-400',
            delay: 200,
        },
    ];

    return (
        <section className="relative w-full py-20 bg-gradient-to-b from-black/50 to-transparent">
            <div className="container mx-auto px-6 lg:px-12">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <p className="text-xs font-mono text-brand-sky/80 uppercase tracking-[0.3em] mb-4">
                        Proven Results
                    </p>
                    <h3 className="text-2xl lg:text-3xl font-medium text-white/80 tracking-tight">
                        Numbers that speak for themselves
                    </h3>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {stats.map((stat, index) => (
                        <StatCard key={index} {...stat} />
                    ))}
                </div>

                {/* Testimonial Highlight */}
                <div className="mt-16 max-w-2xl mx-auto">
                    <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-sm">
                        {/* Quote marks */}
                        <div className="absolute -top-3 left-8 text-5xl text-brand-sky/20 font-serif">"</div>

                        <blockquote className="relative z-10">
                            <p className="text-lg lg:text-xl text-white/80 font-light leading-relaxed italic mb-6">
                                ReachStakes 10x'd our TikTok ROAS in just 30 days. Their managed approach meant we didn't have to chase 50 creators — they handled everything.
                            </p>
                            <footer className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-sky/30 to-violet-500/30 flex items-center justify-center border border-white/10">
                                    <span className="text-sm font-semibold text-white">SC</span>
                                </div>
                                <div>
                                    <cite className="text-sm font-semibold text-white not-italic">Sarah Chen</cite>
                                    <p className="text-xs text-white/50">VP Marketing, BeautyBox</p>
                                </div>
                            </footer>
                        </blockquote>

                        {/* Decorative corner */}
                        <div className="absolute bottom-0 right-0 w-16 h-16 border-r border-b border-brand-sky/20 rounded-br-2xl" />
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none">
                <div className="absolute inset-0 bg-brand-sky/5 rounded-full blur-[120px]" />
            </div>
        </section>
    );
};

export default SocialProof;
