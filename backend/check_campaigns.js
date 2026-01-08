import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const email = "comeshowup@gmail.com";
        console.log(`Searching for user: ${email}`);

        const user = await prisma.user.findUnique({
            where: { email: email }
        });

        if (!user) {
            console.log("User not found!");
            return;
        }

        console.log("User found:", user);

        const campaigns = await prisma.campaign.findMany({
            where: { brandId: user.id }
        });

        console.log(`Found ${campaigns.length} campaigns for brandId ${user.id}:`);
        console.log(campaigns);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
