import React from 'react';
import {
    Briefcase, Calendar, Target, FileText, Users, ExternalLink,
    Tag, CheckCircle2, Clock, Circle, DollarSign, AlertCircle,
    FileSignature, LayoutGrid, CheckSquare, Sparkles
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
}

const CampaignOverview = ({ campaign, deliverables = [] }) => {
    if (!campaign) return null;

    const campaignData = campaign.campaign || campaign;
    const brandProfile = campaignData.brand?.brandProfile || {};
    const logoUrl = resolveUrl(brandProfile.logoUrl || campaign.brandLogo);

    // Calculate metrics if deliverables are structured
    const hasStructured = deliverables && deliverables.length > 0;
    const totalCount = deliverables.length;
    const completedCount = deliverables.filter(d => ['FinalApproved', 'Published', 'PaymentReleased'].includes(d.status)).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // KPI count calculations
    const pendingCount = deliverables.filter(d => ['Pending', 'ScriptRequired', 'ScriptApproved', 'MockDraftApproved'].includes(d.status)).length;
    const revisionCount = deliverables.filter(d => d.status === 'RevisionRequested').length;
    const approvedCount = completedCount;
    const potentialEarnings = deliverables.reduce((sum, d) => sum + parseFloat(d.paymentAmount || 0), 0);

    // Dynamic Milestone Timeline Steps
    const milestoneSteps = hasStructured 
        ? buildStructuredTimeline(deliverables, campaign.status)
        : buildTimeline(campaign);

    return (
        <div className="space-y-6">
            
            {/* Campaign Progress Header */}
            {hasStructured && (
                <div
                    className="rounded-xl p-5"
                    style={{
                        background: 'var(--bd-surface-panel)',
                        border: '1px solid var(--bd-border-subtle)',
                    }}
                >
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <div>
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                <CheckSquare className="w-4 h-4 text-indigo-400" />
                                Campaign Completion Progress
                            </h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Overall deliverable milestones approved by brand
                            </p>
                        </div>
                        <div className="text-right">
                            <span className="text-sm font-extrabold text-white mr-1">
                                {completedCount} / {totalCount}
                            </span>
                            <span className="text-xs text-slate-400">Deliverables Complete</span>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bd-surface-input)' }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${progressPercent}%`,
                                    background: 'linear-gradient(90deg, var(--bd-accent-primary), #60a5fa, #34d399)',
                                }}
                            />
                        </div>
                        <span className="absolute top-3.5 right-0 text-[10px] font-bold" style={{ color: 'var(--bd-accent-primary)' }}>
                            {progressPercent}% Complete
                        </span>
                    </div>
                </div>
            )}

            {/* Creator KPI Strip */}
            {hasStructured && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard
                        icon={<LayoutGrid className="w-4 h-4 text-indigo-400" />}
                        value={totalCount}
                        label="Total Deliverables"
                    />
                    <StatCard
                        icon={<Clock className="w-4 h-4 text-sky-400" />}
                        value={pendingCount}
                        label="Pending Action"
                    />
                    <StatCard
                        icon={<AlertCircle className="w-4 h-4 text-orange-400" />}
                        value={revisionCount}
                        label="Revisions Needed"
                        alert={revisionCount > 0}
                    />
                    <StatCard
                        icon={<CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                        value={approvedCount}
                        label="Approved Content"
                    />
                    <StatCard
                        icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
                        value={`$${potentialEarnings.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                        label="Potential Earnings"
                    />
                </div>
            )}

            {/* Campaign Metadata (Fallback/Original stats if no structured deliverables) */}
            {!hasStructured && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        icon={<Target className="w-4 h-4" style={{ color: 'rgb(167, 139, 250)' }} />}
                        value={campaignData.platformRequired || campaignData.platform || 'Multi-Platform'}
                        label="Platform"
                    />
                    <StatCard
                        icon={<FileText className="w-4 h-4" style={{ color: 'rgb(251, 191, 36)' }} />}
                        value={campaignData.contentType || 'Video'}
                        label="Content Type"
                    />
                    <StatCard
                        icon={<Calendar className="w-4 h-4" style={{ color: 'rgb(96, 165, 250)' }} />}
                        value={
                            campaign.deadline
                                ? new Date(campaign.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : campaignData.endDate
                                ? new Date(campaignData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                : 'Flexible'
                        }
                        label="Deadline"
                    />
                    <StatCard
                        icon={<Users className="w-4 h-4" style={{ color: 'rgb(52, 211, 153)' }} />}
                        value={brandProfile.companyName || campaign.brandName || 'Brand'}
                        label="Brand"
                    />
                </div>
            )}

            {/* Campaign Milestone Timeline */}
            <Section title="Campaign Milestone Timeline" icon={<Clock className="w-4 h-4" />}>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2 pb-4">
                    {milestoneSteps.map((step, idx) => (
                        <MilestoneStep
                            key={idx}
                            title={step.title}
                            description={step.description}
                            completed={step.completed}
                            active={step.active}
                            isLast={idx === milestoneSteps.length - 1}
                        />
                    ))}
                </div>
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left side: Campaign Brief */}
                <div className="lg:col-span-2 space-y-6">
                    <Section title="Campaign Brief" icon={<Briefcase className="w-4 h-4" />}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--bd-text-secondary)' }}>
                            {campaignData.description || campaignData.brief || campaign.notes || 'No brief available. Check with the brand for more details.'}
                        </p>

                        {campaignData.requirements && (
                            <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--bd-border-subtle)' }}>
                                <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--bd-text-primary)' }}>
                                    Content Guidelines & Brand Requirements
                                </h4>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--bd-text-secondary)' }}>
                                    {campaignData.requirements}
                                </p>
                            </div>
                        )}

                        {(campaignData.niche || campaignData.category) && (
                            <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid var(--bd-border-subtle)' }}>
                                <Tag className="w-3.5 h-3.5" style={{ color: 'var(--bd-text-secondary)' }} />
                                <span
                                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                    style={{
                                        background: 'var(--bd-surface-input)',
                                        color: 'var(--bd-text-secondary)',
                                    }}
                                >
                                    {campaignData.niche || campaignData.category}
                                </span>
                            </div>
                        )}
                    </Section>
                </div>

                {/* Right side: Brand Profile Details */}
                <div className="space-y-6">
                    <Section title="About the Brand" icon={<Users className="w-4 h-4" />}>
                        <div className="flex items-start gap-4">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                                style={{
                                    background: 'var(--bd-surface-input)',
                                    border: '1px solid var(--bd-border-subtle)',
                                }}
                            >
                                {logoUrl ? (
                                    <img
                                        src={logoUrl}
                                        alt=""
                                        className="w-12 h-12 rounded-xl object-cover"
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                ) : (
                                    <Briefcase className="w-5 h-5" style={{ color: 'var(--bd-text-secondary)' }} />
                                )}
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold" style={{ color: 'var(--bd-text-primary)' }}>
                                    {brandProfile.companyName || campaign.brandName || 'Brand'}
                                </h4>
                                {brandProfile.industry && (
                                    <p className="text-xs mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
                                        {brandProfile.industry}
                                    </p>
                                )}
                                {brandProfile.website && (
                                    <a
                                        href={brandProfile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs mt-2 hover:opacity-80 transition-opacity"
                                        style={{ color: 'var(--bd-accent-primary)' }}
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        Visit Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

/* ── Sub-components ── */

const StatCard = ({ icon, value, label, alert = false }) => (
    <div
        className="rounded-xl p-4 transition-all duration-300"
        style={{
            background: 'var(--bd-surface-panel)',
            border: alert ? '1px solid rgba(249,115,22,0.3)' : '1px solid var(--bd-border-subtle)',
            boxShadow: alert ? '0 4px 12px rgba(249,115,22,0.05)' : 'none',
        }}
    >
        <div className="mb-2 flex justify-between items-center">
            {icon}
            {alert && <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />}
        </div>
        <p className="text-lg font-black truncate text-white">
            {value}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-wider mt-1 text-slate-400">
            {label}
        </p>
    </div>
);

const Section = ({ title, icon, children }) => (
    <div
        className="rounded-xl p-5"
        style={{
            background: 'var(--bd-surface-panel)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--bd-text-primary)' }}>
            <span style={{ color: 'var(--bd-accent-primary)' }}>{icon}</span>
            {title}
        </h3>
        {children}
    </div>
);

const MilestoneStep = ({ title, description, completed, active, isLast }) => (
    <div className="flex flex-col items-center text-center space-y-2.5 relative flex-1">
        {/* Step Marker */}
        <div className="flex items-center justify-center w-full z-10">
            {completed ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                </div>
            ) : active ? (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-indigo-500/10 border-2 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/15 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                </div>
            ) : (
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-500">
                    <Circle className="w-3.5 h-3.5" />
                </div>
            )}
        </div>

        {/* Step details */}
        <div>
            <h4
                className="text-xs font-bold transition-colors"
                style={{
                    color: completed
                        ? '#34d399'
                        : active
                        ? 'var(--bd-text-primary)'
                        : 'var(--bd-text-secondary)',
                }}
            >
                {title}
            </h4>
            <p className="text-[9px] text-slate-500 mt-0.5 px-2 font-medium">
                {description}
            </p>
        </div>

        {/* Connecting connector line for wider screens */}
        {!isLast && (
            <div
                className="hidden md:block absolute top-[13px] left-[calc(50%+14px)] right-[calc(-50%+14px)] h-[1px] -z-10"
                style={{
                    background: completed ? '#10b981' : 'var(--bd-border-subtle)',
                }}
            />
        )}
    </div>
);

/** Dynamic timeline for structured campaigns */
function buildStructuredTimeline(deliverables, campaignStatus) {
    const hasScript = deliverables.some(d => d.requireScript);
    const hasMock = deliverables.some(d => d.requireMockDraft);

    const steps = [
        { title: 'Agreement', description: 'Campaign Terms Agreed', completed: true, active: false }
    ];

    // Script Review step
    if (hasScript) {
        const totalScripts = deliverables.filter(d => d.requireScript).length;
        const approvedScripts = deliverables.filter(d => d.requireScript && !['Pending', 'ScriptRequired', 'ScriptSubmitted', 'RevisionRequested'].includes(d.status)).length;
        const allApproved = approvedScripts === totalScripts;
        const inProgress = !allApproved && deliverables.some(d => ['ScriptRequired', 'ScriptSubmitted', 'RevisionRequested'].includes(d.status));
        steps.push({
            title: 'Script Review',
            description: `${approvedScripts}/${totalScripts} Approved`,
            completed: allApproved,
            active: inProgress
        });
    } else {
        steps.push({ title: 'Script Review', description: 'Not Required', completed: true, active: false });
    }

    // Mock Draft step
    if (hasMock) {
        const totalMocks = deliverables.filter(d => d.requireMockDraft).length;
        const approvedMocks = deliverables.filter(d => d.requireMockDraft && !['Pending', 'ScriptRequired', 'ScriptSubmitted', 'ScriptApproved', 'MockDraftSubmitted', 'RevisionRequested'].includes(d.status)).length;
        const allApproved = approvedMocks === totalMocks;
        const inProgress = !allApproved && deliverables.some(d => ['MockDraftSubmitted', 'RevisionRequested'].includes(d.status));
        steps.push({
            title: 'Mock Draft',
            description: `${approvedMocks}/${totalMocks} Approved`,
            completed: allApproved,
            active: inProgress
        });
    } else {
        steps.push({ title: 'Mock Draft', description: 'Not Required', completed: true, active: false });
    }

    // Final Approval step
    const totalDeliverables = deliverables.length;
    const finalApproved = deliverables.filter(d => ['FinalApproved', 'Published', 'PaymentReleased'].includes(d.status)).length;
    const allFinalApproved = finalApproved === totalDeliverables;
    const finalInProgress = !allFinalApproved && deliverables.some(d => ['FinalDraftSubmitted', 'RevisionRequested'].includes(d.status));
    steps.push({
        title: 'Final Approval',
        description: `${finalApproved}/${totalDeliverables} Approved`,
        completed: allFinalApproved,
        active: finalInProgress
    });

    // Payment Release step
    const releasedPayments = deliverables.filter(d => d.status === 'PaymentReleased').length;
    const allReleased = releasedPayments === totalDeliverables;
    const releaseInProgress = !allReleased && allFinalApproved;
    steps.push({
        title: 'Payment Release',
        description: allReleased ? 'Released' : `${releasedPayments}/${totalDeliverables} Paid`,
        completed: allReleased,
        active: releaseInProgress
    });

    // Fix active state if everything is pending/active
    let activeFound = false;
    for (let i = 0; i < steps.length; i++) {
        if (steps[i].active) {
            activeFound = true;
            break;
        }
    }
    if (!activeFound) {
        for (let i = 0; i < steps.length; i++) {
            if (!steps[i].completed) {
                steps[i].active = true;
                break;
            }
        }
    }

    return steps;
}

/** Legacy fallback timeline */
function buildTimeline(campaign) {
    const status = campaign.status;
    const steps = [
        { title: 'Agreement', description: 'Campaign confirmed', completed: true, active: false },
        { title: 'In Setup', description: 'Deliverables setup', completed: false, active: false },
        { title: 'Submissions', description: 'Content creation', completed: false, active: false },
        { title: 'Review', description: 'Brand approval', completed: false, active: false },
        { title: 'Payment', description: 'Payout release', completed: false, active: false },
    ];

    switch (status) {
        case 'Applied':
            steps[0].active = true;
            break;
        case 'Invited':
            steps[0].completed = true;
            steps[1].active = true;
            break;
        case 'Approved':
        case 'In_Progress':
            steps[0].completed = true;
            steps[1].completed = true;
            steps[2].active = true;
            break;
        case 'Under_Review':
        case 'Revision_Requested':
            steps[0].completed = true;
            steps[1].completed = true;
            steps[2].completed = true;
            steps[3].active = true;
            break;
        case 'Completed':
            steps.forEach((s) => (s.completed = true));
            break;
        default:
            steps[0].active = true;
    }

    return steps;
}

export default CampaignOverview;
