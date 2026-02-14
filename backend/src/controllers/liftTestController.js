/**
 * Lift Test Controller
 * API endpoints for incremental lift testing
 */

import * as liftTestService from '../services/liftTestService.js';

/**
 * Create a new lift test
 * POST /api/lift-tests
 */
export const createLiftTest = async (req, res) => {
    try {
        const { campaignId, name, hypothesis, testType, splitMethod, targetLiftPct, testRegions, controlRegions, testPercentage } = req.body;

        if (!campaignId || !name) {
            return res.status(400).json({
                status: 'error',
                message: 'Campaign ID and test name are required'
            });
        }

        const liftTest = await liftTestService.createLiftTest({
            campaignId: parseInt(campaignId),
            name,
            hypothesis,
            testType,
            splitMethod,
            targetLiftPct,
            testRegions,
            controlRegions,
            testPercentage
        });

        res.status(201).json({
            status: 'success',
            data: liftTest
        });
    } catch (error) {
        console.error('Error creating lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create lift test',
            error: error.message
        });
    }
};

/**
 * Get a single lift test by ID
 * GET /api/lift-tests/:id
 */
export const getLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        const liftTest = await liftTestService.getLiftTest(id);

        if (!liftTest) {
            return res.status(404).json({
                status: 'error',
                message: 'Lift test not found'
            });
        }

        res.json({
            status: 'success',
            data: liftTest
        });
    } catch (error) {
        console.error('Error fetching lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch lift test',
            error: error.message
        });
    }
};

/**
 * Get all lift tests for a campaign
 * GET /api/lift-tests/campaign/:campaignId
 */
export const getCampaignLiftTests = async (req, res) => {
    try {
        const { campaignId } = req.params;

        const liftTests = await liftTestService.getCampaignLiftTests(campaignId);

        res.json({
            status: 'success',
            data: liftTests
        });
    } catch (error) {
        console.error('Error fetching campaign lift tests:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch lift tests',
            error: error.message
        });
    }
};

/**
 * Get all lift tests for the current brand (across all campaigns)
 * GET /api/lift-tests/my-tests
 */
export const getBrandLiftTests = async (req, res) => {
    try {
        // The protect middleware sets req.user, not req.userId
        const brandId = req.user?.id;
        console.log('[Lift Test] getBrandLiftTests - user.id:', brandId);

        if (!brandId) {
            return res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
        }

        const liftTests = await liftTestService.getBrandLiftTests(brandId);

        res.json({
            status: 'success',
            data: liftTests
        });
    } catch (error) {
        console.error('Error fetching brand lift tests:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch lift tests',
            error: error.message
        });
    }
};


/**
 * Start a lift test

 * POST /api/lift-tests/:id/start
 */
export const startLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        const liftTest = await liftTestService.startTest(id);

        res.json({
            status: 'success',
            message: 'Lift test started',
            data: liftTest
        });
    } catch (error) {
        console.error('Error starting lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to start lift test',
            error: error.message
        });
    }
};

/**
 * Pause a lift test
 * POST /api/lift-tests/:id/pause
 */
export const pauseLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        const liftTest = await liftTestService.pauseTest(id);

        res.json({
            status: 'success',
            message: 'Lift test paused',
            data: liftTest
        });
    } catch (error) {
        console.error('Error pausing lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to pause lift test',
            error: error.message
        });
    }
};

/**
 * Resume a lift test
 * POST /api/lift-tests/:id/resume
 */
export const resumeLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        const liftTest = await liftTestService.resumeTest(id);

        res.json({
            status: 'success',
            message: 'Lift test resumed',
            data: liftTest
        });
    } catch (error) {
        console.error('Error resuming lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to resume lift test',
            error: error.message
        });
    }
};

/**
 * Complete a lift test
 * POST /api/lift-tests/:id/complete
 */
export const completeLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        const liftTest = await liftTestService.completeTest(id);

        res.json({
            status: 'success',
            message: 'Lift test completed',
            data: liftTest
        });
    } catch (error) {
        console.error('Error completing lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to complete lift test',
            error: error.message
        });
    }
};

/**
 * Assign a user to a test group
 * GET /api/lift-tests/:id/assign
 */
export const assignToGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { region, userId, sessionId } = req.query;

        const assignment = await liftTestService.assignUserToGroup(id, {
            region,
            userId,
            sessionId
        });

        if (!assignment) {
            return res.status(404).json({
                status: 'error',
                message: 'Lift test not found or not running'
            });
        }

        res.json({
            status: 'success',
            data: assignment
        });
    } catch (error) {
        console.error('Error assigning user to group:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to assign user to group',
            error: error.message
        });
    }
};

/**
 * Record an event for a group
 * POST /api/lift-tests/group/:groupId/event
 */
export const recordEvent = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { eventType, value } = req.body;

        if (!eventType) {
            return res.status(400).json({
                status: 'error',
                message: 'Event type is required'
            });
        }

        const group = await liftTestService.recordGroupEvent(groupId, eventType, value);

        res.json({
            status: 'success',
            message: 'Event recorded',
            data: group
        });
    } catch (error) {
        console.error('Error recording event:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to record event',
            error: error.message
        });
    }
};

/**
 * Calculate/recalculate results for a lift test
 * POST /api/lift-tests/:id/calculate
 */
export const calculateResults = async (req, res) => {
    try {
        const { id } = req.params;

        const results = await liftTestService.calculateResults(id);

        res.json({
            status: 'success',
            message: 'Results calculated',
            data: results
        });
    } catch (error) {
        console.error('Error calculating results:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to calculate results',
            error: error.message
        });
    }
};

/**
 * Get formatted results for display
 * GET /api/lift-tests/:id/results
 */
export const getResults = async (req, res) => {
    try {
        const { id } = req.params;

        const results = await liftTestService.getFormattedResults(id);

        if (!results) {
            return res.status(404).json({
                status: 'error',
                message: 'Lift test or results not found'
            });
        }

        res.json({
            status: 'success',
            data: results
        });
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch results',
            error: error.message
        });
    }
};

/**
 * Update a lift test
 * PUT /api/lift-tests/:id
 */
export const updateLiftTest = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, hypothesis, targetLiftPct } = req.body;

        const liftTest = await liftTestService.updateLiftTest(id, {
            name,
            hypothesis,
            targetLiftPct
        });

        res.json({
            status: 'success',
            data: liftTest
        });
    } catch (error) {
        console.error('Error updating lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update lift test',
            error: error.message
        });
    }
};

/**
 * Delete a lift test
 * DELETE /api/lift-tests/:id
 */
export const deleteLiftTest = async (req, res) => {
    try {
        const { id } = req.params;

        await liftTestService.deleteLiftTest(id);

        res.json({
            status: 'success',
            message: 'Lift test deleted'
        });
    } catch (error) {
        console.error('Error deleting lift test:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete lift test',
            error: error.message
        });
    }
};
