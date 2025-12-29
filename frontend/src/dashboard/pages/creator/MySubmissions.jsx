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
    Loader2
} from "lucide-react";

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
        campaignId: "",
        platform: "YouTube",
        link: "",
        title: "",
        notes: ""
    });

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token'); // Assuming auth token is stored here
            await axios.post(`${API_BASE_URL}/collaborations/submit`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSuccess();
            onClose();
            setStep(1);
            setFormData({
                campaignId: "",
                platform: "YouTube",
                link: "",
                title: "",
                notes: ""
            });
        } catch (error) {
            console.error("Submission failed", error);
            const errorMsg = error.response?.data?.details || error.response?.data?.error || "Failed to submit video. Please try again.";
            console.log("Detailed Error Message from Backend:", errorMsg);
            if (error.response?.data) console.log("Full Error Data:", error.response.data);
            alert(`Error: ${errorMsg}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200 dark:border-slate-800"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Submit Content</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300">Select Campaign</label>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {campaigns.length === 0 ? (
                                    <p className="text-sm text-gray-500">No active campaigns available for submission.</p>
                                ) : (
                                    campaigns.map(campaign => (
                                        <button
                                            key={campaign.id}
                                            onClick={() => setFormData({ ...formData, campaignId: campaign.campaignId })}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${formData.campaignId === campaign.campaignId
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-500"
                                                : "border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700"
                                                }`}
                                        >
                                            <img src={campaign.brandLogo || `https://ui-avatars.com/api/?name=${campaign.brandName}`} alt={campaign.brandName} className="w-8 h-8 rounded-lg" />
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white">{campaign.campaignTitle}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">{campaign.brandName}</p>
                                            </div>
                                            {formData.campaignId === campaign.campaignId && <CheckCircle className="w-5 h-5 text-indigo-500 ml-auto" />}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-3">Platform</label>
                                <div className="flex gap-3">
                                    {["YouTube", "TikTok", "Instagram"].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setFormData({ ...formData, platform: p })}
                                            className={`flex-1 py-2.5 rounded-lg text-sm font-bold border transition-all ${formData.platform === p
                                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                                                : "border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Content Link</label>
                                <input
                                    type="text"
                                    placeholder="https://..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={formData.link}
                                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Video Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. My Morning Routine..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2">Notes (Optional)</label>
                                <textarea
                                    placeholder="Any additional details..."
                                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[100px]"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-between">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Back
                        </button>
                    ) : <div></div>}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !formData.campaignId || step === 2 && !formData.link}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!formData.title || isSubmitting}
                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                        >
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                            Submit Video
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const MySubmissions = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedId, setExpandedId] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSubmissions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSubmissions(response.data);
        } catch (error) {
            console.error("Failed to fetch submissions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    // Filter campaigns for the modal (those without a submission yet)
    // Actually, 'my-submissions' returns all collabs. We want to find collabs where submissionUrl is null or we want to allow re-submission?
    // Let's assume we want to submit for collabs that are 'Applied' or don't have a submission yet.
    const availableCampaigns = submissions.filter(s => !s.link || s.status === 'Revision Requested' || s.status === 'Applied');
    // This allows submitting if 'Applied' (new) or 'Revision' (update). 
    // And what if I want to list ALL campaigns I joined? 'submissions' list IS the list of joined campaigns basically.
    // 'my-submissions' logic in backend returns all CampaignCollaborations. Status could be 'Applied', 'In_Progress' etc.


    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 p-6 md:p-8 space-y-8 font-sans">

            {/* Header & Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-5xl mx-auto">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">My Submissions</h1>
                    <p className="text-gray-500 dark:text-slate-400 mt-1">Track your content approvals and performance.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" /> Submit New Video
                </button>
            </div>

            {/* Submissions List */}
            <div className="max-w-5xl mx-auto space-y-4">
                <AnimatePresence>
                    {submissions.length === 0 ? (
                        <p className="text-center text-gray-500">No submissions or active campaigns found.</p>
                    ) : (
                        submissions.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === item.id
                                    ? "border-indigo-500/50 ring-1 ring-indigo-500/20 shadow-xl"
                                    : "border-gray-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-md"
                                    }`}
                            >
                                {/* Card Header (Always Visible) */}
                                <div
                                    onClick={() => toggleExpand(item.id)}
                                    className="p-5 flex flex-col md:flex-row md:items-center gap-4 cursor-pointer"
                                >
                                    {/* Left: Identity */}
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <PlatformIcon platform={item.platform} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{item.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
                                                {item.campaignTitle} <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600"></span> {item.brandName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Center: Status */}
                                    <div className="flex flex-col md:items-end gap-1 min-w-[140px]">
                                        <StatusBadge status={item.status || "Applied"} />
                                        <span className="text-xs text-gray-400 dark:text-slate-500">Updated {new Date(item.date).toLocaleDateString()}</span>
                                    </div>

                                    {/* Right: Chevron */}
                                    <div className="hidden md:block text-gray-400 group-hover:text-indigo-500 transition-colors">
                                        {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence>
                                    {expandedId === item.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/20"
                                        >
                                            <div className="p-6">
                                                {/* Stats Section - Show if stats exist */}
                                                {(item.status === "Approved" || item.stats) && item.stats && (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                                                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-2">
                                                                <BarChart3 className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Views</span>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.stats.views?.toLocaleString() || 0}</p>
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                                                            <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 mb-2">
                                                                <MessageSquare className="w-4 h-4" /> <span className="text-xs font-bold uppercase">Likes</span>
                                                            </div>
                                                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.stats.likes?.toLocaleString() || 0}</p>
                                                        </div>
                                                        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex items-center justify-center">
                                                            {item.link ? (
                                                                <a href={item.link} target="_blank" rel="noreferrer" className="text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center gap-2 hover:underline">
                                                                    View Live Post <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            ) : (
                                                                <span className="text-gray-400 text-sm">No link provided</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {item.feedback && (
                                                    <div className="bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl mb-4">
                                                        <h4 className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center gap-2">
                                                            <MessageSquare className="w-4 h-4" /> Brand Feedback
                                                        </h4>
                                                        <p className="text-sm text-purple-700 dark:text-purple-400 leading-relaxed">
                                                            {item.feedback}
                                                        </p>
                                                    </div>
                                                )}

                                                {!item.link ? (
                                                    <div className="text-center py-4">
                                                        <p className="text-sm text-gray-500 mb-2">You haven't submitted a video for this campaign yet.</p>
                                                    </div>
                                                ) : item.status === "Under_Review" ? (
                                                    <div className="text-center py-4 text-gray-500 dark:text-slate-400 text-sm">
                                                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p>Your submission is currently being reviewed by the brand.</p>
                                                        <p>Typical response time is 24-48 hours.</p>
                                                        <p className="mt-2 text-xs">Video stats will update automatically every hour.</p>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <SubmissionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                campaigns={availableCampaigns}
                onSuccess={fetchSubmissions}
            />
        </div>
    );
};

export default MySubmissions;
