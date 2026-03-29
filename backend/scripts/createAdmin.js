/**
 * One-time admin user seed script.
 * Run with: node scripts/createAdmin.js
 * Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = 'ReachStakes Admin';

    if (!email || !password) {
        console.error('❌  ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
        process.exit(1);
    }

    // Check if admin already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
        if (existing.role === 'admin') {
            console.log('✅  Admin user already exists:', email);
        } else {
            // Upgrade existing user to admin (edge case)
            await prisma.user.update({
                where: { email },
                data: { role: 'admin' }
            });
            console.log('✅  Existing user upgraded to admin:', email);
        }
        return;
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const admin = await prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
            role: 'admin'
        }
    });

    console.log('✅  Admin user created successfully!');
    console.log('   Email   :', admin.email);
    console.log('   Role    :', admin.role);
    console.log('   ID      :', admin.id);
    console.log('\n⚠️  Change the default password after first login!');
}

main()
    .catch((e) => {
        console.error('❌  Error creating admin:', e.message);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
