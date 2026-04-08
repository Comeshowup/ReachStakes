import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB, prisma } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js'; // Collaboration routes
import conciergeRoutes from './routes/conciergeRoutes.js'; // Concierge SaaS routes
import userRoutes from './routes/userRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import mediaKitRoutes from './routes/mediaKitRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import meetingRoutes from './routes/meetingRoutes.js';
import payoutRoutes from './routes/payoutRoutes.js';
import creatorRoutes from './routes/creatorRoutes.js';
import referralRoutes from './routes/referralRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import brandCampaignRoutes from './routes/campaign.routes.js';
import escrowRoutes from './routes/escrowRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import adminCampaignRoutes from './routes/adminCampaignRoutes.js';
import adminCreatorRoutes from './routes/adminCreatorRoutes.js';
import adminBrandRoutes from './routes/adminBrandRoutes.js';
import adminInvitationRoutes from './routes/adminInvitationRoutes.js';
import adminIssueRoutes from './routes/adminIssueRoutes.js';
import adminTaskRoutes from './routes/adminTaskRoutes.js';
import adminPaymentRoutes from './routes/adminPaymentRoutes.js';
import adminAnalyticsRoutes from './routes/adminAnalyticsRoutes.js';
import adminMessageRoutes from './routes/adminMessageRoutes.js';
import { initSocketServer } from './socketServer.js';

import { validateTazapayConfig } from './services/tazapayService.js';
import { validateEncryptionConfig } from './utils/encryption.js';
import { payoutQueue } from './services/payoutQueue.js';
import cron from 'node-cron';
import { fetchVideoStats } from './utils/videoStats.js';

// BigInt Serialization Polyfill
BigInt.prototype.toJSON = function () {
    return this.toString();
};



connectDB();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost, ngrok, and production URLs
        if (origin.startsWith('http://localhost') ||
            origin.endsWith('.ngrok-free.app') ||
            origin.endsWith('.loca.lt') ||
            origin.endsWith('.netlify.app') ||
            origin.endsWith('.onrender.com')) {
            return callback(null, true);
        }

        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
    },
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add Headers for COOP/COEP to fix Google OAuth Popups
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none"); // or 'require-corp' if needed, but 'unsafe-none' is safer for external resources
    next();
});

// Serve uploaded files (brand logos, covers, documents)
import path from 'path';
import { fileURLToPath } from 'url';
const __filename_server = fileURLToPath(import.meta.url);
const __dirname_server = path.dirname(__filename_server);
app.use('/uploads', express.static(path.join(__dirname_server, '../uploads')));

// Health Check
app.get('/', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/concierge', conciergeRoutes); // New Consierge Route
app.use('/api/users', userRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/invoices', invoiceRoutes); // Phase 1: Automated Invoicing
app.use('/api/media-kit', mediaKitRoutes); // Phase 2: Live Media Kit
app.use('/api/documents', documentRoutes); // Creator Documents Hub
app.use('/api/payments', paymentRoutes); // Tazapay Payments
app.use('/api/meetings', meetingRoutes);
app.use('/api/payouts', payoutRoutes); // Creator Payouts
app.use('/api/creators', creatorRoutes); // Creator specific routes
app.use('/api/referrals', referralRoutes); // Phase 3: Referral System
app.use('/api/dashboard', dashboardRoutes); // Brand Dashboard API
app.use('/api/v1/brand/campaigns', brandCampaignRoutes); // Campaign Wizard & Detail
app.use('/api/escrow', escrowRoutes); // Escrow Vault
app.use('/api/notifications', notificationRoutes); // In-App Notifications
app.use('/api/support', supportRoutes); // Support System

// Admin Campaign Manager Routes
app.use('/api/admin/campaigns', adminCampaignRoutes);
app.use('/api/admin/creators', adminCreatorRoutes);
app.use('/api/admin/brands', adminBrandRoutes);
app.use('/api/admin/invitations', adminInvitationRoutes);
app.use('/api/admin/issues', adminIssueRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/messages', adminMessageRoutes);

// Cron Job: Update Video Stats every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Running video stats update...');
    try {
        // Find all submitted collaborations (URL required, platform required)
        const activeSubmissions = await prisma.campaignCollaboration.findMany({
            where: {
                submissionUrl: { not: null },
                submissionPlatform: { not: null }
            }
        });

        let successCount = 0;
        for (const submission of activeSubmissions) {
            try {
                // Use videoId for YouTube, submissionUrl for Instagram/TikTok
                const targetId = (submission.submissionPlatform === 'YouTube' && submission.videoId)
                    ? submission.videoId
                    : submission.submissionUrl;

                const stats = await fetchVideoStats(
                    submission.submissionPlatform,
                    targetId,
                    submission.creatorId
                );

                const views = parseInt(stats.views || 0);
                const likes = parseInt(stats.likes || 0);
                const comments = parseInt(stats.comments || 0);
                const shares = parseInt(stats.shares || 0);
                const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0;

                await prisma.campaignCollaboration.update({
                    where: { id: submission.id },
                    data: {
                        // Raw JSON snapshot
                        videoStats: stats,
                        // Dedicated queryable columns (indexed, usable in analytics)
                        viewsCount: views,
                        likesCount: likes,
                        sharesCount: shares,
                        engagementRate: parseFloat(engagementRate.toFixed(4))
                    }
                });
                successCount++;
            } catch (error) {
                if (error.message.includes('not linked') || error.message.includes('expired') || error.message.includes('not connected')) {
                    console.warn(`[Stats Cron] User ${submission.creatorId} (Collab ${submission.id}): ${error.message}`);
                } else {
                    console.error(`[Stats Cron] Error for collab ${submission.id}:`, error.message);
                }
            }
        }
        console.log(`[Cron] Stats updated: ${successCount}/${activeSubmissions.length} submissions.`);
    } catch (error) {
        console.error('[Cron] Fatal error in video stats update:', error);
    }
});


import { startInvitationExpiryJob, startSLAMonitorJob } from './jobs/adminCronJobs.js';

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(process.env.DATABASE_URL);
    validateTazapayConfig();
    validateEncryptionConfig();
    payoutQueue.start();
    startInvitationExpiryJob();
    startSLAMonitorJob();
});

// Initialize Socket.io on the HTTP server
const io = initSocketServer(server);


// Handle unhandled promise rejections (e.g., database connection errors)
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(async () => {
        await disconnectDB();
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on("uncaughtException", async (err) => {
    console.error("Uncaught Exception:", err);
    await disconnectDB();
    process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
    console.log("SIGTERM received, shutting down gracefully");
    server.close(async () => {
        await disconnectDB();
        process.exit(0);
    });
});
