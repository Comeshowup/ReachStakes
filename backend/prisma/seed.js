import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    try {
        // 0. Clean up existing data (optional, but good for repeatable seeds)
        // Note: Order matters due to foreign key constraints
        await prisma.analyticsDaily.deleteMany();
        await prisma.document.deleteMany();
        await prisma.transaction.deleteMany();
        await prisma.campaignCollaboration.deleteMany();
        await prisma.campaign.deleteMany();
        await prisma.communityPost.deleteMany();
        await prisma.creatorService.deleteMany();
        await prisma.creatorDemographics.deleteMany();
        await prisma.creatorProfile.deleteMany();
        await prisma.brandProfile.deleteMany();
        await prisma.socialAccount.deleteMany();
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
                        about: 'We build cutting-edge gadgets for the modern world. At TechNova, we believe technology should empower everyone. Our team of passionate engineers and designers work tirelessly to create products that make a difference in people\'s lives.',
                        companySize: 'Mid_Market',
                        hiringStatus: 'Hiring',
                        hiringSince: 2020,
                        websiteUrl: 'https://technova.com',
                        contactEmail: 'contact@technova.com',
                        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=TechNova&backgroundColor=6366f1',
                        socialLinks: {
                            twitter: 'https://twitter.com/technova',
                            linkedin: 'https://linkedin.com/company/technova-inc',
                            instagram: 'https://instagram.com/technova',
                            website: 'https://technova.com'
                        }
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
                        about: 'Sustainable fashion brand with a global reach. We believe fashion should be accessible, ethical, and beautiful. Our collections are made from 100% recycled materials.',
                        companySize: 'Enterprise',
                        hiringStatus: 'Active',
                        hiringSince: 2018,
                        websiteUrl: 'https://fashionforward.com',
                        contactEmail: 'hello@fashionforward.com',
                        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=FashionForward&backgroundColor=ec4899',
                        socialLinks: {
                            twitter: 'https://twitter.com/fashionforward',
                            linkedin: 'https://linkedin.com/company/fashion-forward',
                            instagram: 'https://instagram.com/fashionforward',
                            website: 'https://fashionforward.com'
                        }
                    }
                }
            }
        });

        const brand3 = await prisma.user.create({
            data: {
                email: 'team@gaminglegends.com',
                passwordHash,
                role: 'brand',
                name: 'Gaming Legends',
                brandProfile: {
                    create: {
                        companyName: 'Gaming Legends',
                        tagline: 'Level Up Your Game',
                        industry: 'Gaming',
                        location: 'Los Angeles, CA',
                        about: 'Premier gaming peripherals and accessories brand. We create products that help gamers perform at their best.',
                        companySize: 'Mid_Market',
                        hiringStatus: 'Hiring',
                        hiringSince: 2021,
                        websiteUrl: 'https://gaminglegends.com',
                        contactEmail: 'partnerships@gaminglegends.com',
                        logoUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=GamingLegends&backgroundColor=8b5cf6',
                        socialLinks: {
                            twitter: 'https://twitter.com/gaminglegends',
                            instagram: 'https://instagram.com/gaminglegends',
                            website: 'https://gaminglegends.com'
                        }
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
                        about: 'Photographer and content creator focused on lifestyle and tech. I help brands tell their stories through stunning visuals.',
                        nicheTags: ['tech', 'lifestyle', 'photography'],
                        followersCount: 54000,
                        engagementRate: 3.5,
                        basePrice: 500.00,
                        rating: 4.8,
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
                        socialLinks: { instagram: '@arivera', youtube: 'Alex Rivera Vlogs' },
                        brandAffiliations: ['TechNova', 'Apple', 'Sony'],
                        demographics: {
                            create: {
                                ageRanges: { '18-24': 35, '25-34': 40, '35-44': 20, '45+': 5 },
                                genderSplit: { 'Male': 55, 'Female': 45 },
                                topCountries: { 'USA': 60, 'UK': 15, 'Canada': 10, 'Australia': 8, 'Other': 7 }
                            }
                        },
                        services: {
                            create: [
                                { title: 'Instagram Reel', description: '60-second engaging reel with hook', price: 500.00, turnaroundTime: '3 days' },
                                { title: 'Instagram Story Package', description: '5 stories with swipe-up links', price: 300.00, turnaroundTime: '2 days' },
                                { title: 'Product Photography', description: '10 high-quality product shots', price: 800.00, turnaroundTime: '5 days' }
                            ]
                        }
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
                        about: 'Professional streamer and gaming enthusiast. I bring energy and entertainment to every stream!',
                        nicheTags: ['gaming', 'esports', 'cosplay'],
                        followersCount: 125000,
                        engagementRate: 5.2,
                        basePrice: 1200.00,
                        rating: 4.9,
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                        socialLinks: { twitch: 'sarahplays', twitter: '@sarahjenkins' },
                        brandAffiliations: ['Gaming Legends', 'Razer', 'Corsair'],
                        demographics: {
                            create: {
                                ageRanges: { '13-17': 15, '18-24': 45, '25-34': 30, '35+': 10 },
                                genderSplit: { 'Male': 65, 'Female': 35 },
                                topCountries: { 'USA': 50, 'UK': 20, 'Germany': 10, 'France': 8, 'Other': 12 }
                            }
                        },
                        services: {
                            create: [
                                { title: 'Sponsored Stream (2 hrs)', description: 'Dedicated gameplay stream featuring your product', price: 1500.00, turnaroundTime: 'Schedule based' },
                                { title: 'Product Review Video', description: 'In-depth review on YouTube', price: 800.00, turnaroundTime: '7 days' }
                            ]
                        }
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
                        about: 'Certified personal trainer sharing quick workout tips. Let\'s get fit together!',
                        nicheTags: ['fitness', 'health', 'nutrition'],
                        followersCount: 850000,
                        engagementRate: 8.1,
                        basePrice: 2500.00,
                        rating: 4.7,
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
                        socialLinks: { tiktok: '@mike_lift', instagram: '@mike_fitness' },
                        brandAffiliations: ['Nike', 'MyProtein', 'Fitbit'],
                        demographics: {
                            create: {
                                ageRanges: { '18-24': 30, '25-34': 45, '35-44': 20, '45+': 5 },
                                genderSplit: { 'Male': 60, 'Female': 40 },
                                topCountries: { 'USA': 55, 'Brazil': 15, 'Mexico': 10, 'UK': 8, 'Other': 12 }
                            }
                        },
                        services: {
                            create: [
                                { title: 'TikTok Video', description: 'Viral-style workout video featuring your product', price: 2000.00, turnaroundTime: '4 days' },
                                { title: 'Instagram Partnership', description: 'Feed post + stories bundle', price: 3000.00, turnaroundTime: '5 days' }
                            ]
                        }
                    }
                }
            }
        });

        const creator4 = await prisma.user.create({
            data: {
                email: 'emma.beauty@outlook.com',
                passwordHash,
                role: 'creator',
                name: 'Emma Glam',
                creatorProfile: {
                    create: {
                        fullName: 'Emma Thompson',
                        handle: '@emmaglam',
                        tagline: 'Beauty & Lifestyle',
                        primaryPlatform: 'YouTube',
                        location: 'London, UK',
                        about: 'Beauty influencer and makeup artist. I create tutorials, reviews, and lifestyle content.',
                        nicheTags: ['beauty', 'makeup', 'skincare', 'lifestyle'],
                        followersCount: 320000,
                        engagementRate: 4.5,
                        basePrice: 1800.00,
                        rating: 4.85,
                        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
                        socialLinks: { youtube: 'EmmaGlam', instagram: '@emmaglam' },
                        brandAffiliations: ['Sephora', 'Charlotte Tilbury', 'Glossier'],
                        demographics: {
                            create: {
                                ageRanges: { '18-24': 40, '25-34': 35, '35-44': 20, '45+': 5 },
                                genderSplit: { 'Male': 15, 'Female': 85 },
                                topCountries: { 'UK': 40, 'USA': 25, 'Australia': 12, 'Canada': 10, 'Other': 13 }
                            }
                        },
                        services: {
                            create: [
                                { title: 'YouTube Review', description: 'Dedicated product review video', price: 2500.00, turnaroundTime: '10 days' },
                                { title: 'Instagram Reel', description: 'Beauty tutorial featuring your product', price: 1200.00, turnaroundTime: '5 days' }
                            ]
                        }
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

        console.log(`Created users: ${brand1.email}, ${brand2.email}, ${brand3.email}, ${creator1.email}, ${creator2.email}, ${creator3.email}, ${creator4.email}, ${admin.email}`);

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
                deadline: new Date(new Date().setDate(new Date().getDate() + 30)),
                usageRights: '90 Days',
                usageCategory: 'Digital Only',
                exclusivity: 'Non-exclusive',
                isWhitelistingRequired: false,
                contentUsageScope: 'Organic, Paid Social'
            }
        });

        const campaign2 = await prisma.campaign.create({
            data: {
                brandId: brand2.id,
                title: 'Eco-Friendly Fall Collection',
                description: 'Showcase our new recycled cotton hoodies. Looking for authentic, lifestyle-focused content.',
                platformRequired: 'TikTok',
                campaignType: 'Brand Awareness',
                status: 'Active',
                budgetMin: 1000,
                budgetMax: 3000,
                deadline: new Date(new Date().setDate(new Date().getDate() + 45)),
                usageRights: '60 Days',
                usageCategory: 'All Media',
                exclusivity: 'Category Exclusive',
                exclusivityPeriod: 30,
                isWhitelistingRequired: true,
                contentUsageScope: 'Organic, Paid Social, Email'
            }
        });

        const campaign3 = await prisma.campaign.create({
            data: {
                brandId: brand1.id,
                title: 'SmartWatch Pro Review Program',
                description: 'Looking for tech reviewers to showcase our new SmartWatch Pro features.',
                platformRequired: 'YouTube',
                campaignType: 'Product Review',
                status: 'Active',
                budgetMin: 3000,
                budgetMax: 8000,
                deadline: new Date(new Date().setDate(new Date().getDate() + 60)),
                usageRights: 'Perpetual',
                usageCategory: 'All Media',
                exclusivity: 'Non-exclusive',
                isWhitelistingRequired: false,
                contentUsageScope: 'All Platforms'
            }
        });

        const campaign4 = await prisma.campaign.create({
            data: {
                brandId: brand3.id,
                title: 'Gaming Chair Launch Stream',
                description: 'Launch our new ergonomic gaming chair with live streams and reviews.',
                platformRequired: 'Twitch',
                campaignType: 'Product Launch',
                status: 'Active',
                budgetMin: 1500,
                budgetMax: 4000,
                deadline: new Date(new Date().setDate(new Date().getDate() + 21)),
                usageRights: '30 Days',
                usageCategory: 'Digital Only',
                exclusivity: 'Category Exclusive',
                exclusivityPeriod: 14,
                isWhitelistingRequired: false,
                contentUsageScope: 'Organic'
            }
        });

        const campaign5 = await prisma.campaign.create({
            data: {
                brandId: brand1.id,
                title: 'Holiday Gift Guide',
                description: 'Feature our products in your holiday gift guide content.',
                platformRequired: 'Instagram',
                campaignType: 'Seasonal',
                status: 'Completed',
                budgetMin: 2500,
                budgetMax: 6000,
                deadline: new Date('2025-12-25'),
                usageRights: '90 Days',
                usageCategory: 'All Media',
                exclusivity: 'Non-exclusive',
                isWhitelistingRequired: true,
                contentUsageScope: 'Organic, Paid Social'
            }
        });

        console.log(`Created campaigns: "${campaign1.title}", "${campaign2.title}", "${campaign3.title}", "${campaign4.title}", "${campaign5.title}"`);

        // 3. Create Collaborations
        const collab1 = await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign1.id,
                creatorId: creator1.id,
                status: 'In_Progress',
                agreedPrice: 750.00,
                feedbackNotes: 'Waiting for first draft.',
                milestones: { 'Concept': 'completed', 'Script': 'completed', 'Draft': 'in_progress', 'Final': 'pending' },
                deliverables: { 'script': 'done', 'draft': 'pending' }
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign1.id,
                creatorId: creator3.id,
                status: 'Applied',
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign2.id,
                creatorId: creator4.id,
                status: 'In_Progress',
                agreedPrice: 1500.00,
                milestones: { 'Concept': 'completed', 'Script': 'in_progress', 'Draft': 'pending', 'Final': 'pending' }
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign3.id,
                creatorId: creator1.id,
                status: 'Approved',
                agreedPrice: 1200.00,
                videoId: 'dQw4w9WgXcQ',
                submissionUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
                submissionPlatform: 'YouTube',
                submissionTitle: 'TechNova SmartWatch Pro - Honest Review',
                videoStats: { views: 45000, likes: 2800, comments: 340 },
                milestones: { 'Concept': 'completed', 'Script': 'completed', 'Draft': 'completed', 'Final': 'completed' }
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign4.id,
                creatorId: creator2.id,
                status: 'In_Progress',
                agreedPrice: 2000.00,
                isWhitelisted: true,
                whitelistingStatus: 'Active',
                milestones: { 'Concept': 'completed', 'Script': 'completed', 'Draft': 'in_progress', 'Final': 'pending' }
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign5.id,
                creatorId: creator1.id,
                status: 'Paid',
                agreedPrice: 900.00,
                videoId: 'abc123xyz',
                submissionUrl: 'https://instagram.com/p/abc123xyz',
                submissionPlatform: 'Instagram',
                submissionTitle: 'Holiday Gift Guide 2025',
                videoStats: { views: 32000, likes: 4500, comments: 180 },
                milestones: { 'Concept': 'completed', 'Script': 'completed', 'Draft': 'completed', 'Final': 'completed' }
            }
        });

        await prisma.campaignCollaboration.create({
            data: {
                campaignId: campaign5.id,
                creatorId: creator4.id,
                status: 'Paid',
                agreedPrice: 2200.00,
                videoId: 'def456uvw',
                submissionUrl: 'https://youtube.com/watch?v=def456uvw',
                submissionPlatform: 'YouTube',
                submissionTitle: 'Tech Gifts You NEED This Holiday',
                videoStats: { views: 85000, likes: 6200, comments: 520 },
                milestones: { 'Concept': 'completed', 'Script': 'completed', 'Draft': 'completed', 'Final': 'completed' }
            }
        });

        console.log('Created collaborations.');

        // 4. Create Transactions
        await prisma.transaction.create({
            data: {
                userId: brand1.id,
                amount: 10000.00,
                type: 'Deposit',
                status: 'Completed',
                description: 'Initial wallet funding'
            }
        });

        await prisma.transaction.create({
            data: {
                userId: brand1.id,
                campaignId: campaign1.id,
                amount: 750.00,
                type: 'Payment',
                status: 'Pending',
                description: 'Escrow for Summer Tech Launch'
            }
        });

        await prisma.transaction.create({
            data: {
                userId: creator1.id,
                campaignId: campaign5.id,
                amount: 900.00,
                type: 'Payment',
                status: 'Completed',
                description: 'Payment for Holiday Gift Guide'
            }
        });

        await prisma.transaction.create({
            data: {
                userId: brand2.id,
                amount: 5000.00,
                type: 'Deposit',
                status: 'Completed',
                description: 'Wallet top-up'
            }
        });

        console.log('Created transactions.');

        // 5. Create Community Posts
        await prisma.communityPost.create({
            data: {
                userId: brand1.id,
                type: 'Casting_Call',
                contentText: '🚀 Looking for tech reviewers for our upcoming SmartWatch Pro launch! We\'re seeking creators with engaged audiences who are passionate about wearable tech. DM for details or apply through our latest campaign!',
                mediaType: 'image',
                mediaUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600'
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: brand1.id,
                type: 'General',
                contentText: '✨ Thrilled to announce our partnership with @arivera for the Summer Tech Launch! Can\'t wait to see the amazing content coming your way. Stay tuned! 📱',
                mediaType: 'none'
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: brand2.id,
                type: 'Casting_Call',
                contentText: '🌿 Calling all sustainable fashion advocates! Our Eco-Friendly Fall Collection is here and we\'re looking for creators who share our passion for the planet. $1000-$3000 per collaboration. Apply now!',
                mediaType: 'image',
                mediaUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: brand3.id,
                type: 'Showcase',
                contentText: '🎮 @sarahplays absolutely crushed it with our new gaming chair stream! 50k concurrent viewers and incredible feedback. This is the power of authentic creator partnerships. Thank you Sarah!',
                mediaType: 'video',
                mediaUrl: 'https://example.com/stream-highlight.mp4'
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: creator2.id,
                type: 'Showcase',
                contentText: '🎉 Just hit 125k followers! Thank you all for the incredible support. Special shoutout to Gaming Legends for the amazing partnership - this chair is a game-changer! 🪑✨',
                mediaType: 'none',
            }
        });

        await prisma.communityPost.create({
            data: {
                userId: creator1.id,
                type: 'General',
                contentText: 'Behind the scenes from today\'s shoot with TechNova! The new headphones look absolutely stunning in natural light. Content dropping next week! 📸🎧',
                mediaType: 'image',
                mediaUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'
            }
        });

        console.log('Created community posts.');

        // 6. Create Analytics Data
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            await prisma.analyticsDaily.create({
                data: {
                    brandId: brand1.id,
                    campaignId: i % 3 === 0 ? campaign1.id : (i % 3 === 1 ? campaign3.id : campaign5.id),
                    recordDate: date,
                    revenueGenerated: parseFloat((Math.random() * 500 + 100).toFixed(2)),
                    spendAmount: parseFloat((Math.random() * 200 + 50).toFixed(2)),
                    impressions: Math.floor(Math.random() * 10000 + 1000),
                    clicks: Math.floor(Math.random() * 500 + 50)
                }
            });
        }

        for (let i = 0; i < 20; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            await prisma.analyticsDaily.create({
                data: {
                    brandId: brand2.id,
                    campaignId: campaign2.id,
                    recordDate: date,
                    revenueGenerated: parseFloat((Math.random() * 300 + 80).toFixed(2)),
                    spendAmount: parseFloat((Math.random() * 150 + 30).toFixed(2)),
                    impressions: Math.floor(Math.random() * 8000 + 500),
                    clicks: Math.floor(Math.random() * 400 + 30)
                }
            });
        }

        console.log('Created analytics data.');

        // 7. Create Documents
        // Contract for Collab 1 (Draft)
        await prisma.document.create({
            data: {
                creatorId: creator1.id,
                collaborationId: collab1.id,
                campaignId: campaign1.id,
                type: 'Contract',
                title: 'Campaign Contract - Summer Tech Launch',
                description: 'Influencer agreement for the Summer Tech Launch campaign with TechNova. Includes usage rights and deliverables.',
                status: 'Pending_Signature',
                expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)),
            }
        });

        // Signed Contract (Past)
        await prisma.document.create({
            data: {
                creatorId: creator1.id,
                type: 'Contract',
                title: 'Campaign Contract - Holiday Gift Guide',
                description: 'Completed contract for the Holiday Gift Guide 2024.',
                status: 'Signed',
                signedAt: new Date('2024-11-15'),
                signedByName: 'Alex Rivera',
                signedFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Dummy PDF
                createdAt: new Date('2024-11-10')
            }
        });

        // Tax Form W-9
        await prisma.document.create({
            data: {
                creatorId: creator1.id,
                type: 'W9',
                title: 'W-9 Form (2025)',
                description: 'Request for Taxpayer Identification Number and Certification.',
                status: 'Signed',
                signedAt: new Date('2025-01-05'),
                signedByName: 'Alex Rivera',
                taxYear: 2025,
                signedFileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            }
        });

        // 1099-NEC
        await prisma.document.create({
            data: {
                creatorId: creator1.id,
                type: 'NEC_1099',
                title: '1099-NEC (2024)',
                description: 'Nonemployee Compensation form for tax year 2024.',
                status: 'Signed',
                taxYear: 2024,
                fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
            }
        });

        // NDA
        await prisma.document.create({
            data: {
                creatorId: creator1.id,
                type: 'NDA',
                title: 'TechNova General NDA',
                description: 'Non-Disclosure Agreement for upcoming product releases.',
                status: 'Pending_Signature',
                createdAt: new Date()
            }
        });

        console.log('Created documents.');

        console.log('Seeding finished successfully!');
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
