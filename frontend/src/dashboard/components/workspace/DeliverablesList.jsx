import React from 'react';
import { ListChecks, Clock, CheckCircle, RotateCcw, Instagram, Youtube, Video, Globe } from 'lucide-react';

const PLATFORM_ICONS = {
    instagram: Instagram,
    youtube: Youtube,
    tiktok: Video,
};

const STATUS_STYLES = {
    'Pending': { bg: 'rgba(245, 158, 11, 0.1)', color: 'rgb(251, 191, 36)', border: 'rgba(245, 158, 11, 0.25)' },
    'In Progress': { bg: 'rgba(96, 165, 250, 0.1)', color: 'rgb(96, 165, 250)', border: 'rgba(96, 165, 250, 0.25)' },
    'Completed': { bg: 'rgba(52, 211, 153, 0.1)', color: 'rgb(52, 211, 153)', border: 'rgba(52, 211, 153, 0.25)' },
    'Revision Needed': { bg: 'rgba(168, 85, 247, 0.1)', color: 'rgb(192, 132, 252)', border: 'rgba(168, 85, 247, 0.25)' },
};

/**
 * Deliverables list — task objects with status, platform, and due date.
 */
const DeliverablesList = ({ deliverables = [] }) => {
    if (deliverables.length === 0) {
        return (
            <div
                className="rounded-xl text-center py-12"
                style={{
                    background: 'var(--bd-surface-panel)',
                    border: '1px solid var(--bd-border-subtle)',
                }}
            >
                <ListChecks className="w-8 h-8 mx-auto mb-3 opacity-30" style={{ color: 'var(--bd-text-secondary)' }} />
                <p className="text-sm" style={{ color: 'var(--bd-text-secondary)' }}>
                    No deliverables assigned yet
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {deliverables.map((deliverable) => {
                const PlatformIcon = PLATFORM_ICONS[deliverable.platform?.toLowerCase()] || Globe;
                const statusStyle = STATUS_STYLES[deliverable.status] || STATUS_STYLES['Pending'];
                const StatusIcon = deliverable.status === 'Completed' ? CheckCircle
                    : deliverable.status === 'Revision Needed' ? RotateCcw
                    : Clock;

                return (
                    <div
                        key={deliverable.id}
                        className="flex items-center gap-4 p-4 rounded-xl transition-colors"
                        style={{
                            background: 'var(--bd-surface-panel)',
                            border: '1px solid var(--bd-border-subtle)',
                        }}
                    >
                        {/* Platform Icon */}
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: 'var(--bd-surface-input)' }}
                        >
                            <PlatformIcon className="w-5 h-5" style={{ color: 'var(--bd-text-secondary)' }} />
                        </div>

                        {/* Deliverable Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold truncate" style={{ color: 'var(--bd-text-primary)' }}>
                                {deliverable.title}
                            </h4>
                            {deliverable.dueDate && (
                                <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--bd-text-secondary)' }}>
                                    <Clock className="w-3 h-3" />
                                    Due {new Date(deliverable.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0"
                            style={{
                                background: statusStyle.bg,
                                color: statusStyle.color,
                                border: `1px solid ${statusStyle.border}`,
                            }}
                        >
                            <StatusIcon className="w-3 h-3" />
                            {deliverable.status}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default DeliverablesList;
