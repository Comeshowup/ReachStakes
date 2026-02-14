/**
 * Vetting Controller
 * API endpoints for creator vetting and fraud detection
 */

import * as vettingService from '../services/vettingService.js';

/**
 * Vet a creator (run full vetting analysis)
 * POST /api/vetting/vet/:creatorId
 */
export const vetCreator = async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Only brands or admins can trigger vetting
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can request creator vetting'
            });
        }

        const result = await vettingService.vetCreator(parseInt(creatorId));

        res.json({
            status: 'success',
            data: result
        });
    } catch (error) {
        console.error('Vet creator error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to vet creator'
        });
    }
};

/**
 * Generate a vetting report
 * POST /api/vetting/report/:creatorId
 */
export const generateReport = async (req, res) => {
    try {
        const { creatorId } = req.params;

        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can generate vetting reports'
            });
        }

        const brandId = req.user.role === 'brand' ? req.user.id : null;
        const report = await vettingService.generateVettingReport(
            parseInt(creatorId),
            brandId
        );

        res.json({
            status: 'success',
            data: report
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate vetting report'
        });
    }
};

/**
 * Get vetting summary for a creator (public summary)
 * GET /api/vetting/summary/:creatorId
 */
export const getVettingSummary = async (req, res) => {
    try {
        const { creatorId } = req.params;
        const summary = await vettingService.getCreatorVettingSummary(parseInt(creatorId));

        res.json({
            status: 'success',
            data: summary
        });
    } catch (error) {
        console.error('Get vetting summary error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get vetting summary'
        });
    }
};

/**
 * Get a specific vetting report
 * GET /api/vetting/report/:reportId
 */
export const getReport = async (req, res) => {
    try {
        const { reportId } = req.params;
        const report = await vettingService.getVettingReportById(parseInt(reportId));

        if (!report) {
            return res.status(404).json({
                status: 'error',
                message: 'Report not found'
            });
        }

        // Check authorization - only report creator (brand) or admin can view
        if (req.user.role === 'brand' && report.brandId !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized to view this report'
            });
        }

        res.json({
            status: 'success',
            data: report
        });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get vetting report'
        });
    }
};

/**
 * Get all reports for a creator
 * GET /api/vetting/creator/:creatorId/reports
 */
export const getCreatorReports = async (req, res) => {
    try {
        const { creatorId } = req.params;

        // Only the creator themselves or admin can see all reports
        if (req.user.role === 'creator' && req.user.id !== parseInt(creatorId)) {
            return res.status(403).json({
                status: 'error',
                message: 'Not authorized'
            });
        }

        const reports = await vettingService.getCreatorVettingReports(parseInt(creatorId));

        res.json({
            status: 'success',
            data: reports
        });
    } catch (error) {
        console.error('Get creator reports error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to get creator reports'
        });
    }
};

/**
 * Calculate scores (preview without saving)
 * GET /api/vetting/preview/:creatorId
 */
export const previewScores = async (req, res) => {
    try {
        const { creatorId } = req.params;

        const [audience, engagement, safety] = await Promise.all([
            vettingService.calculateAudienceAuthenticityScore(parseInt(creatorId)),
            vettingService.calculateEngagementQualityScore(parseInt(creatorId)),
            vettingService.calculateBrandSafetyScore(parseInt(creatorId))
        ]);

        const overallScore = Math.round(
            (audience.score * 0.4) + (engagement.score * 0.3) + (safety.score * 0.3)
        );

        res.json({
            status: 'success',
            data: {
                overallScore,
                scores: {
                    audience: audience.score,
                    engagement: engagement.score,
                    safety: safety.score
                },
                factors: {
                    audience: audience.factors,
                    engagement: engagement.factors,
                    safety: safety.factors
                }
            }
        });
    } catch (error) {
        console.error('Preview scores error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to calculate scores'
        });
    }
};
