import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    const accounts = await prisma.socialAccount.findMany();
    console.log('COUNT:', accounts.length);
    accounts.forEach(a => console.log('PLATFORM:', a.platform, 'USER:', a.username));
}
check();
