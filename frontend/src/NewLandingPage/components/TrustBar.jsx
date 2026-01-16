import React from 'react';
import { ShieldCheck, Lock, CreditCard } from 'lucide-react';

const TrustBar = () => {
    // Placeholder brand logos - replace with actual client logos
    const brandLogos = [
        { name: 'TechFlow', initials: 'TF' },
        { name: 'BeautyBox', initials: 'BB' },
        { name: 'FitLife', initials: 'FL' },
        { name: 'StyleCo', initials: 'SC' },
        { name: 'EcoHome', initials: 'EH' },
    ];

    return (
        <section className="relative w-full py-8 border-t border-b border-white/5 bg-black/30 backdrop-blur-sm">
            <div className="container mx-auto px-6 lg:px-12">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                    {/* Brand Logos Section */}
                    <div className="flex flex-col items-center lg:items-start gap-4">
                        <p className="text-xs font-mono text-white/40 uppercase tracking-[0.2em]">
                            Trusted by 50+ DTC brands
                        </p>
                        <div className="flex items-center gap-4">
                            {brandLogos.map((brand, index) => (
                                <div
                                    key={index}
                                    className="group relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-white/20 hover:bg-white/10"
                                >
                                    <span className="text-sm font-semibold text-white/50 group-hover:text-white/80 transition-colors">
                                        {brand.initials}
                                    </span>
                                    {/* Tooltip */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span className="text-[10px] text-white/60 whitespace-nowrap bg-black/80 px-2 py-1 rounded">
                                            {brand.name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {/* More indicator */}
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <span className="text-xs font-medium text-white/40">+45</span>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="hidden lg:block w-px h-16 bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                    {/* Trust Badges Section */}
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <Lock className="w-4 h-4 text-brand-sky" />
                            <span className="text-xs font-medium text-white/70">Bank-Grade Escrow</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium text-white/70">SOC 2 Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                            <CreditCard className="w-4 h-4 text-violet-400" />
                            <span className="text-xs font-medium text-white/70">Secure Payments</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-64 h-px bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent" />
                <div className="absolute bottom-0 right-1/4 w-64 h-px bg-gradient-to-r from-transparent via-brand-sky/20 to-transparent" />
            </div>
        </section>
    );
};

export default TrustBar;
