/**
 * Widget Contract Types
 * Defines the data contract for each dashboard widget
 */

// Cache strategies for widgets
export const CacheStrategy = {
    AGGRESSIVE: 'aggressive',           // Cache for 5+ minutes
    STALE_WHILE_REVALIDATE: 'swr',     // Show stale, fetch in background
    REAL_TIME: 'realtime',             // Always fresh
    NONE: 'none'                       // No caching
};

// Refresh policies
export const RefreshPolicy = {
    POLLING: 'polling',                // Periodic refresh
    MUTATION_DRIVEN: 'mutation',       // Refresh on mutations
    MANUAL: 'manual',                  // User-triggered only
    FOCUS: 'focus'                     // Refresh on window focus
};

// Error boundary strategies
export const ErrorBoundary = {
    ISOLATED: 'isolated',              // Widget fails independently
    PROPAGATE: 'propagate'             // Bubble up to parent
};

/**
 * Widget Contract Interface
 * Each dashboard widget should implement this contract
 */
export const createWidgetContract = ({
    id,
    priority = 5,
    size = 'md',
    minRole = 'viewer',
    cacheStrategy = CacheStrategy.STALE_WHILE_REVALIDATE,
    refreshPolicy = RefreshPolicy.FOCUS,
    staleTime = 30000,              // 30 seconds default
    gcTime = 300000,                // 5 minutes garbage collection
    errorBoundary = ErrorBoundary.ISOLATED,
    refetchOnMount = true,
    refetchOnWindowFocus = false
}) => ({
    id,
    priority,
    size,
    minRole,
    queryOptions: {
        staleTime,
        gcTime,
        refetchOnMount,
        refetchOnWindowFocus,
        retry: errorBoundary === ErrorBoundary.ISOLATED ? 2 : 0
    },
    meta: {
        cacheStrategy,
        refreshPolicy,
        errorBoundary
    }
});

// Pre-defined widget contracts for the dashboard
export const widgetContracts = {
    // Decision Strip - needs fresh data, show urgency
    decisionStrip: createWidgetContract({
        id: 'decision-strip',
        priority: 1,
        size: 'full',
        staleTime: 15000,           // 15s - more frequent for urgent items
        refreshPolicy: RefreshPolicy.FOCUS
    }),

    // Financial Strip - aggressive cache, trusted data
    financialStrip: createWidgetContract({
        id: 'financial-strip',
        priority: 2,
        size: 'full',
        staleTime: 60000,           // 1 minute - financial data changes less
        cacheStrategy: CacheStrategy.AGGRESSIVE
    }),

    // Performance Metrics - balanced caching
    performanceMetrics: createWidgetContract({
        id: 'performance-metrics',
        priority: 3,
        size: 'lg',
        staleTime: 30000
    }),

    // Campaigns Table - main working data
    campaignsTable: createWidgetContract({
        id: 'campaigns-table',
        priority: 4,
        size: 'full',
        staleTime: 30000,
        refreshPolicy: RefreshPolicy.MUTATION_DRIVEN
    }),

    // Content Approvals - action queue, fresher data
    contentApprovals: createWidgetContract({
        id: 'content-approvals',
        priority: 5,
        size: 'md',
        staleTime: 20000,           // 20s - approvals are action items
        minRole: 'editor'
    }),

    // Activity Feed - real-time feel
    activityFeed: createWidgetContract({
        id: 'activity-feed',
        priority: 6,
        size: 'md',
        staleTime: 10000,           // 10s - feels more live
        cacheStrategy: CacheStrategy.STALE_WHILE_REVALIDATE
    })
};

export default widgetContracts;
