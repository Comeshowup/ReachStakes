import React from 'react';
import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';

const TICKER_ITEMS = [
    { id: 1, text: "Campaign 'Summer Glow' reached 1.2M impressions", time: "2m ago", type: "success" },
    { id: 2, text: "@SarahJ posted a new reel for 'Tech Week'", time: "5m ago", type: "info" },
    { id: 3, text: "Budget alert: 'Q4 Push' is at 85% spend", time: "12m ago", type: "warning" },
    { id: 4, text: "Payment of $4,500 cleared for Creator Batch #2", time: "1h ago", type: "success" },
    { id: 5, text: "New application from @TechReviewer (150K subs)", time: "2h ago", type: "info" }
];

const LiveTicker = () => {
    return (
        <div className="w-full bg-slate-900 border-b border-slate-800 overflow-hidden flex items-center h-10">
            <div className="flex-shrink-0 px-4 h-full flex items-center bg-indigo-600 z-10 shadow-lg">
                <Radio className="w-4 h-4 text-white animate-pulse mr-2" />
                <span className="text-xs font-mono font-bold text-white tracking-wider">LIVE</span>
            </div>

            <div className="flex-1 overflow-hidden relative">
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-slate-900 to-transparent z-10" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-slate-900 to-transparent z-10" />

                <motion.div
                    className="flex items-center whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 30
                    }}
                >
                    {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, index) => (
                        <div key={`${item.id}-${index}`} className="flex items-center mx-6">
                            <span className={`w-2 h-2 rounded-full mr-2 ${item.type === 'success' ? 'bg-green-500' :
                                    item.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-400'
                                }`} />
                            <span className="text-xs font-mono text-slate-300 mr-2">{item.time}:</span>
                            <span className="text-xs font-medium text-slate-100">{item.text}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default LiveTicker;
