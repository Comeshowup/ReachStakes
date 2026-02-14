/**
 * Lift Test Routes
 * API routes for incremental lift testing
 */

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    createLiftTest,
    getLiftTest,
    getCampaignLiftTests,
    getBrandLiftTests,
    startLiftTest,
    pauseLiftTest,
    resumeLiftTest,
    completeLiftTest,
    assignToGroup,
    recordEvent,
    calculateResults,
    getResults,
    updateLiftTest,
    deleteLiftTest
} from '../controllers/liftTestController.js';

const router = express.Router();

// === CRUD OPERATIONS ===

// Create a new lift test
router.post('/', protect, createLiftTest);

// Get all lift tests for the current brand (across all campaigns)
router.get('/my-tests', protect, getBrandLiftTests);

// Get all lift tests for a specific campaign
router.get('/campaign/:campaignId', protect, getCampaignLiftTests);

// Get a single lift test
router.get('/:id', protect, getLiftTest);


// Update a lift test
router.put('/:id', protect, updateLiftTest);

// Delete a lift test
router.delete('/:id', protect, deleteLiftTest);

// === TEST LIFECYCLE ===

// Start a lift test
router.post('/:id/start', protect, startLiftTest);

// Pause a lift test
router.post('/:id/pause', protect, pauseLiftTest);

// Resume a lift test
router.post('/:id/resume', protect, resumeLiftTest);

// Complete a lift test
router.post('/:id/complete', protect, completeLiftTest);

// === USER ASSIGNMENT (Public for tracking) ===

// Assign a user to a test group
router.get('/:id/assign', assignToGroup);

// === EVENT RECORDING ===

// Record an event for a group
router.post('/group/:groupId/event', recordEvent);

// === RESULTS ===

// Calculate results for a lift test
router.post('/:id/calculate', protect, calculateResults);

// Get formatted results
router.get('/:id/results', protect, getResults);

export default router;
