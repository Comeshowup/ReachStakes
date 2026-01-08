import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
    try {
        const user = await prisma.user.findUnique({
            where: { email: "comeshowup@gmail.com" }
        });

        if (!user) {
            console.log("No user found");
            return;
        }

        const count = await prisma.campaign.count({
            where: { brandId: user.id }
        });

        console.log(`User ID: ${user.id}`);
        console.log(`Campaign Count: ${count}`);

        if (count > 0) {
            const camps = await prisma.campaign.findMany({ where: { brandId: user.id } });
            console.log("First campaign status:", camps[0].status);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
