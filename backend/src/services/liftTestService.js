/**
 * Lift Test Service
 * Business logic for incremental lift testing
 */

import { prisma } from '../config/db.js';
import * as stats from './statisticsService.js';

/**
 * Create a new lift test with test and control groups
 */
export const createLiftTest = async (data) => {
    const {
        campaignId, name, hypothesis, testType, splitMethod, targetLiftPct,
        testRegions, controlRegions, testPercentage,
        baselineStartDate, baselineEndDate // For TimeBased tests
    } = data;

    const liftTest = await prisma.liftTest.create({
        data: {
            campaignId,
            name,
            hypothesis,
            testType: testType || 'Geographic',
            splitMethod: splitMethod || 'region',
            targetLiftPct: targetLiftPct || null,
            // Time-based comparison dates
            baselineStartDate: testType === 'TimeBased' ? new Date(baselineStartDate) : null,
            baselineEndDate: testType === 'TimeBased' ? new Date(baselineEndDate) : null,
            groups: {
                create: testType === 'TimeBased'
                    ? [
                        // For TimeBased: "Test" = campaign period, "Control" = baseline period
                        { groupType: 'Test' },
                        { groupType: 'Control' }
                    ]
                    : [
                        {
                            groupType: 'Test',
                            regions: testType === 'Geographic' ? testRegions : null,
                            percentage: testType === 'RandomSplit' ? testPercentage : null
                        },
                        {
                            groupType: 'Control',
                            regions: testType === 'Geographic' ? controlRegions : null,
                            percentage: testType === 'RandomSplit' ? (100 - (testPercentage || 50)) : null
                        }
                    ]
            },
            result: {
                create: {}  // Initialize empty result
            }
        },
        include: {
            groups: true,
            result: true
        }
    });

    return liftTest;
};

/**
 * Get a lift test by ID with all related data
 */
export const getLiftTest = async (id) => {
    return prisma.liftTest.findUnique({
        where: { id: parseInt(id) },
        include: {
            groups: true,
            result: true,
            campaign: {
                select: {
                    id: true,
                    title: true,
                    brandId: true
                }
            }
        }
    });
};

/**
 * Get all lift tests for a campaign
 */
export const getCampaignLiftTests = async (campaignId) => {
    return prisma.liftTest.findMany({
        where: { campaignId: parseInt(campaignId) },
        include: {
            groups: true,
            result: true
        },
        orderBy: { createdAt: 'desc' }
    });
};

/**
 * Get all lift tests for a brand (across all their campaigns)
 */
