import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Zap, Layout, Users } from 'lucide-react';

const features = [
    {
        icon: <Wallet className="w-6 h-6 text-emerald-400" />,
        title: "Instant Payments",
        description: "Get paid immediately upon campaign completion. No more chasing invoices."
    },
    {
        icon: <Zap className="w-6 h-6 text-yellow-400" />,
        title: "Direct Brand Deals",
        description: "Connect directly with top brands without the middleman taking a huge cut."
    },
    {
        icon: <Layout className="w-6 h-6 text-cyan-400" />,
        title: "Professional Portfolio",
        description: "Showcase your best work and stats in a stunning, shareable profile."
    },
    {
        icon: <Users className="w-6 h-6 text-indigo-400" />,
        title: "Community Growth",
        description: "Tools and insights to help you grow your audience and engagement."
    }
];

const CreatorsSection = () => {
    return (
        <section className="py-24 text-white relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black to-transparent opacity-50 pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="lg:w-1/2">
                        <motion.h2
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-5xl font-bold mb-6"
                        >
                            Built for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Creators</span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-gray-400 text-lg mb-8"
                        >
                            Turn your passion into a profession. We provide the tools, connections, and security you need to thrive in the creator economy.
                        </motion.p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 + index * 0.1 }}
                                    className="flex gap-4"
                                >
                                    <div className="mt-1">{feature.icon}</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{feature.title}</h3>
                                        <p className="text-sm text-gray-500">{feature.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        {/* Abstract UI Mockup */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative bg-zinc-800 rounded-2xl p-6 border border-zinc-700 shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                                    <div>
                                        <div className="h-2 w-24 bg-zinc-600 rounded mb-2" />
                                        <div className="h-2 w-16 bg-zinc-700 rounded" />
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">Active</div>
                            </div>

                            <div className="space-y-4">
                                <div className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-700/50 p-4 flex items-center justify-between">
                                    <div>
                                        <div className="h-2 w-32 bg-zinc-600 rounded mb-2" />
                                        <div className="h-2 w-20 bg-zinc-700 rounded" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">$2,400</div>
                                        <div className="text-xs text-gray-500">Pending</div>
                                    </div>
                                </div>
                                <div className="h-24 rounded-xl bg-zinc-900/50 border border-zinc-700/50 p-4 flex items-center justify-between">
                                    <div>
                                        <div className="h-2 w-28 bg-zinc-600 rounded mb-2" />
                                        <div className="h-2 w-24 bg-zinc-700 rounded" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xl font-bold text-white">$1,850</div>
                                        <div className="text-xs text-emerald-400">Paid</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CreatorsSection;
