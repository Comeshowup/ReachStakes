import React from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    DollarSign,
    Clock,
    Target,
    FileText,
    Users,
    CheckCircle,
    AlertCircle,
    Briefcase,
    ExternalLink,
    MapPin,
    Tag
} from "lucide-react";

// Overview Tab Component - Shows campaign brief, brand info, deadlines, milestones
const CampaignOverviewTab = ({ campaign }) => {
    if (!campaign) return null;

    // Extract campaign data (handle different API response structures)
    const campaignData = campaign.campaign || campaign;
    const brandProfile = campaignData.brand?.brandProfile || {};

    return (
        <div className="space-y-8">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <DollarSign className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-2xl font-black text-white">
                        ${campaign.rate?.toLocaleString() || campaignData.budget?.toLocaleString() || "TBD"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Campaign Rate</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <Calendar className="w-5 h-5 text-blue-400 mb-3" />
                    <p className="text-lg font-black text-white">
                        {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() :
                            campaignData.endDate ? new Date(campaignData.endDate).toLocaleDateString() : "Flexible"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Deadline</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <Target className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-lg font-black text-white capitalize">
                        {campaignData.platform || campaign.platform || "Multi-Platform"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Platform</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <FileText className="w-5 h-5 text-amber-400 mb-3" />
                    <p className="text-lg font-black text-white capitalize">
                        {campaignData.contentType || "Video"}
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Content Type</p>
                </div>
            </div>

            {/* Campaign Brief */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-indigo-400" />
                    Campaign Brief
                </h3>
                <div className="prose prose-invert max-w-none">
                    <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {campaignData.description || campaignData.brief || campaign.notes || "No brief available. Check with the brand for more details."}
                    </p>
                </div>

                {/* Requirements */}
                {campaignData.requirements && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h4 className="font-bold text-white text-sm mb-3">Requirements</h4>
                        <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">
                            {campaignData.requirements}
                        </p>
                    </div>
                )}

                {/* Tags/Categories */}
                {(campaignData.niche || campaignData.category) && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <h4 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-slate-400" />
                            Category
                        </h4>
                        <span className="inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-bold uppercase tracking-widest">
                            {campaignData.niche || campaignData.category}
                        </span>
                    </div>
                )}
            </div>

            {/* Brand Info */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-400" />
                    About the Brand
                </h3>
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 flex-shrink-0">
                        {brandProfile.logoUrl || campaign.brandLogo ? (
                            <img
                                src={brandProfile.logoUrl || campaign.brandLogo}
                                alt=""
                                className="w-14 h-14 rounded-lg object-cover"
                            />
                        ) : (
                            <Briefcase className="w-6 h-6 text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-white">
                            {brandProfile.companyName || campaign.brandName || "Brand"}
                        </h4>
                        {brandProfile.industry && (
                            <p className="text-sm text-slate-500 mt-1">{brandProfile.industry}</p>
                        )}
                        {brandProfile.website && (
                            <a
                                href={brandProfile.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300 mt-2"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Visit Website
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Milestones */}
            {campaign.milestones && campaign.milestones.length > 0 && (
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="font-black text-white text-lg mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-indigo-400" />
                        Milestones
                    </h3>
                    <div className="space-y-3">
                        {campaign.milestones.map((milestone, idx) => (
                            <div
                                key={idx}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${milestone.completed
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-white/5 border-white/10"
                                    }`}
                            >
                                <div className={`p-2 rounded-lg ${milestone.completed
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-slate-500/10 text-slate-400"
                                    }`}>
                                    {milestone.completed ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <Clock className="w-4 h-4" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold text-sm ${milestone.completed ? "text-emerald-400" : "text-white"
                                        }`}>
                                        {milestone.title || milestone.name}
                                    </p>
                                    {milestone.dueDate && (
                                        <p className="text-xs text-slate-500 mt-1">
                                            Due: {new Date(milestone.dueDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                {milestone.amount && (
                                    <span className="text-sm font-bold text-emerald-400">
                                        ${milestone.amount.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Notes from Creator */}
            {campaign.notes && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="font-black text-amber-400 text-lg mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Your Notes
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                        {campaign.notes}
                    </p>
                </div>
            )}
        </div>
    );
};

export default CampaignOverviewTab;
