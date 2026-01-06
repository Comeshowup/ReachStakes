import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, AlertCircle } from "lucide-react";

const CampaignCalendar = ({ collaborations = [] }) => {
    // Mocking some dates for visualization if none provided
    const items = [
        { id: 1, title: "Concept Approval", date: "Jan 5", campaign: "Nike Air Max", status: "completed" },
        { id: 2, title: "Script Review", date: "Jan 8", campaign: "Nike Air Max", status: "pending" },
        { id: 3, title: "Draft 1 Due", date: "Jan 12", campaign: "Nike Air Max", status: "upcoming" },
        { id: 4, title: "Final Edit", date: "Jan 15", campaign: "Creative Cloud", status: "upcoming" },
        { id: 5, title: "Go Live", date: "Jan 20", campaign: "Reachstakes Promo", status: "upcoming" },
    ];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Active Content Calendar</h3>
                        <p className="text-sm text-gray-500">Your upcoming deadlines across all campaigns</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div> Upcoming
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Completed
                    </span>
                </div>
            </div>

            <div className="relative">
                {/* Horizontal Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-slate-800 -translate-y-1/2 -z-0"></div>

                <div className="relative z-10 flex justify-between items-center min-w-[600px] py-12 px-4 gap-8">
                    {items.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex flex-col items-center group cursor-pointer flex-1"
                        >
                            {/* Date Bubble */}
                            <div className="mb-4 text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-tighter">
                                {item.date}
                            </div>

                            {/* Node */}
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 mb-4 ${item.status === 'completed'
                                    ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                    : item.status === 'upcoming'
                                        ? 'bg-indigo-600 text-white shadow-indigo-600/20 shadow-xl'
                                        : 'bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-700 text-indigo-600'
                                }`}>
                                {item.status === 'completed' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                            </div>

                            {/* Info */}
                            <div className="text-center space-y-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors whitespace-nowrap">
                                    {item.title}
                                </p>
                                <p className="text-[10px] text-gray-400 font-medium uppercase truncate max-w-[100px]">
                                    {item.campaign}
                                </p>
                            </div>

                            {/* Status Glow for 'Upcoming' */}
                            {item.status === 'pending' && (
                                <div className="absolute -top-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Empty State Overlay (Optional) */}
            {collaborations.length === 0 && items.length === 0 && (
                <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center z-20">
                    <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">No active deadlines</h4>
                    <p className="text-sm text-gray-500 max-w-xs">Apply to campaigns to see your content calendar come to life.</p>
                </div>
            )}
        </div>
    );
};

export default CampaignCalendar;
