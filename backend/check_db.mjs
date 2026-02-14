import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('=== Collaborations ===');
    const collabs = await prisma.campaignCollaboration.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: { id: true, status: true, creatorId: true, campaignId: true }
    });
    console.table(collabs);

    console.log('\n=== Tracking Bundles ===');
    const bundles = await prisma.trackingBundle.findMany({
        orderBy: { id: 'desc' },
        take: 5,
        select: { id: true, collaborationId: true, affiliateCode: true }
    });
    console.table(bundles);
}

main().catch(console.error).finally(() => prisma.$disconnect());
