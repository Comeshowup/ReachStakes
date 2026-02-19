import { CampaignService } from '../services/campaign.service.js';
import { CampaignQueryService } from '../services/campaign.query.service.js';

/**
 * Create Campaign — POST /api/v1/brand/campaigns
 * Validation middleware has already run.
 */
export const createCampaign = async (req, res) => {
    try {
        const result = await CampaignService.createCampaign(req.user.id, req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Create Campaign Error:', error);

        // Structured error response
        if (error.message.includes('balance') || error.message.includes('insufficient')) {
            return res.status(400).json({
                success: false,
                code: 'INSUFFICIENT_FUNDS',
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Failed to create campaign',
        });
    }
};

/**
 * Get Campaign Detail — GET /api/v1/brand/campaigns/:id
 * Returns full aggregated campaign data.
 */
export const getCampaignDetail = async (req, res) => {
    try {
        const campaignId = req.params.id;
        const brandId = req.user.id;

        const data = await CampaignQueryService.getCampaignDetail(campaignId, brandId);

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get Campaign Detail Error:', error);

        if (error.message.includes('not found') || error.message.includes('unauthorized')) {
            return res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Campaign not found',
            });
        }

        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Failed to load campaign details',
        });
    }
};
