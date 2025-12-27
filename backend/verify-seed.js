import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const brandProfileCount = await prisma.brandProfile.count();
        const creatorProfileCount = await prisma.creatorProfile.count();
        const campaignCount = await prisma.campaign.count();
        const collabCount = await prisma.campaignCollaboration.count();
        const transactionCount = await prisma.transaction.count();
        const postCount = await prisma.communityPost.count();

        console.log('--- Verification Results ---');
        console.log(`Users: ${userCount}`);
        console.log(`Brand Profiles: ${brandProfileCount}`);
        console.log(`Creator Profiles: ${creatorProfileCount}`);
        console.log(`Campaigns: ${campaignCount}`);
        console.log(`Collaborations: ${collabCount}`);
        console.log(`Transactions: ${transactionCount}`);
        console.log(`Community Posts: ${postCount}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
