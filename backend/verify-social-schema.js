
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const socialAccounts = await prisma.socialAccount.findMany();
        console.log('Social Accounts table accessed successfully. Count:', socialAccounts.length);
    } catch (error) {
        console.error('Error accessing SocialAccounts table:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
