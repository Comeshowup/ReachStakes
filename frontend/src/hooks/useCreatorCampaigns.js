import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook for fetching and managing creator campaigns.
 * Wraps GET /collaborations/my-submissions and derives status counts.
 *
 * @param {string} [statusFilter] - 'active' | 'pending' | 'revision' | 'completed' | 'invitations'
 * @returns {{ campaigns, filteredCampaigns, invitations, activeCount, pendingCount, revisionCount, completedCount, invitationCount, loading, error, refetch }}
 */
export const useCreatorCampaigns = (statusFilter = 'active') => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            // /my-submissions returns all creator collaborations
            const response = await axios.get(`${API_BASE_URL}/collaborations/my-submissions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const raw = Array.isArray(response.data) ? response.data : (response.data.data || []);
            setCampaigns(raw);
        } catch (err) {
            console.error('Failed to fetch creator campaigns:', err);
            setError(err.response?.data?.message || 'Failed to load campaigns');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    // Invitations — separate from workspace campaigns
    const invitations = useMemo(
        () => campaigns.filter((c) => c.status === 'Invited'),
        [campaigns]
    );
    const invitationCount = invitations.length;

    // Workspace counts (Invited excluded — they live in the inbox tab)
    const activeCount = useMemo(
        () => campaigns.filter((c) => c.status === 'In_Progress' || c.status === 'In Progress').length,
        [campaigns]
    );
    const pendingCount = useMemo(
        () => campaigns.filter((c) => c.status === 'Applied').length,
        [campaigns]
    );
    const revisionCount = useMemo(
        () => campaigns.filter((c) => c.status === 'Revision' || c.status === 'Under_Review' || c.status === 'Under Review').length,
        [campaigns]
    );
    const completedCount = useMemo(
        () => campaigns.filter((c) => c.status === 'Approved' || c.status === 'Paid' || c.status === 'Completed').length,
        [campaigns]
    );

    // Filter workspace campaigns by active status tab
    const filteredCampaigns = useMemo(() => {
        // Invitations are handled separately via InvitationsList
        if (statusFilter === 'invitations') return [];
        if (statusFilter === 'active') return campaigns.filter((c) => c.status === 'In_Progress' || c.status === 'In Progress');
        if (statusFilter === 'pending') return campaigns.filter((c) => c.status === 'Applied');
        if (statusFilter === 'revision') return campaigns.filter((c) => c.status === 'Revision' || c.status === 'Under_Review' || c.status === 'Under Review');
        if (statusFilter === 'completed') return campaigns.filter((c) => c.status === 'Approved' || c.status === 'Paid' || c.status === 'Completed');
        return campaigns.filter((c) => c.status !== 'Invited'); // all non-invite
    }, [campaigns, statusFilter]);

    return {
        campaigns,
        filteredCampaigns,
        invitations,
        activeCount,
        pendingCount,
        revisionCount,
        completedCount,
        invitationCount,
        loading,
        error,
        refetch: fetchCampaigns,
    };
};

export default useCreatorCampaigns;
