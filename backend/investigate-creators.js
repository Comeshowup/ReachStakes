import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkCreators() {
    console.log('--- Checking All Users ---');
    const allUsers = await prisma.user.findMany();
    console.log(JSON.stringify(allUsers, null, 2));

    console.log('\n--- Checking Creator Profiles ---');
    const profiles = await prisma.creatorProfile.findMany();
    console.log(JSON.stringify(profiles, null, 2));

    console.log('\n--- Checking Users with Role "creator" ---');
    const creators = await prisma.user.findMany({
        where: { role: 'creator' },
        include: { creatorProfile: true }
    });
    console.log(JSON.stringify(creators, null, 2));
}

checkCreators()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