export const getBrandLiftTests = async (brandId) => {
    // Ensure brandId is a valid number
    const parsedBrandId = Number(brandId);

    if (!brandId || isNaN(parsedBrandId)) {
        console.error('Invalid brandId:', brandId);
        return [];
    }

    // First get all campaigns for this brand
    const campaigns = await prisma.campaign.findMany({
        where: { brandId: parsedBrandId },
        select: { id: true }
    });

    if (campaigns.length === 0) {
        return [];
    }

    const campaignIds = campaigns.map(c => c.id);

    // Then get all lift tests for those campaigns
    return prisma.liftTest.findMany({
        where: {
            campaignId: { in: campaignIds }
        },
        include: {
            groups: true,
            result: true,
            campaign: {
                select: {
                    id: true,
                    title: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};


/**
 * Start a lift test

 */
export const startTest = async (id) => {
    return prisma.liftTest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'Running',
            startDate: new Date()
        },
        include: { groups: true, result: true }
    });
};

/**
 * Pause a lift test
 */
export const pauseTest = async (id) => {
    return prisma.liftTest.update({
        where: { id: parseInt(id) },
        data: { status: 'Paused' },
        include: { groups: true, result: true }
    });
};

/**
 * Resume a lift test
 */
export const resumeTest = async (id) => {
    return prisma.liftTest.update({
        where: { id: parseInt(id) },
        data: { status: 'Running' },
        include: { groups: true, result: true }
    });
};

/**
 * Complete a lift test
 */
export const completeTest = async (id) => {
    // Calculate final results before completing
    await calculateResults(id);

    return prisma.liftTest.update({
        where: { id: parseInt(id) },
        data: {
            status: 'Completed',
            endDate: new Date()
        },
        include: { groups: true, result: true }
    });
};

/**
 * Assign a user to test or control group based on rules
 * Returns the group type ('Test' or 'Control')
 */
export const assignUserToGroup = async (liftTestId, userContext) => {
    const liftTest = await prisma.liftTest.findUnique({
        where: { id: parseInt(liftTestId) },
        include: { groups: true }
    });

    if (!liftTest || liftTest.status !== 'Running') {
        return null;
    }

    const testGroup = liftTest.groups.find(g => g.groupType === 'Test');
    const controlGroup = liftTest.groups.find(g => g.groupType === 'Control');

    if (liftTest.testType === 'Geographic') {
        // Geographic split - check user's region
        const userRegion = userContext.region || userContext.country || 'UNKNOWN';
        const testRegions = testGroup.regions || [];
        const controlRegions = controlGroup.regions || [];

        if (testRegions.includes(userRegion)) {
            return { groupType: 'Test', groupId: testGroup.id };
        }
        if (controlRegions.includes(userRegion)) {
            return { groupType: 'Control', groupId: controlGroup.id };
        }

        // Unknown region - default to control
        return { groupType: 'Control', groupId: controlGroup.id };
    }

    if (liftTest.testType === 'RandomSplit') {
        // Random split based on user hash or cookie
        const userId = userContext.userId || userContext.sessionId || Math.random().toString();
        const hash = hashString(userId + liftTestId);
        const bucket = hash % 100;

        const testPercentage = testGroup.percentage || 50;

        if (bucket < testPercentage) {
            return { groupType: 'Test', groupId: testGroup.id };
        }
        return { groupType: 'Control', groupId: controlGroup.id };
    }

    // Default to control
    return { groupType: 'Control', groupId: controlGroup.id };
};

/**
 * Simple string hash function for consistent random assignment
 */
const hashString = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};

/**
 * Record an event (impression, conversion) for a group
 */
export const recordGroupEvent = async (groupId, eventType, value = 1) => {
    const updateData = {};

    switch (eventType) {
        case 'impression':
            updateData.impressions = { increment: 1 };
            break;
        case 'unique_user':
            updateData.uniqueUsers = { increment: 1 };
            break;
        case 'conversion':
            updateData.conversions = { increment: 1 };
            break;
        case 'revenue':
            updateData.revenue = { increment: parseFloat(value) || 0 };
            break;
    }

    return prisma.liftTestGroup.update({
        where: { id: parseInt(groupId) },
        data: updateData
    });
};

/**
 * Calculate and update the results for a lift test
 */
export const calculateResults = async (liftTestId) => {
    const liftTest = await prisma.liftTest.findUnique({
        where: { id: parseInt(liftTestId) },
        include: { groups: true, result: true }
    });

    if (!liftTest) {
        throw new Error('Lift test not found');
    }

    const testGroup = liftTest.groups.find(g => g.groupType === 'Test');
    const controlGroup = liftTest.groups.find(g => g.groupType === 'Control');

    if (!testGroup || !controlGroup) {
        throw new Error('Invalid test configuration - missing groups');
    }

    // Calculate metrics
    const testConversions = testGroup.conversions || 0;
    const controlConversions = controlGroup.conversions || 0;
    const testTotal = testGroup.uniqueUsers || testGroup.impressions || 0;
    const controlTotal = controlGroup.uniqueUsers || controlGroup.impressions || 0;

    const testRevenue = parseFloat(testGroup.revenue) || 0;
    const controlRevenue = parseFloat(controlGroup.revenue) || 0;

    // Statistical calculations
    const liftPercentage = stats.calculateLiftPercentage(testConversions, controlConversions);
    const absoluteLift = stats.calculateAbsoluteLift(testConversions, controlConversions);
    const incrementalRevenue = stats.calculateAbsoluteLift(testRevenue, controlRevenue);

    const pValue = stats.calculatePValue(testConversions, testTotal, controlConversions, controlTotal);
    const isSignificant = stats.isStatisticallySignificant(pValue);
    const confidenceInterval = stats.calculateConfidenceInterval(testConversions, testTotal, controlConversions, controlTotal);

    // Update result
    const result = await prisma.liftTestResult.upsert({
        where: { liftTestId: parseInt(liftTestId) },
        update: {
            testConversions,
            controlConversions,
            testRevenue,
            controlRevenue,
            liftPercentage: isFinite(liftPercentage) ? liftPercentage : null,
            absoluteLift,
            incrementalRevenue,
            pValue,
            confidenceInterval,
            sampleSizeTest: testTotal,
            sampleSizeControl: controlTotal,
            calculatedAt: new Date()
        },
        create: {
            liftTestId: parseInt(liftTestId),
            testConversions,
            controlConversions,
            testRevenue,
            controlRevenue,
            liftPercentage: isFinite(liftPercentage) ? liftPercentage : null,
            absoluteLift,
            incrementalRevenue,
            pValue,
            confidenceInterval,
            sampleSizeTest: testTotal,
            sampleSizeControl: controlTotal
        }
    });

    // Update test significance flag
    await prisma.liftTest.update({
        where: { id: parseInt(liftTestId) },
        data: {
            isSignificant,
            confidenceLevel: isSignificant ? 95 : null
        }
    });

    return {
        ...result,
        interpretation: stats.getSignificanceInterpretation(pValue, liftPercentage)
    };
};

/**
 * Calculate results for time-based lift test (baseline vs campaign period)
 * Queries attribution events directly for the two time periods
 */
export const calculateTimeBasedResults = async (liftTestId) => {
    const liftTest = await prisma.liftTest.findUnique({
        where: { id: parseInt(liftTestId) },
        include: {
            groups: true,
            result: true,
            campaign: {
                include: {
                    collaborations: {
                        include: { trackingBundle: true }
                    }
                }
            }
        }
    });

    if (!liftTest || liftTest.testType !== 'TimeBased') {
        throw new Error('Invalid time-based lift test');
    }

    // Get tracking bundle IDs for this campaign
    const bundleIds = liftTest.campaign.collaborations
        .filter(c => c.trackingBundle)
        .map(c => c.trackingBundle.id);

    if (bundleIds.length === 0) {
        console.log('[LiftTest] No tracking bundles found for campaign');
        return null;
    }

    // Query baseline period events
    const baselineEvents = await prisma.attributionEvent.aggregate({
        where: {
            trackingBundleId: { in: bundleIds },
            eventType: 'Purchase',
            eventTimestamp: {
                gte: liftTest.baselineStartDate,
                lte: liftTest.baselineEndDate
            }
        },
        _count: { id: true },
        _sum: { orderValue: true }
    });

    // Query campaign period events (from startDate to now or endDate)
    const campaignEndDate = liftTest.endDate || new Date();
    const campaignEvents = await prisma.attributionEvent.aggregate({
        where: {
            trackingBundleId: { in: bundleIds },
            eventType: 'Purchase',
            eventTimestamp: {
                gte: liftTest.startDate,
                lte: campaignEndDate
            }
        },
        _count: { id: true },
        _sum: { orderValue: true }
    });

    const controlConversions = baselineEvents._count.id || 0;
    const testConversions = campaignEvents._count.id || 0;
    const controlRevenue = parseFloat(baselineEvents._sum.orderValue) || 0;
    const testRevenue = parseFloat(campaignEvents._sum.orderValue) || 0;

    // Calculate days for normalization
    const baselineDays = Math.max(1, Math.ceil(
        (new Date(liftTest.baselineEndDate) - new Date(liftTest.baselineStartDate)) / (1000 * 60 * 60 * 24)
    ));
    const campaignDays = Math.max(1, Math.ceil(
        (campaignEndDate - new Date(liftTest.startDate)) / (1000 * 60 * 60 * 24)
    ));

    // Normalize to daily rates for fair comparison
    const controlDailyRate = controlConversions / baselineDays;
    const testDailyRate = testConversions / campaignDays;

    // Calculate lift using normalized rates
    const liftPercentage = controlDailyRate === 0
        ? (testDailyRate > 0 ? 100 : 0)
        : ((testDailyRate - controlDailyRate) / controlDailyRate) * 100;

    console.log(`[LiftTest TimeBased] Baseline: ${controlConversions} conv over ${baselineDays} days`);
    console.log(`[LiftTest TimeBased] Campaign: ${testConversions} conv over ${campaignDays} days`);
    console.log(`[LiftTest TimeBased] Lift: ${liftPercentage.toFixed(1)}%`);

    // Update groups with metrics
    const testGroup = liftTest.groups.find(g => g.groupType === 'Test');
    const controlGroup = liftTest.groups.find(g => g.groupType === 'Control');

    if (testGroup && controlGroup) {
        await prisma.liftTestGroup.update({
            where: { id: testGroup.id },
            data: { conversions: testConversions, revenue: testRevenue, uniqueUsers: campaignDays }
        });
        await prisma.liftTestGroup.update({
            where: { id: controlGroup.id },
            data: { conversions: controlConversions, revenue: controlRevenue, uniqueUsers: baselineDays }
        });
    }

    // Now call regular calculateResults to compute statistics
    return calculateResults(liftTestId);
};

/**
 * Get formatted results for display
 */
export const getFormattedResults = async (liftTestId) => {
    const liftTest = await getLiftTest(liftTestId);

    if (!liftTest || !liftTest.result) {
        return null;
    }

    const result = liftTest.result;
    const interpretation = stats.getSignificanceInterpretation(
        parseFloat(result.pValue) || 1,
        parseFloat(result.liftPercentage) || 0
    );

    return {
        testId: liftTest.id,
        testName: liftTest.name,
        status: liftTest.status,
        isSignificant: liftTest.isSignificant,

        // Group Metrics
        testGroup: {
            conversions: result.testConversions,
            revenue: parseFloat(result.testRevenue),
            sampleSize: result.sampleSizeTest
        },
        controlGroup: {
            conversions: result.controlConversions,
            revenue: parseFloat(result.controlRevenue),
            sampleSize: result.sampleSizeControl
        },

        // Lift Metrics
        lift: {
            percentage: parseFloat(result.liftPercentage),
            absolute: result.absoluteLift,
            incrementalRevenue: parseFloat(result.incrementalRevenue)
        },

        // Statistical Data
        statistics: {
            pValue: parseFloat(result.pValue),
            confidenceInterval: result.confidenceInterval,
            confidenceLevel: 95
        },

        // Interpretation
        interpretation,

        // Timestamps
        calculatedAt: result.calculatedAt,
        startDate: liftTest.startDate,
        endDate: liftTest.endDate
    };
};

/**
 * Delete a lift test
 */
export const deleteLiftTest = async (id) => {
    return prisma.liftTest.delete({
        where: { id: parseInt(id) }
    });
};

/**
 * Update lift test configuration
 */
export const updateLiftTest = async (id, data) => {
    const { name, hypothesis, targetLiftPct } = data;

    return prisma.liftTest.update({
        where: { id: parseInt(id) },
        data: {
            name,
            hypothesis,
            targetLiftPct
        },
        include: { groups: true, result: true }
    });
};
