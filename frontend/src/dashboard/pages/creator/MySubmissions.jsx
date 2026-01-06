import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
    Plus,
    Clock,
    CheckCircle,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Youtube,
    Instagram,
    BarChart3,
    Upload,
    X,
    MessageSquare,
    ExternalLink,
    Loader2,
    Zap,
    Eye,
    Heart
} from "lucide-react";
import CampaignDrawer from "../../components/CampaignDrawer";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// --- Components ---

const StatusBadge = ({ status }) => {
    const styles = {
        "Approved": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
        "Pending Review": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        "Revision Requested": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800",
        "Under_Review": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
        "Applied": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    };
    const icons = {
        "Approved": CheckCircle,
        "Pending Review": Clock,
        "Revision Requested": RotateCcw,
        "Under_Review": Clock,
        "Applied": Clock
    };
    const Icon = icons[status] || Clock;
    const style = styles[status] || "bg-gray-100 text-gray-700";

    return (
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
            <Icon className="w-3.5 h-3.5" />
            {status.replace('_', ' ')}
        </span>
    );
};

const PlatformIcon = ({ platform }) => {
    if (!platform) return <ExternalLink className="w-5 h-5 text-gray-400" />;
    switch (platform.toLowerCase()) {
        case "youtube": return <Youtube className="w-5 h-5 text-red-500" />;
        case "instagram": return <Instagram className="w-5 h-5 text-pink-500" />;
        case "tiktok": return <span className="text-xs font-bold bg-black text-white dark:bg-white dark:text-black px-1 py-0.5 rounded">TT</span>;
        default: return <ExternalLink className="w-5 h-5 text-gray-400" />;
    }
};

