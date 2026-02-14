/**
 * Report Controller
 * API endpoints for automated report generation
 */

import * as reportService from '../services/reportService.js';

/**
 * Generate Brand Executive Report
 * GET /api/reports/brand/executive
 */
export const getBrandExecutiveReport = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this report'
            });
        }

        const { startDate, endDate, campaignIds } = req.query;

        const reportData = await reportService.generateBrandExecutiveReport(
            req.user.id,
            {
                startDate,
                endDate,
                campaignIds: campaignIds ? campaignIds.split(',').map(Number) : undefined
            }
        );

        res.json({
            status: 'success',
            data: reportData
        });
    } catch (error) {
        console.error('Brand executive report error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate report'
        });
    }
};

/**
 * Generate Creator Performance Report
 * GET /api/reports/creator/performance
 */
export const getCreatorPerformanceReport = async (req, res) => {
    try {
        if (req.user.role !== 'creator' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only creators can access this report'
            });
        }

        const { startDate, endDate } = req.query;

        const reportData = await reportService.generateCreatorPerformanceReport(
            req.user.id,
            { startDate, endDate }
        );

        res.json({
            status: 'success',
            data: reportData
        });
    } catch (error) {
        console.error('Creator performance report error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate report'
        });
    }
};

/**
 * Get Campaign Summary Report
 * GET /api/reports/campaign/:campaignId
 */
export const getCampaignSummary = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const reportData = await reportService.generateCampaignSummary(parseInt(campaignId));

        res.json({
            status: 'success',
            data: reportData
        });
    } catch (error) {
        console.error('Campaign summary error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to generate summary'
        });
    }
};

/**
 * Download Brand Report as PDF
 * GET /api/reports/brand/executive/pdf
 */
export const downloadBrandReportPDF = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this report'
            });
        }

        const { startDate, endDate, campaignIds } = req.query;

        const reportData = await reportService.generateBrandExecutiveReport(
            req.user.id,
            {
                startDate,
                endDate,
                campaignIds: campaignIds ? campaignIds.split(',').map(Number) : undefined
            }
        );

        const pdfBuffer = await reportService.generatePDF('brand', reportData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=executive-report-${Date.now()}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Brand PDF export error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to export PDF'
        });
    }
};

/**
 * Download Brand Report as CSV
 * GET /api/reports/brand/executive/csv
 */
export const downloadBrandReportCSV = async (req, res) => {
    try {
        if (req.user.role !== 'brand' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only brands can access this report'
            });
        }

        const { startDate, endDate, campaignIds } = req.query;

        const reportData = await reportService.generateBrandExecutiveReport(
            req.user.id,
            {
                startDate,
                endDate,
                campaignIds: campaignIds ? campaignIds.split(',').map(Number) : undefined
            }
        );

        const csv = reportService.generateCSV('brand', reportData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=executive-report-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Brand CSV export error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to export CSV'
        });
    }
};

/**
 * Download Creator Report as PDF
 * GET /api/reports/creator/performance/pdf
 */
export const downloadCreatorReportPDF = async (req, res) => {
    try {
        if (req.user.role !== 'creator' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only creators can access this report'
            });
        }

        const { startDate, endDate } = req.query;

        const reportData = await reportService.generateCreatorPerformanceReport(
            req.user.id,
            { startDate, endDate }
        );

        const pdfBuffer = await reportService.generatePDF('creator', reportData);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=performance-report-${Date.now()}.pdf`);
        res.send(pdfBuffer);
    } catch (error) {
        console.error('Creator PDF export error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to export PDF'
        });
    }
};

/**
 * Download Creator Report as CSV
 * GET /api/reports/creator/performance/csv
 */
export const downloadCreatorReportCSV = async (req, res) => {
    try {
        if (req.user.role !== 'creator' && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Only creators can access this report'
            });
        }

        const { startDate, endDate } = req.query;

        const reportData = await reportService.generateCreatorPerformanceReport(
            req.user.id,
            { startDate, endDate }
        );

        const csv = reportService.generateCSV('creator', reportData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=performance-report-${Date.now()}.csv`);
        res.send(csv);
    } catch (error) {
        console.error('Creator CSV export error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to export CSV'
        });
    }
};
