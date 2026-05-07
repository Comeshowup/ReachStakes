import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
    console.log('Checking for admin user...');
    
    try {
        const passwordHash = await bcrypt.hash('Admin@ReachStakes2025!', 10);
        
        const admin = await prisma.user.upsert({
            where: { email: 'admin@reachstakes.com' },
            update: { 
                passwordHash,
                role: 'admin'
            },
            create: {
                email: 'admin@reachstakes.com',
                passwordHash,
                role: 'admin',
                name: 'Super Admin'
            }
        });
        
        console.log(`Successfully created/updated admin: ${admin.email}`);
        console.log('You can now log in with the password: Admin@ReachStakes2025!');
    } catch (e) {
        console.error('Error creating admin:', e);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
