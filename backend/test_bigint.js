
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() {
    try {
        const u = await p.user.findFirst({ where: { role: 'creator' } });
        const creatorId = u.id;
        const campaignId = 12;

        const collaboration = await p.campaignCollaboration.create({
            data: {
                campaignId,
                creatorId,
                status: 'Applied'
            }
        });

        console.log('Collaboration created. Attempting to stringify...');
        try {
            JSON.stringify(collaboration);
            console.log('Stringify succeeded (no BigInt issue?)');
        } catch (e) {
            console.error('Stringify failed:', e.message);
        }
    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        await p.$disconnect();
    }
}
m();
