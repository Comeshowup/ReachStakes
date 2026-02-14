/**
 * Widget Renderer
 * Dynamic widget rendering based on registry
 */

import React from 'react';
import { widgetRegistry, WidgetSkeleton, canViewWidget } from './widgetRegistry';

// Import all widget components
import {
    DecisionStrip,
    FinancialStripWidget,
    PerformanceIntelligence,
    CampaignsTableWidget,
    ContentApprovalWidget,
    ActivityFeedWidget,
    WidgetErrorBoundary
} from '../pages/BrandCommandCenter';

// Component map for dynamic rendering
const componentMap = {
    DecisionStrip,
    FinancialStripWidget,
    PerformanceIntelligence,
    CampaignsTableWidget,
    ContentApprovalWidget,
    ActivityFeedWidget
};

/**
 * Render a single widget by ID
 */
export const renderWidget = (widgetId, userRole, props = {}) => {
    const manifest = widgetRegistry[widgetId];

    if (!manifest || !canViewWidget(widgetId, userRole)) {
        return null;
    }

    const Component = componentMap[manifest.component];

    if (!Component) {
        console.warn(`Widget component not found: ${manifest.component}`);
        return null;
    }

    return (
        <WidgetErrorBoundary key={widgetId} name={manifest.name}>
            <Component {...props} />
        </WidgetErrorBoundary>
    );
};

/**
 * Render all widgets for a specific row
 */
export const renderWidgetRow = (row, userRole, props = {}) => {
    const widgets = Object.values(widgetRegistry)
        .filter(w => w.row === row && w.enabled)
        .sort((a, b) => a.priority - b.priority);

    return widgets
        .filter(w => canViewWidget(w.id, userRole))
        .map(w => renderWidget(w.id, userRole, props));
};

/**
 * Get row layout configuration
 */
export const getRowLayout = (row) => {
    const layouts = {
        1: 'flex flex-wrap gap-3 mb-8',           // Decision Strip
        2: 'grid grid-cols-4 gap-4 mb-8',         // Financial
        3: 'flex gap-6 mb-8',                     // Performance
        4: 'mb-8',                                // Campaigns Table
        5: 'grid grid-cols-1 lg:grid-cols-2 gap-6' // Secondary
    };
    return layouts[row] || 'flex gap-4';
};

export default { renderWidget, renderWidgetRow, getRowLayout };
