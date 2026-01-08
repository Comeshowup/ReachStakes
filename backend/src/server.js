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

// ... other imports


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
app.use(express.json());

// Add Headers for COOP/COEP to fix Google OAuth Popups
app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none"); // or 'require-corp' if needed, but 'unsafe-none' is safer for external resources
    next();
});

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

// Cron Job: Update Video Stats every 5 minutes
cron.schedule('*/5 * * * *', async () => {
    console.log('Running video stats update...');
    try {
        // Find all collaborations with a videoId that are not active/completed? Or just all?
        // Let's update all for now.
        const activeSubmissions = await prisma.campaignCollaboration.findMany({
            where: {
                videoId: { not: null },
                submissionUrl: { not: null }
            }
        });

        for (const submission of activeSubmissions) {
            try {
                // Fetch real stats using creator's token
                const stats = await fetchVideoStats(submission.submissionPlatform, submission.videoId, submission.creatorId);

                await prisma.campaignCollaboration.update({
                    where: { id: submission.id },
                    data: { videoStats: stats }
                });
            } catch (error) {
                // Log specific warning for unlinked accounts to avoid cluttering error logs
                if (error.message.includes('not linked') || error.message.includes('expired')) {
                    console.warn(`[Stats Update] User ${submission.creatorId} (Submission ${submission.id}): ${error.message}`);
                } else {
                    console.error(`[Stats Update] Error updating stats for submission ${submission.id}:`, error.message);
                }
            }
        }
        console.log(`Updated stats for ${activeSubmissions.length} videos.`);
    } catch (error) {
        console.error('Error updating video stats:', error);
    }
});


const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


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
