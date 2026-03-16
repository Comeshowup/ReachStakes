import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axios';

/**
 * useCreatorDashboard
 *
 * Batches all creator dashboard API calls in parallel.
 * Returns normalized, component-ready data so components
 * never need to parse nested API response shapes.
 *
 * Error handling strategy:
 * - 401 / 403 / 404 on primary calls → graceful: return empty data (components show empty states)
 * - Real network errors (5xx, timeout) → set error string so DashboardError screen renders
 * - Recommended campaigns (best-effort) → 404 swallowed silently; other status codes logged only
 */

const isAuthOrNotFound = (err) => {
    const status = err?.response?.status;
    return status === 401 || status === 403 || status === 404;
};

const useCreatorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [stats, setStats] = useState([]);
    const [pendingEarnings, setPendingEarnings] = useState(0);
    const [quickWinTasks, setQuickWinTasks] = useState({});
    const [userName, setUserName] = useState('Creator');
    const [matchScore, setMatchScore] = useState(0);
    const [campaigns, setCampaigns] = useState([]);
    const [recommended, setRecommended] = useState([]);
    const [deliverables, setDeliverables] = useState([]);
    const [socialPerformance, setSocialPerformance] = useState([]);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Run primary API calls in parallel
            const [statsRes, campaignsRes] = await Promise.all([
                axiosInstance.get('/users/me/dashboard-stats').catch(err => {
                    // Gracefully degrade on auth/not-found; re-throw real errors
                    if (isAuthOrNotFound(err)) return null;
                    throw err;
                }),
                axiosInstance.get('/collaborations/my-submissions').catch(err => {
                    if (isAuthOrNotFound(err)) return null;
                    throw err;
                }),
            ]);

            // --- Dashboard Stats ---
            if (statsRes?.data?.status === 'success') {
                const d = statsRes.data.data ?? {};
                setStats(d.stats ?? []);
                setPendingEarnings(d.pendingEarnings ?? 0);
                setQuickWinTasks(d.quickWinTasks ?? {});
                setUserName(d.userName ?? 'Creator');
                setMatchScore(d.matchScore ?? 0);
                setSocialPerformance(d.socialPerformance ?? []);
                setDeliverables(d.upcomingDeliverables ?? []);
            }

            // --- Active Campaigns --- (my-submissions returns a plain array)
            if (campaignsRes) {
                const all = Array.isArray(campaignsRes.data)
                    ? campaignsRes.data
                    : (campaignsRes.data?.data ?? []);
                const active = all.filter(c =>
                    ['In_Progress', 'Applied', 'Invited', 'Approved'].includes(c.status)
                );
                setCampaigns(active);
            }
        } catch (err) {
            // Only real errors (5xx, network timeout, etc.) reach here
            console.error('[useCreatorDashboard] critical fetch error:', err);
            setError('Failed to load your dashboard. Please try again.');
        }

        // 3. Recommended campaigns — best-effort, never blocks dashboard
        try {
            const recRes = await axiosInstance.get('/campaigns/recommended');
            if (recRes?.data?.status === 'success') {
                setRecommended(recRes.data.data ?? []);
            }
        } catch (err) {
            if (err?.response?.status !== 404) {
                console.warn('[useCreatorDashboard] recommended campaigns unavailable:', err?.response?.status);
            }
            // Leave recommended as [] — component falls back to mock data
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        stats,
        pendingEarnings,
        quickWinTasks,
        userName,
        matchScore,
        campaigns,
        recommended,
        deliverables,
        socialPerformance,
        loading,
        error,
        refetch: fetchAll,
    };
};

export default useCreatorDashboard;
