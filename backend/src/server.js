import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB, prisma } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import socialRoutes from './routes/socialRoutes.js';
import collaborationRoutes from './routes/collaborationRoutes.js'; // Collaboration routes
import cron from 'node-cron';
import { fetchVideoStats } from './utils/videoStats.js';

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and ngrok URLs
        if (origin.startsWith('http://localhost') || origin.endsWith('.ngrok-free.app') || origin.endsWith('.loca.lt')) {
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

// Cron Job: Update Video Stats every hour
cron.schedule('0 * * * *', async () => {
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
            // Fetch real stats using creator's token
            const mockStats = await fetchVideoStats(submission.submissionPlatform, submission.videoId, submission.creatorId);

            await prisma.campaignCollaboration.update({
                where: { id: submission.id },
                data: { videoStats: mockStats }
            });
        }
        console.log(`Updated stats for ${activeSubmissions.length} videos.`);
    } catch (error) {
        console.error('Error updating video stats:', error);
    }
});


const server = app.listen(PORT, () => {
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