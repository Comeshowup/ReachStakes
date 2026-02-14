/**
 * Matching Controller
 * API endpoints for AI matching and explainability
 * Phase 8
 */

import * as matchingService from '../services/matchingService.js';

/**
 * Get match score with explainability for creator-campaign pair
 * GET /api/matching/score/:campaignId
 */
export const getMatchScore = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const campaignId = parseInt(req.params.campaignId);

        const matchResult = await matchingService.calculateMatchScore(creatorId, campaignId);

        res.json({
            status: 'success',
            data: matchResult
        });
    } catch (error) {
        console.error('Match score error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to calculate match score'
        });
    }
};

/**
 * Get match scores for multiple campaigns
 * POST /api/matching/scores
 * Body: { campaignIds: [1, 2, 3] }
 */
export const getBulkMatchScores = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const { campaignIds } = req.body;

        if (!Array.isArray(campaignIds)) {
            return res.status(400).json({
                status: 'error',
                message: 'campaignIds must be an array'
            });
        }

        const results = await Promise.all(
            campaignIds.slice(0, 20).map(async (campaignId) => {
                try {
                    return await matchingService.calculateMatchScore(creatorId, parseInt(campaignId));
                } catch (e) {
                    return { campaignId, error: e.message };
                }
            })
        );

        res.json({
            status: 'success',
            data: results
        });
    } catch (error) {
        console.error('Bulk match score error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to calculate match scores'
        });
    }
};

/**
 * Get predicted ROI for creator-campaign pair
 * GET /api/matching/roi/:campaignId
 */
export const getPredictedROI = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const campaignId = parseInt(req.params.campaignId);

        const roiPrediction = await matchingService.predictROI(creatorId, campaignId);

        res.json({
            status: 'success',
            data: roiPrediction
        });
    } catch (error) {
        console.error('ROI prediction error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to predict ROI'
        });
    }
};

/**
 * Get ROI prediction for brand's view of a creator
 * GET /api/matching/roi/brand/:creatorId/:campaignId
 */
export const getBrandROIPrediction = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this'
            });
        }

        const creatorId = parseInt(req.params.creatorId);
        const campaignId = parseInt(req.params.campaignId);

        const roiPrediction = await matchingService.predictROI(creatorId, campaignId);

        res.json({
            status: 'success',
            data: roiPrediction
        });
    } catch (error) {
        console.error('Brand ROI prediction error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to predict ROI'
        });
    }
};

/**
 * Get "Scale this creator" recommendations
 * GET /api/matching/scale/:creatorId
 */
export const getScaleRecommendations = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this'
            });
        }

        const creatorId = parseInt(req.params.creatorId);
        const { limit } = req.query;

        const recommendations = await matchingService.getScaleRecommendations(
            creatorId,
            parseInt(limit) || 5
        );

        res.json({
            status: 'success',
            data: recommendations
        });
    } catch (error) {
        console.error('Scale recommendations error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get recommendations'
        });
    }
};

/**
 * Get personalized campaign suggestions for creator
 * GET /api/matching/suggestions
 */
export const getCampaignSuggestions = async (req, res) => {
    try {
        if (req.user.role !== 'creator') {
            return res.status(403).json({
                status: 'error',
                message: 'Only creators can access this'
            });
        }

        const { limit } = req.query;

        const suggestions = await matchingService.getCampaignSuggestions(
            req.user.id,
            parseInt(limit) || 10
        );

        res.json({
            status: 'success',
            data: suggestions
        });
    } catch (error) {
        console.error('Campaign suggestions error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get suggestions'
        });
    }
};

/**
 * Analyze audience overlap between creators
 * POST /api/matching/overlap
 * Body: { creatorIds: [1, 2, 3] }
 */
export const analyzeAudienceOverlap = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this'
            });
        }

        const { creatorIds } = req.body;

        if (!Array.isArray(creatorIds) || creatorIds.length < 2) {
            return res.status(400).json({
                status: 'error',
                message: 'At least 2 creator IDs required'
            });
        }

        const analysis = await matchingService.analyzeAudienceOverlap(
            creatorIds.map(id => parseInt(id))
        );

        res.json({
            status: 'success',
            data: analysis
        });
    } catch (error) {
        console.error('Audience overlap error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to analyze overlap'
        });
    }
};

/**
 * Get match explainability for a specific creator-campaign pair (brand view)
 * GET /api/matching/explain/:creatorId/:campaignId
 */
export const getMatchExplainability = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this'
            });
        }

        const creatorId = parseInt(req.params.creatorId);
        const campaignId = parseInt(req.params.campaignId);

        const matchResult = await matchingService.calculateMatchScore(creatorId, campaignId);

        res.json({
            status: 'success',
            data: matchResult
        });
    } catch (error) {
        console.error('Match explainability error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to explain match'
        });
    }
};
