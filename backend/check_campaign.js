
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() {
    try {
        const c = await p.campaign.findUnique({ where: { id: 12 } });
        console.log('Campaign 12:', JSON.stringify(c, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await p.$disconnect();
    }
}
m();
