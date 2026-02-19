import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../lib/api/campaigns';

export const useCampaignDetail = (id) => {
    return useQuery({
        queryKey: ['campaign', id],
        queryFn: () => campaignsApi.getDetail(id),
        enabled: !!id,
        staleTime: 60 * 1000, // 1 minute stale time
        retry: 1,
    });
};

export const useCreateCampaign = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: campaignsApi.create,
        onSuccess: (data) => {
            // Invalidate list queries
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            // Pre-seed detail query?
            queryClient.setQueryData(['campaign', data.campaignId.toString()], (old) => {
                // Can't fully seed because detail endpoint returns aggregated data we don't have yet.
                // Better to just let it fetch.
                return undefined;
            });
        },
    });
};
