import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
    BarChart3, TrendingUp, Eye, Heart, MessageCircle, Share2,
    Youtube, Instagram, ExternalLink, Loader2, RefreshCw, Play
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const PlatformIcon = ({ platform, className = "w-5 h-5" }) => {
    const p = platform?.toLowerCase() || "";
    if (p.includes("youtube")) return <Youtube className={`${className} text-red-500`} />;
    if (p.includes("instagram")) return <Instagram className={`${className} text-pink-500`} />;
    return <Play className={`${className} text-indigo-500`} />;
};

const formatNumber = (num) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
};

const StatsCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
        <Icon className={`w-5 h-5 ${color} mb-2`} />
        <p className="text-2xl font-black text-white">{typeof value === 'string' ? value : formatNumber(value)}</p>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

const VideoStatsRow = ({ submission, index }) => {
    const stats = submission.stats || {};
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.05 }}
            className="bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all">
            <div className="flex items-center gap-4">
                <div className="w-20 h-14 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                    <PlatformIcon platform={submission.platform} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{submission.title || "Content"}</h4>
                    <span className="text-xs text-slate-500">{new Date(submission.createdAt || submission.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center"><p className="font-bold text-white">{formatNumber(stats.views)}</p><Eye className="w-3 h-3 text-blue-400 mx-auto" /></div>
                    <div className="text-center"><p className="font-bold text-white">{formatNumber(stats.likes)}</p><Heart className="w-3 h-3 text-pink-400 mx-auto" /></div>
                    <div className="text-center hidden md:block"><p className="font-bold text-white">{formatNumber(stats.comments)}</p><MessageCircle className="w-3 h-3 text-emerald-400 mx-auto" /></div>
                </div>
                {submission.link && <a href={submission.link} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 hover:bg-indigo-500/20 rounded-lg"><ExternalLink className="w-4 h-4 text-slate-400" /></a>}
            </div>
        </motion.div>
    );
};

const CampaignVideoStatsTab = ({ collaborationId, campaign }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchSubmissions(); }, [collaborationId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, { headers: { Authorization: `Bearer ${token}` } });
            const filtered = (response.data || []).filter(s => (s.collaborationId === parseInt(collaborationId) || s.id === parseInt(collaborationId)) && s.link);
            setSubmissions(filtered);
        } catch (error) { console.error("Failed:", error); }
        finally { setLoading(false); }
    };

    const totals = submissions.reduce((acc, s) => ({ views: acc.views + (s.stats?.views || 0), likes: acc.likes + (s.stats?.likes || 0), comments: acc.comments + (s.stats?.comments || 0) }), { views: 0, likes: 0, comments: 0 });
    const engagementRate = totals.views > 0 ? ((totals.likes + totals.comments) / totals.views * 100).toFixed(2) : "0.00";

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-black text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" />Video Performance</h2><p className="text-sm text-slate-500 mt-1">{submissions.length} video(s)</p></div>
                <button onClick={fetchSubmissions} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl"><RefreshCw className="w-4 h-4 text-slate-400" /></button>
            </div>
            {submissions.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatsCard icon={Eye} label="Views" value={totals.views} color="text-blue-400" />
                    <StatsCard icon={Heart} label="Likes" value={totals.likes} color="text-pink-400" />
                    <StatsCard icon={MessageCircle} label="Comments" value={totals.comments} color="text-emerald-400" />
                    <StatsCard icon={TrendingUp} label="Engagement" value={`${engagementRate}%`} color="text-purple-400" />
                </div>
            )}
            {submissions.length === 0 ? (
                <div className="text-center py-16 bg-white/5 rounded-2xl"><BarChart3 className="w-12 h-12 text-slate-700 mx-auto mb-4" /><p className="text-slate-500 text-xs uppercase">No video stats yet</p></div>
            ) : (
                <div className="space-y-3">{submissions.map((s, i) => <VideoStatsRow key={s.id || i} submission={s} index={i} />)}</div>
            )}
        </div>
    );
};

export default CampaignVideoStatsTab;
