import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // 0. Clean up existing data (optional, but good for repeatable seeds)
        // Note: Order matters due to foreign key constraints
        await prisma.analyticsDaily.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.campaignCollaboration.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.communityPost.deleteMany();
        await prisma.creatorProfile.deleteMany();
        await prisma.brandProfile.deleteMany();
        await prisma.user.deleteMany();

        console.log('Cleaned up existing data.');

        // 1. Create Users
        const passwordHash = await bcrypt.hash('password123', 10);

        // --- Brand Users ---
        const brand1 = await prisma.user.create({
            data: {
                email: 'marketing@technova.com',
                passwordHash,
                role: 'brand',
                name: 'TechNova',
                brandProfile: {
                    create: {
                        companyName: 'TechNova',
                        tagline: 'Innovating the Future',
                        industry: 'Technology',
                        location: 'San Francisco, CA',
                        about: 'We build cutting-edge gadgets for the modern world.',
                        companySize: 'Mid_Market',
                        hiringStatus: 'Hiring',
                        hiringSince: 2020,
                        websiteUrl: 'https://technova.com',
                        contactEmail: 'contact@technova.com',
                        socialLinks: { twitter: '@technova', linkedin: 'technova-inc' }
                    }
                }
            }
        });

        const brand2 = await prisma.user.create({
            data: {
                email: 'press@fashionforward.com',
                passwordHash,
                role: 'brand',
                name: 'Fashion Forward',
                brandProfile: {
                    create: {
                        companyName: 'Fashion Forward',
                        tagline: 'Style for Everyone',
                        industry: 'Fashion',
                        location: 'New York, NY',
                        about: 'Sustainable fashion brand with a global reach.',
                        companySize: 'Enterprise',
                        hiringStatus: 'Active',
                        websiteUrl: 'https://fashionforward.com',
                        contactEmail: 'hello@fashionforward.com'
                    }
                }
            }
        });

        // --- Creator Users ---
        const creator1 = await prisma.user.create({
            data: {
                email: 'alex.creative@gmail.com',
                passwordHash,
                role: 'creator',
                name: 'Alex Creative',
                creatorProfile: {
                    create: {
                        fullName: 'Alex Rivera',
                        handle: '@arivera',
                        tagline: 'Visual Storyteller',
                        primaryPlatform: 'Instagram',
                        location: 'Austin, TX',
                        about: 'Photographer and content creator focused on lifestyle and tech.',
                        nicheTags: ['tech', 'lifestyle', 'photography'],
                        followersCount: 54000,
                        engagementRate: 3.5,
                        basePrice: 500.00,
                        rating: 4.8,
                        socialLinks: { instagram: '@arivera', youtube: 'Alex Rivera Vlogs' }
                    }
                }
            }
        });

        const creator2 = await prisma.user.create({
            data: {
                email: 'sarah.gaming@gmail.com',
                passwordHash,
                role: 'creator',
                name: 'Sarah Plays',
                creatorProfile: {
                    create: {
                        fullName: 'Sarah Jenkins',
                        handle: '@sarahplays',
                        tagline: 'Level Up Your Game',
                        primaryPlatform: 'Twitch',
                        location: 'Seattle, WA',
                        about: 'Professional streamer and gaming enthusiast.',
                        nicheTags: ['gaming', 'esports', 'cosplay'],
                        followersCount: 125000,
                        engagementRate: 5.2,
                        basePrice: 1200.00,
                        rating: 4.9,
                        socialLinks: { twitch: 'sarahplays', twitter: '@sarahjenkins' }
                    }
                }
            }
        });

        const creator3 = await prisma.user.create({
            data: {
                email: 'mike.fitness@yahoo.com',
                passwordHash,
                role: 'creator',
                name: 'Mike Lift',
                creatorProfile: {
                    create: {
                        fullName: 'Mike Johnson',
                        handle: '@mike_lift',
                        tagline: 'Fitness for Life',
                        primaryPlatform: 'TikTok',
                        location: 'Miami, FL',
                        about: 'Certified personal trainer sharing quick workout tips.',
                        nicheTags: ['fitness', 'health', 'nutrition'],
                        followersCount: 850000,
                        engagementRate: 8.1,
                        basePrice: 2500.00,
                        rating: 4.7,
                        socialLinks: { tiktok: '@mike_lift', instagram: '@mike_fitness' }
                    }
                }
            }
        });

        // --- Admin User ---
        const admin = await prisma.user.create({
            data: {
                email: 'admin@reachstakes.com',
                passwordHash,
                role: 'admin',
                name: 'Super Admin'
            }
        });

        console.log(`Created users: ${brand1.email}, ${brand2.email}, ${creator1.email}, ${creator2.email}, ${creator3.email}, ${admin.email}`);

        // 2. Create Campaigns
        const campaign1 = await prisma.campaign.create({
            data: {
                brandId: brand1.id,
                title: 'Summer Tech Launch',
                description: 'Launching our new water-resistant headphones. Need energetic lifestyle content.',
                platformRequired: 'Instagram',
                campaignType: 'Product Launch',
                status: 'Active',
                budgetMin: 2000,
                budgetMax: 5000,
                deadline: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 days from now
            }
        });

        const campaign2 = await prisma.campaign.create({
            data: {
                brandId: brand2.id,
                title: 'Eco-Friendly Fall Collection',
                description: 'Showcase our new recycled cotton hoodies.',
                platformRequired: 'TikTok',
                campaignType: 'Brand Awareness',
                status: 'Draft',
                budgetMin: 1000,
                budgetMax: 3000,
            }
        });

        console.log(`Created campaigns: "${campaign1.title}", "${campaign2.title}"`);

        // 3. Create Collaborations
        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign1.id,
                creatorId: creator1.id,
                status: 'In_Progress',
                agreedPrice: 750.00,
                feedbackNotes: 'Waiting for first draft.'
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign1.id,
                creatorId: creator3.id, // Mike (TikTok/Health) might not match intent but valid relation
                status: 'Applied',
            }
        });

        console.log('Created collaborations.');

        // 4. Create Transactions
        await prisma.transaction.create({
            data: {
                userId: brand1.id,
                amount: 5000.00,
                type: 'Deposit',
                status: 'Completed',
                description: 'Initial wallet funding'
            }
        });

        await prisma.transaction.create({
            data: {
                userId: creator1.id,
                amount: 750.00, // Escrow hold technically, but modeling simple flow
                campaignId: campaign1.id,
                type: 'Payment',
                status: 'Pending',
                description: 'Payment for Summer Tech Launch'
            }
        });

        console.log('Created transactions.');

        // 5. Create Community Posts
        await prisma.communityPost.create({
            data: {
                userId: brand1.id,
                type: 'Casting_Call',
                contentText: 'Looking for tech reviewers for our upcoming gadget! DM for details.',
                mediaType: 'image',
                mediaUrl: 'https://via.placeholder.com/600x400?text=Tech+Launch'
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: creator2.id,
                type: 'Showcase',
                contentText: 'Just hit 100k views on my latest stream! Thanks everyone!',
                mediaType: 'none',
            }
        });

        console.log('Created community posts.');

        console.log('Seeding finished.');
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
