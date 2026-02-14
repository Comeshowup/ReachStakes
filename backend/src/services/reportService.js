/**
 * Report Service
 * Automated report generation for brands and creators
 */

import { prisma } from '../config/db.js';
import PDFDocument from 'pdfkit';

// ============================================
// BRAND EXECUTIVE REPORT
// ============================================

/**
 * Generate Brand Executive Report data
 */
export const generateBrandExecutiveReport = async (brandId, options = {}) => {
    const { startDate, endDate, campaignIds } = options;

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get brand profile
    const brand = await prisma.brandProfile.findUnique({
        where: { userId: brandId },
        include: { user: { select: { name: true, email: true } } }
    });

    if (!brand) throw new Error('Brand not found');

    // Get campaigns
    const campaignWhere = {
        brandId: brandId,
        ...(campaignIds?.length && { id: { in: campaignIds } }),
        ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
    };

    const campaigns = await prisma.campaign.findMany({
        where: campaignWhere,
        include: {
            collaborations: {
                where: { status: { in: ['Approved', 'Paid'] } },
                include: {
                    creator: {
                        include: { creatorProfile: true }
                    }
                }
            }
        }
    });

    // Calculate aggregated metrics
    let totalReach = 0;
    let totalEngagement = 0;
    let totalSpend = 0;
    let totalConversions = 0;
    let totalRevenue = 0;
    const creatorPerformance = {};

    for (const campaign of campaigns) {
        totalSpend += parseFloat(campaign.budget || 0);

        for (const collab of campaign.collaborations) {
            const payment = parseFloat(collab.agreedPrice || 0);
            const views = collab.videoStats?.views || 0;
            const likes = collab.videoStats?.likes || 0;
            const comments = collab.videoStats?.comments || 0;

            totalReach += views;
            totalEngagement += likes + comments;

            // Track creator performance
            const creatorId = collab.creatorId;
            if (!creatorPerformance[creatorId]) {
                creatorPerformance[creatorId] = {
                    name: collab.creator.name,
                    handle: collab.creator.creatorProfile?.handle || '',
                    campaigns: 0,
                    reach: 0,
                    engagement: 0,
                    spend: 0
                };
            }
            creatorPerformance[creatorId].campaigns++;
            creatorPerformance[creatorId].reach += views;
            creatorPerformance[creatorId].engagement += likes + comments;
            creatorPerformance[creatorId].spend += payment;
        }
    }

    // Get attribution data
    const attributionEvents = await prisma.attributionEvent.findMany({
        where: {
            bundle: {
                campaign: { brandId: brandId }
            },
            eventType: 'Purchase',
            ...(Object.keys(dateFilter).length && { timestamp: dateFilter })
        }
    });

    for (const event of attributionEvents) {
        totalConversions++;
        totalRevenue += parseFloat(event.value || 0);
    }

    // Top performers
    const topCreators = Object.values(creatorPerformance)
        .sort((a, b) => b.reach - a.reach)
        .slice(0, 5);

    // Calculate ROI
    const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend * 100) : 0;

    return {
        brand: {
            name: brand.companyName,
            email: brand.user.email
        },
        period: {
            startDate: startDate || 'All time',
            endDate: endDate || 'Present'
        },
        summary: {
            totalCampaigns: campaigns.length,
            totalCollaborations: campaigns.reduce((sum, c) => sum + c.collaborations.length, 0),
            totalSpend: totalSpend.toFixed(2),
            totalReach,
            totalEngagement,
            totalConversions,
            totalRevenue: totalRevenue.toFixed(2),
            roi: roi.toFixed(1)
        },
        topCreators,
        campaigns: campaigns.map(c => ({
            id: c.id,
            title: c.title,
            status: c.status,
            budget: c.budget,
            collaborations: c.collaborations.length
        })),
        generatedAt: new Date().toISOString()
    };
};

// ============================================
// CREATOR PERFORMANCE REPORT
// ============================================

/**
 * Generate Creator Proof-of-Performance Report
 */
