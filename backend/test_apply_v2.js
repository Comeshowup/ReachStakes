
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function m() {
    try {
        const campaignId = 12;
        const u = await p.user.findFirst({ where: { role: 'creator' } });
        const creatorId = u.id;

        const req_body = {};
        const { agreedPrice, pitch } = req_body;

        console.log('Attempting to create collaboration with:', {
            campaignId,
            creatorId,
            agreedPrice: agreedPrice ? parseFloat(agreedPrice) : null,
            pitch
        });

        const collaboration = await p.campaignCollaboration.create({
            data: {
                campaignId,
                creatorId,
                status: 'Applied',
                agreedPrice: agreedPrice ? parseFloat(agreedPrice) : null,
                feedbackNotes: pitch,
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
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await p.$disconnect();
    }
}
m();
