import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosInstance from '../api/axios';

/**
 * useCreatorOverview
 *
 * Unified hook for the Creator Overview dashboard.
 * Batches all API calls in parallel and returns structured,
 * component-ready data for each dashboard section.
 */

const isNonCritical = (err) => {
    const status = err?.response?.status;
    // Auth, not-found, or network errors (e.g. connection refused) → degrade gracefully
    if (status === 401 || status === 403 || status === 404) return true;
    if (!err?.response && err?.code === 'ERR_NETWORK') return true;
    return false;
};

const useCreatorOverview = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Raw data stores
    const [rawStats, setRawStats] = useState(null);
    const [rawCampaigns, setRawCampaigns] = useState([]);
    const [rawRecommended, setRawRecommended] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [statsRes, campaignsRes] = await Promise.all([
                axiosInstance.get('/users/me/dashboard-stats').catch(err => {
                    if (isNonCritical(err)) return null;
                    throw err;
                }),
                axiosInstance.get('/collaborations/my-campaigns?dashboard=true').catch(err => {
                    if (isNonCritical(err)) return null;
                    throw err;
                }),
            ]);

            if (statsRes?.data?.status === 'success') {
                setRawStats(statsRes.data.data ?? {});
            }

            if (campaignsRes?.data?.status === 'success') {
                setRawCampaigns(campaignsRes.data.data ?? []);
            }
        } catch (err) {
            console.error('[useCreatorOverview] critical fetch error:', err);
            setError('Failed to load your dashboard. Please try again.');
        }

        // Recommended campaigns — best-effort, never blocks dashboard
        try {
            const recRes = await axiosInstance.get('/campaigns/recommended');
            if (recRes?.data?.status === 'success') {
                setRawRecommended(recRes.data.data ?? []);
            }
        } catch (err) {
            if (err?.response?.status !== 404) {
                console.warn('[useCreatorOverview] recommended campaigns unavailable:', err?.response?.status);
            }
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    // ── Derived state (memoized) ──────────────────────────────────────────

    const userName = rawStats?.userName ?? 'Creator';

    const stats = useMemo(() => ({
        activeCampaigns: rawStats?.stats?.find(s => s.label === 'Active Campaigns')?.value ?? 0,
        pendingInvites: rawStats?.stats?.find(s => s.label === 'Pending Invites')?.value ?? 0,
        totalEarnings: rawStats?.pendingEarnings ?? 0,
        matchScore: rawStats?.matchScore ?? 0,
    }), [rawStats]);

    const activeCampaigns = useMemo(() => {
        return rawCampaigns.filter(c =>
            ['In_Progress', 'Applied', 'Invited', 'Approved'].includes(c.status)
        );
    }, [rawCampaigns]);

    const earnings = useMemo(() => ({
        pending: rawStats?.pendingEarnings ?? 0,
        available: rawStats?.availableBalance ?? 0,
        nextPayoutDate: rawStats?.nextPayoutDate ?? null,
    }), [rawStats]);

    const deliverables = useMemo(() => {
        const items = rawStats?.upcomingDeliverables ?? [];
        return [...items].sort((a, b) => {
            const dateA = new Date(a.date || a.dueDate || 0);
            const dateB = new Date(b.date || b.dueDate || 0);
            return dateA - dateB;
        });
    }, [rawStats]);

    const recommendedCampaigns = useMemo(() => {
        return rawRecommended.slice(0, 3);
    }, [rawRecommended]);

    const performance = useMemo(() => {
        return rawStats?.socialPerformance ?? [];
    }, [rawStats]);

    const profileCompletion = useMemo(() => {
        const tasks = rawStats?.quickWinTasks ?? {};
        const allTasks = [
            { id: 'avatar', label: 'Upload Avatar', completed: !!tasks.profileComplete },
            { id: 'bio', label: 'Add Bio', completed: !!tasks.profileComplete },
            { id: 'social', label: 'Connect Social Account', completed: !!tasks.socialLinked },
            { id: 'browse', label: 'Browse Campaigns', completed: !!tasks.browseCampaigns || !!tasks.firstApplied },
        ];
        const completed = allTasks.filter(t => t.completed).length;
        return {
            percentage: rawStats?.matchScore ?? Math.round((completed / allTasks.length) * 100),
            tasks: allTasks,
        };
    }, [rawStats]);

    return {
        stats,
        activeCampaigns,
        earnings,
        deliverables,
        recommendedCampaigns,
        performance,
        profileCompletion,
        userName,
        loading,
        error,
        refetch: fetchAll,
    };
};

export default useCreatorOverview;
