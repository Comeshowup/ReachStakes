import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Search, Rocket } from 'lucide-react';

const steps = [
    {
        icon: <UserPlus className="w-8 h-8 text-white" />,
        title: "Create Account",
        description: "Sign up as a brand or creator. Set up your profile and preferences in minutes."
    },
    {
        icon: <Search className="w-8 h-8 text-white" />,
        title: "Find Match",
        description: "Browse our curated marketplace or use our AI matching to find the perfect partner."
    },
    {
        icon: <Rocket className="w-8 h-8 text-white" />,
        title: "Launch Campaign",
        description: "Collaborate, track results, and handle payments securely through our platform."
    }
];

const HowItWorks = () => {
    return (
        <section className="py-24 bg-black text-white relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">How It Works</h2>
                    <p className="text-gray-400 text-lg">Simple steps to start your journey.</p>
                </div>

                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-gray-700 to-transparent border-t border-dashed border-gray-700" />

                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="relative flex flex-col items-center text-center group"
                        >
                            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 relative z-10 group-hover:border-purple-500 transition-colors duration-300 shadow-lg shadow-purple-500/5">
                                <div className="absolute inset-0 rounded-full bg-purple-500/10 scale-0 group-hover:scale-100 transition-transform duration-300" />
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                            <p className="text-gray-400 leading-relaxed max-w-xs">
                                {step.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default HowItWorks;
