import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInvalidEmails() {
    try {
        // Find all users with invalid emails (missing domain extension)
        const users = await prisma.user.findMany({
            where: {
                email: {
                    not: {
                        contains: '.com'
                    }
                }
            }
        });

        console.log(`Found ${users.length} users with potentially invalid emails:`);

        for (const user of users) {
            console.log(`- ${user.email} (ID: ${user.id})`);

            // Fix email by adding .com if it's missing
            if (user.email && user.email.includes('@') && !user.email.includes('.')) {
                const fixedEmail = user.email + '.com';

                await prisma.user.update({
                    where: { id: user.id },
                    data: { email: fixedEmail }
                });

                console.log(`  ✓ Updated to: ${fixedEmail}`);
            }
        }

        console.log('\nDone!');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixInvalidEmails();
