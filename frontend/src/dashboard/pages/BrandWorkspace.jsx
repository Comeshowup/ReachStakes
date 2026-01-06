import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Plus,
    ArrowUpRight,
    Home,
} from "lucide-react";
import CampaignWorkspace from "../components/CampaignWorkspace";
import LaunchWizard from "../components/LaunchWizard";
import { ThemeToggle } from "../../components/ThemeToggle";
import { CAMPAIGNS_DATA } from "../data";
import { AnimatePresence } from "framer-motion";

const ProjectCard = ({ campaign, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full group flex items-center gap-3 p-3 rounded-xl transition-all duration-300 bg-transparent ${active
            ? "bg-slate-900/80 shadow-[0_0_15px_-5px_rgba(99,102,241,0.4)] border border-indigo-500/30 relative overflow-hidden"
            : "hover:bg-slate-900/40 border border-transparent hover:border-white/5"
            }`}
    >
        {active && <div className="absolute inset-0 bg-indigo-500/5 animate-pulse" />}

        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold relative z-10 transition-colors ${active
            ? "bg-indigo-600 text-white shadow-lg"
            : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
            }`}>
            {campaign.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 text-left min-w-0 relative z-10">
            <h4 className={`text-sm font-medium truncate ${active ? "text-white" : "text-slate-400 group-hover:text-slate-200"}`}>
                {campaign.name}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-600">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${campaign.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
                {campaign.status}
            </div>
        </div>
        {active && <ArrowUpRight className="w-4 h-4 text-indigo-400 relative z-10" />}
    </button>
);

const BrandWorkspace = () => {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState(campaignId ? parseInt(campaignId) : CAMPAIGNS_DATA[0]?.id);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const activeCampaign = CAMPAIGNS_DATA.find(c => c.id === activeId) || CAMPAIGNS_DATA[0];

    useEffect(() => {
        if (campaignId) {
            setActiveId(parseInt(campaignId));
        }
    }, [campaignId]);

    const handleSelectCampaign = (id) => {
        setActiveId(id);
        navigate(`/brand/workspace/${id}`);
    };

    return (
        <div className="flex h-screen bg-[#09090B] text-slate-200 overflow-hidden">
            {/* Sidebar - Project List */}
            <div className="w-80 bg-[#09090B] border-r border-slate-800/60 flex flex-col shrink-0 z-20">
                <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => navigate('/brand')}
                                className="p-1.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <Home size={16} />
                            </button>
                            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Your Projects</h2>
                        </div>
                        <button onClick={() => setIsWizardOpen(true)} className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors">
                            <Plus className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>

                    <div className="space-y-1">
                        {CAMPAIGNS_DATA.map(campaign => (
                            <ProjectCard
                                key={campaign.id}
                                campaign={campaign}
                                active={activeId === campaign.id}
                                onClick={() => handleSelectCampaign(campaign.id)}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-800/60 bg-[#09090B]">
                    <button
                        onClick={() => setIsWizardOpen(true)}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-xl shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                        Create Campaign
                    </button>
                    <div className="mt-4 flex justify-between items-center px-2">
                        <ThemeToggle />
                        <span className="text-[10px] text-slate-600 font-mono">v1.2.0</span>
                    </div>
                </div>
            </div>

            {/* Main Workspace Area (New Component) */}
            <CampaignWorkspace campaign={activeCampaign} />

            <AnimatePresence>
                {isWizardOpen && <LaunchWizard onClose={() => setIsWizardOpen(false)} />}
            </AnimatePresence>
        </div>
    );
};

export default BrandWorkspace;
