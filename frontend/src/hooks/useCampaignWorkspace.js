import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Hook for a single campaign workspace.
 * Fetches campaign details, submissions, and derives deliverables/payment info.
 *
 * @param {string|number} campaignId - Collaboration / campaign ID
 * @returns {{ campaign, deliverables, submissions, messages, payment, loading, error, refetch }}
 */
export const useCampaignWorkspace = (campaignId) => {
    const [campaign, setCampaign] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWorkspace = useCallback(async () => {
        if (!campaignId) return;
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Get the creator's user id from localStorage
            let creatorId = null;
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                creatorId = user.id;
            } catch (_) {}

            // Fetch both endpoints in parallel:
            // 1. /my-submissions → flat view with submission status
            // 2. /creator/:creatorId → full nested campaign with brand/budget/deadline
            const [submissionsRes, richRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/collaborations/my-submissions`, { headers }),
                creatorId
                    ? axios.get(`${API_BASE_URL}/collaborations/creator/${creatorId}`, { headers }).catch(() => ({ data: [] }))
                    : Promise.resolve({ data: [] }),
            ]);

            const allFlat = Array.isArray(submissionsRes.data) ? submissionsRes.data : (submissionsRes.data.data || []);
            const flatCollab = allFlat.find((c) => String(c.id) === String(campaignId));

            if (!flatCollab) {
                setError('Campaign not found');
                setLoading(false);
                return;
            }

            // Merge with rich data if available
            const allRich = Array.isArray(richRes.data) ? richRes.data : (richRes.data.data || []);
            const richCollab = allRich.find((c) => String(c.id) === String(campaignId));

            // Merged campaign: prefer rich data for nested fields, fall back to flat
            const merged = richCollab
                ? {
                      ...flatCollab,
                      campaign: richCollab.campaign,
                      deadline: richCollab.campaign?.endDate || flatCollab.deadline,
                      rate: richCollab.campaign?.targetBudget || richCollab.campaign?.budget || flatCollab.rate,
                  }
                : flatCollab;

            setCampaign(merged);

            // Submissions: the collaboration itself is the submission record
            setSubmissions(flatCollab.link ? [flatCollab] : []);
        } catch (err) {
            console.error('Failed to fetch campaign workspace:', err);
            setError(err.response?.data?.message || 'Failed to load campaign');
        } finally {
            setLoading(false);
        }
    }, [campaignId]);

    useEffect(() => {
        fetchWorkspace();
    }, [fetchWorkspace]);

    // Derive deliverables from campaign data
    // Structured for future backend deliverable entities
    const deliverables = campaign
        ? buildDeliverables(campaign)
        : [];

    // Derive payment info
    const payment = campaign
        ? {
              campaignFee: campaign.rate || campaign.campaign?.budget || null,
              escrowStatus: campaign.escrowStatus || (campaign.campaign?.escrowBalance > 0 ? 'Locked' : 'Not Funded'),
              paymentStatus: campaign.paymentStatus || 'Awaiting Approval',
              milestones: campaign.milestones || [],
          }
        : null;

    // Messages placeholder — structured for future API
    const messages = [];

    return {
        campaign,
        deliverables,
        submissions,
        messages,
        payment,
        loading,
        error,
        refetch: fetchWorkspace,
    };
};

/**
 * Build deliverables list from campaign data.
 * Uses campaign requirements/content types to generate task objects.
 */
function buildDeliverables(campaign) {
    const campaignData = campaign.campaign || campaign;
    const deliverables = [];

    // If campaign has explicit deliverables, use them
    if (campaign.deliverables && Array.isArray(campaign.deliverables)) {
        return campaign.deliverables;
    }

    // Otherwise, generate from campaign metadata
    const platform = campaignData.platformRequired || campaignData.platform || 'Multi-Platform';
    const contentType = campaignData.contentType || 'Video';
    const deadline = campaign.deadline || campaignData.endDate || null;

    // Primary deliverable
    deliverables.push({
        id: `del-${campaign.id}-1`,
        title: `${platform} ${contentType}`,
        status: mapCollaborationStatusToDeliverable(campaign.status),
        dueDate: deadline,
        platform: platform,
    });

    // If milestones exist, create additional deliverables
    if (campaign.milestones && Array.isArray(campaign.milestones)) {
        campaign.milestones.forEach((milestone, idx) => {
            if (milestone.title && milestone.title !== deliverables[0]?.title) {
                deliverables.push({
                    id: `del-${campaign.id}-${idx + 2}`,
                    title: milestone.title || milestone.name,
                    status: milestone.completed ? 'Completed' : 'Pending',
                    dueDate: milestone.dueDate || deadline,
                    platform: platform,
                });
            }
        });
    }

    return deliverables;
}

function mapCollaborationStatusToDeliverable(status) {
    switch (status) {
        case 'In_Progress':
            return 'In Progress';
        case 'Applied':
        case 'Invited':
            return 'Pending';
        case 'Completed':
            return 'Completed';
        case 'Revision_Requested':
            return 'Revision Needed';
        default:
            return 'Pending';
    }
}

export default useCampaignWorkspace;
