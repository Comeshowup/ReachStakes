import { useState, useEffect, useCallback } from 'react';
import {
    getCreatorDashboardStats,
    getCreatorCampaigns,
    getRecommendedCampaigns
} from '../../api/creatorDashboardService';

/**
 * useCreatorDashboard
 * Batches all creator dashboard API calls into a single hook.
 * Returns { data, loading, error, refetch }
 */
const useCreatorDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [statsResult, campaignsResult, recommendedResult] = await Promise.allSettled([
                getCreatorDashboardStats(),
                getCreatorCampaigns(),
                getRecommendedCampaigns()
            ]);

            const statsData = statsResult.status === 'fulfilled' && statsResult.value?.status === 'success'
                ? statsResult.value.data
                : null;

            const campaignsRaw = campaignsResult.status === 'fulfilled' && campaignsResult.value?.status === 'success'
                ? campaignsResult.value.data
                : [];

            const recommendedData = recommendedResult.status === 'fulfilled' && recommendedResult.value?.status === 'success'
                ? recommendedResult.value.data
                : [];

            // Filter active campaigns
            const activeCampaigns = campaignsRaw.filter(c =>
                c.status === 'In_Progress' || c.status === 'Applied' || c.status === 'Invited'
            );

            if (!statsData) {
                throw new Error('Failed to load dashboard data');
            }

            setData({
                // From stats endpoint
                stats: statsData.stats || [],
                pendingEarnings: statsData.pendingEarnings || 0,
                quickWinTasks: statsData.quickWinTasks || {},
                matchScore: statsData.matchScore || 0,
                userName: statsData.userName || 'Creator',
                onboardingStep: statsData.onboardingStep || 0,
                completedCampaigns: statsData.completedCampaigns || 0,

                // From campaigns endpoint
                activeCampaigns: activeCampaigns.slice(0, 5),
                allCampaigns: campaignsRaw,

                // From recommended endpoint
                recommendedCampaigns: recommendedData.slice(0, 3)
            });
        } catch (err) {
            console.error('Creator dashboard fetch error:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return { data, loading, error, refetch: fetchAll };
};

export default useCreatorDashboard;
