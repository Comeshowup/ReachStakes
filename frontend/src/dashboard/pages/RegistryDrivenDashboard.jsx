/**
 * Registry-Driven Dashboard
 * Renders the dashboard layout dynamically from widget registry
 */

import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

// Foundation
import { Container, Row, Stack, Inline, Surface } from '../../foundation';
import { colors, spacing } from '../../foundation/tokens';

// Registry
import {
    getWidgetsByRow,
    UserRole,
    WidgetSkeleton
} from '../registry/widgetRegistry';

// Widgets (direct imports for now, could be lazy loaded)
import {
    WidgetErrorBoundary,
    DecisionStrip,
    FinancialStripWidget,
    PerformanceIntelligence,
    CampaignsTableWidget,
    ContentApprovalWidget,
    ActivityFeedWidget,
    CommandHeader
} from './BrandCommandCenter';

// Enhanced Decision Strip
import EnhancedDecisionStrip from '../components/EnhancedDecisionStrip';

// Keyboard shortcuts
import { useKeyboardShortcuts, ShortcutHelp } from '../../hooks/useKeyboardShortcuts';

// Data hooks
import { dashboardKeys } from '../../data/hooks/useDashboardWidgets';

// Widget component map
const widgetComponents = {
    'decision-strip': EnhancedDecisionStrip,
    'financial-strip': FinancialStripWidget,
    'performance-roas': PerformanceIntelligence,
    'campaigns-table': CampaignsTableWidget,
    'content-approvals': ContentApprovalWidget,
    'activity-feed': ActivityFeedWidget
};

/**
 * Registry-Driven Dashboard
 * Uses widget registry to determine layout and visibility
 */
const RegistryDrivenDashboard = ({ userRole = UserRole.ADMIN }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showShortcuts, setShowShortcuts] = useState(false);

    // Get widgets grouped by row based on user role
    const widgetsByRow = getWidgetsByRow(userRole);

    // Setup keyboard shortcuts
    useKeyboardShortcuts({
        newCampaign: () => navigate('/brand/campaigns/new'),
        refresh: () => queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
        showHelp: () => setShowShortcuts(true),
        escape: () => setShowShortcuts(false)
    });

    // Render a single widget by manifest
    const renderWidget = (manifest) => {
        const Component = widgetComponents[manifest.id];
        if (!Component) return null;

        return (
            <WidgetErrorBoundary key={manifest.id} name={manifest.name}>
                <Suspense fallback={<WidgetSkeleton size={manifest.size} />}>
                    <Component />
                </Suspense>
            </WidgetErrorBoundary>
        );
    };

    // Render widgets for a specific row
    const renderRow = (rowNumber, layout = 'default') => {
        const widgets = widgetsByRow[rowNumber];
        if (!widgets || widgets.length === 0) return null;

        // Different layouts based on row
        switch (layout) {
            case 'flex':
                return (
                    <Row marginBottom="8">
                        <div className="flex gap-6">
                            {widgets.map(renderWidget)}
                        </div>
                    </Row>
                );
            case 'grid-2':
                return (
                    <Row marginBottom="0">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {widgets.map(renderWidget)}
                        </div>
                    </Row>
                );
            default:
                return (
                    <Row marginBottom="8">
                        {widgets.map(renderWidget)}
                    </Row>
                );
        }
    };

    return (
        <div
            className="min-h-screen text-slate-200"
            style={{ background: colors.bg.base }}
        >
            <Container paddingX="8" paddingY="10">
                {/* Header */}
                <CommandHeader />

                {/* ROW 1: Decision Strip */}
                {renderRow(1)}

                {/* ROW 2: Financial Reality */}
                {renderRow(2)}

                {/* ROW 3: Performance Intelligence */}
                {renderRow(3, 'flex')}

                {/* ROW 4: Campaigns Table */}
                {renderRow(4)}

                {/* ROW 5: Secondary Widgets */}
                {renderRow(5, 'grid-2')}

                {/* Keyboard hint */}
                <div className="fixed bottom-6 right-6">
                    <button
                        onClick={() => setShowShortcuts(true)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                    >
                        <kbd className="px-1.5 py-0.5 rounded bg-white/5 font-mono">?</kbd>
                        <span>Shortcuts</span>
                    </button>
                </div>
            </Container>

            {/* Shortcuts Modal */}
            <AnimatePresence>
                {showShortcuts && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <ShortcutHelp onClose={() => setShowShortcuts(false)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RegistryDrivenDashboard;