const SubmissionModal = ({ isOpen, onClose, campaigns, onSuccess }) => {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        collaborationId: "",
        platform: "YouTube",
        link: "",
        title: "",
        notes: ""
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            let videoId = null;
            if (formData.platform === "YouTube" && formData.link) {
                const match = formData.link.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (match) videoId = match[1];
            }

            await axios.post(`${API_BASE_URL}/collaborations/${formData.collaborationId}/submit`, {
                submissionUrl: formData.link,
                platform: formData.platform,
                videoId: videoId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            setStep(1);
            setFormData({ collaborationId: "", platform: "YouTube", link: "", title: "", notes: "" });
        } catch (error) {
            console.error("Submission failed", error);
            alert(`Error: ${error.response?.data?.details || "Failed to submit content"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-900 border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-8 border-b border-white/5">
                    <h2 className="text-xl font-black text-white italic tracking-tight">SUBMIT CONTENT</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Select Campaign</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                                {campaigns.map(campaign => (
                                    <button
                                        key={campaign.id}
                                        onClick={() => setFormData({ ...formData, collaborationId: campaign.id })}
                                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all ${formData.collaborationId === campaign.id
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-white/5 bg-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        <img src={campaign.brandLogo || `https://ui-avatars.com/api/?name=${campaign.brandName}`} alt={campaign.brandName} className="w-10 h-10 rounded-xl object-cover" />
                                        <div className="text-left">
                                            <p className="text-sm font-bold text-white">{campaign.campaignTitle}</p>
                                            <p className="text-xs text-slate-500 font-medium">{campaign.brandName}</p>
                                        </div>
                                        {formData.collaborationId === campaign.id && <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Platform</label>
                                <div className="flex gap-3">
                                    {["YouTube", "TikTok", "Instagram"].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setFormData({ ...formData, platform: p })}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black border uppercase transition-all ${formData.platform === p
                                                ? "border-indigo-500 bg-indigo-500/10 text-indigo-400"
                                                : "border-white/5 bg-white/5 text-slate-500 hover:text-slate-300"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Content URL</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Video Title</label>
                                <input
                                    type="text"
                                    placeholder="Enter submission title..."
                                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/5 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-white/5 flex justify-between bg-slate-900/50">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="text-sm font-black text-slate-500 hover:text-white transition-colors"
                        >
                            PREVIOUS
                        </button>
                    )}
                    <div className="flex-1"></div>
                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !formData.collaborationId || step === 2 && !formData.link}
                            className="px-8 py-3 bg-white text-slate-950 rounded-xl font-black text-xs uppercase hover:bg-slate-200 transition-all disabled:opacity-20"
                        >
                            NEXT STEP
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title || isSubmitting}
                            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            CONFIRM SUBMISSION
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const MySubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isResponding, setIsResponding] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const [subRes, invRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${API_BASE_URL}/campaigns/creator/${JSON.parse(localStorage.getItem('user')).id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            setSubmissions(subRes.data);
            setInvitations(invRes.data.data.filter(i => i.status === 'Invited'));
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRespond = async (collabId, action) => {
        setIsResponding(true);
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`${API_BASE_URL}/campaigns/respond/${collabId}`, { action }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert(`Invitation ${action === 'accept' ? 'accepted' : 'declined'}!`);
            fetchData();
        } catch (error) {
            console.error("Failed to respond", error);
            alert("Action failed");
        } finally {
            setIsResponding(false);
        }
    };

    const openDrawer = (item) => {
        const mappedCampaign = {
            id: item.id,
            title: item.campaignTitle,
            brand: item.brandName,
            logo: item.brandLogo || `https://ui-avatars.com/api/?name=${item.brandName}`,
            description: item.campaignDescription || "Access the full brand brief and campaign requirements here.",
            platform: item.platform || "Multi-Platform",
            deadline: item.date ? new Date(item.date).toLocaleDateString() : "Flexible",
            brandColor: item.brandColor || "#6366f1",
            milestones: item.milestones
        };
        setSelectedItem(mappedCampaign);
        setIsDrawerOpen(true);
    };

    const availableCampaigns = submissions.filter(s => !s.link || s.status === 'Revision Requested' || s.status === 'Applied');

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-slate-950">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter text-white">WORKSPACE</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Active Collaborations & Content Submissions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="group bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-indigo-500/20 flex items-center gap-3"
                >
                    <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    Submit New Content
                </button>
            </div>

            {/* Invitations Section */}
            {invitations.length > 0 && (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-indigo-500" />
                        <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Campaign Invitations</h2>
                        <span className="bg-indigo-600 text-[10px] font-black px-2 py-0.5 rounded-full text-white">{invitations.length} NEW</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {invitations.map(inv => (
                            <motion.div
                                key={inv.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-indigo-900/20 to-slate-900 p-6 rounded-3xl border border-indigo-500/20 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <img
                                        src={inv.campaign.brand.brandProfile?.logoUrl || `https://ui-avatars.com/api/?name=${inv.campaign.brand.brandProfile?.companyName}`}
                                        className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                                        alt=""
                                    />
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{inv.campaign.title}</h3>
                                        <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{inv.campaign.brand.brandProfile?.companyName}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleRespond(inv.id, 'decline')}
                                        disabled={isResponding}
                                        className="p-2 hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors rounded-xl border border-white/5"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleRespond(inv.id, 'accept')}
                                        disabled={isResponding}
                                        className="px-4 py-2 bg-white text-slate-950 text-xs font-black rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest shadow-xl shadow-white/5"
                                    >
                                        {isResponding ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="h-4"></div>
                </div>
            )}

            {/* Submissions List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-slate-500" />
                        <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Active Collaborations</h2>
                    </div>
                </div>
                {submissions.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5">
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">No active collaborations found</p>
                    </div>
                ) : (
                    submissions.map((item, index) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => openDrawer(item)}
                            className="group bg-slate-900/50 hover:bg-slate-900 rounded-3xl border border-white/5 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden p-6 flex flex-col md:flex-row md:items-center gap-6 relative"
                            style={{
                                "--brand-neon": item.brandColor || "#6366f1",
                            }}
                        >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-[var(--brand-neon)] opacity-40"></div>

                            {/* Identity */}
                            <div className="flex items-center gap-5 flex-1 relative z-10">
                                <div className="relative">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                        <PlatformIcon platform={item.platform} />
                                    </div>
                                    <div className="absolute inset-0 bg-[var(--brand-neon)] blur-xl opacity-20"></div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.campaignTitle}</h3>
                                    <p className="text-slate-500 font-bold text-xs mt-1 flex items-center gap-2">
                                        {item.brandName} <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span> {item.title || "CAMPAIGN"}
                                    </p>
                                </div>
                            </div>

                            {/* Video Stats (if submitted) */}
                            {item.stats && item.link && (
                                <div className="flex items-center gap-4 px-4 py-2 bg-white/5 rounded-xl border border-white/5 relative z-10">
                                    <div className="flex items-center gap-1.5">
                                        <Eye className="w-3.5 h-3.5 text-blue-400" />
                                        <span className="text-xs font-bold text-slate-300">
                                            {typeof item.stats.views === 'number' ? item.stats.views.toLocaleString() : item.stats.views || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Heart className="w-3.5 h-3.5 text-pink-400" />
                                        <span className="text-xs font-bold text-slate-300">
                                            {typeof item.stats.likes === 'number' ? item.stats.likes.toLocaleString() : item.stats.likes || 0}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                                        <span className="text-xs font-bold text-slate-300">
                                            {typeof item.stats.comments === 'number' ? item.stats.comments.toLocaleString() : item.stats.comments || 0}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Status & Action */}
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="text-right hidden sm:block">
                                    <StatusBadge status={item.status || "Applied"} />
                                    <p className="text-[10px] font-black text-slate-600 uppercase mt-2 tracking-widest">
                                        Last Active {new Date(item.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl text-slate-500 group-hover:text-indigo-400 transition-colors">
                                    <ChevronDown className="w-6 h-6 rotate-[-90deg]" />
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                campaigns={availableCampaigns}
                onSuccess={fetchData}
            />

            <CampaignDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                campaign={selectedItem}
            />
        </div>
    );
};

export default MySubmissions;