export const generateCreatorPerformanceReport = async (creatorId, options = {}) => {
    const { startDate, endDate } = options;

    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get creator profile
    const creator = await prisma.creatorProfile.findUnique({
        where: { userId: creatorId },
        include: {
            user: { select: { name: true, email: true } },
            demographics: true
        }
    });

    if (!creator) throw new Error('Creator not found');

    // Get collaborations
    const collaborations = await prisma.campaignCollaboration.findMany({
        where: {
            creatorId,
            status: { in: ['Approved', 'Paid'] },
            ...(Object.keys(dateFilter).length && { updatedAt: dateFilter })
        },
        include: {
            campaign: {
                include: {
                    brand: { include: { brandProfile: true } }
                }
            }
        }
    });

    // Calculate metrics
    let totalReach = 0;
    let totalEngagement = 0;
    let totalEarnings = 0;
    const brandPartnerships = new Set();

    const campaignDetails = collaborations.map(collab => {
        const views = collab.videoStats?.views || 0;
        const likes = collab.videoStats?.likes || 0;
        const comments = collab.videoStats?.comments || 0;
        const payment = parseFloat(collab.agreedPrice || 0);

        totalReach += views;
        totalEngagement += likes + comments;
        totalEarnings += payment;
        brandPartnerships.add(collab.campaign.brand.brandProfile?.companyName);

        return {
            campaignTitle: collab.campaign.title,
            brand: collab.campaign.brand.brandProfile?.companyName || 'Unknown',
            status: collab.status,
            views,
            engagement: likes + comments,
            payment: payment.toFixed(2),
            completedAt: collab.updatedAt
        };
    });

    // Get attribution conversions
    const conversions = await prisma.attributionEvent.findMany({
        where: {
            bundle: { creatorId },
            eventType: 'Purchase',
            ...(Object.keys(dateFilter).length && { timestamp: dateFilter })
        }
    });

    const totalConversions = conversions.length;
    const totalConversionValue = conversions.reduce((sum, c) => sum + parseFloat(c.value || 0), 0);

    // Get payouts
    const payouts = await prisma.creatorPayout.findMany({
        where: {
            creatorId,
            status: 'Completed',
            ...(Object.keys(dateFilter).length && { paidAt: dateFilter })
        }
    });

    const totalPaidOut = payouts.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

    return {
        creator: {
            name: creator.fullName,
            handle: creator.handle,
            email: creator.user.email,
            platform: creator.primaryPlatform,
            followers: creator.followersCount,
            verificationTier: creator.verificationTier || 'None'
        },
        period: {
            startDate: startDate || 'All time',
            endDate: endDate || 'Present'
        },
        summary: {
            totalCampaigns: collaborations.length,
            uniqueBrands: brandPartnerships.size,
            totalReach,
            totalEngagement,
            engagementRate: totalReach > 0 ? ((totalEngagement / totalReach) * 100).toFixed(2) : '0',
            totalEarnings: totalEarnings.toFixed(2),
            totalPaidOut: totalPaidOut.toFixed(2),
            totalConversions,
            totalConversionValue: totalConversionValue.toFixed(2)
        },
        campaigns: campaignDetails,
        verification: {
            tier: creator.verificationTier || 'None',
            reliabilityScore: creator.reliabilityScore || 0,
            onTimeDeliveryRate: creator.onTimeDeliveryRate ? parseFloat(creator.onTimeDeliveryRate) : null,
            completedCampaigns: creator.completedCampaigns || 0
        },
        generatedAt: new Date().toISOString()
    };
};

// ============================================
// PDF EXPORT
// ============================================

/**
 * Generate PDF from report data
 */
export const generatePDF = async (reportType, reportData) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));

    return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(24).font('Helvetica-Bold')
            .text(reportType === 'brand' ? 'Executive Report' : 'Performance Report', { align: 'center' });
        doc.moveDown(0.5);

        doc.fontSize(12).font('Helvetica')
            .fillColor('#666')
            .text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.moveDown(2);

        if (reportType === 'brand') {
            generateBrandPDF(doc, reportData);
        } else {
            generateCreatorPDF(doc, reportData);
        }

        doc.end();
    });
};

