/**
 * Widget Registry
 * Composable dashboard system enabling:
 * - Role-based widget visibility
 * - Dynamic widget loading
 * - Custom dashboard layouts
 * - Future AI-inserted widgets
 */

import React, { lazy, Suspense } from 'react';

// Widget size definitions
export const WidgetSize = {
    FULL: 'full',       // Full width
    LARGE: 'lg',        // 2/3 width or flex-2
    MEDIUM: 'md',       // 1/2 width or flex-1
    SMALL: 'sm',        // 1/3 width
    COMPACT: 'compact'  // Minimal
};

// User roles for permission control
export const UserRole = {
    VIEWER: 'viewer',
    EDITOR: 'editor',
    ADMIN: 'admin',
    FINANCE: 'finance'
};

// Widget categories for organization
export const WidgetCategory = {
    DECISION: 'decision',      // Urgent actions
    FINANCIAL: 'financial',    // Money-related
    PERFORMANCE: 'performance', // Metrics/KPIs
    OPERATIONAL: 'operational', // Day-to-day
    INTELLIGENCE: 'intelligence' // AI insights
};

/**
 * Widget Manifest Schema
 * Defines the contract for each widget in the registry
 */
const createWidgetManifest = ({
    id,
    name,
    description,
    category,
    priority = 50,
    size = WidgetSize.MEDIUM,
    minRole = UserRole.VIEWER,
    row = 4,
    enabled = true,
    configurable = false,
    component,
    defaultConfig = {}
}) => ({
    id,
    name,
    description,
    category,
    priority,
    size,
    minRole,
    row,
    enabled,
    configurable,
    component,
    defaultConfig
});

/**
 * Dashboard Widget Registry
 * All widgets register here for discovery and rendering
 */
export const widgetRegistry = {
    // ROW 1: Decision Strip (Priority 10-19)
    'decision-strip': createWidgetManifest({
        id: 'decision-strip',
        name: 'Decision Strip',
        description: 'Urgent items requiring immediate attention',
        category: WidgetCategory.DECISION,
        priority: 10,
        size: WidgetSize.FULL,
        minRole: UserRole.VIEWER,
        row: 1,
        component: 'DecisionStrip'
    }),

    // ROW 2: Financial Reality (Priority 20-29)
    'financial-strip': createWidgetManifest({
        id: 'financial-strip',
        name: 'Financial Overview',
        description: 'Wallet, escrow, and payout status',
        category: WidgetCategory.FINANCIAL,
        priority: 20,
        size: WidgetSize.FULL,
        minRole: UserRole.VIEWER,
        row: 2,
        component: 'FinancialStripWidget'
    }),

    // ROW 3: Performance Intelligence (Priority 30-39)
    'performance-roas': createWidgetManifest({
        id: 'performance-roas',
        name: 'Overall ROAS',
        description: 'Return on ad spend across all campaigns',
        category: WidgetCategory.PERFORMANCE,
        priority: 30,
        size: WidgetSize.LARGE,
        minRole: UserRole.VIEWER,
        row: 3,
        component: 'PerformanceIntelligence'
    }),

    // ROW 4: Operational Layer (Priority 40-49)
    'campaigns-table': createWidgetManifest({
        id: 'campaigns-table',
        name: 'Campaigns Table',
        description: 'Active campaigns with status and metrics',
        category: WidgetCategory.OPERATIONAL,
        priority: 40,
        size: WidgetSize.FULL,
        minRole: UserRole.VIEWER,
        row: 4,
        component: 'CampaignsTableWidget'
    }),

    // Secondary Widgets (Priority 50-59)
    'content-approvals': createWidgetManifest({
        id: 'content-approvals',
        name: 'Content Queue',
        description: 'Pending content submissions for review',
        category: WidgetCategory.OPERATIONAL,
        priority: 50,
        size: WidgetSize.MEDIUM,
        minRole: UserRole.EDITOR,
        row: 5,
        component: 'ContentApprovalWidget'
    }),

    'activity-feed': createWidgetManifest({
        id: 'activity-feed',
        name: 'Live Activity',
        description: 'Recent platform events and actions',
        category: WidgetCategory.OPERATIONAL,
        priority: 51,
        size: WidgetSize.MEDIUM,
        minRole: UserRole.VIEWER,
        row: 5,
        component: 'ActivityFeedWidget'
    })
};

/**
 * Get widgets filtered by user role
 */
export const getWidgetsForRole = (userRole) => {
    const roleHierarchy = [UserRole.VIEWER, UserRole.EDITOR, UserRole.ADMIN, UserRole.FINANCE];
    const userRoleIndex = roleHierarchy.indexOf(userRole);

    return Object.values(widgetRegistry)
        .filter(widget => {
            const widgetRoleIndex = roleHierarchy.indexOf(widget.minRole);
            return widget.enabled && widgetRoleIndex <= userRoleIndex;
        })
        .sort((a, b) => a.priority - b.priority);
};

/**
 * Get widgets grouped by row
 */
export const getWidgetsByRow = (userRole = UserRole.VIEWER) => {
    const widgets = getWidgetsForRole(userRole);
    const rows = {};

    widgets.forEach(widget => {
        if (!rows[widget.row]) {
            rows[widget.row] = [];
        }
        rows[widget.row].push(widget);
    });

    return rows;
};

/**
 * Get widgets by category
 */
export const getWidgetsByCategory = (category, userRole = UserRole.VIEWER) => {
    return getWidgetsForRole(userRole)
        .filter(widget => widget.category === category);
};

/**
 * Check if user can view widget
 */
export const canViewWidget = (widgetId, userRole) => {
    const widget = widgetRegistry[widgetId];
    if (!widget || !widget.enabled) return false;

    const roleHierarchy = [UserRole.VIEWER, UserRole.EDITOR, UserRole.ADMIN, UserRole.FINANCE];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const widgetRoleIndex = roleHierarchy.indexOf(widget.minRole);

    return widgetRoleIndex <= userRoleIndex;
};

/**
 * Widget Skeleton for Suspense fallback
 */
export const WidgetSkeleton = ({ size = WidgetSize.MEDIUM }) => {
    const sizeClasses = {
        [WidgetSize.FULL]: 'col-span-full',
        [WidgetSize.LARGE]: 'col-span-2',
        [WidgetSize.MEDIUM]: 'col-span-1',
        [WidgetSize.SMALL]: 'col-span-1',
        [WidgetSize.COMPACT]: 'col-span-1'
    };

    return (
        <div className={`rounded-2xl border border-white/5 bg-white/[0.02] p-6 animate-pulse ${sizeClasses[size]}`}>
            <div className="h-4 w-32 bg-white/5 rounded mb-4" />
            <div className="h-10 w-24 bg-white/10 rounded mb-3" />
            <div className="h-3 w-48 bg-white/5 rounded" />
        </div>
    );
};

export default widgetRegistry;
