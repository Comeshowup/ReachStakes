import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const where = { role: 'creator' };
  
  const [total, creators] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true, name: true, email: true, createdAt: true,
        creatorProfile: {
          select: {
            handle: true, avatarUrl: true, primaryPlatform: true,
            followersCount: true, engagementRate: true, rating: true,
            verificationTier: true, completedCampaigns: true,
            payoutStatus: true, onboardingStatus: true,
          },
        },
        _count: { select: { creatorCollabs: true } },
      },
    }),
  ]);

  console.log('Total:', total);
  console.log('Creators:', JSON.stringify(creators, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