const generateBrandPDF = (doc, data) => {
    // Brand Info
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000')
        .text(data.brand.name);
    doc.fontSize(10).font('Helvetica').fillColor('#666')
        .text(`Report Period: ${data.period.startDate} - ${data.period.endDate}`);
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Campaign Summary');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Total Campaigns: ${data.summary.totalCampaigns}`);
    doc.text(`Total Collaborations: ${data.summary.totalCollaborations}`);
    doc.text(`Total Spend: $${data.summary.totalSpend}`);
    doc.moveDown(1);

    // Performance Metrics
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Performance Metrics');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Total Reach: ${data.summary.totalReach.toLocaleString()}`);
    doc.text(`Total Engagement: ${data.summary.totalEngagement.toLocaleString()}`);
    doc.text(`Conversions: ${data.summary.totalConversions}`);
    doc.text(`Revenue Attributed: $${data.summary.totalRevenue}`);
    doc.text(`ROI: ${data.summary.roi}%`);
    doc.moveDown(2);

    // Top Creators
    if (data.topCreators?.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
            .text('Top Performing Creators');
        doc.moveDown(0.5);

        data.topCreators.forEach((creator, i) => {
            doc.fontSize(11).font('Helvetica').fillColor('#333')
                .text(`${i + 1}. ${creator.name} (@${creator.handle}) - ${creator.reach.toLocaleString()} reach`);
        });
    }
};

const generateCreatorPDF = (doc, data) => {
    // Creator Info
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#000')
        .text(data.creator.name);
    doc.fontSize(11).font('Helvetica').fillColor('#666')
        .text(`@${data.creator.handle} | ${data.creator.platform}`);
    doc.fontSize(10).fillColor('#888')
        .text(`Report Period: ${data.period.startDate} - ${data.period.endDate}`);
    doc.moveDown(2);

    // Verification Badge
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#8b5cf6')
        .text(`✓ ${data.verification.tier} Tier Verified`);
    doc.moveDown(1);

    // Performance Summary
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Performance Summary');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Campaigns Completed: ${data.summary.totalCampaigns}`);
    doc.text(`Unique Brand Partnerships: ${data.summary.uniqueBrands}`);
    doc.text(`Total Reach Delivered: ${data.summary.totalReach.toLocaleString()}`);
    doc.text(`Total Engagement: ${data.summary.totalEngagement.toLocaleString()}`);
    doc.text(`Engagement Rate: ${data.summary.engagementRate}%`);
    doc.moveDown(1);

    // Earnings
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
        .text('Earnings & Impact');
    doc.moveDown(0.5);

    doc.fontSize(11).font('Helvetica').fillColor('#333');
    doc.text(`Total Earnings: $${data.summary.totalEarnings}`);
    doc.text(`Total Paid Out: $${data.summary.totalPaidOut}`);
    doc.text(`Conversions Driven: ${data.summary.totalConversions}`);
    doc.text(`Conversion Value: $${data.summary.totalConversionValue}`);
    doc.moveDown(2);

    // Campaign History
    if (data.campaigns?.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
            .text('Campaign History');
        doc.moveDown(0.5);

        data.campaigns.slice(0, 10).forEach(campaign => {
            doc.fontSize(10).font('Helvetica').fillColor('#333')
                .text(`• ${campaign.campaignTitle} (${campaign.brand}) - $${campaign.payment}`);
        });
    }
};

// ============================================
// CSV EXPORT
// ============================================

/**
 * Generate CSV from report data
 */
