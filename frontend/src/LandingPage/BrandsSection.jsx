import React from 'react';
import { motion } from 'framer-motion';
import { Target, BarChart3, ShieldCheck, Globe } from 'lucide-react';

const features = [
    {
        icon: <Target className="w-6 h-6 text-purple-400" />,
        title: "Precision Targeting",
        description: "Find creators that match your exact audience demographics and brand values."
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-blue-400" />,
        title: "Real-Time Analytics",
        description: "Track campaign performance, ROI, and engagement metrics as they happen."
    },
    {
        icon: <ShieldCheck className="w-6 h-6 text-green-400" />,
        title: "Verified Creators",
        description: "Work with pre-vetted professionals. No bots, no fake engagement."
    },
    {
        icon: <Globe className="w-6 h-6 text-pink-400" />,
        title: "Global Reach",
        description: "Launch campaigns across multiple regions and languages seamlessly."
    }
];

const BrandsSection = () => {
    return (
        <section className="py-24 bg-black text-white relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Empower Your Brand</h2>
                    <p className="text-gray-400 text-lg">
                        Scale your marketing efforts with data-driven influencer campaigns that deliver real results.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                        >
                            <div className="mb-4 p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandsSection;
