import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, FileText, Send, Activity, Info, AlertCircle,
    CheckCircle, RotateCcw, DollarSign, Calendar, Paperclip,
    ExternalLink, BookOpen, CheckSquare, ShieldCheck, Sparkles,
} from 'lucide-react';
import { useDeliverableDetail, useSubmitDeliverable, useUpdateChecklist } from '../../../hooks/useDeliverables';
import DeliverableTimeline from './DeliverableTimeline';
import DeliverableChecklist from './DeliverableChecklist';
import SubmissionForm from './SubmissionForm';
import deliverableApi from '../../../api/deliverableService';

const PLATFORM_ICONS = {
    Instagram: '📸',
    TikTok: '🎵',
    YouTube: '🎥',
    Twitch: '🎮',
};

const STATUS_CONFIG = {
    Pending:            { label: 'Pending',           color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
    ScriptRequired:     { label: 'Script Required',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)' },
    ScriptSubmitted:    { label: 'Script Submitted',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
    ScriptApproved:     { label: 'Script Approved',   color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
    MockDraftSubmitted: { label: 'Mock Submitted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)' },
    MockDraftApproved:  { label: 'Mock Approved',     color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
    FinalDraftSubmitted:{ label: 'Final Submitted',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)' },
    RevisionRequested:  { label: 'Revision Needed',   color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.25)' },
    FinalApproved:      { label: 'Approved',          color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)' },
    Published:          { label: 'Published',         color: '#06b6d4', bg: 'rgba(6,182,212,0.1)',   border: 'rgba(6,182,212,0.25)' },
    PaymentReleased:    { label: 'Paid',              color: '#34d399', bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)' },
};

function getPriority(deadline) {
    if (!deadline) return { label: 'Low', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
    const diff = new Date(deadline) - new Date();
    const days = diff / (1000 * 60 * 60 * 24);
    if (days < 0) return { label: 'Overdue', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
    if (days <= 3) return { label: 'High', color: '#f97316', bg: 'rgba(249,115,22,0.1)' };
    if (days <= 7) return { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' };
    return { label: 'Low', color: '#64748b', bg: 'rgba(100,116,139,0.1)' };
}

function getNextSubmissionType(status, requireScript, requireMockDraft) {
    if (['ScriptRequired', 'RevisionRequested'].includes(status) && requireScript) return 'Script';
    if (status === 'ScriptApproved' && requireMockDraft) return 'MockDraft';
    if (status === 'ScriptApproved' && !requireMockDraft) return 'FinalDraft';
    if (status === 'MockDraftApproved') return 'FinalDraft';
    if (status === 'Pending' && requireScript) return 'Script';
    if (status === 'Pending' && !requireScript) return 'FinalDraft';
    if (status === 'RevisionRequested') return 'FinalDraft';
    return null;
}

const DeliverableWorkspaceDrawer = ({ deliverableId, campaignId, isOpen, onClose, onRefreshParent }) => {
    const [activeTab, setActiveTab] = useState('brief');
    const [complianceResult, setComplianceResult] = useState(null);
    const [showBrandVoice, setShowBrandVoice] = useState(false);

    const { deliverable, loading, error, refetch } = useDeliverableDetail(deliverableId);
    const { submit, submitting } = useSubmitDeliverable();
    const { updateChecklist } = useUpdateChecklist();

    // Re-fetch detail when drawer opens or deliverable ID changes
    useEffect(() => {
        if (isOpen && deliverableId) {
            refetch();
            setComplianceResult(null);
            setActiveTab('brief');
        }
    }, [isOpen, deliverableId, refetch]);

    const handleSubmit = useCallback(async (payload) => {
        try {
            await submit(deliverableId, payload);
            refetch();
            onRefreshParent?.();
            setComplianceResult(null);
            setActiveTab('history');
        } catch (_) { /* Handled in hook */ }
    }, [deliverableId, submit, refetch, onRefreshParent]);

    const handleChecklistToggle = useCallback(async (itemId, completed) => {
        if (!deliverable) return;
        const current = deliverable.checklistState || [];
        const updated = deliverable.checklist.map(item => {
            const existing = current.find(s => s.id === item.id);
            if (item.id === itemId) return { id: item.id, completed };
            return { id: item.id, completed: existing?.completed || false };
        });
        await updateChecklist(deliverableId, updated);
        refetch();
        onRefreshParent?.();
    }, [deliverable, deliverableId, updateChecklist, refetch, onRefreshParent]);

    const handleValidate = useCallback(async () => {
        try {
            const res = await deliverableApi.validate(deliverableId, {});
            setComplianceResult(res.data?.data);
        } catch (_) {}
    }, [deliverableId]);

    // Handle closing the drawer on ESC keypress
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex flex-col items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--bd-accent-primary)' }} />
                    <p className="text-xs mt-3" style={{ color: 'var(--bd-text-secondary)' }}>Loading Workspace...</p>
                </div>
            );
        }

        if (error || !deliverable) {
            return (
                <div className="text-center py-20 px-6">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-25" style={{ color: 'var(--bd-text-secondary)' }} />
                    <p className="text-sm mb-6" style={{ color: 'var(--bd-text-secondary)' }}>{error || 'Deliverable details could not be loaded.'}</p>
                    <button onClick={onClose} className="px-5 py-2 rounded-lg text-xs font-semibold text-white" style={{ background: 'var(--bd-accent-primary)' }}>
                        Close Drawer
                    </button>
                </div>
            );
        }

        const cfg = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.Pending;
        const nextType = getNextSubmissionType(deliverable.status, deliverable.requireScript, deliverable.requireMockDraft);
        const guidelines = deliverable.guidelines || {};
        const submissions = deliverable.submissions || [];
        const events = deliverable.events || [];
        const isOverdue = deliverable.deadline && new Date(deliverable.deadline) < new Date() && !['FinalApproved','Published','PaymentReleased'].includes(deliverable.status);
        const priority = getPriority(deliverable.deadline);
        const revisionFeedback = submissions.find(s => s.reviewStatus === 'revision_requested')?.reviewFeedback;

        // Custom Guidelines structure mapping
        const objective = guidelines.objective || guidelines.contentRequirements;
        const talkingPoints = guidelines.talkingPoints || [];
        const mentions = guidelines.mentions || [];
        const hashtags = guidelines.hashtags || [];
        const cta = guidelines.cta || guidelines.ctaRequirements;
        const prohibited = guidelines.prohibited || guidelines.restrictedClaims || guidelines.donts || [];
        const dos = guidelines.dos || [];
        const brandVoice = guidelines.brandVoice;
        const duration = guidelines.duration;
        const caption = guidelines.caption || guidelines.platformReqs;
        const scenes = guidelines.scenes || guidelines.productPlacement || guidelines.productPlacementRequirements;

        return (
            <div className="flex flex-col h-full overflow-hidden">
                {/* Header Info */}
                <div className="p-6 border-b" style={{ borderColor: 'var(--bd-border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-[14px] flex items-center gap-1">
                                    <span>{PLATFORM_ICONS[deliverable.platform] || '📎'}</span>
                                    <span className="font-semibold text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                                        {deliverable.platform}
                                    </span>
                                </span>
                                <span className="text-slate-600 text-xs">•</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--bd-text-secondary)' }}>
                                    {deliverable.contentType?.replace(/_/g, ' ') || 'Any Type'}
                                </span>
                            </div>
                            <h2 className="text-lg font-bold" style={{ color: 'var(--bd-text-primary)' }}>
                                {deliverable.title}
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                            style={{ color: 'var(--bd-text-secondary)' }}
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3.5 rounded-xl text-xs" style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)' }}>
                        <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>Status</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10px]" style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                                {cfg.label}
                            </span>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>Payment</p>
                            <p className="font-bold flex items-center" style={{ color: 'var(--bd-text-primary)' }}>
                                <DollarSign className="w-3.5 h-3.5 text-emerald-500 mr-0.5" />
                                {deliverable.paymentAmount ? `${parseFloat(deliverable.paymentAmount).toLocaleString()}` : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>Deadline</p>
                            <p className="font-medium flex items-center" style={{ color: isOverdue ? '#ef4444' : 'var(--bd-text-primary)' }}>
                                <Calendar className="w-3.5 h-3.5 mr-1 opacity-70" />
                                {deliverable.deadline ? new Date(deliverable.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Flexible'}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase font-semibold tracking-wider mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>Priority</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[10px]" style={{ background: priority.bg, color: priority.color }}>
                                {priority.label}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Sub-Tabs */}
                <nav className="flex px-6 border-b" style={{ borderColor: 'var(--bd-border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
                    {[
                        { id: 'brief', label: 'Guidelines & Assets', icon: BookOpen },
                        { id: 'submit', label: 'Submit Workspace', icon: CheckSquare },
                        { id: 'history', label: 'History & Activity', icon: Activity },
                    ].map(tab => {
                        const TabIcon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex items-center gap-2 py-3 px-4 text-xs font-semibold relative transition-colors"
                                style={{ color: isActive ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)' }}
                            >
                                <TabIcon className="w-3.5 h-3.5" />
                                {tab.label}
                                {isActive && (
                                    <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: 'var(--bd-accent-primary)' }} />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Drawer Body Scroll Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    
                    {/* Brief Tab */}
                    {activeTab === 'brief' && (
                        <div className="space-y-6">
                            
                            {/* Requirements Block */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-400" />
                                    Campaign Requirements
                                </h3>

                                <div className="space-y-3.5 text-xs">
                                    {objective && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Objective</span>
                                            <p className="leading-relaxed" style={{ color: 'var(--bd-text-primary)' }}>{objective}</p>
                                        </div>
                                    )}

                                    {talkingPoints && talkingPoints.length > 0 && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Talking Points</span>
                                            <ul className="list-disc pl-4 space-y-1 leading-relaxed" style={{ color: 'var(--bd-text-primary)' }}>
                                                {(Array.isArray(talkingPoints) ? talkingPoints : [talkingPoints]).map((tp, idx) => (
                                                    <li key={idx}>{tp}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {mentions && mentions.length > 0 && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Mandatory Mentions</span>
                                            <div className="flex flex-wrap gap-1.5 mt-1">
                                                {(Array.isArray(mentions) ? mentions : [mentions]).map((mention, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold border" style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--bd-text-primary)', borderColor: 'var(--bd-border-subtle)' }}>
                                                        {mention}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {cta && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Call to Action</span>
                                            <p className="leading-relaxed font-medium" style={{ color: 'var(--bd-accent-primary)' }}>{cta}</p>
                                        </div>
                                    )}

                                    {scenes && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Product Placement / Scenes</span>
                                            <p className="leading-relaxed" style={{ color: 'var(--bd-text-primary)' }}>{scenes}</p>
                                        </div>
                                    )}

                                    {duration && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Duration Requirements</span>
                                            <p className="font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                                                {typeof duration === 'object' ? `${duration.min || 0}s to ${duration.max || '∞'}s` : duration}
                                            </p>
                                        </div>
                                    )}

                                    {caption && (
                                        <div>
                                            <span className="text-[10px] uppercase font-bold tracking-wider block mb-1" style={{ color: 'var(--bd-text-secondary)' }}>Caption Requirements</span>
                                            <p className="leading-relaxed" style={{ color: 'var(--bd-text-primary)' }}>{caption}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Brand Guidelines Section */}
                            <div className="border-t pt-5" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                                <button
                                    onClick={() => setShowBrandVoice(!showBrandVoice)}
                                    className="flex items-center justify-between w-full text-left font-semibold text-sm text-white mb-3"
                                >
                                    <span className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-emerald-400" />
                                        Brand Guidelines
                                    </span>
                                    <span className="text-[11px] font-bold text-indigo-400">
                                        {showBrandVoice ? 'Collapse' : 'Expand Guidelines'}
                                    </span>
                                </button>

                                <AnimatePresence>
                                    {(showBrandVoice || (dos.length > 0 || prohibited.length > 0)) && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 text-xs overflow-hidden"
                                        >
                                            {brandVoice && (
                                                <div className="p-3 rounded-lg" style={{ background: 'var(--bd-surface-input)', border: '1px solid var(--bd-border-subtle)' }}>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-slate-400">Brand Voice & Persona</span>
                                                    <p className="leading-relaxed" style={{ color: 'var(--bd-text-primary)' }}>{brandVoice}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Do's */}
                                                <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-500/[0.02]">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block mb-2 text-emerald-400">Do's</span>
                                                    {dos && dos.length > 0 ? (
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {(Array.isArray(dos) ? dos : [dos]).map((item, idx) => (
                                                                <li key={idx} style={{ color: 'var(--bd-text-primary)' }}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[11px] italic text-slate-500">No specific dos provided.</p>
                                                    )}
                                                </div>

                                                {/* Don'ts / Prohibited */}
                                                <div className="p-3.5 rounded-lg border border-red-500/20 bg-red-500/[0.02]">
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block mb-2 text-red-400">Don'ts & Restrictions</span>
                                                    {prohibited && prohibited.length > 0 ? (
                                                        <ul className="list-disc pl-4 space-y-1">
                                                            {(Array.isArray(prohibited) ? prohibited : [prohibited]).map((item, idx) => (
                                                                <li key={idx} style={{ color: 'var(--bd-text-primary)' }}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <p className="text-[11px] italic text-slate-500">No prohibited guidelines defined.</p>
                                                    )}
                                                </div>
                                            </div>

                                            {hashtags && hashtags.length > 0 && (
                                                <div>
                                                    <span className="text-[10px] uppercase font-bold tracking-wider block mb-1 text-slate-400">Required Hashtags & Tags</span>
                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                        {(Array.isArray(hashtags) ? hashtags : [hashtags]).map((tag, idx) => (
                                                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Assets Area */}
                            <div className="border-t pt-5" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                                <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                                    <Paperclip className="w-4 h-4 text-emerald-400" />
                                    Brand Assets & Attachments
                                </h3>
                                {deliverable.assets && Array.isArray(deliverable.assets) && deliverable.assets.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {deliverable.assets.map((asset, idx) => (
                                            <a
                                                key={idx}
                                                href={asset.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-slate-800 transition-colors"
                                                style={{ borderColor: 'var(--bd-border-subtle)', background: 'var(--bd-surface-input)' }}
                                            >
                                                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold truncate text-white">{asset.name || 'Attachment'}</p>
                                                    <p className="text-[9px] text-slate-400 truncate uppercase">{asset.type || 'File'}</p>
                                                </div>
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                            </a>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 border border-dashed rounded-xl" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                                        <Paperclip className="w-6 h-6 mx-auto mb-2 opacity-35" style={{ color: 'var(--bd-text-secondary)' }} />
                                        <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>No references or files attached to this deliverable.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Submit Workspace Tab */}
                    {activeTab === 'submit' && (
                        <div className="space-y-6">
                            
                            {/* Compliance Checker Button */}
                            {nextType && (
                                <div className="p-4 rounded-xl border flex items-center justify-between gap-4" style={{ background: 'var(--bd-surface-input)', borderColor: 'var(--bd-border-subtle)' }}>
                                    <div className="flex items-start gap-3">
                                        <ShieldCheck className="w-5 h-5 mt-0.5 text-indigo-400" />
                                        <div>
                                            <h4 className="text-xs font-bold text-white">Compliance Check</h4>
                                            <p className="text-[10px] text-slate-400">Validate against required keywords, hashtags, and CTA guidelines before submitting.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleValidate}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 hover:bg-slate-800"
                                        style={{ border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-primary)' }}
                                    >
                                        Run Checks
                                    </button>
                                </div>
                            )}

                            {/* Checklist Module */}
                            {deliverable.checklist && deliverable.checklist.length > 0 && (
                                <div className="space-y-2">
                                    <DeliverableChecklist
                                        checklist={deliverable.checklist}
                                        checklistState={deliverable.checklistState || []}
                                        onToggle={handleChecklistToggle}
                                        readOnly={['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status)}
                                    />
                                </div>
                            )}

                            {/* Submission form / status message */}
                            {nextType ? (
                                <div className="space-y-3 pt-2">
                                    {revisionFeedback && (
                                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ background: 'rgba(249,115,22,0.04)', borderColor: 'rgba(249,115,22,0.25)' }}>
                                            <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5 text-orange-400" />
                                            <div>
                                                <p className="text-xs font-bold text-orange-400">Brand Feedback for Revision:</p>
                                                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>"{revisionFeedback}"</p>
                                            </div>
                                        </div>
                                    )}

                                    <SubmissionForm
                                        type={nextType}
                                        deliverable={deliverable}
                                        onSubmit={handleSubmit}
                                        submitting={submitting}
                                        complianceResult={complianceResult}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4">
                                    {['ScriptSubmitted', 'MockDraftSubmitted', 'FinalDraftSubmitted'].includes(deliverable.status) && (
                                        <div className="rounded-xl p-8 text-center border" style={{ background: 'var(--bd-surface-panel)', borderColor: 'var(--bd-border-subtle)' }}>
                                            <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-sky-400" />
                                            <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>Awaiting Brand Review</h4>
                                            <p className="text-xs leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>
                                                Your latest submission is being processed and reviewed by the brand. We will notify you once approval or revision requests are made.
                                            </p>
                                        </div>
                                    )}

                                    {['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status) && (
                                        <div className="rounded-xl p-8 text-center border" style={{ background: 'rgba(16,185,129,0.03)', borderColor: 'rgba(16,185,129,0.2)' }}>
                                            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
                                            <h4 className="text-sm font-semibold mb-1 text-emerald-400">
                                                {deliverable.status === 'PaymentReleased' ? 'Paid & Released' : 'Approved!'}
                                            </h4>
                                            <p className="text-xs leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>
                                                This deliverable is complete. The content was approved by the brand. {deliverable.status === 'PaymentReleased' ? 'Funds have been credited to your payment method.' : 'The payout is pending publication or schedule release.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* History & Timeline Tab */}
                    {activeTab === 'history' && (
                        <div className="space-y-6">
                            
                            {/* Submissions list */}
                            <div className="space-y-3.5">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Submission History</h3>
                                {submissions.length === 0 ? (
                                    <div className="text-center py-8 border border-dashed rounded-xl" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                                        <Send className="w-6 h-6 mx-auto mb-2 opacity-35" style={{ color: 'var(--bd-text-secondary)' }} />
                                        <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>No submissions made yet.</p>
                                    </div>
                                ) : (
                                    submissions.map(sub => (
                                        <div key={sub.id} className="rounded-xl p-4 border" style={{ background: 'var(--bd-surface-input)', borderColor: 'var(--bd-border-subtle)' }}>
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-white">
                                                        {sub.type.replace(/([A-Z])/g, ' $1').trim()} — V{sub.version}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                                                        background: sub.reviewStatus === 'approved' ? 'rgba(52,211,153,0.1)' : sub.reviewStatus === 'revision_requested' ? 'rgba(249,115,22,0.1)' : 'rgba(148,163,184,0.1)',
                                                        color: sub.reviewStatus === 'approved' ? '#34d399' : sub.reviewStatus === 'revision_requested' ? '#f97316' : '#94a3b8',
                                                    }}>
                                                        {sub.reviewStatus || 'pending'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px]" style={{ color: 'var(--bd-text-secondary)' }}>
                                                    {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {sub.textContent && (
                                                <div className="text-xs p-3 rounded-lg mb-2 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto bg-slate-900 text-slate-300">
                                                    {sub.textContent}
                                                </div>
                                            )}
                                            <div className="flex gap-4">
                                                {sub.fileUrl && (
                                                    <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline flex items-center gap-1 font-semibold text-indigo-400">
                                                        View File Link <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                                {sub.externalUrl && (
                                                    <a href={sub.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline flex items-center gap-1 font-semibold text-indigo-400">
                                                        View Platform Link <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </div>
                                            {sub.reviewFeedback && (
                                                <div className="mt-2.5 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(249,115,22,0.04)', border: '1px solid rgba(249,115,22,0.15)', color: 'var(--bd-text-secondary)' }}>
                                                    <strong>Brand Feedback:</strong> "{sub.reviewFeedback}"
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Activity Event Timeline */}
                            <div className="border-t pt-5 space-y-4.5" style={{ borderColor: 'var(--bd-border-subtle)' }}>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Activity Log</h3>
                                <DeliverableTimeline events={events} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
                {/* Overlay backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
                />

                {/* Side sheet drawer */}
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 26, stiffness: 220 }}
                    className="relative w-full max-w-2xl h-full flex flex-col shadow-2xl z-10"
                    style={{ background: '#09090B', borderLeft: '1px solid var(--bd-border-subtle)' }}
                >
                    {renderContent()}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DeliverableWorkspaceDrawer;
