import React, { Component, Suspense } from 'react';
import { AlertCircle } from 'lucide-react';

// =====================
// ERROR BOUNDARY (Per-Widget Isolation)
// =====================
class WidgetErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="bd-card p-6 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3"
                        style={{ color: 'var(--bd-danger)' }}>
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                            Failed to load {this.props.name || 'widget'}
                        </span>
                    </div>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="text-xs font-medium px-4 py-2 rounded-xl transition-colors"
                        style={{
                            background: 'var(--bd-secondary)',
                            color: 'var(--bd-secondary-fg)'
                        }}
                    >
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

// =====================
// LAZY WIDGET IMPORTS
// =====================
const FinancialIntelligence = React.lazy(() => import('../components/brand/FinancialIntelligence/FinancialIntelligence'));
const PerformanceMetricsWidget = React.lazy(() => import('../components/brand/PerformanceMetricsWidget'));
const ActiveCampaignsWidget = React.lazy(() => import('../components/brand/ActiveCampaignsWidget'));
const ContentQueueWidget = React.lazy(() => import('../components/brand/ContentQueueWidget'));
const LiveActivityWidget = React.lazy(() => import('../components/brand/LiveActivityWidget'));

// =====================
// SKELETON FALLBACK FOR SUSPENSE
// =====================
const WidgetSkeleton = ({ className = '' }) => (
    <div className={`bd-card animate-pulse p-6 ${className}`}>
        <div className="bd-skeleton h-6 w-32 mb-4 rounded-lg" />
        <div className="bd-skeleton h-20 w-full rounded-xl" />
    </div>
);

// =====================
// DASHBOARD HEADER
// =====================
const DashboardHeader = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

    return (
        <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight mb-1"
                style={{ color: 'var(--bd-text-primary)' }}>
                Dashboard
            </h1>
            <p className="text-base"
                style={{ color: 'var(--bd-text-secondary)' }}>
                {greeting}. Here's your campaign performance overview.
            </p>
        </div>
    );
};

// =====================
// MAIN DASHBOARD — BENTO GRID
// =====================
const BrandCommandCenter = () => {
    return (
        <div className="max-w-[1600px] mx-auto">
            {/* Header */}
            <DashboardHeader />

            {/* Row 1: Financial Intelligence — full width */}
            <WidgetErrorBoundary name="Financial Intelligence">
                <Suspense fallback={<WidgetSkeleton className="mb-8" />}>
                    <FinancialIntelligence className="mb-8" />
                </Suspense>
            </WidgetErrorBoundary>

            {/* Row 2 + 3: Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6 h-full">
                    {/* Performance Metrics */}
                    <WidgetErrorBoundary name="Performance Metrics">
                        <Suspense fallback={<WidgetSkeleton />}>
                            <PerformanceMetricsWidget />
                        </Suspense>
                    </WidgetErrorBoundary>

                    {/* Active Campaigns Table */}
                    <WidgetErrorBoundary name="Active Campaigns">
                        <Suspense fallback={<WidgetSkeleton />}>
                            <ActiveCampaignsWidget />
                        </Suspense>
                    </WidgetErrorBoundary>

                    {/* Content Queue */}
                    <WidgetErrorBoundary name="Content Queue">
                        <Suspense fallback={<WidgetSkeleton />}>
                            <ContentQueueWidget className="flex-1 min-h-[300px]" />
                        </Suspense>
                    </WidgetErrorBoundary>
                </div>

                {/* Right Column (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6 h-full">
                    {/* Live Activity Feed */}
                    <WidgetErrorBoundary name="Live Activity">
                        <Suspense fallback={<WidgetSkeleton className="h-full" />}>
                            <LiveActivityWidget className="h-full" />
                        </Suspense>
                    </WidgetErrorBoundary>
                </div>
            </div>
        </div>
    );
};

export default BrandCommandCenter;
