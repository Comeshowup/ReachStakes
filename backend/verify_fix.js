
// BigInt Serialization Polyfill (Simulating server.js)
BigInt.prototype.toJSON = function () {
    return this.toString();
};

import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function m() {
    console.log('--- Starting Verification ---');
    try {
        const u = await p.user.findFirst({ where: { role: 'creator' } });
        const creatorId = u.id;
        const campaignId = 12;

        console.log('Creating collaboration...');
        const collaboration = await p.campaignCollaboration.create({
            data: {
                campaignId,
                creatorId,
                status: 'Applied',
                feedbackNotes: 'Verification Test',
                agreedPrice: 500.00
            }
        });

        console.log('Collaboration created with ID:', collaboration.id);
        console.log('Views Count Type:', typeof collaboration.viewsCount);
        console.log('Views Count Value:', collaboration.viewsCount);

        console.log('Attempting to stringify...');
        const json = JSON.stringify(collaboration);
        console.log('Stringify SUCCESS!');
        console.log('JSON Output snippet:', json.substring(0, 100) + '...');

        // Clean up
        await p.campaignCollaboration.delete({ where: { id: collaboration.id } });
        console.log('Cleaned up test data.');

    } catch (e) {
        console.error('VERIFICATION FAILED:', e);
        process.exit(1);
    } finally {
        await p.$disconnect();
    }
}
m();
