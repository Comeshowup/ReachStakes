import { useState, useMemo } from 'react';
import { calcProgress } from './campaignUtils';

/**
 * Custom hook managing campaign filter, search, sort, and view state.
 * Follows existing local-state hooks pattern.
 *
 * @param {Array} campaigns — mapped campaign objects
 * @returns {Object} filter state + filtered/sorted results
 */
export function useCampaignFilters(campaigns) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');

    const filteredCampaigns = useMemo(() => {
        let result = [...campaigns];

        // Filter by status
        if (statusFilter !== 'All') {
            result = result.filter((c) => c.status === statusFilter);
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter((c) =>
                c.name.toLowerCase().includes(query)
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortBy) {
                case 'budget':
                    return b.budget - a.budget;
                case 'roi': {
                    const roiA = a.roi ?? -Infinity;
                    const roiB = b.roi ?? -Infinity;
                    return roiB - roiA;
                }
                case 'progress': {
                    const pA = calcProgress(a.spent, a.budget);
                    const pB = calcProgress(b.spent, b.budget);
                    return pB - pA;
                }
                case 'newest':
                default:
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
            }
        });

        return result;
    }, [campaigns, searchQuery, statusFilter, sortBy]);

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        sortBy,
        setSortBy,
        viewMode,
        setViewMode,
        filteredCampaigns,
    };
}
