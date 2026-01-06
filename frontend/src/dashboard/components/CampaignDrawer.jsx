import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Briefcase,
    FileText,
    ShieldCheck,
    Clock,
    DollarSign,
    ChevronDown,
    Zap,
    MapPin,
    Calendar,
    CheckCircle2,
    Lock,
    Loader2
} from "lucide-react";
import axios from "axios";
import GuaranteedPayBadge from "./GuaranteedPayBadge";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const CampaignDrawer = ({ isOpen, onClose, campaign, onApplySuccess }) => {
    const [activeTab, setActiveTab] = useState("Brief");
    const [expandedAccordion, setExpandedAccordion] = useState(null);
    const [isApplying, setIsApplying] = useState(false);

    if (!campaign) return null;

    const tabs = ["Brief", "Milestones", "Contract"];

    const toggleAccordion = (id) => {
        setExpandedAccordion(expandedAccordion === id ? null : id);
    };

    const handleApply = async () => {
        setIsApplying(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_BASE_URL}/campaigns/${campaign.id}/apply`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Application submitted successfully!");
            if (onApplySuccess) onApplySuccess();
            onClose();
        } catch (error) {
            console.error("Failed to apply", error);
            alert(error.response?.data?.message || "Failed to submit application");
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer Content */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-slate-950 border-l border-white/5 shadow-2xl z-[101] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
                            <div className="flex items-center gap-4">
                                <img src={campaign.logo} alt={campaign.brand} className="w-14 h-14 rounded-2xl object-cover shadow-2xl" />
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-white">{campaign.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">{campaign.brand}</p>
                                        {campaign.escrowBalance > 0 && <GuaranteedPayBadge variant="guaranteed" size="sm" />}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex px-8 py-4 gap-8 border-b border-white/5 bg-slate-900/30">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative py-2 text-sm font-bold transition-colors ${activeTab === tab ? "text-indigo-500" : "text-slate-500 hover:text-slate-300"
                                        }`}
                                >
                                    {tab}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-4 left-0 right-0 h-1 bg-indigo-500 rounded-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
                            {activeTab === "Brief" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-8"
                                >
                                    <section>
                                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                            <Briefcase className="w-5 h-5 text-indigo-500" />
                                            Campaign Goal
                                        </h3>
                                        <p className="text-slate-400 leading-relaxed">
                                            {campaign.description}
                                        </p>Section 3
                                    </section>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Platform Required</p>
                                            <p className="font-bold text-white">{campaign.platform}</p>
                                        </div>
                                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Deadline</p>
                                            <p className="font-bold text-white">{campaign.deadline}</p>
                                        </div>
                                    </div>

                                    <section className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                                        <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2">
                                            <Zap className="w-4 h-4" /> Creator Requirements
                                        </h4>
                                        <ul className="text-sm text-slate-400 space-y-2">
                                            <li className="flex items-center gap-2">• Must use specific hashtags: #NikeAir #InfiniteReach</li>
                                            <li className="flex items-center gap-2">• Mandatory swipe-up link in Stories</li>
                                            <li className="flex items-center gap-2">• High-quality 4K resolution required</li>
                                        </ul>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === "Milestones" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-6"
                                >
                                    {[
                                        { id: 1, title: "Concept Approval", status: "Completed", desc: "Submit your video concept for board review." },
                                        { id: 2, title: "Script Review", status: "In Progress", desc: "Write out the script and messaging." },
                                        { id: 3, title: "Draft 1 Submission", status: "Upcoming", desc: "Upload the first rough cut." },
                                        { id: 4, title: "Post Live", status: "Upcoming", desc: "Upload final version and publish." },
                                    ].map((milestone, idx) => (
                                        <div key={milestone.id} className="relative pl-10">
                                            {idx !== 3 && <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-white/5"></div>}
                                            <div className={`absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center border-2 ${milestone.status === 'Completed' ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-white/10'
                                                }`}>
                                                {milestone.status === 'Completed' ? <CheckCircle2 size={16} className="text-white" /> : <Clock size={16} className="text-slate-600" />}
                                            </div>
                                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-white">{milestone.title}</h4>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${milestone.status === 'Completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/10'
                                                        }`}>{milestone.status}</span>
                                                </div>
                                                <p className="text-xs text-slate-500">{milestone.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === "Contract" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-4"
                                >
                                    {[
                                        { id: 'usage', title: 'Usage Rights', icon: ShieldCheck, content: 'Brand receives 12 months of digital usage rights starting from the post date. This includes social media reposting and website usage.' },
                                        { id: 'exclusivity', title: 'Exclusivity Period', icon: Lock, content: 'Creator agree not to work with direct competitors (Adidas, Puma, New Balance) for the duration of the campaign + 30 days.' },
                                        { id: 'payment', title: 'Payment Terms', icon: DollarSign, content: 'Net-30 payment issued via Reachstakes Escrow upon successful campaign completion and logic verification.' },
                                    ].map(item => (
                                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                                            <button
                                                onClick={() => toggleAccordion(item.id)}
                                                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon className="w-5 h-5 text-indigo-500" />
                                                    <span className="font-bold text-white">{item.title}</span>
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: expandedAccordion === item.id ? 180 : 0 }}
                                                >
                                                    <ChevronDown className="w-5 h-5 text-slate-500" />
                                                </motion.div>
                                            </button>
                                            <AnimatePresence>
                                                {expandedAccordion === item.id && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="px-5 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4"
                                                    >
                                                        {item.content}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {/* Footer CTA */}
                        <div className="p-8 border-t border-white/5 bg-slate-900/50">
                            <button
                                onClick={handleApply}
                                disabled={isApplying}
                                className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-slate-200 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2"
                            >
                                {isApplying ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        SUBMITTING...
                                    </>
                                ) : "APPLY TO CAMPAIGN"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CampaignDrawer;
