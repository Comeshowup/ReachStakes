import React from 'react';
import {
    Briefcase,
    Calendar,
    Target,
    FileText,
    Users,
    ExternalLink,
    Tag,
    CheckCircle,
    Clock,
    Circle,
} from 'lucide-react';

/**
 * Campaign Overview tab — brief, brand info, guidelines, and timeline.
 */
const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

function resolveUrl(url) {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BACKEND_URL}${url}`;
}

const CampaignOverview = ({ campaign }) => {
    if (!campaign) return null;

    const campaignData = campaign.campaign || campaign;
    const brandProfile = campaignData.brand?.brandProfile || {};
    const logoUrl = resolveUrl(brandProfile.logoUrl || campaign.brandLogo);

    // Build timeline steps
    const timelineSteps = buildTimeline(campaign);

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
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

            {/* Campaign Brief */}
            <Section title="Campaign Brief" icon={<Briefcase className="w-4 h-4" />}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--bd-text-secondary)' }}>
                    {campaignData.description || campaignData.brief || campaign.notes || 'No brief available. Check with the brand for more details.'}
                </p>

                {campaignData.requirements && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--bd-border-subtle)' }}>
                        <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--bd-text-primary)' }}>
                            Content Guidelines
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

            {/* Campaign Timeline */}
            <Section title="Campaign Timeline" icon={<Clock className="w-4 h-4" />}>
                <div className="space-y-0">
                    {timelineSteps.map((step, idx) => (
                        <TimelineStep
                            key={idx}
                            title={step.title}
                            completed={step.completed}
                            active={step.active}
                            isLast={idx === timelineSteps.length - 1}
                        />
                    ))}
                </div>
            </Section>

            {/* Brand Info */}
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
    );
};

/* ── Sub-components ── */

const StatCard = ({ icon, value, label }) => (
    <div
        className="rounded-xl p-4"
        style={{
            background: 'var(--bd-surface-panel)',
            border: '1px solid var(--bd-border-subtle)',
        }}
    >
        <div className="mb-2">{icon}</div>
        <p className="text-sm font-semibold truncate capitalize" style={{ color: 'var(--bd-text-primary)' }}>
            {value}
        </p>
        <p className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: 'var(--bd-text-secondary)' }}>
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

const TimelineStep = ({ title, completed, active, isLast }) => (
    <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
            {completed ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'rgb(52, 211, 153)' }} />
            ) : active ? (
                <div
                    className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ border: '2px solid var(--bd-accent-primary)' }}
                >
                    <div className="w-2 h-2 rounded-full" style={{ background: 'var(--bd-accent-primary)' }} />
                </div>
            ) : (
                <Circle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--bd-border-subtle)' }} />
            )}
            {!isLast && (
                <div
                    className="w-px h-6"
                    style={{ background: completed ? 'rgb(52, 211, 153)' : 'var(--bd-border-subtle)' }}
                />
            )}
        </div>
        <span
            className="text-sm pb-6"
            style={{
                color: completed
                    ? 'rgb(52, 211, 153)'
                    : active
                    ? 'var(--bd-text-primary)'
                    : 'var(--bd-text-secondary)',
                fontWeight: active || completed ? 500 : 400,
            }}
        >
            {title}
        </span>
    </div>
);

function buildTimeline(campaign) {
    const status = campaign.status;
    const steps = [
        { title: 'Applied', completed: true, active: false },
        { title: 'Approved', completed: false, active: false },
        { title: 'Content Submitted', completed: false, active: false },
        { title: 'Review', completed: false, active: false },
        { title: 'Payment Released', completed: false, active: false },
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
