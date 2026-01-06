
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() {
    try {
        const c = await p.campaign.findFirst();
        const u = await p.user.findFirst({ where: { role: 'creator' } });
        console.log('Campaign:', c?.id);
        console.log('Creator:', u?.id);

        if (c && u) {
            console.log('Attempting to create collaboration...');
            const collaboration = await p.campaignCollaboration.create({
                data: {
                    campaignId: c.id,
                    creatorId: u.id,
                    status: 'Applied',
                    milestones: {
                        "Concept": "pending",
                        "Script": "pending",
                        "Draft": "pending",
                        "Final": "pending",
                        "Live": "pending"
                    }
                }
            });
            console.log('Collaboration created:', collaboration.id);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await p.$disconnect();
    }
}
m();
