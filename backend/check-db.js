
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Successfully connected and queried users table.');
        console.log('Users found:', users.length);
    } catch (err) {
        console.error('Error querying users table:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
