import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const CallToAction = () => {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-blue-900/20" />

            <div className="container mx-auto px-4 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto bg-zinc-900/50 border border-white/10 rounded-3xl p-12 backdrop-blur-sm"
                >
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        Ready to Start?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Join thousands of brands and creators who are already shaping the future of digital marketing.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors flex items-center gap-2">
                            Get Started Now
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 rounded-full bg-transparent border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-colors">
                            Contact Sales
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default CallToAction;
