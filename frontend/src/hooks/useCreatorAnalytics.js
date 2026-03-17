import { useState, useEffect, useCallback } from 'react';
import { getCreatorAnalytics } from '../api/creatorDashboardService';

/**
 * useCreatorAnalytics
 *
 * Manages analytics data fetching, local UI state (timeRange, metric, sort),
 * and exposes component-ready data. Refetches automatically when timeRange changes.
 *
 * Returns:
 *   data    — { metrics, timeline, platformStats, videos } | null
 *   loading — boolean
 *   error   — string | null
 *   timeRange, setTimeRange      — '7d' | '30d' | '90d' | '12m'
 *   selectedMetric, setSelectedMetric — 'views' | 'engagements' | 'videos'
 *   sortBy, setSortBy            — 'views' | 'engagement' | 'newest'
 *   refetch — () => void
 */
const useCreatorAnalytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [timeRange, setTimeRange] = useState('30d');
    const [selectedMetric, setSelectedMetric] = useState('views');
    const [sortBy, setSortBy] = useState('views');

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await getCreatorAnalytics({ range: timeRange });

            if (res?.status === 'success') {
                setData(res.data);
            } else {
                setData(null);
            }
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                setData(null); // Auth issue — show empty state, not error
            } else {
                console.error('[useCreatorAnalytics] fetch error:', err);
                setError('Failed to load analytics. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Derived: sorted video list
    const sortedVideos = (data?.videos ?? []).slice().sort((a, b) => {
        if (sortBy === 'views') return b.views - a.views;
        if (sortBy === 'engagement') return b.engagementRate - a.engagementRate;
        if (sortBy === 'newest')
            return new Date(b.publishDate) - new Date(a.publishDate);
        return 0;
    });

    const hasData =
        data &&
        (data.metrics?.videosPublished?.value > 0 || (data.videos?.length ?? 0) > 0);

    return {
        data,
        sortedVideos,
        hasData,
        loading,
        error,
        timeRange,
        setTimeRange,
        selectedMetric,
        setSelectedMetric,
        sortBy,
        setSortBy,
        refetch: fetchAnalytics,
    };
};

export default useCreatorAnalytics;