export const generateCSV = (reportType, reportData) => {
    const rows = [];

    if (reportType === 'brand') {
        // Header
        rows.push(['Campaign Report', '', '', '', '']);
        rows.push(['Brand', reportData.brand.name, '', '', '']);
        rows.push(['Period', `${reportData.period.startDate} - ${reportData.period.endDate}`, '', '', '']);
        rows.push(['', '', '', '', '']);

        // Summary
        rows.push(['Summary', '', '', '', '']);
        rows.push(['Metric', 'Value', '', '', '']);
        rows.push(['Total Campaigns', reportData.summary.totalCampaigns]);
        rows.push(['Total Spend', `$${reportData.summary.totalSpend}`]);
        rows.push(['Total Reach', reportData.summary.totalReach]);
        rows.push(['Total Engagement', reportData.summary.totalEngagement]);
        rows.push(['Conversions', reportData.summary.totalConversions]);
        rows.push(['Revenue', `$${reportData.summary.totalRevenue}`]);
        rows.push(['ROI', `${reportData.summary.roi}%`]);
        rows.push(['', '', '', '', '']);

        // Campaigns
        rows.push(['Campaigns', '', '', '', '']);
        rows.push(['Title', 'Status', 'Budget', 'Collaborations']);
        reportData.campaigns.forEach(c => {
            rows.push([c.title, c.status, c.budget, c.collaborations]);
        });
        rows.push(['', '', '', '', '']);

        // Top Creators
        rows.push(['Top Creators', '', '', '', '']);
        rows.push(['Name', 'Handle', 'Reach', 'Engagement', 'Spend']);
        reportData.topCreators.forEach(c => {
            rows.push([c.name, c.handle, c.reach, c.engagement, c.spend]);
        });
    } else {
        // Creator report
        rows.push(['Performance Report', '', '', '', '']);
        rows.push(['Creator', reportData.creator.name, '', '', '']);
        rows.push(['Handle', `@${reportData.creator.handle}`, '', '', '']);
        rows.push(['Period', `${reportData.period.startDate} - ${reportData.period.endDate}`, '', '', '']);
        rows.push(['', '', '', '', '']);

        // Summary
        rows.push(['Summary', '', '', '', '']);
        rows.push(['Total Campaigns', reportData.summary.totalCampaigns]);
        rows.push(['Unique Brands', reportData.summary.uniqueBrands]);
        rows.push(['Total Reach', reportData.summary.totalReach]);
        rows.push(['Total Engagement', reportData.summary.totalEngagement]);
        rows.push(['Engagement Rate', `${reportData.summary.engagementRate}%`]);
        rows.push(['Total Earnings', `$${reportData.summary.totalEarnings}`]);
        rows.push(['Conversions', reportData.summary.totalConversions]);
        rows.push(['', '', '', '', '']);

        // Campaigns
        rows.push(['Campaign History', '', '', '', '']);
        rows.push(['Campaign', 'Brand', 'Views', 'Engagement', 'Payment']);
        reportData.campaigns.forEach(c => {
            rows.push([c.campaignTitle, c.brand, c.views, c.engagement, `$${c.payment}`]);
        });
    }

    // Convert to CSV string
    return rows.map(row => row.map(cell => {
        if (cell === null || cell === undefined) return '';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    }).join(',')).join('\n');
};

// ============================================
// CAMPAIGN SUMMARY REPORT
// ============================================

/**
 * Generate a quick campaign summary
 */
export const generateCampaignSummary = async (campaignId) => {
    const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
            brand: { include: { brandProfile: true } },
            collaborations: {
                include: {
                    creator: { include: { creatorProfile: true } }
                }
            }
        }
    });

    if (!campaign) throw new Error('Campaign not found');

    const completedCollabs = campaign.collaborations.filter(c =>
        ['Approved', 'Paid'].includes(c.status)
    );

    const totalReach = completedCollabs.reduce((sum, c) =>
        sum + (c.videoStats?.views || 0), 0
    );

    const totalEngagement = completedCollabs.reduce((sum, c) =>
        sum + (c.videoStats?.likes || 0) + (c.videoStats?.comments || 0), 0
    );

    const totalSpend = completedCollabs.reduce((sum, c) =>
        sum + parseFloat(c.agreedPrice || 0), 0
    );

    return {
        campaign: {
            id: campaign.id,
            title: campaign.title,
            status: campaign.status,
            budget: campaign.budget,
            deadline: campaign.deadline
        },
        brand: campaign.brand.brandProfile?.companyName || 'Unknown',
        metrics: {
            collaborators: campaign.collaborations.length,
            completed: completedCollabs.length,
            totalReach,
            totalEngagement,
            totalSpend: totalSpend.toFixed(2),
            costPerReach: totalReach > 0 ? (totalSpend / totalReach).toFixed(4) : '0'
        },
        creators: completedCollabs.map(c => ({
            name: c.creator.name,
            handle: c.creator.creatorProfile?.handle,
            views: c.videoStats?.views || 0,
            payment: c.agreedPrice
        })),
        generatedAt: new Date().toISOString()
    };
};
