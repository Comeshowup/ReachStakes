import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Loader2, Briefcase, FileText, Video, Clock,
    DollarSign, CheckCircle, RotateCcw, ChevronRight, Eye,
    ListChecks, Activity, Send, AlertCircle,
} from 'lucide-react';
import { useDeliverableDetail, useSubmitDeliverable, useUpdateChecklist } from '../../../hooks/useDeliverables';
import DeliverableTimeline from '../../components/deliverables/DeliverableTimeline';
import DeliverableChecklist from '../../components/deliverables/DeliverableChecklist';
import SubmissionForm from '../../components/deliverables/SubmissionForm';
import deliverableApi from '../../../api/deliverableService';

const STATUS_CONFIG = {
    Pending:            { label: 'Pending',           color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
    ScriptRequired:     { label: 'Script Required',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    ScriptSubmitted:    { label: 'Script Submitted',  color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    ScriptApproved:     { label: 'Script Approved',   color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    MockDraftSubmitted: { label: 'Mock Submitted',    color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    MockDraftApproved:  { label: 'Mock Approved',     color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
    FinalDraftSubmitted:{ label: 'Final Submitted',   color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    RevisionRequested:  { label: 'Revision Needed',   color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    FinalApproved:      { label: 'Approved',          color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
    Published:          { label: 'Published',         color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
    PaymentReleased:    { label: 'Paid',              color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
};

const TABS = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'submissions', label: 'Submissions', icon: Send },
    { id: 'activity', label: 'Activity', icon: Activity },
];

/** Determine which submission type to show based on current status */
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

const DeliverableDetailPage = () => {
    const { campaignId, deliverableId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [complianceResult, setComplianceResult] = useState(null);

    const { deliverable, loading, error, refetch } = useDeliverableDetail(parseInt(deliverableId));
    const { submit, submitting } = useSubmitDeliverable();
    const { updateChecklist } = useUpdateChecklist();

    const handleSubmit = useCallback(async (payload) => {
        try {
            await submit(parseInt(deliverableId), payload);
            refetch();
            setComplianceResult(null);
        } catch (_) { /* error handled in hook */ }
    }, [deliverableId, submit, refetch]);

    const handleChecklistToggle = useCallback(async (itemId, completed) => {
        if (!deliverable) return;
        const current = deliverable.checklistState || [];
        const updated = deliverable.checklist.map(item => {
            const existing = current.find(s => s.id === item.id);
            if (item.id === itemId) return { id: item.id, completed };
            return { id: item.id, completed: existing?.completed || false };
        });
        await updateChecklist(parseInt(deliverableId), updated);
        refetch();
    }, [deliverable, deliverableId, updateChecklist, refetch]);

    const handleValidate = useCallback(async () => {
        try {
            const res = await deliverableApi.validate(parseInt(deliverableId), {});
            setComplianceResult(res.data?.data);
        } catch (_) {}
    }, [deliverableId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--bd-accent-primary)' }} />
            </div>
        );
    }

    if (error || !deliverable) {
        return (
            <div className="text-center py-24">
                <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm mb-6" style={{ color: 'var(--bd-text-secondary)' }}>{error || 'Deliverable not found'}</p>
                <button onClick={() => navigate(`/creator/campaigns/${campaignId}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: 'var(--bd-accent-primary)' }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Campaign
                </button>
            </div>
        );
    }

    const cfg = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.Pending;
    const nextType = getNextSubmissionType(deliverable.status, deliverable.requireScript, deliverable.requireMockDraft);
    const guidelines = deliverable.guidelines || {};
    const submissions = deliverable.submissions || [];
    const events = deliverable.events || [];
    const campaign = deliverable.collaboration?.campaign;
    const isOverdue = deliverable.deadline && new Date(deliverable.deadline) < new Date() && !['FinalApproved','Published','PaymentReleased'].includes(deliverable.status);
    const revisionFeedback = submissions.find(s => s.reviewStatus === 'revision_requested')?.reviewFeedback;

    return (
        <div>
            {/* Header */}
            <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                <div className="flex items-start gap-3">
                    <button onClick={() => navigate(`/creator/campaigns/${campaignId}`)} className="p-2 rounded-lg flex-shrink-0 mt-0.5 transition-colors" style={{ color: 'var(--bd-text-secondary)', background: 'var(--bd-surface-input)' }}>
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                            {campaign?.title || 'Campaign'}
                        </p>
                        <h1 className="text-lg font-bold tracking-tight truncate" style={{ color: 'var(--bd-text-primary)' }}>
                            {deliverable.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        {deliverable.paymentAmount && (
                            <div className="text-right">
                                <div className="flex items-center gap-1 justify-end">
                                    <DollarSign className="w-3.5 h-3.5" style={{ color: '#34d399' }} />
                                    <span className="text-sm font-bold" style={{ color: 'var(--bd-text-primary)' }}>${parseFloat(deliverable.paymentAmount).toLocaleString()}</span>
                                </div>
                                <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: 'var(--bd-text-secondary)' }}>Payment</span>
                            </div>
                        )}
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                            {cfg.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Revision Alert */}
            {deliverable.status === 'RevisionRequested' && revisionFeedback && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.3)' }}>
                    <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f97316' }} />
                    <div>
                        <p className="text-sm font-semibold mb-0.5" style={{ color: '#fb923c' }}>Revision Requested</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--bd-text-secondary)' }}>"{revisionFeedback}"</p>
                    </div>
                </div>
            )}

            {/* Overdue Alert */}
            {isOverdue && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-5" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <AlertCircle className="w-4 h-4" style={{ color: '#ef4444' }} />
                    <span className="text-xs font-medium" style={{ color: '#f87171' }}>This deliverable is past its deadline</span>
                </div>
            )}

            {/* Tabs */}
            <nav className="flex gap-1 mb-5" style={{ borderBottom: '1px solid var(--bd-border-subtle)' }}>
                {TABS.map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className="flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all relative" style={{ color: isActive ? 'var(--bd-text-primary)' : 'var(--bd-text-secondary)' }}>
                            <TabIcon className="w-4 h-4" />
                            {tab.label}
                            {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ background: 'var(--bd-accent-primary)' }} />}
                        </button>
                    );
                })}
            </nav>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-5">
                        {/* Guidelines */}
                        {Object.keys(guidelines).length > 0 && (
                            <div className="rounded-xl p-5" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--bd-text-primary)' }}>
                                    <FileText className="w-4 h-4" style={{ color: 'var(--bd-accent-primary)' }} /> Guidelines
                                </h3>
                                <div className="space-y-3 text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                                    {guidelines.objective && <div><span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5" style={{ color: 'var(--bd-text-secondary)' }}>Objective</span><p style={{ color: 'var(--bd-text-primary)' }}>{guidelines.objective}</p></div>}
                                    {guidelines.talkingPoints && <div><span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Talking Points</span><ul className="list-disc list-inside space-y-0.5">{(Array.isArray(guidelines.talkingPoints) ? guidelines.talkingPoints : [guidelines.talkingPoints]).map((p, i) => <li key={i}>{p}</li>)}</ul></div>}
                                    {guidelines.hashtags && <div><span className="text-[10px] uppercase tracking-wider font-semibold block mb-1">Hashtags</span><div className="flex flex-wrap gap-1.5">{guidelines.hashtags.map((tag, i) => <span key={i} className="px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--bd-accent-primary)' }}>{tag}</span>)}</div></div>}
                                    {guidelines.cta && <div><span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5">Call to Action</span><p style={{ color: 'var(--bd-text-primary)' }}>{guidelines.cta}</p></div>}
                                    {guidelines.prohibited && <div><span className="text-[10px] uppercase tracking-wider font-semibold block mb-0.5" style={{ color: '#f87171' }}>Prohibited</span><p style={{ color: '#f87171' }}>{Array.isArray(guidelines.prohibited) ? guidelines.prohibited.join(', ') : guidelines.prohibited}</p></div>}
                                </div>
                            </div>
                        )}

                        {/* Submission Form */}
                        {nextType && (
                            <SubmissionForm
                                type={nextType}
                                deliverable={deliverable}
                                onSubmit={handleSubmit}
                                submitting={submitting}
                                complianceResult={complianceResult}
                            />
                        )}

                        {/* Awaiting review state */}
                        {['ScriptSubmitted', 'MockDraftSubmitted', 'FinalDraftSubmitted'].includes(deliverable.status) && (
                            <div className="rounded-xl p-6 text-center" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" style={{ color: '#60a5fa' }} />
                                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--bd-text-primary)' }}>Awaiting Brand Review</p>
                                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>Your submission is being reviewed. You'll be notified once feedback is available.</p>
                            </div>
                        )}

                        {/* Completed state */}
                        {['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status) && (
                            <div className="rounded-xl p-6 text-center" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#10b981' }} />
                                <p className="text-sm font-semibold mb-1" style={{ color: '#34d399' }}>
                                    {deliverable.status === 'PaymentReleased' ? 'Payment Released!' : deliverable.status === 'Published' ? 'Content Published!' : 'Content Approved!'}
                                </p>
                                <p className="text-xs" style={{ color: 'var(--bd-text-secondary)' }}>
                                    {deliverable.status === 'PaymentReleased' ? 'Your payment has been released for this deliverable.' : 'Your content has been approved by the brand.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* Checklist */}
                        {deliverable.checklist && deliverable.checklist.length > 0 && (
                            <DeliverableChecklist
                                checklist={deliverable.checklist}
                                checklistState={deliverable.checklistState || []}
                                onToggle={handleChecklistToggle}
                                readOnly={['FinalApproved', 'Published', 'PaymentReleased'].includes(deliverable.status)}
                            />
                        )}

                        {/* Validate Button */}
                        {nextType && (
                            <button onClick={handleValidate} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)', color: 'var(--bd-text-secondary)' }}>
                                <ListChecks className="w-3.5 h-3.5" /> Run Compliance Check
                            </button>
                        )}

                        {/* Info Card */}
                        <div className="rounded-xl p-4 space-y-3" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                            <h4 className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--bd-text-secondary)' }}>Details</h4>
                            {deliverable.platform && <div className="flex justify-between text-xs"><span style={{ color: 'var(--bd-text-secondary)' }}>Platform</span><span className="font-medium" style={{ color: 'var(--bd-text-primary)' }}>{deliverable.platform}</span></div>}
                            {deliverable.contentType && <div className="flex justify-between text-xs"><span style={{ color: 'var(--bd-text-secondary)' }}>Type</span><span className="font-medium" style={{ color: 'var(--bd-text-primary)' }}>{deliverable.contentType.replace(/_/g, ' ')}</span></div>}
                            {deliverable.deadline && <div className="flex justify-between text-xs"><span style={{ color: 'var(--bd-text-secondary)' }}>Deadline</span><span className="font-medium" style={{ color: isOverdue ? '#ef4444' : 'var(--bd-text-primary)' }}>{new Date(deliverable.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>}
                            <div className="flex justify-between text-xs"><span style={{ color: 'var(--bd-text-secondary)' }}>Script Required</span><span className="font-medium" style={{ color: 'var(--bd-text-primary)' }}>{deliverable.requireScript ? 'Yes' : 'No'}</span></div>
                            <div className="flex justify-between text-xs"><span style={{ color: 'var(--bd-text-secondary)' }}>Mock Draft</span><span className="font-medium" style={{ color: 'var(--bd-text-primary)' }}>{deliverable.requireMockDraft ? 'Yes' : 'No'}</span></div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'submissions' && (
                <div className="space-y-4">
                    {submissions.length === 0 ? (
                        <div className="text-center py-12 rounded-xl" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                            <Send className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: 'var(--bd-text-secondary)' }} />
                            <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>No submissions yet</p>
                        </div>
                    ) : (
                        submissions.map(sub => (
                            <div key={sub.id} className="rounded-xl p-4" style={{ background: 'var(--bd-surface-panel)', border: '1px solid var(--bd-border-subtle)' }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold" style={{ color: 'var(--bd-text-primary)' }}>{sub.type.replace(/([A-Z])/g, ' $1').trim()} — V{sub.version}</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{
                                            background: sub.reviewStatus === 'approved' ? 'rgba(52,211,153,0.1)' : sub.reviewStatus === 'revision_requested' ? 'rgba(249,115,22,0.1)' : 'rgba(148,163,184,0.1)',
                                            color: sub.reviewStatus === 'approved' ? '#34d399' : sub.reviewStatus === 'revision_requested' ? '#f97316' : '#94a3b8',
                                        }}>
                                            {sub.reviewStatus || 'pending'}
                                        </span>
                                    </div>
                                    <span className="text-[10px]" style={{ color: 'var(--bd-text-secondary)' }}>{new Date(sub.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                                {sub.textContent && <div className="text-xs p-3 rounded-lg mb-2 whitespace-pre-wrap leading-relaxed" style={{ background: 'var(--bd-surface-input)', color: 'var(--bd-text-primary)', maxHeight: 200, overflow: 'auto' }}>{sub.textContent}</div>}
                                {sub.fileUrl && <a href={sub.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline" style={{ color: 'var(--bd-accent-primary)' }}>View File →</a>}
                                {sub.externalUrl && <a href={sub.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline ml-3" style={{ color: 'var(--bd-accent-primary)' }}>Platform Link →</a>}
                                {sub.reviewFeedback && <div className="mt-2 px-3 py-2 rounded-lg text-xs" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)', color: 'var(--bd-text-secondary)' }}>Feedback: "{sub.reviewFeedback}"</div>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {activeTab === 'activity' && (
                <DeliverableTimeline events={events} />
            )}
        </div>
    );
};

export default DeliverableDetailPage;
