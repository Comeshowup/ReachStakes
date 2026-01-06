import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Kanban,
    FileSignature,
    TrendingUp,
    LayoutDashboard,
    Search,
    Bell,
    Settings,
    ChevronDown,
    Filter,
    Calendar,
    Users,
    MoreHorizontal
} from "lucide-react";
import CollaborationsKanban from "./CollaborationsKanban";
import ContractStatus from "./ContractStatus";
import PerformanceDeepDive from "./PerformanceDeepDive";

// --- Tab Navigation Component ---
const TabButton = ({ active, icon: Icon, label, onClick }) => (
    <button
        onClick={onClick}
        className={`relative flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium transition-all duration-300 rounded-full ${active
            ? "text-white shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)]"
            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }`}
    >
        {active && (
            <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-indigo-600 rounded-full"
                initial={false}
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
        )}
        <span className="relative z-10 flex items-center gap-2">
            <Icon className={`w-4 h-4 ${active ? "text-indigo-100" : "text-slate-400 group-hover:text-slate-300"}`} />
            {label}
        </span>
    </button>
);

// --- Stat Badge ---
const StatBadge = ({ icon: Icon, value, label, trend, color = "indigo" }) => {
    // Color mapping
    const theme = {
        indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/20", text: "text-indigo-400", glow: "group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]" },
        emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", glow: "group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]" },
        amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", glow: "group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]" },
    }[color];

    return (
        <div className={`group flex items-center gap-3 px-4 py-2 rounded-xl border transition-all duration-300 ${theme.bg} ${theme.border} ${theme.glow}`}>
            <div className={`p-1.5 rounded-lg bg-black/20 ${theme.text}`}>
                <Icon size={16} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold text-slate-100">{value}</span>
                    {trend && <span className="text-[10px] text-emerald-500 font-medium">{trend}</span>}
                </div>
            </div>
        </div>
    );
};

// --- Main Workspace Component ---
const CampaignWorkspace = ({ campaign }) => {
    const [activeTab, setActiveTab] = useState("kanban");

    return (
        <div className="flex-1 flex flex-col h-full bg-[#09090B] text-slate-200 relative overflow-hidden font-sans">
            {/* Ambient Background Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* --- Executive Header --- */}
            <header className="shrink-0 px-8 py-5 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl z-40">
                <div className="flex items-center justify-between mb-6">
                    {/* Brand & Campaign Title */}
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-xl font-bold text-white">{campaign.name.substring(0, 2).toUpperCase()}</span>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-white tracking-tight">{campaign.name}</h1>
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Live Campaign
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    Oct 24 - Dec 15, 2024
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-700" />
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    12 Creators Active
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* KPI Quick View */}
                    <div className="flex items-center gap-3">
                        <StatBadge icon={Users} value="2.4M" label="Total Reach" color="indigo" />
                        <StatBadge icon={TrendingUp} value="4.2%" label="Engagement" color="emerald" />
                        <StatBadge icon={Briefcase} value="$42.5K" label="Budget Used" color="amber" />
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center p-1 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                        <TabButton
                            active={activeTab === 'overview'}
                            onClick={() => setActiveTab('overview')}
                            icon={LayoutDashboard}
                            label="Overview"
                        />
                        <TabButton
                            active={activeTab === 'kanban'}
                            onClick={() => setActiveTab('kanban')}
                            icon={Kanban}
                            label="Workflow"
                        />
                        <TabButton
                            active={activeTab === 'contracts'}
                            onClick={() => setActiveTab('contracts')}
                            icon={FileSignature}
                            label="Contracts"
                        />
                        <TabButton
                            active={activeTab === 'performance'}
                            onClick={() => setActiveTab('performance')}
                            icon={TrendingUp}
                            label="Performance"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search workspace..."
                                className="pl-9 pr-4 py-2 bg-slate-900/50 border border-white/5 rounded-full text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-[#09090B]"></span>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* --- Main Content Area --- */}
            <main className="flex-1 overflow-hidden relative bg-[#09090B]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -15, scale: 0.98 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className={`h-full w-full ${activeTab === 'kanban' ? 'p-0' : 'p-6'}`}
                    >
                        {activeTab === 'overview' && (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                Overview Component Coming Soon
                            </div>
                        )}
                        {activeTab === 'kanban' && <CollaborationsKanban />}
                        {activeTab === 'contracts' && <ContractStatus />}
                        {activeTab === 'performance' && <PerformanceDeepDive />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

// Icons helper since they were not all imported in standard way
import { Briefcase } from "lucide-react";

export default CampaignWorkspace;
